
import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList implements OnInit {

  http = inject(HttpClient);

  EmployeeObj: any = {
    employeeId: 0,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    department: '',
    designation: '',
    dateOfJoining: '',
    address: '',
    createdAt: '',
    updatedAt: ''
  };

  employeeList: any[] = [];

  ngOnInit(): void {
    this.getAllEmployee();
  }

  getAllEmployee(): void {
    this.http.get<any[]>('https://localhost:7091/api/employee')
      .subscribe({
        next: (result) => {
          this.employeeList = result;
          console.log('Employees fetched:', result);
        },
        error: (error) => {
          console.error('Failed to fetch employees:', error);
        }
      });
  }
}
