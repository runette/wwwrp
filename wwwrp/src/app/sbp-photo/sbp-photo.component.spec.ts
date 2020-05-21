import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbpPhotoComponent } from './sbp-photo.component';

describe('SbpPhotoComponent', () => {
  let component: SbpPhotoComponent;
  let fixture: ComponentFixture<SbpPhotoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbpPhotoComponent ]
    })
    .compileComponents();
  }));
 
  beforeEach(() => {
    fixture = TestBed.createComponent(SbpPhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
