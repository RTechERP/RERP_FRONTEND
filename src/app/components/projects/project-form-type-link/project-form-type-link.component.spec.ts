import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFormTypeLinkComponent } from './project-form-type-link.component';

describe('ProjectFormTypeLinkComponent', () => {
  let component: ProjectFormTypeLinkComponent;
  let fixture: ComponentFixture<ProjectFormTypeLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectFormTypeLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectFormTypeLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
