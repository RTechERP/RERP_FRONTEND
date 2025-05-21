/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AssetStatusService } from './AssetStatus.service';

describe('Service: AssetStatus', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssetStatusService]
    });
  });

  it('should ...', inject([AssetStatusService], (service: AssetStatusService) => {
    expect(service).toBeTruthy();
  }));
});
