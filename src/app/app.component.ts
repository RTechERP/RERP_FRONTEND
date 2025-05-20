import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef, Type } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { EmployeesComponent } from './components/employees/employees.component';
import { MenusComponent } from './components/menus/menus.component';
import { MenuService } from './components/menus/menu-service/menu.service';
import { DymanicComponentComponent } from './dymanic-component/dymanic-component.component';
import { ListVPPComponent } from "./components/VPP/list-vpp/list-vpp.component";
import{OfficeSupplyComponentComponent} from"./components/OfficeSupply/office-supply-component/office-supply-component.component";
import { OfficeSupplyRequestSummaryComponent } from './components/VPP/OfficeSupplyRequestSummary/office-supply-request-summary/office-supply-request-summary.component';
import { DangkyVppComponent } from './components/VPP/DangkyVPP/dangky-vpp/dangky-vpp.component';    
import { DailyreportComponent } from './components/dailyreport/dailyreport.component';

@Component({
    selector: 'app-root',
    standalone:true,
    imports: [RouterOutlet, RouterOutlet, ListVPPComponent,RouterModule, OfficeSupplyComponentComponent, OfficeSupplyRequestSummaryComponent, DangkyVppComponent, DailyreportComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})




export class AppComponent implements OnInit {
    title = 'R_ERP';

    menus: any[] = [];

    @ViewChild('viewcomponent', { read: ViewContainerRef }) viewcomponent!: ViewContainerRef
    @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef

    constructor(
        private menuService: MenuService,
        private resolver:ComponentFactoryResolver,
      ) { }
      
    ngOnInit(): void {
        this.getMenus();
    }

    getComponentByType(type:string):Type<any>|null{
        switch(type){
            case 'a':return MenusComponent;
            case 'b':return EmployeesComponent
            default:return null
        };
    }

    addComponent(type:string) {
        //1. Tạo view để add component
        const viewFactory = this.resolver.resolveComponentFactory(DymanicComponentComponent);
        const viewRef = this.viewcomponent.createComponent(viewFactory);
        const viewVCRef = viewRef.instance.getViewContainer();
        
        //2. Xác định component cần add
        const comp = this.getComponentByType(type);
        console.log('comp',comp);
        if (comp) {
            const compFactory = this.resolver.resolveComponentFactory(comp);
            viewVCRef.createComponent(compFactory);
        }

        this.container.clear(); // (nếu muốn xóa trước)
        this.container.createComponent(MenusComponent);

        const viewReff = this.viewcomponent.createComponent(viewFactory);
    }

    removeComponent(){
        alert('xóa');
    }

    getMenus():void{
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

