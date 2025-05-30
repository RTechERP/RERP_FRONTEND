import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFormAddStatusComponent } from './project-form-add-status.component';

describe('ProjectFormAddStatusComponent', () => {
  let component: ProjectFormAddStatusComponent;
  let fixture: ComponentFixture<ProjectFormAddStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectFormAddStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectFormAddStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
