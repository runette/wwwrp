import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbpSidebarComponent } from './sbp-sidebar.component';

describe('SbpSidebarComponent', () => {
  let component: SbpSidebarComponent;
  let fixture: ComponentFixture<SbpSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbpSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbpSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
