import { Component } from '@angular/core';
import { PdfUpload } from '../../Components/pdf-upload/pdf-upload';
import { Router } from '@angular/router';

@Component({
  imports: [PdfUpload],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  constructor( private router: Router) {}

  gotoFormPage() {
    this.router.navigate(['/add']);
  }
}
