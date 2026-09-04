//MODELS
import { ReservaModel } from '../../../models/reserva.model';
import { HuespedModel } from '../../../models/huesped.model';
import { TipoDocumentoModel } from '../../../../base/models/tipodocumento.model';
import { PaisModel } from '../../../models/pais.model';
import { MotivoModel } from '../../../models/motivo.model';
import { TipoHuespedModel } from '../../../models/tipo_huesped.model';
import { EstadoCivilModel } from '../../../../base/models/estadocivil.model';

//SERVICES
import { AlertService } from '../../../../base/services/local/alert.service';
import { PersonaService } from '../../../../base/services/persona.service';
import { HuespedService } from '../../../services/huesped.service';
import { BalanceService } from '../../../services/balance.service';

//DATA PICKER
import {MatDatepickerModule} from '@angular/material/datepicker'; //Para fecha desplegable

//ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

//COMPONENETES
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//DIRECTIVAS
import { PreventEnterSubmitDirective } from '../../../../base/shared/directives/prevent-enter-submit.directive';
import { PreventEnterSelectDirective } from '../../../../base/shared/directives/prevent-enter-select.directive';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';

//DATA TABLE
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

//VARIOS
import { Component, ViewChild,Input, OnInit, inject, computed, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { NgForm,FormsModule} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EstadoHuespedModel } from '../../../models/estado_huesped.model';
import { ConfirmarComponent } from '../../../shared/views/confirmar/confirmar';

@Component({
  selector: 'app-huesped-form',
  standalone: true,
  imports: [
    // Angular Material Modules
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatIconModule,
    MatTabsModule,
    // Directives
    PreventEnterSelectDirective,
    PreventEnterSubmitDirective,
    BotonGuardarDirective,
    //Otros
    FormsModule,
    MatDialogModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    MatDatepickerModule
],
  templateUrl: './huesped-form.html',
  styleUrl: './huesped-form.scss'
})
export class HuespedFormComponent implements OnInit {
    @Input() reserva!: ReservaModel; 
    @Input() paises: PaisModel[] = []; 
    @Input() motivos: MotivoModel[] = [];
    @Input() tipo_huespedes: TipoHuespedModel[] = [];
    @Input() tipo_documentos: TipoDocumentoModel[] = [];
    @Input() estado_civil: EstadoCivilModel[] = [];
    @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;    
    huespedes:HuespedModel[]=[];      
    huesped:HuespedModel=new HuespedModel(); 
    estadoHuesped:EstadoHuespedModel=new EstadoHuespedModel();    
    hiddenContainerHuesped: boolean = true; 
    
    //Para filtrar Paises con signal
    busquedaPaisProcedencia = signal('');   
    busquedaPaisDestino = signal('');
    busquedaNacionalidad = signal('');    
    paisProcedenciaSeleccionado = signal<string | null>(null);
    paisDestinoSeleccionado = signal<string | null>(null);
    nacionalidadSeleccionado = signal<string | null>(null);

    balance:any; //Variable signal cargado desde constructor 
    
    //Huesped
    displayedColumnsHuesped: string[] = ['actions', 'fecha_ingreso','fecha_salida', 'huesped', 'nro_documento','cargo_extra', 'estado_huesped','opcion'];
    dataSourceHuesped : MatTableDataSource<HuespedModel>;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private personaService:PersonaService,
                private huespedService: HuespedService,
                private alertService:AlertService,
                private balanceService: BalanceService) 
    {
        this.balance = this.balanceService.balance;       
    }   

    ngOnInit() {
      setTimeout(() => {
          if (this.reserva) {           
            this.cargarDatosHuesped(this.reserva.id);
          }
      });
    }

    submitHuesped(f: NgForm) {                
        if (f.valid) {           
            this.huesped.reserva_id=this.reserva.id;
            if(this.huesped.huesped_id>0){               
               this.modificarHuesped();              
            } else {
               this.guardarHuesped();
            }           
            this.botonGuardarDirectiva.deshabilitarFormBoton();           
        } else {
            f.control.markAllAsTouched(); //Para marcar con borde rojo los campos requeridos 
            this.alertService.show("Debe llenar los campos", { duration: 3000, type: 'info' });
        }
    }

    cargarDatosHuesped(reserva_id:number) {       
      forkJoin({         
        huespedes: this.huespedService.listar(reserva_id)               
      }).subscribe({
        next: (res) => {                
          this.huespedes = res.huespedes;                         
          this.dataSourceHuesped = new MatTableDataSource<HuespedModel>(this.huespedes);
          this.dataSourceHuesped.paginator = this.paginator;                     
        }
      });
    }

    toggleContainerHuesped(){
       this.hiddenContainerHuesped=!this.hiddenContainerHuesped;
    }

    //BEGIN: FILTRAR PAISES
    onBuscarPaisProcedencia(event: Event): void {
      const valor = (event.target as HTMLInputElement).value;       
      this.busquedaPaisProcedencia.set(valor);           
    }
    
    onBuscarPaisDestino(event: Event): void {
      const valor = (event.target as HTMLInputElement).value;       
      this.busquedaPaisDestino.set(valor);           
    } 

    onBuscarNacionalidad(event: Event): void {
      const valor = (event.target as HTMLInputElement).value;       
      this.busquedaNacionalidad.set(valor);          
    }
                  
    filteredPaisesProcedencia = computed(() => {
      const term = this.busquedaPaisProcedencia().toLowerCase();
      return this.paises.filter(p =>
        p.descripcion.toLowerCase().includes(term)
      );
    });

    filteredPaisesDestino = computed(() => {
      const term = this.busquedaPaisDestino().toLowerCase();
      return this.paises.filter(p =>
        p.descripcion.toLowerCase().includes(term)
      );
    });

    filteredNacionalidad = computed(() => {
      const term = this.busquedaNacionalidad().toLowerCase();
      return this.paises.filter(p =>
        p.descripcion.toLowerCase().includes(term)
      );
    });            
    
    displayPaisProcedencia = (id: number | null) => {
      if (id == null) return '';
      const pais = this.paises.find(p => p.id === id);
      return pais ? pais.descripcion : '';
    };

    displayPaisDestino = (id: number | null) => {
      if (id == null) return '';
      const pais = this.paises.find(p => p.id === id);
      return pais ? pais.descripcion : '';
    };

    displayNacionalidad = (id: number | null) => {
      if (id == null) return '';
      const pais = this.paises.find(p => p.id === id);
      return pais ? pais.descripcion : '';
    };
    //END:  FILTRAR PAISES

    //Begin: Operaciones con huesped
    guardarHuesped(){
      this.huesped.reserva_id=this.reserva.id;           
      this.huesped.cliente_id=this.reserva.cliente_id;    
      this.huespedService.crear(this.huesped).subscribe({
        next:(res)=>{
          if(res.correcto){             
            const data = JSON.parse(res.dato);  
            this.balance.set(data.balance);
            this.huespedes = data.huespedes as HuespedModel[];            
            this.dataSourceHuesped = new MatTableDataSource<HuespedModel>(this.huespedes);
            this.toggleContainerHuesped();
            this.huesped = new HuespedModel();
          } else {
            this.alertService.show(res.mensaje, { duration: 10000, type: 'info' });
          }             
          this.botonGuardarDirectiva.habilitarFormBoton();                       
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }

    editarHuesped(huesped:HuespedModel){ 
       this.huesped={...huesped};//clone          
       this.hiddenContainerHuesped=false;
    }

    modificarHuesped(){
      this.huesped.id=this.reserva.id;
      this.huespedService.modificar(this.huesped).subscribe({
        next:(res)=>{
          if(res.correcto){             
             const data = JSON.parse(res.dato);
             this.balance.set(data.balance);
             this.huespedes = data.huespedes as HuespedModel[];
             this.dataSourceHuesped = new MatTableDataSource<HuespedModel>(this.huespedes);
             this.toggleContainerHuesped();
             this.huesped = new HuespedModel(); 
          } else {
             this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          } 
          
          this.botonGuardarDirectiva.habilitarFormBoton();                   
        },
        error:(error)=>{
           this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }

    readonly dialog = inject(MatDialog);
    eliminarHuesped(enterAnimationDuration: string, exitAnimationDuration: string,a:HuespedModel){
      this.huesped=a;

      const dialogRef =this.dialog.open(ConfirmarEliminarComponent, {
        width: '250px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: this.huesped.huesped_id
      });
      this.cambiarfondoFila("MistyRose");
      dialogRef.afterClosed().subscribe(result => {
        if(result){//eliminar
          this.huespedService.eliminar(this.huesped.huesped_id).subscribe({
            next:(res)=>{             
              if(res.correcto){             
                 const data = JSON.parse(res.dato); 
                 this.balance.set(data.balance);              
                 this.huespedes = data.huespedes as HuespedModel[];
                 this.dataSourceHuesped = new MatTableDataSource<HuespedModel>(this.huespedes);
              } else {
                 this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
              } 
                
              this.botonGuardarDirectiva.habilitarFormBoton(); 
            },
            error:(error)=>{
              this.botonGuardarDirectiva.habilitarFormBoton();
              console.error(error);
            }
          })
        }else{
          this.cambiarfondoFila("");//cancelar
        }
      });
    }

    private cambiarfondoFila(color: string) {
      document.querySelectorAll<HTMLElement>("#fila" + this.huesped.huesped_id + " td").forEach(celda => {
        celda.style.backgroundColor = color;
      });
    }   

    cancelarHuesped(){                    
        this.huesped=new HuespedModel();
        this.toggleContainerHuesped();
    }

    dniHuesped(nro_documento:string){       
        this.personaService.personaPorNroDocumento(nro_documento).subscribe({
            next: (res) => {
              if(res){
                  if(Object.keys(res).length!=0) {
                    this.huesped.tipo_doc_id=Number(res.tipo_doc_id);
                    this.huesped.nacionalidad_id=Number(res.nacionalidad_id);
                    this.huesped.nombre=res.nombre;
                    this.huesped.primer_apellido=res.primer_apellido;
                    this.huesped.segundo_apellido=res.segundo_apellido;
                    this.huesped.email=res.email; 
                    this.huesped.telefono=res.telefono;
                  } else {
                    this.huesped.tipo_doc_id=null;
                    this.huesped.nacionalidad_id=null;
                    this.huesped.nombre="";
                    this.huesped.primer_apellido="";
                    this.huesped.segundo_apellido="";
                    this.huesped.telefono=""; 
                    this.huesped.email=""; 
                  }               
              }              
            },
            error: (error) => {
              console.error(error);
            }
        });    
    } 

    mostrarConfirmarEstado(title_estado:string,enterAnimationDuration: string, exitAnimationDuration: string,huesped_id:number,estado_huesped_id:number){        
        const dialogRef =this.dialog.open(ConfirmarComponent, {
          width: '250px',
          enterAnimationDuration,
          exitAnimationDuration,
          data:{title:title_estado}
        });        
               
        this.estadoHuesped.huesped_id=huesped_id;
        this.estadoHuesped.estado_huesped_id=estado_huesped_id;

        dialogRef.afterClosed().subscribe(result => {
          if(result){             

            forkJoin({
              huesped: this.huespedService.estado(this.estadoHuesped),          
            }).subscribe({
              next: (res) => {   
                if (res.huesped?.correcto) {  
                    const data = JSON.parse(res.huesped.dato);               
                    this.huespedes = data as HuespedModel[];                                      
                    this.dataSourceHuesped = new MatTableDataSource<HuespedModel>(this.huespedes);
                } else {
                    this.alertService.show(res.huesped.mensaje,{duration:10000,type:'info'});                    
                }                               
              },
            });  
          }
        });
    }  
    
}
