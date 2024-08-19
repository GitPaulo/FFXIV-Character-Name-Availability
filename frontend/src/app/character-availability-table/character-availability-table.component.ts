import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CharacterAvailabilityResponse } from '../services/character-availability.service';

@Component({
  selector: 'app-character-availability-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-availability-table.component.html',
  styleUrl: './character-availability-table.component.scss'
})
export class CharacterAvailabilityTableComponent {
  @Input() data: CharacterAvailabilityResponse | null = null;

  objectKeys = Object.keys;
  objectEntries = (obj: any) => Object.entries(obj);

  // Array of colors for data centers
  dcColors: string[] = ['#E3F2FD', '#E1F5FE', '#E0F7FA', '#E8F5E9', '#FFF3E0', '#FBE9E7'];

  // Function to get the background color based on data center index
  getBackgroundColor(index: number): string {
    return this.dcColors[index % this.dcColors.length];
  }
}
