import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { CharacterAvailabilityData } from '../services/character-availability.service';

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

@Component({
  selector: 'app-character-availability-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-availability-table.component.html',
  styleUrls: ['./character-availability-table.component.scss'],
})
export class CharacterAvailabilityTableComponent implements OnChanges {
  @Input() data: CharacterAvailabilityData | null = null;

  filterQuery: string = '';
  sortedData: AvailabilityTableRow[] = [];
  filteredData: AvailabilityTableRow[] = [];

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
      this.sortedData = this.transformData(this.data);
      this.filteredData = [...this.sortedData]; // Initialize filteredData with sortedData
      this.sortTable('dc'); // Default sorting by Data Center
    }
  }

  onFilterChange(query: string): void {
    this.filterQueryChanged.next(query);
  }

  openCharacterPage(world: string): void {
    const queryInput = document.getElementById('characterQuery') as HTMLInputElement;
    const query = queryInput?.value || '';

    if (query) {
      const encodedQuery = encodeURIComponent(query);
      const encodedWorld = encodeURIComponent(world);
      const url = `https://na.finalfantasyxiv.com/lodestone/character/?q=${encodedQuery}&worldname=${encodedWorld}`;
      window.open(url, '_blank');
    }
  }

  sortTable(column: SortableColumns): void {
    this.filteredData.sort((a, b) => {
      if (column === 'available') {
        return a.available === b.available ? 0 : a.available ? -1 : 1;
      }
      return a[column].localeCompare(b[column]);
    });
  }

  private transformData(data: CharacterAvailabilityData): AvailabilityTableRow[] {
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
    this.filteredData = this.sortedData.filter(
      (item) =>
        item.dc.toLowerCase().includes(query) ||
        item.world.toLowerCase().includes(query)
    );
  }
}
