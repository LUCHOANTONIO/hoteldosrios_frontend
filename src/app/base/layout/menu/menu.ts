// menu.component.ts
import { Component, effect, signal} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MenuService } from '../../services/menu.service';
import { AppService } from '../../services/local/app.service';
import { MenuModel } from '../../models/menu.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MatListModule, RouterModule, MatIconModule, MatExpansionModule, CommonModule],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss'],
  providers: [provideNativeDateAdapter()],
})
export class MenuComponent {
  menuPadre!: MenuModel;
  public agenciaNombre = signal('');
    
  constructor(protected menuService: MenuService, protected appService: AppService) {
    // obteniendo menus a partir del único rol seleccionado
    effect(()=>{
      //console.log("signal");
      this.menuPadre = MenuService.convertArrayMenuToTree(this.menuService.menus());
    });
  }
 
  click() {
    if (this.appService.tamPantalla == "xs") {
      this.appService.mostrarSideNav = !this.appService.mostrarSideNav;
    }
  }
}
