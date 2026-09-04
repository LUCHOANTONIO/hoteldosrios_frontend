
//MODELS
import { RegionalModel } from '../../models/regional.model';

//SERVICES
import { RegionalService } from '../../services/regional.service';

//MATERIAL DESING
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

//COMPONENT
import { RegionalFormComponent } from './regional-form/regional-form';

//VARIOS
import { AfterViewInit,Component, ViewChild, inject } from '@angular/core';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { SpanishPaginatorIntl } from '../../utils/spanish-paginator-intl';

@Component({
  selector: 'app-regional',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './regional.html',
  styleUrl: './regional.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class RegionalComponent implements AfterViewInit{
    regionales:RegionalModel[]=[];
    regional!:RegionalModel;
    readonly dialog = inject(MatDialog);

    displayedColumns: string[] = ['actions','nombre','observacion'];
    dataSource! : MatTableDataSource<RegionalModel>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(private regionalService:RegionalService) {
       this.mostrarRegionales();
    }

    ngAfterViewInit() {

    }

    mostrarRegionales() {
        this.regionalService.listar().subscribe({
          next: (res) => {
              this.regionales = res;
              this.dataSource = new MatTableDataSource<RegionalModel>(res);
              this.dataSource.paginator = this.paginator;
          },
          error: (error) => {
            console.error(error);
          }
        });
    }
    
    mostrarEditar(x:RegionalModel){
      this.regional={...x};//clone
      const dialogRef = this.dialog.open(RegionalFormComponent,
        { data: {regional: this.regional},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.mostrarRegionales();
        this.cambiarfondoFila("");
      });
    }

    mostrarFormularioNuevo(){
      this.regional=new RegionalModel();

      const dialogRef = this.dialog.open(RegionalFormComponent,
        { data: {regional: this.regional},
          width: "98vw",
          maxWidth: "600px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.mostrarRegionales();
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:RegionalModel){
      this.regional=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.regional.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.regionalService.eliminar(this.regional.id!).subscribe({
            next:(res)=>{
              this.mostrarRegionales();
            },
            error:(error)=>{
              console.error(error);
            }
          })
        }else{
          this.cambiarfondoFila("");//cancelar
        }
      });
    }

    //------------------------------------------------------------------------
    busqueda(textoBusqueda: string) {
      const filterValue = textoBusqueda;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    //------------------------------------------------------------------------
    private cambiarfondoFila(color: string) {
      document.querySelectorAll<HTMLElement>("#fila" + this.regional.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }
   //------------------------------------------------------------------------
}

