import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { AddForm } from './pages/add-form/add-form';
import { ListView } from './pages/list-view/list-view';
import { UpdateEmployee } from './pages/update-employee/update-employee';
import { EmployeeView } from './pages/employee-view/employee-view';
import { PageNotFound } from './pages/page-not-found/page-not-found';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'add', component: AddForm},
    {path: 'list', component: ListView},
    {path: 'update/:id', component: UpdateEmployee},
    {path: 'view/:id', component: EmployeeView},
    {path: '**', component: PageNotFound} // Wildcard route for a 404 page  
    
];
