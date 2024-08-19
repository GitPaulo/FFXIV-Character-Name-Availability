import { TestBed } from '@angular/core/testing';

import { CharacterAvailabilityService } from './character-availability.service';

describe('CharacterAvailabilityService', () => {
  let service: CharacterAvailabilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharacterAvailabilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
