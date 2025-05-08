import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POKHComponent } from './pokh.component';

describe('POKHComponent', () => {
  let component: POKHComponent;
  let fixture: ComponentFixture<POKHComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [POKHComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(POKHComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
