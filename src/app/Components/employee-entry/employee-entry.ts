import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-employee-entry',
  styleUrl: './employee-entry.css',
  templateUrl: './employee-entry.html',
})
export class EmployeeEntry {
  http = inject(HttpClient);

  selectedFile: File | null = null;
  isExtracting = false;

  EmployeeObj: any = this.getInitialEmployeeState();

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  // Upload PDF -> Extract text via PdfPig -> Extract JSON via Gemini -> Auto-fill Form
  onUploadAndExtractPdf(): void {
    if (!this.selectedFile) {
      alert('Please select a PDF file first.');
      return;
    }

    this.isExtracting = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post<any>('https://localhost:7091/api/pdf/extract-employee', formData)
      .subscribe({
        next: (extractedData) => {
          this.isExtracting = false;
          console.log('Data extracted from LLM:', extractedData);

          // Auto-fill form fields with extracted data
          this.EmployeeObj = {
            ...this.EmployeeObj,
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

          alert('Resume parsed successfully! Form fields have been auto-filled.');
        },
        error: (error) => {
          this.isExtracting = false;
          console.error('PDF extraction failed:', error);
          alert('Failed to parse PDF resume. Please enter details manually.');
        }
      });
  }

  onSubmitSaveEmployee(): void {
    const payload = { ...this.EmployeeObj };

    // Clean up empty ID and date fields before sending to .NET
    if (!payload.employeeId) delete payload.employeeId;
    if (!payload.dateOfBirth) delete payload.dateOfBirth;
    if (!payload.dateOfJoining) delete payload.dateOfJoining;

    this.http.post('https://localhost:7091/api/employee', payload)
      .subscribe({
        next: () => {
          alert('Employee added successfully!');
          this.EmployeeObj = this.getInitialEmployeeState();
          this.selectedFile = null;
        },
        error: (error) => {
          console.error('Failed to add employee:', error);
          alert('Failed to save employee record.');
        }
      });
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '';

    // Extract YYYY-MM-DD from an ISO date or datetime
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);

    if (match) {
      return match[0];
    }

    // Convert DD/MM/YYYY to YYYY-MM-DD
    const otherFormat = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (otherFormat) {
      return `${otherFormat[3]}-${otherFormat[2]}-${otherFormat[1]}`;
    }

    return '';
  }
}