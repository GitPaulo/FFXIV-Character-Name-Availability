import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterAvailabilityDisplayComponent } from './character-availability-display.component';

describe('CharacterAvailabilityDisplayComponent', () => {
  let component: CharacterAvailabilityDisplayComponent;
  let fixture: ComponentFixture<CharacterAvailabilityDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterAvailabilityDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterAvailabilityDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
