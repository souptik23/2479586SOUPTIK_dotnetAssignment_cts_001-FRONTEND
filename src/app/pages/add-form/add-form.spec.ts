import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddForm } from './add-form';

describe('AddForm', () => {
  let component: AddForm;
  let fixture: ComponentFixture<AddForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddForm],
    }).compileComponents();

    fixture = TestBed.createComponent(AddForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
