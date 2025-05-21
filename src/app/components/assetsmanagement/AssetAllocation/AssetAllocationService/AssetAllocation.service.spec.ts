/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AssetAllocationService } from './AssetAllocation.service';

describe('Service: AssetAllocation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssetAllocationService]
    });
  });

  it('should ...', inject([AssetAllocationService], (service: AssetAllocationService) => {
    expect(service).toBeTruthy();
  }));
});
