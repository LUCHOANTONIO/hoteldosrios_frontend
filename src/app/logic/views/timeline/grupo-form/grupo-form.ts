//MODELS
import { GrupoModel } from '../../../models/grupo.model';
import { GrupoDetalleModel } from '../../../models/grupo_detalle.model';

//SERVICES
import { AlertService } from '../../../../base/services/local/alert.service';
import { GrupoService } from '../../../services/grupo.service';

//DIRECTIVAS
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';

//ANGULAR
import { Component, Inject, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';

//ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';



@Component({
  selector: 'app-grupo-form',
  standalone: true,
  imports: [
    // Directivas personalizadas   
    BotonGuardarDirective,
  
    // Módulos de Angular Material
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule,   
    MatIconModule,
    MatTabsModule,
    FormsModule,
    MatDialogModule, 
    MatCardModule,   
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './grupo-form.html',
  styleUrl: './grupo-form.scss'
})
export class GrupoFormComponent implements OnInit {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;  
  readonly dialog = inject(MatDialog);
          
  grupo:GrupoModel=new GrupoModel();   
  selectedItems: any[] = [];
  items: any;
  lista_grupo_reserva: any[] = [];

  displayedColumns: string[] = ['correlativo','nro_habitacion','estado','actions'];
  dataSource: MatTableDataSource<GrupoDetalleModel>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, 
    public dialogRef: MatDialogRef<GrupoFormComponent>,
    private alertService: AlertService,
    //private comunicacionService:ComunicacionService, 
    private grupoService: GrupoService         
  ) {

    this.selectedItems =data.selectedItems;
    this.items =data.items;

    this.cargarGrupo();
    
    // effect(() => {     
    //    const { grupo_id } = this.comunicacionService.loadGrupoSignal();
    //    if (grupo_id !== null) {            
    //       this.cargarGrupo(grupo_id);              
    //    }
    // });
    
  }

  ngOnInit() {
    
  }

  submitAgrupar(f: NgForm) {               
      if (f.valid) {             
          this.botonGuardarDirectiva.deshabilitarFormBoton();
          this.crear();
      } else {
          this.alertService.show("Debe llenar los campos", { duration: 3000, type: 'info' });
      }
  }
  
  cargarGrupo(){    
    this.grupoService.listar(this.selectedItems).subscribe({
      next:(res)=>{
         if(res.correcto){ 
            const data = JSON.parse(res.dato);
            this.grupo = data.grupo as GrupoModel; 
            this.grupo.detalle = data.detalle as GrupoDetalleModel[];                                
            this.dataSource = new MatTableDataSource<GrupoDetalleModel>(this.grupo.detalle);
            this.dataSource.paginator = this.paginator; 
         } else {
             this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
         }
      },
      error:(error)=>{
        //Sin acciones
      }
    })
  }

  crear(){
    this.grupoService.crear(this.grupo).subscribe({    
      next:(res)=>{
          if(res.correcto){                                          
             const lista = JSON.parse(res.dato);
             if (Array.isArray(lista)) {               
                lista.forEach((item: any) => {
                  this.items.update({
                    id: item.id,
                    cliente: item.cliente,
                    saldo: item.saldo
                  });
                });
             }
             this.dialogRef.close();
          } else {
              this.alertService.show(res.mensaje, { duration: 10000, type: 'info' });
              this.botonGuardarDirectiva.habilitarFormBoton();
          }          
      },
      error:(error)=>{
        this.botonGuardarDirectiva.habilitarFormBoton();
      }
    })
  }

  eliminar(data: GrupoDetalleModel) {
      const index = this.dataSource.data.indexOf(data);
      if (index > -1) {       
        this.dataSource.data[index].estado = 'eliminado';
        // Filtrar los datos para ocultar los marcados como eliminado
        const newData = this.dataSource.data.filter(item => item.estado !== 'eliminado');
        this.dataSource.data = newData;
      }
  }

}
