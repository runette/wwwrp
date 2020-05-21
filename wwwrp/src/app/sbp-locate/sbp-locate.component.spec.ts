import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbpLocateComponent } from './sbp-locate.component';

describe('SbpLocateComponent', () => {
  let component: SbpLocateComponent;
  let fixture: ComponentFixture<SbpLocateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbpLocateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbpLocateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
