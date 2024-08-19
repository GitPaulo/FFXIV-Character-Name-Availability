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

  constructor(private characterService: CharacterAvailabilityService) { }

  checkAvailability() {
    if (!this.query) return; // Early return if query is empty.

    this.loading = true;
    this.error = null;
    this.result = null;

    this.characterService.checkCharacterAvailability(this.query)
      .pipe(
        catchError(err => {
          debugger;
          if (err.error && err.error.error) {
            this.error = err.error.error; // Extract the error message from the response body
          } else {
            this.error = 'An unknown error occurred. Please try again.';
          }
          return of(null); // Return null observable in case of error
        }),
        finalize(() => {
          this.loading = false; // Stop the loading state once the observable completes
        })
      )
      .subscribe(data => {
        if (data) {
          this.result = data;
        }
      });
  }
}
