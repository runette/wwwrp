import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbpOlMapComponent } from './sbp-ol-map.component';

describe('SbpOlMapComponent', () => {
  let component: SbpOlMapComponent;
  let fixture: ComponentFixture<SbpOlMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbpOlMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbpOlMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
