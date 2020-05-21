import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbpInventoryComponent } from './sbp-inventory.component';

describe('SbpInventoryComponent', () => {
  let component: SbpInventoryComponent;
  let fixture: ComponentFixture<SbpInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbpInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbpInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
