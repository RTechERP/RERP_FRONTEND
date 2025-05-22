import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef, Type } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { EmployeesComponent } from './components/employees/employees.component';
import { MenusComponent } from './components/menus/menus.component';
import { AssetsComponent } from './components/assetsmanagement/AssetsResouse/assets.component';
import { MenuService } from './components/menus/menu-service/menu.service';
import { DymanicComponentComponent } from './dymanic-component/dymanic-component.component';
import { AssetsManagementComponent } from './components/assetsmanagement/Assets-Management/AssetsManagement.component';
import{ AssetsManagementService } from './components/assetsmanagement/Assets-Management/AssetsManagementService.service';
import{ TypeAssetsComponent } from './components/assetsmanagement/TypeAssets/TypeAssets.component';
import { DepartmentComponent } from "./components/Department/Department.component";
import { UnitManagementComponent } from "./components/assetsmanagement/UnitManagement/UnitManagement.component";
import { TransferAssetsComponent } from './components/assetsmanagement/BorrowAssets/TransferAssets/TransferAssets.component';
import { AssetManagementHistoryComponent } from './components/assetsmanagement/BorrowAssets/AssetManagementHistory/AssetManagementHistory.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterLink, AssetsComponent, AssetsManagementComponent, TypeAssetsComponent, DepartmentComponent, EmployeesComponent, UnitManagementComponent], // ✅ Thêm AssetsManagementComponent vào đây
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
  
export class AppComponent implements OnInit {
  title = 'R_ERP';
  menus: any[] = [];

  @ViewChild('viewcomponent', { read: ViewContainerRef }) viewcomponent!: ViewContainerRef;
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

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
      case 'assets':
        return AssetsComponent;
        case 'assetsmanagement':
        return AssetsManagementComponent;
      default:
        return null;
    }
  }

  addComponent(type: string) {
    const viewFactory = this.resolver.resolveComponentFactory(DymanicComponentComponent);
    const viewRef = this.viewcomponent.createComponent(viewFactory);
    const viewVCRef = viewRef.instance.getViewContainer();

    const comp = this.getComponentByType(type);
    if (comp) {
      const compFactory = this.resolver.resolveComponentFactory(comp);
      viewVCRef.createComponent(compFactory);
    }

    this.container.clear();
    this.container.createComponent(MenusComponent);
  }

  loadComponent(type: string) {
    this.viewcomponent.clear();
    const comp = this.getComponentByType(type);
    if (comp) {
      const compFactory = this.resolver.resolveComponentFactory(comp);
      this.viewcomponent.createComponent(compFactory);
      if (type === 'assets') {
        const tabElement = document.querySelector('a[href="#menu_2"]') as HTMLElement;
        if (tabElement) {
          tabElement.click();// Kích hoạt tab #menu_2
        }
      }
        if (type === 'assetsmanagement') {
        const tabElement = document.querySelector('a[href="#menu_2"]') as HTMLElement;
        if (tabElement) {
          tabElement.click();// Kích hoạt tab #menu_2
        }
      }
    }
  }
  removeComponent() {

    alert('Xóa');
  }

  getMenus(): void {
    this.menuService.getMenus().subscribe({
      next: (response: any) => {
        this.menus = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      }
    });
  }
}   