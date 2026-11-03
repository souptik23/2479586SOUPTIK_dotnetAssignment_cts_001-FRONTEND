import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  selector: 'app-pdf-upload',
  standalone: true,
  templateUrl: './pdf-upload.html',
  styleUrl: './pdf-upload.css'
})
export class PdfUpload {

  private http = inject(HttpClient);
  private router = inject(Router);

  selectedFile: File | null = null;
  isExtracting = false;

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.selectedFile = input.files?.[0] ?? null;

  }

  onUploadAndExtractPdf(): void {

    if (!this.selectedFile) {
      alert('Please select a PDF file first.');
      return;
    }

    this.isExtracting = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post<EmployeeData>(
      'https://localhost:7091/api/pdf/extract-employee',
      formData
    ).subscribe({

      next: (extractedData) => {

        this.isExtracting = false;

        console.log('Extracted Employee Data:', extractedData);

        alert('Resume parsed successfully!');

        // Navigate to Employee Entry page with extracted data
        this.router.navigate(['/add'], {
          state: {
            employeeData: extractedData
          }
        });

      },

      error: (error) => {

        this.isExtracting = false;

        console.error('PDF extraction failed:', error);

        alert('Failed to parse PDF resume. Please enter details manually.');

      }

    });

  }

}