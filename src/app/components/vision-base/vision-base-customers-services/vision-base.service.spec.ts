import { TestBed } from '@angular/core/testing';

import { VisionBaseService } from './vision-base.service';

describe('VisionBaseService', () => {
  let service: VisionBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisionBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
