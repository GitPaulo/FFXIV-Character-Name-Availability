import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// region map -> dc map -> world array
export type CharacterAvailabilityResponse = {
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
  private apiUrl = '/api/character-availability';

  constructor(private http: HttpClient) { }

  checkCharacterAvailability(query: string): Observable<CharacterAvailabilityResponse> {
    return this.http.get<CharacterAvailabilityResponse>(`${this.apiUrl}?query=${encodeURIComponent(query)}`);
  }
}
