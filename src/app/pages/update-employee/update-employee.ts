
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
  ) { }

  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const employeeId = this.activatedRoute.snapshot.paramMap.get('id');

    if (employeeId) {
      this.loadEmployee(employeeId);
    }

    // const hasReloaded = sessionStorage.getItem('hasReloaded');
    // if (!hasReloaded) {
    //   sessionStorage.setItem('hasReloaded', 'true');
    //   window.location.reload();
    // } else {
    //   sessionStorage.removeItem('hasReloaded');
    // }
  }

  // Load existing employee details
  loadEmployee(id: number | string): void {

    this.http
      .get<any>(`https://localhost:7091/api/employee/${id}`)
      .subscribe({
        next: (employee) => {

          console.log('Employee loaded:', employee);

          this.EmployeeObj = {
            ...employee,

            // Convert API date format to HTML date format
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

  // Update employee details
  onUpdateEmployee(): void {

    this.http
      .put(
        'https://localhost:7091/api/employee',
        this.EmployeeObj
      )
      .subscribe({

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

  // Cancel and return to employee list
  onCancel(): void {
    this.router.navigate(['/list']);
  }

}
