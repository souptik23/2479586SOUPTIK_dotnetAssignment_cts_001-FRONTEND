import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-employee-entry',
  styleUrl: './employee-entry.css',
  templateUrl: './employee-entry.html',
})
export class EmployeeEntry implements OnInit {
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
    // this.getAllEmployee();
  }

  // getAllEmployee(): void {
  //   this.http.get<any[]>('https://localhost:7091/api/employee')
  //     .subscribe({
  //       next: (result) => {
  //         this.employeeList = result;
  //         console.log('Employees fetched:', result);
  //       },
  //       error: (error) => {
  //         console.error('Failed to fetch employees:', error);
  //       }
  //     });
  // }

  onSubmitSaveEmployee(): void {
    console.log('Submitting employee data:', this.EmployeeObj);

    this.EmployeeObj.createdAt = new Date().toISOString();
    this.EmployeeObj.updatedAt = new Date().toISOString();

    this.http.post('https://localhost:7091/api/employee', this.EmployeeObj)
      .subscribe({
        next: (result: any) => {
          console.log('Employee added successfully:', result);
          // this.employeeList = result; 
          // this.getAllEmployee(); 
          // this.EmployeeObj = {
          //   employeeId: 0,
          //   firstName: '',
          //   lastName: '',
          //   email: '',
          //   phoneNumber: '',
          //   gender: '',
          //   dateOfBirth: '',
          //   department: '',
          //   designation: '',
          //   dateOfJoining: '',
          //   address: '',
          //   createdAt: '',
          //   updatedAt: ''
          // };

          window.alert('Employee added successfully!');
          window.location.reload(); // Reload the page to reflect the changes
        },
        error: (error) => {
          console.error('Failed to add employee:', error);
        }
      });
  }
}
