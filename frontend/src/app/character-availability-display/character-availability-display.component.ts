import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { CharacterAvailabilityService } from '../services/character-availability.service';
import { CharacterAvailabilityTableComponent } from '../character-availability-table/character-availability-table.component';

export const CHARACTER_NAME_REGEX = /^[a-zA-Z]+$/;
export const MAX_CHARACTER_NAME_LENGTH = 15;
export const MIN_CHARACTER_NAME_LENGTH = 2;
export const MAX_CHARACTER_NAME_COMBINED_LENGTH = 20;

@Component({
  selector: 'app-character-availability-display',
  standalone: true,
  imports: [CommonModule, FormsModule, CharacterAvailabilityTableComponent],
  templateUrl: './character-availability-display.component.html',
  styleUrls: ['./character-availability-display.component.scss'],
})
export class CharacterAvailabilityDisplayComponent {
  query = '';
  result: any = null;
  error: string | null = null;
  loading = false;
  isValid: boolean | null = null;

  constructor(private readonly characterService: CharacterAvailabilityService) { }

  private validateCharacterName(query: string): boolean {
    const names = query.split(' ');

    if (names.length !== 2) return false;

    const [firstName, lastName] = names;

    if (!CHARACTER_NAME_REGEX.test(firstName) || !CHARACTER_NAME_REGEX.test(lastName)) {
      return false;
    }

    if (
      firstName.length < MIN_CHARACTER_NAME_LENGTH ||
      firstName.length > MAX_CHARACTER_NAME_LENGTH ||
      lastName.length < MIN_CHARACTER_NAME_LENGTH ||
      lastName.length > MAX_CHARACTER_NAME_LENGTH
    ) {
      return false;
    }

    if (firstName.length + lastName.length > MAX_CHARACTER_NAME_COMBINED_LENGTH) {
      return false;
    }

    return true;
  }

  onInputChange(): void {
    this.isValid = this.validateCharacterName(this.query);
  }

  checkAvailability(): void {
    if (!this.isValid || !this.query) return;

    this.loading = true;
    this.error = null;
    this.result = null;

    this.characterService.checkCharacterAvailability(this.query)
      .pipe(
        catchError(err => {
          this.error = err?.error?.error || 'An unknown error occurred. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(data => this.result = data);
  }
}
