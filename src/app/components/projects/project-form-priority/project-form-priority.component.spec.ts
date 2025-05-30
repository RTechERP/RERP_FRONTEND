import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFormPriorityComponent } from './project-form-priority.component';

describe('ProjectFormPriorityComponent', () => {
  let component: ProjectFormPriorityComponent;
  let fixture: ComponentFixture<ProjectFormPriorityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectFormPriorityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectFormPriorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
