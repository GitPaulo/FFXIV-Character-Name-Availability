import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { CharacterAvailabilityService } from '../services/character-availability.service';
import { CharacterAvailabilityTableComponent } from '../character-availability-table/character-availability-table.component';
import { InfoModalComponent } from '../info-modal/info-modal.component';

@Component({
  selector: 'app-character-availability-display',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CharacterAvailabilityTableComponent,
    InfoModalComponent,
  ],
  templateUrl: './character-availability-display.component.html',
  styleUrls: ['./character-availability-display.component.scss'],
})
export class CharacterAvailabilityDisplayComponent
  implements AfterViewInit, OnDestroy
{
  @ViewChild('characterQueryInput') characterQueryInput!: ElementRef;
  @ViewChild(CharacterAvailabilityTableComponent)
  tableComponent!: CharacterAvailabilityTableComponent;

  query = '';
  result: any = null;
  error: string | null = null;
  loading = false;
  isValid: boolean | null = null;
  showLoadingMessage = false;
  isInfoModalVisible = false;

  readonly loadingMessageTimeoutDuration = 4000; // ms

  private loadingMessageTimeout: any;

  constructor(
    private readonly characterService: CharacterAvailabilityService
  ) {}

  ngOnDestroy(): void {
    if (this.loadingMessageTimeout) {
      clearTimeout(this.loadingMessageTimeout);
    }
  }

  ngAfterViewInit(): void {
    this.characterQueryInput.nativeElement.focus(); // Auto focus on input field
  }

  onInputChange(): void {
    // Important: Using CJS function from backend B)
    const isValidCharacterName =
      require('../../../../backend/lib/isValidCharacterName.js') as (
        query: string
      ) => boolean;
    this.isValid = isValidCharacterName(this.query);
  }

  checkAvailability(): void {
    if (!this.isValid || !this.query) {
      this.error = 'Please enter a valid character name.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.result = null;
    this.showLoadingMessage = false;
    this.loadingMessageTimeout = setTimeout(() => {
      this.showLoadingMessage = true;
    }, this.loadingMessageTimeoutDuration);

    this.characterService
      .checkCharacterAvailability(this.query)
      .pipe(
        catchError((err) => {
          this.error =
            err?.error?.error || 'An unknown error occurred. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          clearTimeout(this.loadingMessageTimeout);
        })
      )
      .subscribe((data) => {
        this.result = data;
        // Focus the filter input after the table is loaded
        if (data && this.tableComponent) {
          // Let the table component handle the timing for focus
          this.tableComponent.focusFilterInput();
        }
      });
  }

  openInfoModal(): void {
    this.isInfoModalVisible = true;
  }

  closeInfoModal(): void {
    this.isInfoModalVisible = false;
  }
}
