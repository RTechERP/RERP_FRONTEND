import { Component,OnInit } from '@angular/core';
import { MenuService } from './menu-service/menu.service';

@Component({
  selector: 'app-menus',
  imports: [],
  templateUrl: './menus.component.html',
  styleUrl: './menus.component.css',
  standalone:true,
})

export class MenusComponent implements OnInit {
    
    menus: any[] = [];

    constructor(
        private menuService: MenuService
      ) { }
      
    ngOnInit(): void {
        this.getMenus();
    }

    getMenus():void{
    this.menuService.getMenus().subscribe({
        next: (response: any) => {
            this.menus = response.data;
            // console.log(this.menus );
        },
        error: (error) => {
            console.error('Lỗi:', error);
        }
        });
    }
    
}
