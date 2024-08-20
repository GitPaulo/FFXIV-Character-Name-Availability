import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Backend doesn't use types lol
// region map -> dc map -> world array
export type CharacterAvailabilityData = {
  [region: string]: {
    [dc: string]: {
      [world: string]: boolean
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class CharacterAvailabilityService {
  // TODO: This will need to be updated when served from firebase?
  private apiUrl = '/api/character-availability';

  constructor(private http: HttpClient) { }

  checkCharacterAvailability(query: string): Observable<CharacterAvailabilityData> {
    return this.http.get<CharacterAvailabilityData>(`${this.apiUrl}?query=${encodeURIComponent(query)}`);
  }
}
