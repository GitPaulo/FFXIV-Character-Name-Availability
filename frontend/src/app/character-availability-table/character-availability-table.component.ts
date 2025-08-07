import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { CharacterAvailabilityData } from '../services/character-availability.service';
import { TooltipDirective } from '../tooltip.directive';

// Define the type for a single row in the availability table
type AvailabilityTableRow = {
  region: string;
  dc: string;
  world: string;
  available: boolean;
  color: string;
};

// Define the possible keys for sorting
type SortableColumns = 'region' | 'dc' | 'world' | 'available';

// Define the sort states
type SortState = 'none' | 'asc' | 'desc';

@Component({
  selector: 'app-character-availability-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipDirective],
  templateUrl: './character-availability-table.component.html',
  styleUrls: ['./character-availability-table.component.scss'],
})
export class CharacterAvailabilityTableComponent implements OnChanges {
  @Input() data: CharacterAvailabilityData | null = null;

  filterQuery: string = '';
  sortedData: AvailabilityTableRow[] = [];
  filteredData: AvailabilityTableRow[] = [];
  originalData: AvailabilityTableRow[] = [];

  // Track current sort state
  currentSortColumn: SortableColumns | null = null;
  currentSortState: SortState = 'none';

  readonly dcColors: string[] = [
    '#E3F2FD',
    '#E1F5FE',
    '#E0F7FA',
    '#E8F5E9',
    '#FFF3E0',
    '#FBE9E7',
  ];

  private filterQueryChanged: Subject<string> = new Subject<string>();

  constructor() {
    this.filterQueryChanged
      .pipe(debounceTime(300))
      .subscribe(() => this.applyFilter());
  }

  ngOnChanges(): void {
    if (this.data) {
      this.originalData = this.transformData(this.data);
      this.sortedData = [...this.originalData];
      this.filteredData = [...this.sortedData]; // Initialize filteredData with sortedData
      this.currentSortColumn = 'dc';
      this.currentSortState = 'asc';
      this.sortTable('dc'); // Default sorting by Data Center
    }
  }

  onFilterChange(query: string): void {
    this.filterQueryChanged.next(query);
  }

  openCharacterPage(world: string): void {
    const queryInput = document.getElementById(
      'characterQuery'
    ) as HTMLInputElement;
    const query = queryInput?.value || '';

    if (query) {
      const encodedQuery = encodeURIComponent(query);
      const encodedWorld = encodeURIComponent(world);
      const url = `https://na.finalfantasyxiv.com/lodestone/character/?q=${encodedQuery}&worldname=${encodedWorld}`;
      window.open(url, '_blank');
    }
  }

  sortTable(column: SortableColumns): void {
    this.updateSortState(column);
    this.applySorting();
  }

  private updateSortState(column: SortableColumns): void {
    if (this.currentSortColumn === column) {
      // Same column clicked, cycle through states
      this.currentSortState = this.getNextSortState(this.currentSortState);
    } else {
      // Different column clicked, start with ascending
      this.currentSortColumn = column;
      this.currentSortState = 'asc';
    }

    // Clear sort column when no sort is applied
    if (this.currentSortState === 'none') {
      this.currentSortColumn = null;
    }
  }

  private getNextSortState(currentState: SortState): SortState {
    const stateOrder: SortState[] = ['asc', 'desc', 'none'];
    const currentIndex = stateOrder.indexOf(currentState);
    return stateOrder[(currentIndex + 1) % stateOrder.length];
  }

  private applySorting(): void {
    if (this.currentSortState === 'none') {
      this.filteredData = this.getFilteredOriginalData();
    } else {
      this.sortFilteredData();
    }
  }

  private sortFilteredData(): void {
    const column = this.currentSortColumn!;
    this.filteredData.sort((a, b) => {
      const comparison = this.compareValues(a, b, column);
      return this.currentSortState === 'desc' ? -comparison : comparison;
    });
  }

  private compareValues(
    a: AvailabilityTableRow,
    b: AvailabilityTableRow,
    column: SortableColumns
  ): number {
    if (column === 'available') {
      // For boolean values: available items first when ascending
      return a.available === b.available ? 0 : a.available ? -1 : 1;
    }
    // For string values
    return a[column].localeCompare(b[column]);
  }

  // Helper method to get filtered data in original order
  private getFilteredOriginalData(): AvailabilityTableRow[] {
    const query = this.filterQuery.toLowerCase();
    return this.originalData.filter(
      (item) =>
        item.dc.toLowerCase().includes(query) ||
        item.world.toLowerCase().includes(query)
    );
  }

  // Method to get sort indicator for display
  getSortIndicator(column: SortableColumns): string {
    if (this.currentSortColumn !== column) {
      return '';
    }

    switch (this.currentSortState) {
      case 'asc':
        return ' ↑';
      case 'desc':
        return ' ↓';
      default:
        return '';
    }
  }

  private transformData(
    data: CharacterAvailabilityData
  ): AvailabilityTableRow[] {
    const result: AvailabilityTableRow[] = [];
    let colorIndex = 0;

    Object.keys(data).forEach((region) => {
      const regionData = data[region as keyof CharacterAvailabilityData];
      Object.keys(regionData).forEach((dc) => {
        const dcColor = this.getBackgroundColor(colorIndex++);
        const dcData = regionData[dc];
        Object.keys(dcData).forEach((world) => {
          result.push({
            region,
            dc,
            world,
            available: dcData[world],
            color: dcColor,
          });
        });
      });
    });

    return result;
  }

  private getBackgroundColor(index: number): string {
    return this.dcColors[index % this.dcColors.length];
  }

  private applyFilter(): void {
    const query = this.filterQuery.toLowerCase();
    this.filteredData = this.originalData.filter(
      (item) =>
        item.dc.toLowerCase().includes(query) ||
        item.world.toLowerCase().includes(query)
    );

    // Re-apply current sorting if any
    if (this.currentSortState !== 'none' && this.currentSortColumn) {
      this.sortFilteredData();
    }
  }
}
