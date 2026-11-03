import { Component } from '@angular/core';
import { EmployeeEntry } from '../../Components/employee-entry/employee-entry';

@Component({
  imports: [EmployeeEntry],
  selector: 'app-add-form',
  styleUrl: './add-form.css',
  templateUrl: './add-form.html',
})
export class AddForm {}
