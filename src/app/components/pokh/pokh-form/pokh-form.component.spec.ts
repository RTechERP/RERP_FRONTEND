import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokhFormComponent } from './pokh-form.component';

describe('PokhFormComponent', () => {
  let component: PokhFormComponent;
  let fixture: ComponentFixture<PokhFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokhFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokhFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
