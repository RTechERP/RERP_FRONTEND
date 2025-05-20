import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DangkyVppComponent } from './dangky-vpp.component';

describe('DangkyVppComponent', () => {
  let component: DangkyVppComponent;
  let fixture: ComponentFixture<DangkyVppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DangkyVppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DangkyVppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
