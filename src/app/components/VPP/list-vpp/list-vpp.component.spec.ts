import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListVppComponent } from './list-vpp.component';

describe('ListVppComponent', () => {
  let component: ListVppComponent;
  let fixture: ComponentFixture<ListVppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListVppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListVppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
