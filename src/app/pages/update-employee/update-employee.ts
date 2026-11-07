
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-update-employee',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './update-employee.html',
  styleUrl: './update-employee.css'
})
export class UpdateEmployee implements OnInit {

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  private readonly apiUrl = 'https://localhost:7091/api/employee';

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
    address: ''
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {

    // Get Employee ID from the route
    const employeeId = this.activatedRoute.snapshot.paramMap.get('id');

    if (employeeId) {
      this.loadEmployee(employeeId);
    } else {
      alert('Employee ID not found.');
      this.router.navigate(['/list']);
    }
  }

  // Load existing employee details
  loadEmployee(id: number | string): void {

    this.http.get<any>(`${this.apiUrl}/${id}`).subscribe({

      next: (employee) => {

        this.EmployeeObj = {
          ...employee,

          dateOfBirth: employee.dateOfBirth
            ? employee.dateOfBirth.split('T')[0]
            : '',

          dateOfJoining: employee.dateOfJoining
            ? employee.dateOfJoining.split('T')[0]
            : ''
        };

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error('Error loading employee:', error);

        alert('Unable to load employee details.');

      }

    });

  }

  // Update existing employee
  onUpdateEmployee(): void {

    if (!this.EmployeeObj.employeeId) {
      alert('Invalid Employee ID.');
      return;
    }

    const payload = {
      ...this.EmployeeObj
    };

    this.http.put(
      this.apiUrl,
      payload
    ).subscribe({

      next: (response) => {

        console.log('Employee updated successfully:', response);

        alert('Employee details updated successfully!');

        this.router.navigate(['/list']);

      },

      error: (error) => {

        console.error('Error updating employee:', error);

        alert('Failed to update employee details.');

      }

    });

  }

  // Cancel update and return to employee list
  onCancel(): void {

    this.router.navigate(['/list']);

  }

}
