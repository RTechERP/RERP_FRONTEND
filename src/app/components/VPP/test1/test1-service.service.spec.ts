import { TestBed } from '@angular/core/testing';

import { Test1ServiceService } from './test1-service.service';

describe('Test1ServiceService', () => {
  let service: Test1ServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Test1ServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
