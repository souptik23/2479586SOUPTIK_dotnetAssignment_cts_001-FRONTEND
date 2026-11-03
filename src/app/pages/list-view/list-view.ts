import { Component } from '@angular/core';
import { EmployeeList } from '../../Components/employee-list/employee-list';


@Component({
  imports: [EmployeeList],
  selector: 'app-list-view',
  styleUrl: './list-view.css',
  templateUrl: './list-view.html',
})
export class ListView {}
