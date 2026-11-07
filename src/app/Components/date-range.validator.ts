import { Directive, Input, OnChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appDateRange]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: DateRangeValidator, multi: true }]
})
export class DateRangeValidator implements Validator, OnChanges {

  @Input() minDate = '';   // YYYY-MM-DD, empty = no minimum
  @Input() maxDate = '';   // YYYY-MM-DD, empty = no maximum

  private onChange: () => void = () => {};

  validate(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;

    if (!value) {
      return null; // "required" is handled separately
    }

    // YYYY-MM-DD strings compare correctly as plain text
    if (this.minDate && value < this.minDate) {
      return { dateMin: true };
    }
    if (this.maxDate && value > this.maxDate) {
      return { dateMax: true };
    }
    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }

  // Re-validate when the limits change (e.g. the DOB changes,
  // so the joining-date minimum moves)
  ngOnChanges(): void {
    this.onChange();
  }
} 