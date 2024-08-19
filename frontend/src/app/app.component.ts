import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CharacterAvailabilityDisplayComponent } from './character-availability-display/character-availability-display.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CharacterAvailabilityDisplayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ffxiv-character-availability';
}
