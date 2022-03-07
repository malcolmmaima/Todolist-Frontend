import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  imageSrc = 'assets/images/Avatar.png'  
  imageAlt = 'Avatar'
  today: number = Date.now();
  constructor() { }

  ngOnInit(): void {
  }

}
