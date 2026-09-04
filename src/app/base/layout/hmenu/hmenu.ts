import { AfterViewInit, Component,Input, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MenuModel } from '../../models/menu.model';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hmenu',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatMenuModule, MatButtonModule, CommonModule],
  templateUrl: './hmenu.html',
  styleUrl: './hmenu.scss',
  providers: [provideNativeDateAdapter()],
})


export class HMenuComponent implements AfterViewInit{
  @ViewChild('menuRef') 
  public menuRefAux:any;
  @Input() nodo!: MenuModel;
  public menuRef:any;

  constructor() {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.menuRef = this.menuRefAux;  
    }, 0);
  }
}
