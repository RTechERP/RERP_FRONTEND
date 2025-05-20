import { TestBed } from '@angular/core/testing';

import { VppServiceService } from './vpp-service.service';

describe('VppServiceService', () => {
  let service: VppServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VppServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
