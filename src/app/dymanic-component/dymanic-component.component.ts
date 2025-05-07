import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MenuService } from '../components/menus/menu-service/menu.service';

@Component({
  selector: 'app-dymanic-component',
  imports: [],
  templateUrl: './dymanic-component.component.html',
  styleUrl: './dymanic-component.component.css'
})
export class DymanicComponentComponent implements OnInit {
    menus: any[] = [];

    @ViewChild('container',{read:ViewContainerRef}) container!:ViewContainerRef;

    constructor(
        private menuService: MenuService,
      ) { }

    ngOnInit(): void {
        this.getMenus();
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

    public getViewContainer():ViewContainerRef{
        return this.container;
    }
}
