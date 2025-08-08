import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoModalComponent } from './info-modal.component';

describe('InfoModalComponent', () => {
  let component: InfoModalComponent;
  let fixture: ComponentFixture<InfoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closeModal when close button is clicked', () => {
    spyOn(component.closeModal, 'emit');
    component.onCloseModal();
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should close modal on Escape key press', () => {
    spyOn(component.closeModal, 'emit');
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    component.onEscapeKey(event);
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should close modal when clicking on backdrop', () => {
    spyOn(component.closeModal, 'emit');
    const event = { target: {}, currentTarget: {} } as any;
    event.target = event.currentTarget; // Simulate clicking on backdrop
    component.onBackdropClick(event);
    expect(component.closeModal.emit).toHaveBeenCalled();
  });
});
