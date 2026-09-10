//MODELS
import { ReservaModel } from '../../../models/reserva.model';
import { TipoDocumentoModel } from '../../../../base/models/tipodocumento.model';
import { PaisModel } from '../../../models/pais.model';
import { CanalReservaModel } from '../../../models/canal_reserva.model';
import { HabitacionModel } from '../../../models/habitacion.model';

//COMPONENT
import { CompletarPagoFormComponent } from '../completar_pago/pago-form'; 
import { CompletarNotaFormComponent } from '../completar_nota/nota-form'; 

//SERVICES
import { ReservaService } from '../../../services/reserva.service';
import { AlertService } from '../../../../base/services/local/alert.service';
import { ComunicacionService } from '../../../services/local/comunicacion.service';
import { HabitacionService } from '../../../services/habitacion.service';
import { TipoDocumentoService } from '../../../../base/services/tipodocumento.service';
import { PaisService } from '../../../services/pais.service';
import { CanalReservaService } from '../../../services/canal_reserva.service';
import { FormaPagoService } from '../../../services/forma_pago.service';
import { BalanceService } from '../../../services/balance.service';

//ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

//DATA PICKER
import {MatDatepickerModule} from '@angular/material/datepicker';

//DIRECTIVAS
import { PreventEnterSubmitDirective } from '../../../../base/shared/directives/prevent-enter-submit.directive';
import { PreventEnterSelectDirective } from '../../../../base/shared/directives/prevent-enter-select.directive';
import { AnimarPerderFocoDirective } from '../../../../base/shared/directives/animar-perder-foco.directive';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';

//VARIOS
import { ChangeDetectorRef, Component,computed,inject,Inject,signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { forkJoin} from 'rxjs';
import { FormaPagoModel } from '../../../models/forma_pago.model';

//DATA TABLE
import { MatTableModule } from '@angular/material/table';

//MENU OPCIONES
import {MatMenuModule} from '@angular/material/menu';
import moment from 'moment';

//ANGULAR MATERIAL
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { PersonaService } from '../../../../base/services/persona.service';

@Component({
  selector: 'app-completar_reserva-form',
  standalone: true,
  imports: [
    // Angular Material Modules
    MatTabsModule,
    MatMenuModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,    
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    // Angular Modules
    FormsModule,
    // CDK Modules
    CdkDrag,
    CdkDragHandle,
    // Directives
    PreventEnterSubmitDirective,
    PreventEnterSelectDirective,
    AnimarPerderFocoDirective,
    BotonGuardarDirective,
    // Components  
    CompletarPagoFormComponent,    
    CompletarNotaFormComponent,  
    MatAutocompleteModule,
    MatTableModule,
    MatCheckboxModule,
    MatDatepickerModule
  ],
  templateUrl: './reserva-form.html',
  styleUrls: ['./reserva-form.scss']
})
export class CompletarReservaFormComponent { 
      @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective; 
      private cd = inject(ChangeDetectorRef);
      
      habitaciones: HabitacionModel[] = [];
      forma_pagos: FormaPagoModel[] = [];     
      tipo_documentos: TipoDocumentoModel[] = [];  
      paises: PaisModel[] = [];         
      canal_reservas: CanalReservaModel[] = [];
      reserva: any = new ReservaModel(); 
      reserva_id: number; 
      habitacion_id:number; 
      balance:any; //Variable signal cargado desde constructor  
      
      //Flag Visible or Disabled
      btnVisibleCheckIn: boolean = false; 
      btnVisibleCheckOut: boolean = false; 
      btnVisibleCancelReserva: boolean = true;
      btnVisibleSaveReserva: boolean = true;
      mnuVisibleOpciones: boolean = false;

      //Definicion de signals
      busquedaPais = signal('');       
      paisSeleccionado = signal<string | null>(null); 
      cargando = signal<boolean>(true); 
      panel_visible = signal<boolean>(true);       
     
      constructor(
        public dialogRef: MatDialogRef<CompletarReservaFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialog: MatDialog,
        private reservaService: ReservaService,      
        private alertService: AlertService,
        private comunicacionService: ComunicacionService,
        private habitacionService: HabitacionService,      
        private tipoDocumentoService: TipoDocumentoService,
        private paisService: PaisService,
        private canalReservaService: CanalReservaService,
        private formaPagoService: FormaPagoService,
        private balanceService: BalanceService,
        private personaService: PersonaService,      
      ) {
        // Asignación de datos desde el objeto 'data'       
        this.reserva_id = data.reserva_id;
        this.habitacion_id = data.habitacion_id;
        this.balance = this.balanceService.balance;      
        this.cargarDatos();
      }

      cargarDatos() {
        this.cargando.set(true); // Aseguramos que esté en true al iniciar
        forkJoin({
          habitaciones: this.habitacionService.listar(),
          tipo_documentos: this.tipoDocumentoService.listar(),
          paises: this.paisService.listar(),
          canal_reservas: this.canalReservaService.listar(),          
          forma_pagos: this.formaPagoService.listar(),        
          reserva: this.reservaService.mostrar(this.reserva_id),             
        }).subscribe({
          next: (res) => {           
            this.habitaciones = res.habitaciones;
            this.tipo_documentos = res.tipo_documentos;
            this.paises = res.paises;
            this.canal_reservas = res.canal_reservas;
            this.forma_pagos = res.forma_pagos;
            
            if(this.reserva_id!=null){             
              this.reserva = res.reserva.reserva;          
              this.balance.set(res.reserva.balance); 
              this.reserva.fecha_ini = moment(this.reserva.fecha_ini).format("YYYY-MM-DD");
              this.reserva.fecha_fin = moment(this.reserva.fecha_fin).format("YYYY-MM-DD"); 
            } else { 
              this.panel_visible.set(false);                         
              this.reserva = new ReservaModel();
              this.reserva.habitacion_id = this.habitacion_id;
              this.reserva.fecha_ini = moment().format("YYYY-MM-DD");
              this.reserva.fecha_fin = moment().add(1,'days').format("YYYY-MM-DD");                     
              this.balance.set(res.reserva.balance);
              this.calcularCantidad();             
              const selectedHabitacion = this.habitaciones.find(h => h.id === this.habitacion_id);
              if (selectedHabitacion) {
                this.reserva.precio_unitario = 0;
                this.calcularTotal();
              }
            }
            
            //Para renderizar tab
            this.cargando.set(false);
            this.cd.detectChanges();          
          },
          error: (err) => {          
            this.cargando.set(false);
          }
        });
      }
                  
      ngOnInit(): void {  
            // En tu ngOnInit o donde cargues los datos de la reserva
            if (!this.reserva.pais_procedencia_id) {
                this.reserva.pais_procedencia_id = 1;
                this.paisSeleccionado.set('1'); // Sincroniza tu Signal
            }      
      }

      //BEGIN: Filtrar Paises
      onBuscarPais(event: Event): void {
        const valor = (event.target as HTMLInputElement).value;       
        this.busquedaPais.set(valor);              
      }     
              
      // Bandera para saber si ya se aplicó el filtro inicial
      private inicializado = false;
      filteredPaises = computed(() => {
          const term = this.busquedaPais().toLowerCase();
          const paisFiltered = this.paises.filter(p =>
            p.descripcion.toLowerCase().includes(term)
          );

          // Solo la primera vez y si es un registro existente
          if (!this.inicializado && this.reserva.id > 0) {
            this.inicializado = true;
            return paisFiltered; // no toca departamentos
          }                 

          return paisFiltered;
      });               
     
      displayPais = (id: number | null) => {
        if (id == null) return '';
        const pais = this.paises.find(p => p.id === id);
        return pais ? pais.descripcion : '';
      };

      //END: Filtrar Paises  

      // Este método se llama desde el botón de cerrar
      onClose(): void {           
          this.dialogRef.close({
            action: 'close'           
          });
      }

      submitReserva(f: NgForm) {            
        if (f.valid) {
          this.botonGuardarDirectiva.deshabilitarFormBoton();
          if(this.reserva_id){            
            this.modificarReserva();
          } else {
            this.crearReserva();
          }
          
        } else {
          this.alertService.show("Debe llenar los campos",{duration:5000,type:'info'});
        }
      }     
      
      crearReserva(){       
          this.reservaService.crear(this.reserva).subscribe({
            next:(res)=>{
              if(res.correcto){                                 
                  this.dialogRef.close({ res: res});
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

      modificarReserva(){       
        this.reservaService.modificar(this.reserva).subscribe({
          next:(res)=>{
            if(res.correcto){               
                const data = JSON.parse(res.dato);
                this.reserva = data.reserva as ReservaModel;
                this.balance.set(data.balance);
                this.comunicacionService.executeActionReserva.set(true);//Señal para indicar que hubo accion en reserva              
                this.comunicacionService.loadBitacoraSignal.set({reserva_id: this.reserva.id,trigger: Date.now()});                

                this.dialogRef.close({ res: res});

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
    
    verificarNroDocumento(nro_documento:string){      
        if(this.reserva.id==null && nro_documento?.trim()){            
            this.personaService.personaPorNroDocumento(nro_documento).subscribe({
                next: (res) => {
                  if(Object.keys(res).length!=0) {

                      const {                       
                        detalle,
                        tipo_doc_id,
                        nombre,
                        primer_apellido,
                        segundo_apellido,
                        email                        
                      } = res;

                      this.reserva.tipo_doc_id=Number(tipo_doc_id);
                      this.reserva.nombre=nombre;
                      this.reserva.primer_apellido=primer_apellido;
                      this.reserva.segundo_apellido=segundo_apellido;
                      this.reserva.correo=email;                                              
                      
                  } else {
                      this.reserva.tipo_doc_id=null;
                      this.reserva.nombre="";
                      this.reserva.primer_apellido="";
                      this.reserva.segundo_apellido="";
                      this.reserva.telefono="";   
                      this.reserva.correo="";                    
                  }
                },
                error: (error) => {
                  console.error(error);
                }
          });
        }      
    } 

    //BEGIN: Calcular montos en reserva
    onSelectionChange(event: any): void {
        const selectedId = event.value;
        const selectedHabitacion = this.habitaciones.find(h => h.id === selectedId);
        if (selectedHabitacion) {
          this.reserva.precio_unitario = 0;
          this.calcularTotal();
        }
    } 

    calcularCantidad() {
      const fecha_inicio = new Date(this.reserva.fecha_ini);
      const fecha_fin = new Date(this.reserva.fecha_fin);               
      const diferenciaEnMilisegundos = fecha_fin.getTime() - fecha_inicio.getTime();              
      let cantidad = diferenciaEnMilisegundos / (1000 * 3600 * 24);   
      cantidad = cantidad < 0 ? 0 : cantidad;                  
      this.reserva.cantidad = cantidad; 
      this.calcularTotal();      
    }

    calcularDescuentoPorcentaje(): void {      
      const cantidad = Number(this.reserva.cantidad) > 0 ? Number(this.reserva.cantidad) : 1;
      const precioUnitario = Number(this.reserva.precio_unitario) > 0 ? Number(this.reserva.precio_unitario) : 0;
      const descuento = Number(this.reserva.descuento) > 0 ? Number(this.reserva.descuento) : 0;     
      const total = cantidad * precioUnitario;
      let porcentaje = 0;

      if (total > 0 && descuento > 0) {      
        porcentaje = (descuento / total) * 100;       
        porcentaje = Math.round(porcentaje * 100) / 100;      
        if (porcentaje > 100) {
          porcentaje = 100;
        }
      }

      this.reserva.descuento_porcentaje = porcentaje;     
      this.calcularTotal();
    }

    calcularDescuento(): void {
      const cantidad = Number(this.reserva.cantidad) > 0 ? Number(this.reserva.cantidad) : 1;
      const precioUnitario = Number(this.reserva.precio_unitario) > 0 ? Number(this.reserva.precio_unitario) : 0;
      const descuentoPorcentaje = Number(this.reserva.descuento_porcentaje) > 0 ? Number(this.reserva.descuento_porcentaje) : 0;

      const total = cantidad * precioUnitario;
      let descuento = 0;

      if (total > 0 && descuentoPorcentaje > 0) {
        descuento = (descuentoPorcentaje / 100) * total;       
        descuento = Math.round(descuento * 100) / 100;      
        if (descuento > total) {
          descuento = total;
        }
      }

      this.reserva.descuento = descuento;    ;
      this.calcularTotal();
    }

    calcularFechaFin() {
        if (this.reserva.fecha_ini) {       
          const diasASumar = Number(this.reserva.cantidad);        
          const diasFinales = diasASumar > 0 ? diasASumar : 1;
          this.reserva.fecha_fin = moment(this.reserva.fecha_ini).add(diasFinales, 'days').format('YYYY-MM-DD');
          this.calcularTotal();
        }
    }

    calcularTotal() {    
      const precio = Number(this.reserva.precio_unitario) || 0;
      const cantidad = Number(this.reserva.cantidad) || 0;
      const descuento = Number(this.reserva.descuento) || 0;         
      let totalCalculado = (precio * cantidad) - descuento;
      this.reserva.total = Math.max(0, Math.round(totalCalculado * 100) / 100);        
    }
    //END: Calcular montos en reserva

    bloquearNegativos(event: KeyboardEvent): void {    
      if (event.key === '-' || event.key === '+' || event.key === '.' || event.key === ',' || event.key === 'e' || event.key === 'E') {
        event.preventDefault();
      }
    }

    bloquearSignosNegativos(event: KeyboardEvent): void {
      if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
        event.preventDefault();
      }
    }

}
