import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Utils from '../helpers/utils';
import * as $ from 'jquery';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { ViewTaskComponent } from '../view-task/view-task.component';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
})
export class TodoComponent implements OnInit {
  modalRef: MdbModalRef<ViewTaskComponent> | null = null;
  imageSrc = 'assets/images/Avatar.png';
  imageAlt = 'Avatar';
  today: number = Date.now();
  SignupUser: any = {
    Username: '',
    Email: '',
    Password: '',
  };
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private modalService: MdbModalService
  ) {}

  userID: any;
  created: any = [''];
  posts: any = [];
  done: any = [];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      this.updateTask(
        event.previousContainer.data[event.previousIndex],
        event.container.id
      );
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
  ngOnInit(): void {
    $(document).ready(function () {
      $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
      });
    });
    console.log('ngOnInit');

    let header = new HttpHeaders();
    header.append('Content-Type', 'application/json');
    header.append('Access-Control-Allow-Origin', '*');

    //fetch userid from local storage
    let userId = localStorage.getItem('userId');

    //check if user id is in local storage, if not redirect to login page
    if (userId === null) {
      this.router.navigate(['/login']);
      this.toastr.error('Please Login First!', 'Error');
    }

    //call api to get all tasks
    this.http
      .get(Utils.BASE_URL + 'task/' + userId, { headers: header })
      .subscribe((res) => {
        const createdTasks = Object.values(res);
        console.log('Tasks: ', createdTasks);

        //filter tasks
        this.created = createdTasks.filter((task) => task.status === 'created');
        this.posts = createdTasks.filter((task) => task.status === 'progress');
        this.done = createdTasks.filter((task) => task.status === 'done');
      });

    //call api to get user details
    this.http
      .get(Utils.BASE_URL + 'user/' + userId, { headers: header })
      .subscribe((res) => {
        this.SignupUser = res;
      });
  }

  deleteItem(id: any) {
    this.http.delete(Utils.BASE_URL + 'task/delete/' + id).subscribe(
      (res) => {
        this.toastr.success('Task deleted Successfully!', 'Success');
        this.ngOnInit();
        this.router.navigate(['todo']);
      },
      (err: any) => {
        console.log('Error: ', err);
        this.toastr.error('Task Delete Failed, ' + err.error.message, 'Error');
      }
    );
  }

  //update task status on move to new section
  updateTask(task: any, sectionId: String) {
    console.log('New Status: ', sectionId);

    //if section id is cdk-drop-list-0 then set task status to created,
    //if section id is cdk-drop-list-1 then set task status to progress,
    //if section id is cdk-drop-list-2 then set task status to done

    if (sectionId === 'cdk-drop-list-0') {
      task.status = 'created';
    } else if (sectionId === 'cdk-drop-list-1') {
      task.status = 'progress';
    } else if (sectionId === 'cdk-drop-list-2') {
      task.status = 'done';
    }

    //always format dates to backend standard of yyyy-mm-dd hh:mm:ss
    task.createdTime = Utils.formatDate(task.createdTime);
    task.dueDate = Utils.formatDate(task.dueDate);
    task.reminer = Utils.formatDate(task.reminderTime);

    let header = new HttpHeaders();
    header.append('Content-Type', 'application/json');
    header.append('Access-Control-Allow-Origin', '*');
    this.http
      .put(Utils.BASE_URL + `task/update/${task.id}`, task, {
        headers: header,
      })
      .subscribe((res) => {
        console.log('Updated Task: ', res);
        this.toastr.success('Task Updated Successfully!', 'Success');
        this.ngOnInit();
      }),
      (err: any) => {
        this.toastr.error('Task Update Failed, ' + err.error.message, 'Error');
        console.log('Error: ', err);
      };
  }
  openModal(item: any) {
    this.modalRef = this.modalService.open(ViewTaskComponent, {
      data: {
        taskId: item.id,
        title: item.title,
        description: item.description,
        dueDate: item.dueDate,
        status: item.status,
      },
    });
    this.modalRef.onClose.subscribe((message: any) => {
      console.log('modal close: ', message);
      this.ngOnInit();
    });
  }
  Logout() {
    //clear local storage then redirect to login page
    localStorage.clear();
    this.router.navigate(['/login']);
    this.toastr.success('Logged Out Successfully!', 'Success');
  }
}
