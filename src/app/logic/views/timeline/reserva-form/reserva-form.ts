//MODELS
import { ReservaModel } from '../../../models/reserva.model';
import { TipoDocumentoModel } from '../../../../base/models/tipodocumento.model';
import { PaisModel } from '../../../models/pais.model';
import { HuespedModel } from '../../../models/huesped.model';
import { MotivoModel } from '../../../models/motivo.model';
import { TipoHuespedModel } from '../../../models/tipo_huesped.model';
import { CanalReservaModel } from '../../../models/canal_reserva.model';
import { HabitacionModel } from '../../../models/habitacion.model';
import { ProductoModel } from '../../../models/producto.model';
import { TransaccionModel } from '../../../models/transaccion.model';
import { EstadoCivilModel } from '../../../../base/models/estadocivil.model';

//COMPONENT
import { HuespedFormComponent } from '../huesped-form/huesped-form';
import { TransaccionFormComponent } from '../transaccion-form/transaccion-form';
import { PagoFormComponent } from '../pago-form/pago-form';
import { NotaFormComponent } from '../nota-form/nota-form';
import { BitacoraFormComponent } from '../bitacora-form/bitacora-form';
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';
import { SelectSearchComponent } from '../../../../base/shared/views/select-search/select-search';

//DATA PICKER
import { MatDatepickerModule } from '@angular/material/datepicker'; //Para fecha desplegable

//Moment
import moment from 'moment';

//SERVICES
import { ReservaService } from '../../../services/reserva.service';
import { AlertService } from '../../../../base/services/local/alert.service';
import { PersonaService } from '../../../../base/services/persona.service';
import { DocumentoService } from '../../../services/documento.service';
import { BalanceService } from '../../../services/balance.service';
import { ComunicacionService } from '../../../services/local/comunicacion.service';
import { TransaccionService } from '../../../services/transaccion.service';
import { PermisoService } from '../../../../base/services/permiso.service';

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

//DIRECTIVAS
import { PreventEnterSubmitDirective } from '../../../../base/shared/directives/prevent-enter-submit.directive';
import { PreventEnterSelectDirective } from '../../../../base/shared/directives/prevent-enter-select.directive';
import { AnimarPerderFocoDirective } from '../../../../base/shared/directives/animar-perder-foco.directive';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';
import { ShowErrorDirective } from '../../../../base/shared/directives/show-error.directive';

//VARIOS
import { Component, Inject, ChangeDetectorRef, ViewChild, effect, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';
import { ConfirmarComponent } from '../../../shared/views/confirmar/confirmar';
import { FormaPagoModel } from '../../../models/forma_pago.model';

//DATA TABLE
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

//MENU OPCIONES
import { MatMenuModule } from '@angular/material/menu';

//ANGULAR MATERIAL
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox'

@Component({
  selector: 'app-reserva-form',
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
    HuespedFormComponent,
    TransaccionFormComponent,
    PagoFormComponent,
    NotaFormComponent,
    BitacoraFormComponent,
    MatAutocompleteModule,
    MatTableModule,
    MatCheckboxModule,
    MatDatepickerModule,
    SelectSearchComponent,
    ShowErrorDirective,
  ],
  
  templateUrl: './reserva-form.html',
  styleUrls: ['./reserva-form.scss']
})
export class ReservaFormComponent {
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
  @ViewChild(PagoFormComponent) pagoFormComponent: PagoFormComponent;
  @ViewChild(BitacoraFormComponent) bitacoraFormComponent: BitacoraFormComponent;
  @ViewChild('cboHabitacion') cboHabitacion: any;
  @ViewChild('cboCanalReserva') cboCanalReserva: any;

  items: any;
  groups: any;
  habitaciones: HabitacionModel[] = [];
  forma_pagos: FormaPagoModel[] = [];
  forma_pagos_servicio: FormaPagoModel[] = [];
  productos: ProductoModel[] = [];
  tipo_documentos: TipoDocumentoModel[] = [];
  estado_civil: EstadoCivilModel[] = [];
  paises: PaisModel[] = [];
  motivos: MotivoModel[] = [];
  tipo_huespedes: TipoHuespedModel[] = [];
  huespedes: HuespedModel[] = [];
  canal_reservas: CanalReservaModel[] = [];
  reserva: ReservaModel = new ReservaModel();
  balance: any; //Variable signal cargado desde constructor  

  //Flag Visible or Disabled
  btnVisibleCheckIn: boolean = false;
  btnVisibleCheckOut: boolean = false;
  btnVisibleCancelReserva: boolean = true;
  btnVisibleSaveReserva: boolean = true;
  btnDeleteReserva: boolean = false;
  mnuVisibleOpciones: boolean = false;
  isDisabled: boolean = false;
  isEditReserva: boolean = false;
  isVisibleTabs: boolean = false;
  isVisibleServiciosExtra: boolean = false;

  // Tipo de Reserva: individual o grupal
  tipo_reserva: 'individual' | 'grupal' = 'individual';
  selectedHabitaciones: number[] = [];

  //Comprobante              
  dialogVoucherRef: any;

  //Variable Signals
  updateGroupsSignal = signal<number | null>(null);   
  private triggerEstadoReserva = signal<number>(Date.now());    

  //Vaariables para Transaccion    
  displayedColumnsTransaccion: string[] = ['accion', 'descripcion', 'cantidad', 'precio_unitario', 'total'];
  dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  transaccion: TransaccionModel = new TransaccionModel();

  constructor(
    public dialogRef: MatDialogRef<ReservaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private reservaService: ReservaService,
    private personaService: PersonaService,
    private alertService: AlertService,
    private documentoService: DocumentoService,
    private balanceService: BalanceService,
    private transaccionService: TransaccionService,
    private comunicacionService: ComunicacionService,
    private permisoService: PermisoService,
    private cdr: ChangeDetectorRef
  ) {
    // Asignación de datos desde el objeto 'data'
    this.items = data.items;
    this.updateGroupsSignal = data.updateGroupsSignal;
    this.habitaciones = data.habitaciones;
    this.forma_pagos = data.forma_pagos;
    this.forma_pagos_servicio = [...data.forma_pagos];
    this.productos = data.productos;
    this.tipo_documentos = data.tipo_documentos;
    this.estado_civil = data.estado_civil;
    this.reserva = data.reserva;
    this.paises = data.paises;
    this.tipo_huespedes = data.tipo_huespedes;
    this.motivos = data.motivos;
    this.canal_reservas = data.canal_reservas;

    // Configuración de suscripciones y servicios
    this.dialogRef.backdropClick().subscribe(x => { });
    this.balance = this.balanceService.balance;      

    // Lógica condicional de inicialización
    if (this.reserva.id > 0) {
      this.cargarDatosTransaccion(this.reserva.id)
      this.btnVisibleCheckIn = true;
      this.btnVisibleCheckOut = true;
    }    

    effect(() => {
      this.triggerEstadoReserva(); // Disparador reactivo para cuando hay cambio de estado_reserva_id   
      let permisos = this.permisoService.permisos();     
      if (this.reserva.estado_reserva_id != 1) {
        if (permisos.length > 0) {
           this.btnDeleteReserva = permisos.find(p => p.nombre == 'Eliminar Reserva') ? true : false;
        }
      } else {
        this.btnDeleteReserva=true;
      }
    });
  }

  ngOnInit(): void {
    if (this.reserva) {
      this.calcularCantidad();
      this.calcularTotal();
      if (this.reserva.id > 0) {
        if (this.reserva.grupo_id) {
          this.tipo_reserva = 'grupal';
          this.reserva.is_grupal = true;
          this.selectedHabitaciones = [this.reserva.habitacion_id];
        } else {
          this.tipo_reserva = 'individual';
          this.reserva.is_grupal = false;
          this.selectedHabitaciones = [this.reserva.habitacion_id];
        }
        setTimeout(() => {
          this.isDisabled = true;
          this.mnuVisibleOpciones = true;
          this.btnVisibleCancelReserva = false;
          this.btnVisibleSaveReserva = false;
          this.isVisibleTabs = true;
          this.cdr.detectChanges(); //Con esto se corrigio el error ExpressionChangedAfterItHasBeenCheckedError
        });
      } else {
        this.tipo_reserva = 'individual';
        this.reserva.is_grupal = false;
        this.selectedHabitaciones = this.reserva.habitacion_id ? [this.reserva.habitacion_id] : [];
      }

      // En tu ngOnInit o donde cargues los datos de la reserva
      if (!this.reserva.pais_procedencia_id) {
        this.reserva.pais_procedencia_id = 1;
      }

      if (!this.reserva.nacionalidad_id) {
        this.reserva.nacionalidad_id = 1;
      }
    }

    this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>([]);
  }

  //Begin: Filtrar habitacion
  changeHabitacion(event: any): void {
    const selectedId = event.value;
    const selectedHabitacion = this.habitaciones.find(h => h.id === selectedId);
    if (selectedHabitacion) {
      this.reserva.precio_unitario = selectedHabitacion.precio;
      this.calcularTotal();
    }
  }
  //End: Filtrar habitacion   

  //Begin: Metodos para Reserva Grupal
  onTipoReservaChange(tipo: 'individual' | 'grupal'): void {
    if (this.isDisabled) return;
    this.tipo_reserva = tipo;
    if (tipo === 'individual') {
      this.reserva.is_grupal = false;
      this.reserva.habitacion_ids = [];
      if (this.selectedHabitaciones.length > 0) {
        this.reserva.habitacion_id = this.selectedHabitaciones[0];
      }
      const selectedHabitacion = this.habitaciones.find(h => h.id === this.reserva.habitacion_id);
      if (selectedHabitacion) {
        this.reserva.precio_unitario = selectedHabitacion.precio;
      }
      this.calcularTotal();
    } else {
      this.reserva.is_grupal = true;
      if (this.selectedHabitaciones.length === 0 && this.reserva.habitacion_id) {
        this.selectedHabitaciones = [this.reserva.habitacion_id];
      }
      this.reserva.habitacion_ids = [...this.selectedHabitaciones];
      if (!this.reserva.grupo_nombre) {
        const apellido = this.reserva.primer_apellido || this.reserva.nombre || '';
        this.reserva.grupo_nombre = apellido ? `Grupo ${apellido}` : 'Grupo';
      }
      this.calcularPrecioGrupal();
    }
  }

  changeHabitacionesMulti(event: any): void {
    this.selectedHabitaciones = event.value || [];
    this.reserva.habitacion_ids = [...this.selectedHabitaciones];
    if (this.selectedHabitaciones.length > 0) {
      this.reserva.habitacion_id = this.selectedHabitaciones[0];
    }
    this.calcularPrecioGrupal();
  }

  calcularPrecioGrupal(): void {
    let sumPrecio = 0;
    for (const habId of this.selectedHabitaciones) {
      const hab = this.habitaciones.find(h => h.id === habId);
      if (hab && hab.precio) {
        sumPrecio += Number(hab.precio);
      }
    }
    this.reserva.precio_unitario = sumPrecio;
    this.calcularTotal();
  }

  focusHabitacion(): void {
    if (this.cboHabitacion?.focus) {
      this.cboHabitacion.focus();
    } else if (this.cboCanalReserva?.focus) {
      this.cboCanalReserva.focus();
    }
  }
  //End: Metodos para Reserva Grupal   

  // Este método se llama desde el botón de cerrar
  onClose(): void {
    this.dialogRef.close({
      action: 'close'
    });
  }

  onCancel() {
    if (this.isEditReserva) {
      this.isEditReserva = false;
      this.btnVisibleCheckIn = true;
      this.btnVisibleCheckOut = true;
      this.isDisabled = true;
      this.mnuVisibleOpciones = true;
      this.btnVisibleCancelReserva = false;
      this.btnVisibleSaveReserva = false;
      this.botonGuardarDirectiva.habilitarFormBoton();
      return;
    }

    this.dialogRef.close();
  }

  submitReserva(f: NgForm) {
    if (f.valid) {
      if (!this.reserva.cantidad || Number(this.reserva.cantidad) <= 0) {
        this.alertService.show("La cantidad de noches debe ser mayor a 0", { duration: 5000, type: 'info' });
        return;
      }
      this.reserva.cantidad_huesped = this.reserva.cantidad_huesped || 1;
      if (this.reserva.descuento !== undefined && this.reserva.descuento !== null && Number(this.reserva.descuento) < 0) {
        this.alertService.show("El descuento no puede ser un número negativo", { duration: 5000, type: 'info' });
        return;
      }
      if (this.tipo_reserva === 'grupal') {
        if (!this.selectedHabitaciones || this.selectedHabitaciones.length === 0) {
          this.alertService.show("Debe seleccionar al menos una habitación para la reserva grupal", { duration: 5000, type: 'info' });
          return;
        }
        this.reserva.is_grupal = true;
        this.reserva.habitacion_ids = this.selectedHabitaciones;
        this.reserva.habitacion_id = this.selectedHabitaciones[0];
      } else {
        this.reserva.is_grupal = false;
        this.reserva.habitacion_ids = [this.reserva.habitacion_id];
      }
      this.botonGuardarDirectiva.deshabilitarFormBoton();
      if (this.reserva.id > 0) {
        this.modificarReserva();
      } else {
        this.crearReserva();
      }
    } else {
      this.alertService.show("Debe llenar los campos", { duration: 5000, type: 'info' });
    }
  }

  crearReserva() {
    this.reservaService.crear(this.reserva).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          this.reserva = data.reserva as ReservaModel;
          this.balance.set(data.balance); //Establecer valor a por medio de signal                
          let fecha_hora_ini = moment(this.reserva.fecha_ini).format("YYYY-MM-DD HH:mm");
          let fecha_hora_fin = moment(this.reserva.fecha_fin).format("YYYY-MM-DD HH:mm");
          this.reserva.fecha_ini = moment(this.reserva.fecha_ini).format("YYYY-MM-DD");
          this.reserva.fecha_fin = moment(this.reserva.fecha_fin).format("YYYY-MM-DD");

          // Limpiar borde naranja de cualquier reserva registrada anteriormente
          if (this.items) {
            const allItems = this.items.get();
            const updates: any[] = [];
            allItems.forEach((it: any) => {
              if (it.className && it.className.includes('new-reservation-highlight')) {
                updates.push({
                  id: it.id,
                  className: it.className.replace(/\bnew-reservation-highlight\b/g, '').trim()
                });
              }
            });
            if (updates.length > 0) {
              this.items.update(updates);
            }
          }

          // Si es grupal y se crearon múltiples reservas, actualizarlas todas en el timeline
          if (data.reservas && Array.isArray(data.reservas) && data.reservas.length > 0) {
            data.reservas.forEach((r: any) => {
              const r_ini = moment(r.fecha_ini).format("YYYY-MM-DD HH:mm");
              const r_fin = moment(r.fecha_fin).format("YYYY-MM-DD HH:mm");
              const newCls = r.color ? r.color + ' new-reservation-highlight' : 'new-reservation-highlight';
              this.items.update({
                id: r.id,
                correlativo: r.correlativo,
                cliente: r.cliente,
                start: r_ini,
                end: r_fin,
                group: r.habitacion_id,
                className: newCls,
                saldo: r.saldo
              });
            });
            this.alertService.show(`Reserva grupal creada con éxito (${data.reservas.length} habitaciones)`, { duration: 5000, type: 'success' });
          } else {
            const newClassName = this.reserva.color ? this.reserva.color + ' new-reservation-highlight' : 'new-reservation-highlight';
            this.items.update({ id: this.reserva.id, correlativo: this.reserva.correlativo, cliente: this.reserva.cliente, start: fecha_hora_ini, end: fecha_hora_fin, group: this.reserva.habitacion_id, className: newClassName, saldo: this.reserva.saldo });
          }
          this.isDisabled = true;
          this.btnVisibleCheckIn = true;
          this.btnVisibleCheckOut = true;
          this.mnuVisibleOpciones = true;
          this.btnVisibleCancelReserva = false;
          this.btnVisibleSaveReserva = false;
          this.isVisibleTabs = true;

          //Cargar transacciones del servicio extra al crear reserva 
          this.reserva.transacciones = data.transacciones;
          this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);

          this.comunicacionService.executeActionReserva.set(true); //Señal para indicar que hubo accion en reserva               
          this.comunicacionService.loadBitacoraSignal.set({ reserva_id: this.reserva.id, trigger: Date.now() });
          this.triggerEstadoReserva.set(Date.now());

        } else {
          this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
        }

        this.botonGuardarDirectiva.habilitarFormBoton();

      },
      error: (error) => {
        this.botonGuardarDirectiva.habilitarFormBoton();
      }
    })
  }

  editarReserva() {
    this.isEditReserva = true;
    this.isDisabled = false;
    this.mnuVisibleOpciones = false;
    this.btnVisibleCancelReserva = true;
    this.btnVisibleSaveReserva = true;
    this.btnVisibleCheckIn = false;
    this.btnVisibleCheckOut = false;
  }

  modificarReserva() {
    this.reservaService.modificar(this.reserva).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          this.reserva = data.reserva as ReservaModel;
          this.balance.set(data.balance); //Establecer valor a por medio de signal                
          let fecha_hora_ini = moment(this.reserva.fecha_ini).format("YYYY-MM-DD HH:mm");
          let fecha_hora_fin = moment(this.reserva.fecha_fin).format("YYYY-MM-DD HH:mm");
          this.reserva.fecha_ini = moment(this.reserva.fecha_ini).format("YYYY-MM-DD");
          this.reserva.fecha_fin = moment(this.reserva.fecha_fin).format("YYYY-MM-DD");
          this.items.update({ id: this.reserva.id, correlativo: this.reserva.correlativo, cliente: this.reserva.cliente, start: fecha_hora_ini, end: fecha_hora_fin, group: this.reserva.habitacion_id, className: this.reserva.color, saldo: this.reserva.saldo });
          this.isEditReserva = false;
          this.isDisabled = true;
          this.btnVisibleCheckIn = true;
          this.btnVisibleCheckOut = true;
          this.mnuVisibleOpciones = true;
          this.btnVisibleCancelReserva = false;
          this.btnVisibleSaveReserva = false;

          //Cargar transacciones del servicio extra al crear reserva 
          this.reserva.transacciones = data.transacciones;
          this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);

          this.comunicacionService.executeActionReserva.set(true);//Señal para indicar que hubo accion en reserva              
          this.comunicacionService.loadBitacoraSignal.set({ reserva_id: this.reserva.id, trigger: Date.now() });
          this.triggerEstadoReserva.set(Date.now());

        } else {
          this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
        }

        this.botonGuardarDirectiva.habilitarFormBoton();

      },
      error: (error) => {
        this.botonGuardarDirectiva.habilitarFormBoton();
      }
    })
  }

  eliminarReserva(enterAnimationDuration: string, exitAnimationDuration: string) {
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: this.reserva.id
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {//eliminar
        this.botonGuardarDirectiva.deshabilitarFormBoton();
        forkJoin({
          reserva: this.reservaService.eliminar(this.reserva.id),
        }).subscribe({
          next: (res) => {
            if (res.reserva.correcto) {
              this.reserva = JSON.parse(res.reserva.dato) as ReservaModel;
              this.items.remove(this.reserva.id);
              this.comunicacionService.executeActionReserva.set(true);//Señal para indicar que hubo accion en reserva                     
              this.dialogRef.close();

            } else {
              this.alertService.show(res.reserva.mensaje, { duration: 5000, type: 'info' });
              this.botonGuardarDirectiva.habilitarFormBoton();
            }
          },
        });
      }
    });
  }

  mostrarVisorPdf(pdf_base64: string) {
    if (this.reserva) {
      if (!pdf_base64) {
        this.documentoService.obtenerVoucherReserva(this.reserva.id).subscribe({
          next: (res) => {
            this.cargarVisorPdf(res, "Comprobante");
          }
        });
      } else {
        this.cargarVisorPdf(pdf_base64, "Comprobante");
      }
    }
  }

  private cargarVisorPdf(pdf_base64: string, titulo_documento: string): void {
    this.dialogVoucherRef = this.dialog.open(PdfViewerComponent, {
      width: '50vw',
      maxWidth: '95vw',
      height: '80vh',
      data: { pdf_base64, titulo_documento },
      disableClose: true,
    });
  }

  mostrarConfirmarEstado(title_estado: string, enterAnimationDuration: string, exitAnimationDuration: string, estado_reserva_id: number) {
    const dialogRef = this.dialog.open(ConfirmarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: { title: title_estado }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const data_reserva = { ...this.reserva }; //Clonar reserva
        data_reserva.estado_reserva_id = estado_reserva_id;
        this.botonGuardarDirectiva?.deshabilitarFormBoton();

        forkJoin({
          reserva: this.reservaService.estado(data_reserva),
        }).subscribe({
          next: (res) => {
            if (res.reserva?.correcto) {
              this.reserva = JSON.parse(res.reserva.dato) as ReservaModel;

              let fecha_hora_ini = moment(this.reserva.fecha_ini).format("YYYY-MM-DD HH:mm");
              let fecha_hora_fin = moment(this.reserva.fecha_fin).format("YYYY-MM-DD HH:mm");
              this.reserva.fecha_ini = moment(this.reserva.fecha_ini).format("YYYY-MM-DD");
              this.reserva.fecha_fin = moment(this.reserva.fecha_fin).format("YYYY-MM-DD");

              this.items.update({ id: this.reserva.id, cliente: this.reserva.cliente, start: fecha_hora_ini, end: fecha_hora_fin, group: this.reserva.habitacion_id, className: this.reserva.color, saldo: this.reserva.saldo });
              this.isDisabled = true;
              this.mnuVisibleOpciones = true;
              this.btnVisibleCancelReserva = false;
              this.btnVisibleSaveReserva = false;
              this.comunicacionService.executeActionReserva.set(true);
              this.comunicacionService.loadBitacoraSignal.set({ reserva_id: this.reserva.id, trigger: Date.now() });

              if (estado_reserva_id == 3) { // Estado Check Out
                this.updateGroupsSignal.set(this.reserva.habitacion_id);
              }
              
              this.triggerEstadoReserva.set(Date.now());

            } else {
              this.alertService.show(res.reserva.mensaje, { duration: 10000, type: 'info' });
            }

            this.botonGuardarDirectiva.habilitarFormBoton();

          },
        });
      }
    });
  }

  verificarNroDocumento(nro_documento: string) {
    if (this.reserva.id == null && nro_documento?.trim()) {
      this.personaService.personaPorNroDocumento(nro_documento).subscribe({
        next: (res) => {
          if (Object.keys(res).length != 0) {

            const {
              detalle,
              tipo_doc_id,
              nacionalidad_id,
              nombre,
              primer_apellido,
              segundo_apellido,
              telefono
            } = res;

            this.reserva.tipo_doc_id = Number(tipo_doc_id);
            this.reserva.nacionalidad_id = Number(nacionalidad_id);
            this.reserva.nombre = nombre;
            this.reserva.primer_apellido = primer_apellido;
            this.reserva.segundo_apellido = segundo_apellido;
            this.reserva.telefono = telefono;

          } else {
            this.reserva.tipo_doc_id = null;
            this.reserva.nacionalidad_id = null;
            this.reserva.nombre = "";
            this.reserva.primer_apellido = "";
            this.reserva.segundo_apellido = "";
            this.reserva.telefono = "";
            this.reserva.correo = "";
          }
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }

  calcularCantidad() {
    const fecha_inicio = moment(this.reserva.fecha_ini);
    const fecha_fin = moment(this.reserva.fecha_fin);
    let cantidad = Math.round(fecha_fin.diff(fecha_inicio, 'days', true));
    cantidad = cantidad <= 0 ? 1 : cantidad; //Controlamos que no sea negativo
    this.reserva.cantidad = cantidad;
    this.calcularTotal();
  }

  // calcularDescuentoPorcentaje(): void {      
  //   const cantidad = Number(this.reserva.cantidad) > 0 ? Number(this.reserva.cantidad) : 1;
  //   const precioUnitario = Number(this.reserva.precio_unitario) > 0 ? Number(this.reserva.precio_unitario) : 0;
  //   const descuento = Number(this.reserva.descuento) > 0 ? Number(this.reserva.descuento) : 0;     
  //   const total = cantidad * precioUnitario;
  //   let porcentaje = 0;

  //   if (total > 0 && descuento > 0) {      
  //     porcentaje = (descuento / total) * 100;       
  //     porcentaje = Math.round(porcentaje * 100) / 100;      
  //     if (porcentaje > 100) {
  //       porcentaje = 100;
  //     }
  //   }

  //   this.reserva.descuento_porcentaje = porcentaje;     
  //   this.calcularTotal();
  // }

  // calcularDescuento(): void {
  //   const cantidad = Number(this.reserva.cantidad) > 0 ? Number(this.reserva.cantidad) : 1;
  //   const precioUnitario = Number(this.reserva.precio_unitario) > 0 ? Number(this.reserva.precio_unitario) : 0;
  //   const descuentoPorcentaje = Number(this.reserva.descuento_porcentaje) > 0 ? Number(this.reserva.descuento_porcentaje) : 0;

  //   const total = cantidad * precioUnitario;
  //   let descuento = 0;

  //   if (total > 0 && descuentoPorcentaje > 0) {
  //     descuento = (descuentoPorcentaje / 100) * total;       
  //     descuento = Math.round(descuento * 100) / 100;      
  //     if (descuento > total) {
  //       descuento = total;
  //     }
  //   }

  //   this.reserva.descuento = descuento;    ;
  //   this.calcularTotal();
  // }

  calcularFechaFin() {
    if (this.reserva.fecha_ini) {
      const diasASumar = Math.max(1, Math.floor(Number(this.reserva.cantidad) || 1));
      this.reserva.fecha_fin = moment(this.reserva.fecha_ini).add(diasASumar, 'days').format('YYYY-MM-DD');
      this.calcularTotal();
    }
  }

  calcularTotal() {
    const precio = Number(this.reserva.precio_unitario) || 0;
    const cantidad = Number(this.reserva.cantidad) || 0;
    let descuento = Number(this.reserva.descuento) || 0;
    if (descuento < 0) {
      descuento = 0;
      this.reserva.descuento = 0;
    }
    let totalCalculado = (precio * cantidad) - descuento;
    this.reserva.total = Math.max(0, Math.round(totalCalculado * 100) / 100);
  }

  onProductoChange(fila: TransaccionModel) {
    const productoSeleccionado = this.productos.find(p => p.id === fila.producto_id);
    if (productoSeleccionado) {
      fila.precio_unitario = productoSeleccionado.precio;
      this.calcularTotalTransaccion(fila);
    }
  }

  calcularTotalTransaccion(fila: TransaccionModel) {
    const cantidad = Number(fila.cantidad) || 0;
    const precio = Number(fila.precio_unitario) || 0;
    fila.total = cantidad * precio;
  }

  //BEGIN TRANSACCIONES

  cargarDatosTransaccion(reserva_id: number) {
    forkJoin({
      transacciones: this.transaccionService.listarTransaccionesPorReservaId(reserva_id),
    }).subscribe({
      next: (res) => {
        this.reserva.transacciones = res.transacciones;
        this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
        this.dataSourceTransaccion.paginator = this.paginator;
      }
    });
  }

  //END TRANSACCIONES     

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

