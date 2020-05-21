import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbpSettingsComponent } from './sbp-settings.component';

describe('SbpSettingsComponent', () => {
  let component: SbpSettingsComponent;
  let fixture: ComponentFixture<SbpSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbpSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbpSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
