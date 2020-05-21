import { TestBed } from '@angular/core/testing';

import { SbpCategoriesService } from './sbp-categories.service';

describe('SbpCategoriesService', () => {
  let service: SbpCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SbpCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
