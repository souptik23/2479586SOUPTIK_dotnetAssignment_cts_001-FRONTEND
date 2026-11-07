import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DateRangeValidator } from '../date-range.validator';

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
  imports: [FormsModule, CommonModule, DateRangeValidator],
  templateUrl: './employee-entry.html',
  styleUrl: './employee-entry.css'
})
export class EmployeeEntry implements OnInit, OnDestroy {

  @ViewChild('employeeForm') employeeForm!: NgForm;

  private readonly apiUrl = 'https://localhost:7091/api/employee';
  private readonly debounceMs = 600;

  // ---- Email check internals ----
  private emailCheckRequestId = 0;
  private emailDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private checkedEmail = '';   // email that finished verification
  private pendingEmail = '';   // email whose request is in flight

  // ---- Phone check internals ----
  private phoneCheckRequestId = 0;
  private phoneDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private checkedPhone = '';
  private pendingPhone = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }


  // ---- Email validation state ----
  emailExist = false;
  emailAvailable = false;
  emailCheckError = false;
  isCheckingEmail = false;

  // ---- Phone validation state ----
  phoneExist = false;
  phoneAvailable = false;
  phoneCheckError = false;
  isCheckingPhone = false;

  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  phonePattern = /^[0-9]{10}$/;

  EmployeeObj: any = this.getInitialEmployeeState();

  today: string = this.formatDateForInput(new Date());
  maxDateOfBirth: string = this.getMaxDateOfBirth();

  // ------- EmployeeId section
  nextEmployeeId: number | null = null;

  get minJoiningDate(): string {
    const dob: string = this.EmployeeObj.dateOfBirth;
    if (!dob) {
      return '';
    }

    const [year, month, day] = dob.split('-').map(Number);
    return this.formatDateForInput(new Date(year + 18, month - 1, day));
  }

  ngOnInit(): void {

    // Receive extracted data from PDF Upload component
    const extractedData: EmployeeData | undefined = history.state?.employeeData;

    this.getNextEmployeeId();



    if (extractedData) {

      this.EmployeeObj = {
        ...this.getInitialEmployeeState(),
        firstName: extractedData.firstName ?? '',
        lastName: extractedData.lastName ?? '',
        email: extractedData.email ?? '',
        phoneNumber: this.normalizePhone(extractedData.phoneNumber),
        gender: extractedData.gender ?? '',
        dateOfBirth: this.formatDate(extractedData.dateOfBirth),
        department: extractedData.department ?? '',
        designation: extractedData.designation ?? '',
        dateOfJoining: this.formatDate(extractedData.dateOfJoining),
        address: extractedData.address ?? ''
      };

      // Validate values that came from the resume immediately
      this.checkEmailExistence();
      this.checkPhoneExistence();
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.cancelEmailDebounce();
    this.cancelPhoneDebounce();
    this.emailCheckRequestId++; // ignore responses arriving after destroy
    this.phoneCheckRequestId++;
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


  // ===============================================
  // Fetch the next available Employee ID from the backend
  // ================================================

  getNextEmployeeId(): void {

    this.nextEmployeeId = null;

    this.http.get<{ nextEmployeeId: number }>(
      `${this.apiUrl}/next-employee-id`
    ).subscribe({

      next: (response) => {
        this.nextEmployeeId = response.nextEmployeeId;
        this.cdr.detectChanges();

        console.log('Next Employee ID:', this.nextEmployeeId);
      },

      error: (error) => {
        console.error('Error fetching next Employee ID:', error);

        this.nextEmployeeId = null;
      }

    });
  }

  // ================================================
  // EMAIL DUPLICATE CHECK - DEBOUNCE + BLUR
  // ================================================

  private cancelEmailDebounce(): void {
    if (this.emailDebounceTimer) {
      clearTimeout(this.emailDebounceTimer);
      this.emailDebounceTimer = null;
    }
  }

  private resetEmailState(): void {
    this.emailExist = false;
    this.emailAvailable = false;
    this.emailCheckError = false;
    this.isCheckingEmail = false;
    this.checkedEmail = '';
    this.pendingEmail = '';
  }

  // Called on every keystroke via (ngModelChange)
  onEmailChange(): void {

    // Invalidate any in-flight request and pending timer
    this.emailCheckRequestId++;
    this.cancelEmailDebounce();
    this.resetEmailState();

    const email = (this.EmployeeObj.email ?? '').trim();

    if (!email || !this.emailPattern.test(email)) {
      return;
    }

    // Show "Checking..." and keep Save disabled while waiting
    this.isCheckingEmail = true;

    this.emailDebounceTimer = setTimeout(() => {
      this.emailDebounceTimer = null;
      this.checkEmailExistence();
    }, this.debounceMs);
  }

  // Called by the debounce timer, by (blur), and on page load.
  // Safe to call repeatedly: duplicate calls are skipped.
  checkEmailExistence(): void {

    // Blur beats the timer: cancel it so we don't check twice
    this.cancelEmailDebounce();

    const email = (this.EmployeeObj.email ?? '').trim();

    if (!email || !this.emailPattern.test(email)) {
      this.resetEmailState();
      this.cdr.markForCheck();
      return;
    }

    // Already verified, or a request for this email is in flight
    if (email === this.checkedEmail || email === this.pendingEmail) {
      return;
    }

    const requestId = ++this.emailCheckRequestId;

    this.emailExist = false;
    this.emailAvailable = false;
    this.emailCheckError = false;
    this.isCheckingEmail = true;
    this.pendingEmail = email;
    this.cdr.markForCheck();

    this.http.get<{ exists: boolean }>(
      `${this.apiUrl}/check-email?email=${encodeURIComponent(email)}`
    ).subscribe({

      next: (response) => {
        if (requestId !== this.emailCheckRequestId) {
          return; // outdated response
        }

        this.emailExist = response.exists;
        this.emailAvailable = !response.exists;
        this.emailCheckError = false;
        this.isCheckingEmail = false;
        this.checkedEmail = email;
        this.pendingEmail = '';

        this.cdr.markForCheck();
      },

      error: (error) => {
        if (requestId !== this.emailCheckRequestId) {
          return;
        }

        console.error('Email verification failed:', error);

        this.emailCheckError = true;
        this.isCheckingEmail = false;
        this.checkedEmail = '';
        this.pendingEmail = ''; // allows retry on blur / next keystroke

        this.cdr.markForCheck();
      }
    });
  }

  // ================================================
  // PHONE DUPLICATE CHECK - DEBOUNCE + BLUR
  // ================================================

  private cancelPhoneDebounce(): void {
    if (this.phoneDebounceTimer) {
      clearTimeout(this.phoneDebounceTimer);
      this.phoneDebounceTimer = null;
    }
  }

  private resetPhoneState(): void {
    this.phoneExist = false;
    this.phoneAvailable = false;
    this.phoneCheckError = false;
    this.isCheckingPhone = false;
    this.checkedPhone = '';
    this.pendingPhone = '';
  }

  // Called on every keystroke via (ngModelChange)
  onPhoneChange(): void {

    this.phoneCheckRequestId++;
    this.cancelPhoneDebounce();
    this.resetPhoneState();

    const phone = (this.EmployeeObj.phoneNumber ?? '').toString().trim();

    // Only check once exactly 10 digits are entered
    if (!phone || !this.phonePattern.test(phone)) {
      return;
    }

    this.isCheckingPhone = true;

    this.phoneDebounceTimer = setTimeout(() => {
      this.phoneDebounceTimer = null;
      this.checkPhoneExistence();
    }, this.debounceMs);
  }

  // Called by the debounce timer, by (blur), and on page load.
  checkPhoneExistence(): void {

    this.cancelPhoneDebounce();

    const phone = (this.EmployeeObj.phoneNumber ?? '').toString().trim();

    if (!phone || !this.phonePattern.test(phone)) {
      this.resetPhoneState();
      this.cdr.markForCheck();
      return;
    }

    if (phone === this.checkedPhone || phone === this.pendingPhone) {
      return;
    }

    const requestId = ++this.phoneCheckRequestId;

    this.phoneExist = false;
    this.phoneAvailable = false;
    this.phoneCheckError = false;
    this.isCheckingPhone = true;
    this.pendingPhone = phone;
    this.cdr.markForCheck();

    this.http.get<{ exists: boolean }>(
      `${this.apiUrl}/check-phone?phone=${encodeURIComponent(phone)}`
    ).subscribe({

      next: (response) => {
        if (requestId !== this.phoneCheckRequestId) {
          return;
        }

        this.phoneExist = response.exists;
        this.phoneAvailable = !response.exists;
        this.phoneCheckError = false;
        this.isCheckingPhone = false;
        this.checkedPhone = phone;
        this.pendingPhone = '';

        this.cdr.markForCheck();
      },

      error: (error) => {
        if (requestId !== this.phoneCheckRequestId) {
          return;
        }

        console.error('Phone verification failed:', error);

        this.phoneCheckError = true;
        this.isCheckingPhone = false;
        this.checkedPhone = '';
        this.pendingPhone = '';

        this.cdr.markForCheck();
      }
    });
  }

  // Resumes often contain "+91 98765 43210" or "(987) 654-3210".
  // Keep only digits and take the last 10 so the field's pattern accepts it.
  private normalizePhone(value: string | undefined | null): string {
    const digits = (value ?? '').replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  }

  // ================================================
  // SAVE EMPLOYEE
  // ================================================

  onSubmitSaveEmployee(): void {

    const email = (this.EmployeeObj.email ?? '').trim();
    const phone = (this.EmployeeObj.phoneNumber ?? '').toString().trim();

    // Both email and phone must be verified as available
    if (
      !this.emailPattern.test(email) ||
      this.emailExist ||
      this.isCheckingEmail ||
      this.emailCheckError ||
      !this.emailAvailable ||
      this.checkedEmail !== email ||

      !this.phonePattern.test(phone) ||
      this.phoneExist ||
      this.isCheckingPhone ||
      this.phoneCheckError ||
      !this.phoneAvailable ||
      this.checkedPhone !== phone
    ) {
      alert('Please enter a valid email and phone number and verify that they are available.');
      return;
    }

    const payload = {
      ...this.EmployeeObj,
      email,
      phoneNumber: phone
    };

    // Always remove Employee ID from a new employee request.
    // SQL Server generates it.
    delete payload.employeeId;

    if (!payload.dateOfBirth) {
      delete payload.dateOfBirth;
    }

    if (!payload.dateOfJoining) {
      delete payload.dateOfJoining;
    }

    this.http.post(this.apiUrl, payload).subscribe({

      next: (response: any) => {
        alert(`Employee added successfully! Employee ID: ${response.employeeId}`);
        this.clearForm();
      },

      error: (error) => {
        console.error('Failed to add employee:', error);

        if (error.status === 409) {
          // Backend unique-index conflict: tells us which field clashed
          if (error.error?.field === 'phone') {
            this.phoneExist = true;
            this.phoneAvailable = false;
            this.checkedPhone = '';
          } else {
            this.emailExist = true;
            this.emailAvailable = false;
            this.checkedEmail = '';
          }
          alert(error.error?.message ?? 'Duplicate value found.');
        } else {
          alert('Failed to save employee record.');
        }

        // A failed insert can still consume an identity value,
        // so re-fetch the ID shown in the form.
        this.getNextEmployeeId();

        this.cdr.markForCheck();
      }
    });
  }

  // ================================================
  // CLEAR FORM
  // ================================================

  clearForm(): void {
    this.emailCheckRequestId++;
    this.phoneCheckRequestId++;
    this.cancelEmailDebounce();
    this.cancelPhoneDebounce();

    const initialState = this.getInitialEmployeeState();

    // Resets values AND the touched / dirty / submitted flags,
    // so no "required" errors appear on the empty form
    this.employeeForm.resetForm(initialState);
    this.EmployeeObj = initialState;

    this.resetEmailState();
    this.resetPhoneState();

    this.getNextEmployeeId();
    this.cdr.markForCheck();
  }

  // ================================================
  // DATE HELPERS
  // ================================================

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