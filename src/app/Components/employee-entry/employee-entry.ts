import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface EmployeeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  department?: string;
  designation?: string;
  dateOfJoining?: string;
  address?: string;
}

@Component({
  selector: 'app-employee-entry',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './employee-entry.html',
  styleUrl: './employee-entry.css'
})
export class EmployeeEntry implements OnInit {

  private http = inject(HttpClient);
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  EmployeeObj: any = this.getInitialEmployeeState();

  ngOnInit(): void {

    // Receive extracted data from PDF Upload component
    const extractedData: EmployeeData | undefined =
      history.state?.employeeData;

    if (extractedData) {

      this.EmployeeObj = {

        ...this.getInitialEmployeeState(),

        firstName: extractedData.firstName ?? '',
        lastName: extractedData.lastName ?? '',
        email: extractedData.email ?? '',
        phoneNumber: extractedData.phoneNumber ?? '',
        gender: extractedData.gender ?? '',

        dateOfBirth: this.formatDate(extractedData.dateOfBirth),

        department: extractedData.department ?? '',
        designation: extractedData.designation ?? '',

        dateOfJoining: this.formatDate(extractedData.dateOfJoining),

        address: extractedData.address ?? ''

      };

      console.log('Employee form populated:', this.EmployeeObj);

    }

  }

  getInitialEmployeeState() {

    return {
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
      address: ''
    };

  }

  // Save Employee
  onSubmitSaveEmployee(): void {

    const payload = { ...this.EmployeeObj };

    if (!payload.employeeId) {
      delete payload.employeeId;
    }

    if (!payload.dateOfBirth) {
      delete payload.dateOfBirth;
    }

    if (!payload.dateOfJoining) {
      delete payload.dateOfJoining;
    }

    this.http.post(
      'https://localhost:7091/api/employee',
      payload
    ).subscribe({

      next: () => {

        alert('Employee added successfully!');

        // Reset form after successful save
        this.EmployeeObj = this.getInitialEmployeeState();
        this.reloadPage();


      },

      error: (error) => {

        console.error('Failed to add employee:', error);

        alert('Failed to save employee record.');

      }

    });

  }

  // Convert extracted dates into YYYY-MM-DD format
  formatDate(value: string | null | undefined): string {

    if (!value) {
      return '';
    }

    // ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
    const isoMatch = value.match(/^\d{4}-\d{2}-\d{2}/);

    if (isoMatch) {
      return isoMatch[0];
    }

    // DD/MM/YYYY format
    const otherFormat = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (otherFormat) {
      return `${otherFormat[3]}-${otherFormat[2]}-${otherFormat[1]}`;
    }

    return '';

  }

  reloadPage(): void {
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    if (!hasReloaded) {
      sessionStorage.setItem('hasReloaded', 'true');
      location.reload();
    } else {
      sessionStorage.removeItem('hasReloaded');
    }
  }

  // Today's date in YYYY-MM-DD format
  today: string = new Date().toISOString().split('T')[0];

  // Minimum date of birth (18 years ago)
  maxDateOfBirth: string = this.getMaxDateOfBirth();

  getMaxDateOfBirth(): string {
    const today = new Date();

    const maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

    return this.formatDateForInput(maxDate);
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

} 