import { Component, effect, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { Router,RouterModule } from '@angular/router';
import { AppService } from '../../services/local/app.service';
import { HMenuComponent } from "../hmenu/hmenu";
import { MenuModel } from '../../models/menu.model';
import { MenuService } from '../../services/menu.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, RouterModule, HMenuComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  menuPadre!:MenuModel;
  constructor(protected authService:AuthService,protected router:Router,protected appService:AppService,protected menuService:MenuService) {
    effect(()=>{
      //console.log("signal");
      this.menuPadre = MenuService.convertArrayMenuToTree(this.menuService.menus());
    });
  }
  @Output() toogleClickEvent=new EventEmitter();

  toogleClick(){
    this.toogleClickEvent.emit();
  }

  logout(){
    this.authService.cerrarSesion();
    // this.authService.logout().subscribe({
    //   next:(res)=>{
    //     this.router.navigate(['/']);
    //     this.appService.clear(); //borra datos de sesion.
    //     this.authService.triggerAuthChange(false);
    //   },
    //   error:(error)=>{
    //     this.appService.clear(); //borra datos de sesion.
    //     console.error(error);
    //   },
    // });
  }

}

