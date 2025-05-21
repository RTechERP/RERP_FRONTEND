/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TransferAssetsServiceService } from './TransferAssetsService.service';

describe('Service: TransferAssetsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransferAssetsServiceService]
    });
  });

  it('should ...', inject([TransferAssetsServiceService], (service: TransferAssetsServiceService) => {
    expect(service).toBeTruthy();
  }));
});
