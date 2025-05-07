import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DymanicComponentComponent } from './dymanic-component.component';

describe('DymanicComponentComponent', () => {
  let component: DymanicComponentComponent;
  let fixture: ComponentFixture<DymanicComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DymanicComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DymanicComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
