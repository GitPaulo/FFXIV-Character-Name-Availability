import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterAvailabilityTableComponent } from './character-availability-table.component';

describe('CharacterAvailabilityTableComponent', () => {
  let component: CharacterAvailabilityTableComponent;
  let fixture: ComponentFixture<CharacterAvailabilityTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterAvailabilityTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterAvailabilityTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
