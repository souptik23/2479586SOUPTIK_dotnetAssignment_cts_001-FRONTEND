import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeEntry } from './employee-entry';

describe('EmployeeEntry', () => {
  let component: EmployeeEntry;
  let fixture: ComponentFixture<EmployeeEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeEntry],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
