/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TSReportBrokenAssetComponent } from './TSReportBrokenAsset.component';

describe('TSReportBrokenAssetComponent', () => {
  let component: TSReportBrokenAssetComponent;
  let fixture: ComponentFixture<TSReportBrokenAssetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TSReportBrokenAssetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TSReportBrokenAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
