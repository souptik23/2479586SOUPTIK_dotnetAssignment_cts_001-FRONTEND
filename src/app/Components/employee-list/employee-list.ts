
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
    console.log('Employee list initialized:', this.employeeList);
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

  deleteEmployee( employeeId: number): void {
    this.http.delete(`https://localhost:7091/api/employee/${employeeId}`)
      .subscribe({
        next: () => {
          console.log(`Employee with ID ${employeeId} deleted successfully.`);
          // this.getAllEmployee(); // Refresh the list after deletion
          this.employeeList = this.employeeList.filter(emp => emp.employeeId !== employeeId);
        },
        error: (error) => {
          console.error(`Failed to delete employee with ID ${employeeId}:`, error);
        }
      });
  }
}
