import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  imports: [DatePipe, FormsModule],
  selector: 'app-employee-view',
  styleUrl: './employee-view.css',
  templateUrl: './employee-view.html',
})
export class EmployeeView implements OnInit {

  private http = inject(HttpClient);

  EmployeeObj: any = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }


  ngOnInit(): void {
    const employeeId = this.activatedRoute.snapshot.paramMap.get('id');

    if (employeeId) {
      this.loadEmployee(employeeId);
    }
    this.reloadPage();
  }

  loadEmployee(employeeId: string): void {
    this.http.get<any>(`https://localhost:7091/api/employee/${employeeId}`).subscribe({
      next: (employee) => {
        console.log('Employee data:', employee);
        this.EmployeeObj = employee;
      },

      error: (error) => {
        console.error('Error fetching employee:', error);
      }
    })
  }

  reloadPage(): void {
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    if (!hasReloaded) {
      sessionStorage.setItem('hasReloaded', 'true');
      window.location.reload();
    } else {
      sessionStorage.removeItem('hasReloaded');
    }
  }

  closePage(): void {
    this.router.navigate(['/list']);
  }
}
