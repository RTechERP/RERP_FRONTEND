/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TSReportBrokenAssetService } from './TSReportBrokenAsset.service';

describe('Service: TSReportBrokenAsset', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TSReportBrokenAssetService]
    });
  });

  it('should ...', inject([TSReportBrokenAssetService], (service: TSReportBrokenAssetService) => {
    expect(service).toBeTruthy();
  }));
});
