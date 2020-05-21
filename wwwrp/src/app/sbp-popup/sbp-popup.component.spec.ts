import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbpPopupComponent } from './sbp-popup.component';

describe('SbpPopupComponent', () => {
  let component: SbpPopupComponent;
  let fixture: ComponentFixture<SbpPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbpPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbpPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
