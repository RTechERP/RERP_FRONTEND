import { TestBed } from '@angular/core/testing';

import { PokhServiceService } from './pokh.service';

describe('PokhServiceService', () => {
  let service: PokhServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokhServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
