import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

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
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  checkCharacterAvailability(query: string): Observable<CharacterAvailabilityData> {
    return this.http.get<CharacterAvailabilityData>(`${this.apiUrl}/api/character-availability`, {
      params: { query }
    });
  }
}
