import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPokhComponent } from './list-pokh.component';

describe('ListPokhComponent', () => {
  let component: ListPokhComponent;
  let fixture: ComponentFixture<ListPokhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPokhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPokhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
