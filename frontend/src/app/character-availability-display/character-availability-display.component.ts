import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { CharacterAvailabilityService } from '../services/character-availability.service';
import { CharacterAvailabilityTableComponent } from '../character-availability-table/character-availability-table.component';

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

  onInputChange(): void {
    // Important: Using CJS function from backend B)
    const isValidCharacterName = require('../../../../backend/lib/isValidCharacterName.js') as (query: string) => boolean;
    this.isValid = isValidCharacterName(this.query);
  }

  checkAvailability(): void {
    if (!this.isValid || !this.query) return;

    this.loading = true;
    this.error = null;
    this.result = null;

    this.characterService.checkCharacterAvailability(this.query)
      .pipe(
        catchError(err => {
          debugger;
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
