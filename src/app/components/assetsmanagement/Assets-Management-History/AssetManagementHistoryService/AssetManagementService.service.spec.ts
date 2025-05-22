/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AssetManagementServiceService } from './AssetManagementService.service';

describe('Service: AssetManagementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssetManagementServiceService]
    });
  });

  it('should ...', inject([AssetManagementServiceService], (service: AssetManagementServiceService) => {
    expect(service).toBeTruthy();
  }));
});
