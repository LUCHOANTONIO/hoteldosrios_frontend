
//MODELS
import { ReservaArchivoModel } from '../../models/reservaarchivo.model';
import { TipoDocumentoModel } from '../../../base/models/tipodocumento.model';

//SERVICES
import { ReservaArchivoService } from '../../services/reservaarchivo.service';
import { TipoDocumentoService } from '../../../base/services/tipodocumento.service';

//MATERIAL DESING
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

//COMPONENT
import { ReservaArchivoFormComponent } from './reserva_archivo-form/reserva_archivo-form';

//VARIOS
import { AfterViewInit, Component, Inject, ViewChild, inject } from '@angular/core';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReservaModel } from '../../models/reserva.model';
import { environment } from '../../../../environments/environment';
import { ImageViewerDirective } from '../../shared/directives/image-viewer.directive';
import { forkJoin } from 'rxjs';
import { TipoArchivoModel } from '../../models/tipo_archivo.model';
import { TipoArchivoService } from '../../services/tipo_archivo.service';

@Component({
  selector: 'app-reservaArchivo',
  standalone: true,
  imports: [MatTableModule,MatIconModule,MatPaginatorModule,MatButtonModule,MatDialogModule,MatDividerModule,
            MatFormFieldModule,MatInputModule,MatCardModule,MatDialogModule,CdkDrag, CdkDragHandle,
            MatProgressSpinnerModule,ImageViewerDirective
           ],
  templateUrl: './reserva_archivo.html',
  styleUrl: './reserva_archivo.scss',
  providers: [{provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl}],
})

export class ReservaArchivoComponent implements AfterViewInit{   
    reservaArchivos:ReservaArchivoModel[]=[];
    tipo_archivo:TipoArchivoModel[]=[];
    reservaArchivo:ReservaArchivoModel=new ReservaArchivoModel();
    tipo_documentos:TipoDocumentoModel[]=[];
    reserva:ReservaModel;
    archivo: File | null = null;
    url_imagenes:string[]=[];
    displayedColumns: string[] = ['actions','url','nombre','primer_apellido','segundo_apellido','nro_documento','tipo_documento','detalle'];

    dataSource : MatTableDataSource<ReservaArchivoModel>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    constructor(public dialogRef: MatDialogRef<ReservaArchivoFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private reservaArchivoService:ReservaArchivoService,private tipoDocumentoService: TipoDocumentoService,private tipoArchivoService: TipoArchivoService) {
      this.reserva = data.reserva;
      this.mostrarReservaArchivos();
    }

    ngAfterViewInit() {

    }

    mostrarReservaArchivos() {
        forkJoin({
          archivos:this.reservaArchivoService.listar(this.reserva.id),
          tipo_archivo:this.tipoArchivoService.listar(),
          tipo_documentos: this.tipoDocumentoService.listar(),
        }).subscribe({
          next: (res) => {
            this.tipo_archivo = res.tipo_archivo;
            this.tipo_documentos = res.tipo_documentos;
            this.reservaArchivos = res.archivos;
            this.dataSource = new MatTableDataSource<ReservaArchivoModel>( this.reservaArchivos);
            this.dataSource.paginator = this.paginator;                       
            this.url_imagenes = res.archivos.map(item => item.base64_real);
          }
        });
    }
    
    readonly dialog = inject(MatDialog);
    mostrarEditar(a:ReservaArchivoModel){
      this.reservaArchivo={...a};//clone
      const dialogRef = this.dialog.open(ReservaArchivoFormComponent,
        { data: {reservaArchivo: this.reservaArchivo, reserva:this.reserva,tipo_documentos:this.tipo_documentos,tipo_archivo:this.tipo_archivo},
          width: "98vw",
          maxWidth: "700px",
          disableClose:true
        });
      this.cambiarfondoFila("azure");
      dialogRef.afterClosed().subscribe(result => {
        if(result) {
          //this.archivo=result.archivo;
          this.mostrarReservaArchivos();
        } 
        this.cambiarfondoFila("");
      });
    }

    mostrarFormularioNuevo(){
      this.reservaArchivo=new ReservaArchivoModel();
      const dialogRef = this.dialog.open(ReservaArchivoFormComponent,
        { data: {reservaArchivo: this.reservaArchivo, reserva:this.reserva,tipo_documentos:this.tipo_documentos,tipo_archivo:this.tipo_archivo},
          width: "98vw",
          maxWidth: "700px",
          disableClose:true
        });
      dialogRef.afterClosed().subscribe(result => {
        if(result) {        
          this.mostrarReservaArchivos();
        };
      });
    }

    mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string,a:ReservaArchivoModel){
      this.reservaArchivo=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.reservaArchivo.id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.reservaArchivoService.eliminar(this.reservaArchivo.id).subscribe({
            next:(res)=>{
              this.mostrarReservaArchivos();
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
      document.querySelectorAll<HTMLElement>("#reservaArchivofila" + this.reservaArchivo.id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }       

    //------------------------------------------------------------------------
}

