import { Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

//COMPONENTES
import {HeaderComponent} from './base/layout/header/header'
import {MenuComponent} from './base/layout/menu/menu'

import { LoaderService } from './base/services/local/loader.service';
import { CommonModule } from '@angular/common';
import { AuthService } from './base/services/auth.service';
import { AppService } from './base/services/local/app.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatSidenavModule,CommonModule,MatProgressSpinnerModule,HeaderComponent,MenuComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnDestroy {

  title="SISTEMA";

  destroyed = new Subject<void>();
  // Create a map to display breakpoint names for demonstration purposes.
  displayNameMap = new Map([
    [Breakpoints.XSmall, 'xs'],
    [Breakpoints.Small, 'sm'],
    [Breakpoints.Medium, 'md'],
    [Breakpoints.Large, 'lg'],
    [Breakpoints.XLarge, 'xl'],
  ]);
  constructor(public loaderService:LoaderService,protected authService:AuthService, protected appService:AppService,breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.appService.tamPantalla = this.displayNameMap.get(query) ?? 'Unknown';
            if(this.appService.tamPantalla=="xs")
              appService.mostrarSideNav=false;
            else
              appService.mostrarSideNav=true;
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  toogleSideNav(){
    this.appService.mostrarSideNav=  !this.appService.mostrarSideNav;
  }
}
