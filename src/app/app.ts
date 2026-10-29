import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EmployeeEntry } from './Components/employee-entry/employee-entry';
import { EmployeeList } from './Components/employee-list/employee-list';

@Component({
  imports: [EmployeeEntry, EmployeeList],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('AngularFrontend');
}
