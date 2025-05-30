import {
  Component,
  ComponentFactoryResolver,
  OnInit,
  ViewChild,
  ViewContainerRef,
  Type,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgModule } from '@angular/core';
import { EmployeesComponent } from './components/employees/employees.component';
import { MenusComponent } from './components/menus/menus.component';
import { MenuService } from './components/menus/menu-service/menu.service';
import { DymanicComponentComponent } from './dymanic-component/dymanic-component.component';
import { ProjectPartlistPriceRequestComponent } from "./components/project-partlist-price-request/project-partlist-price-request.component";

import { ProjectsComponent } from './components/projects/projects.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ProjectPartlistPriceRequestComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'R_ERP';

  menus: any[] = [];

  @ViewChild('viewcomponent', { read: ViewContainerRef })
  viewcomponent!: ViewContainerRef;
  @ViewChild('container', { read: ViewContainerRef })
  container!: ViewContainerRef;

  constructor(
    private menuService: MenuService,
    private resolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    this.getMenus();
  }

  getComponentByType(type: string): Type<any> | null {
    switch (type) {
      case 'a':
        return MenusComponent;
      case 'b':
        return EmployeesComponent;
      case 'p':
        return ProjectsComponent;
      default:
        return null;
    }
  }

  addComponent(type: string) {
    //1. Tạo view để add component
    const viewFactory = this.resolver.resolveComponentFactory(
      DymanicComponentComponent
    );
    const viewRef = this.viewcomponent.createComponent(viewFactory);
    const viewVCRef = viewRef.instance.getViewContainer();

    //2. Xác định component cần add
    const comp = this.getComponentByType(type);
    console.log('comp', comp);
    if (comp) {
      const compFactory = this.resolver.resolveComponentFactory(comp);
      viewVCRef.createComponent(compFactory);
    }

    this.container.clear(); // (nếu muốn xóa trước)
    this.container.createComponent(MenusComponent);

    const viewReff = this.viewcomponent.createComponent(viewFactory);
  }

  removeComponent() {
    alert('xóa');
  }

  getMenus(): void {
    this.menuService.getMenus().subscribe({
      next: (response: any) => {
        this.menus = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }
}
