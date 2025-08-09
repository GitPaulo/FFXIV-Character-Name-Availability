import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { CharacterAvailabilityData } from '../services/character-availability.service';
import { TooltipDirective } from '../tooltip.directive';

type AvailabilityTableRow = {
  region: string;
  dc: string;
  world: string;
  available: boolean;
  color: string;
};

type SortableColumns = 'region' | 'dc' | 'world' | 'available';
type SortState = 'none' | 'asc' | 'desc';

@Component({
  selector: 'app-character-availability-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipDirective],
  templateUrl: './character-availability-table.component.html',
  styleUrls: ['./character-availability-table.component.scss'],
})
export class CharacterAvailabilityTableComponent
  implements OnChanges, OnDestroy
{
  @Input() data: CharacterAvailabilityData | null = null;
  @ViewChild('filterInput') filterInput!: ElementRef<HTMLInputElement>;

  filterQuery = '';
  filteredData: AvailabilityTableRow[] = [];
  originalData: AvailabilityTableRow[] = [];

  currentSortColumn: SortableColumns | null = null;
  currentSortState: SortState = 'none';

  private static readonly dcColors = [
    '#E3F2FD',
    '#E1F5FE',
    '#E0F7FA',
    '#E8F5E9',
    '#FFF3E0',
    '#FBE9E7',
  ] as const;
  private static readonly sortStateOrder: readonly SortState[] = [
    'asc',
    'desc',
    'none',
  ] as const;
  private static readonly lodestoneBaseUrl =
    'https://na.finalfantasyxiv.com/lodestone/character/' as const;

  private readonly destroy$ = new Subject<void>();
  private readonly filterQueryChanged = new Subject<string>();

  constructor() {
    this.filterQueryChanged
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilter());
  }

  ngOnChanges(): void {
    if (this.data) {
      this.originalData = this.transformData(this.data);
      this.filteredData = [...this.originalData];
      this.currentSortColumn = 'dc';
      this.currentSortState = 'asc';
      this.sortTable('dc');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterChange(query: string): void {
    this.filterQueryChanged.next(query);
  }

  sortTable(column: SortableColumns): void {
    this.updateSortState(column);
    this.applySorting();
  }

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

  openCharacterPage(world: string): void {
    const queryInput = document.getElementById(
      'characterQuery'
    ) as HTMLInputElement;
    const query = queryInput?.value || '';

    if (query) {
      const params = new URLSearchParams({
        q: query,
        worldname: world,
      });
      const url = `${CharacterAvailabilityTableComponent.lodestoneBaseUrl}?${params}`;
      window.open(url, '_blank');
    }
  }

  focusFilterInput(): void {
    this.filterInput?.nativeElement?.focus();
  }

  private updateSortState(column: SortableColumns): void {
    if (this.currentSortColumn === column) {
      this.currentSortState = this.getNextSortState(this.currentSortState);
    } else {
      this.currentSortColumn = column;
      this.currentSortState = 'asc';
    }

    if (this.currentSortState === 'none') {
      this.currentSortColumn = null;
    }
  }

  private getNextSortState(currentState: SortState): SortState {
    const currentIndex =
      CharacterAvailabilityTableComponent.sortStateOrder.indexOf(currentState);
    return CharacterAvailabilityTableComponent.sortStateOrder[
      (currentIndex + 1) %
        CharacterAvailabilityTableComponent.sortStateOrder.length
    ];
  }

  private applySorting(): void {
    this.applyFilter();
  }

  private compareValues(
    a: AvailabilityTableRow,
    b: AvailabilityTableRow,
    column: SortableColumns
  ): number {
    if (column === 'available') {
      return a.available === b.available ? 0 : a.available ? -1 : 1;
    }
    return a[column].localeCompare(b[column]);
  }

  private getFilteredData(): AvailabilityTableRow[] {
    const query = this.filterQuery.toLowerCase();
    return this.originalData.filter(
      (item) =>
        item.dc.toLowerCase().includes(query) ||
        item.world.toLowerCase().includes(query)
    );
  }

  private applyFilter(): void {
    this.filteredData = this.getFilteredData();

    if (this.currentSortState !== 'none' && this.currentSortColumn) {
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

  private transformData(
    data: CharacterAvailabilityData
  ): AvailabilityTableRow[] {
    let colorIndex = 0;

    return Object.entries(data).flatMap(([region, regionData]) =>
      Object.entries(regionData).flatMap(([dc, dcData]) => {
        const dcColor = this.getBackgroundColor(colorIndex++);
        return Object.entries(dcData).map(([world, available]) => ({
          region,
          dc,
          world,
          available,
          color: dcColor,
        }));
      })
    );
  }

  private getBackgroundColor(index: number): string {
    return CharacterAvailabilityTableComponent.dcColors[
      index % CharacterAvailabilityTableComponent.dcColors.length
    ];
  }
}
