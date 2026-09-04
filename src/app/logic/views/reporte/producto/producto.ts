
//MODELS
import { ReporteProductoModel } from "../../../models/reporte_producto.model";

//SERVICES
import { ReporteService } from '../../../services/reporte.service';


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
import { MatSelectModule } from '@angular/material/select';

//COMPONENT
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';

//VARIOS
import { FormsModule} from '@angular/forms';
import { AfterViewInit, Component, ViewChild, effect, inject, signal } from '@angular/core';
import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reporte-producto',
  standalone: true,
  imports: [MatSelectModule,FormsModule,MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule
           ],
  templateUrl: './producto.html',
  styleUrl: './producto.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class ReporteProductoComponent implements AfterViewInit{   
    reporteProducto = signal<ReporteProductoModel[]>([]);    
    dialogRef:any; //Definir formulario modal
    
    //Para comprobante
    pdf_base64:String="";
    titulo_documento: string;

    displayedColumns: string[] = ['descripcion','categoria','precio','stock'];
    dataSource : MatTableDataSource<ReporteProductoModel>;
  
    @ViewChild(MatPaginator) paginator: MatPaginator;
    readonly dialog = inject(MatDialog);

    constructor(private reporteService:ReporteService) {
        this.cargarDatos();
        effect(() => {
            this.dataSource = new MatTableDataSource<ReporteProductoModel>(this.reporteProducto());
            this.dataSource.paginator = this.paginator;
        });
    }

    ngAfterViewInit() {

    }

    cargarDatos() {
        forkJoin({
          huesped: this.reporteService.list_producto()        
        }).subscribe({
          next: (res) => {          
            this.reporteProducto.set(res.huesped);                    
          }
        });
    }

    mostrarVisorPdf(enterAnimationDuration: string, exitAnimationDuration: string){
        forkJoin({
          pdf_base64: this.reporteService.exportar_list_producto(),
        }).subscribe({
          next: (res) => {
            this.pdf_base64=res.pdf_base64;
            this.titulo_documento="Reporte Producto";
            this.dialogRef =this.dialog.open(PdfViewerComponent, {
              width: '50vw',
              maxWidth: '95vw',
              height: '80vh',
              enterAnimationDuration,
              exitAnimationDuration,
              data:{pdf_base64:this.pdf_base64,titulo_documento:this.titulo_documento},
              disableClose:true,
            });

          }
        });
    }

    //------------------------------------------------------------------------
    busqueda(textoBusqueda: string) {
      const filterValue = textoBusqueda;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }

}

