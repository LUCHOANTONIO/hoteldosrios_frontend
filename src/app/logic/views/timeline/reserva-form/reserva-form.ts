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
import { CategoriaModel } from '../../../models/categoria.model';

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
import { CategoriaService } from '../../../services/categoria.service';

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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatTooltipModule,
    // Angular Modules
    CommonModule,
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
  @ViewChild('cboTipoDocId') cboTipoDocId: any;
  @ViewChild('cboFormaPagoAnticipo') cboFormaPagoAnticipo: any;

  items: any;
  groups: any;
  reservas: any[] = [];
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
  nuevoServicio: TransaccionModel = new TransaccionModel();
  categorias: CategoriaModel[] = [];
  productos_filtrados: ProductoModel[] = [];
  isProcessingServicio: boolean = false;
  isSearchingDni: boolean = false;

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
    private categoriaService: CategoriaService,
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
    this.reservas = data.reservas || [];

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
        this.btnDeleteReserva = true;
      }

      // Sincronizar anticipo mostrado cuando se visualiza una reserva existente
      if (this.reserva && this.reserva.id > 0 && !this.isEditReserva) {
        this.reserva.anticipo = this.getYaPagado();
      }
    });
  }

  ngOnInit(): void {
    if (this.reserva) {
      if (!this.reserva.id || this.reserva.id <= 0) {
        if (!this.reserva.cantidad_adulto || this.reserva.cantidad_adulto <= 0) {
          this.reserva.cantidad_adulto = 1;
        }
        this.reserva.precio_unit_adulto = 0;
        if (this.reserva.cantidad_ninio === undefined || this.reserva.cantidad_ninio === null) {
          this.reserva.cantidad_ninio = 0;
        }
        this.reserva.precio_unit_ninio = 0;
        this.reserva.total = 0;
        this.reserva.anticipo = 0;
        this.reserva.detalle_anticipo = '';
      } else {
        this.reserva.precio_unit_adulto = Number(this.reserva.precio_unit_adulto) || 0;
        this.reserva.precio_unit_ninio = Number(this.reserva.precio_unit_ninio) || 0;
        this.reserva.anticipo = this.getYaPagado();
      }

      this.calcularCantidad();
      this.calcularTotal();

      if (this.reserva.id > 0) {
        let habitacionIds: number[] = [];

        // 1. Si viene habitacion_ids desde backend (getAllReservaById)
        if (this.reserva.habitacion_ids && this.reserva.habitacion_ids.length > 0) {
          habitacionIds = this.reserva.habitacion_ids.map(id => Number(id));
        }

        // 2. Si es grupal por grupo_id y no tenemos la lista completa aún, buscar en this.reservas de timeline
        if (this.reserva.grupo_id && habitacionIds.length <= 1 && this.reservas && this.reservas.length > 0) {
          const matchedHabs = this.reservas
            .filter((r: any) => r.grupo_id == this.reserva.grupo_id)
            .map((r: any) => Number(r.habitacion_id));
          if (matchedHabs.length > 0) {
            habitacionIds = [...new Set([...habitacionIds, ...matchedHabs])];
          }
        }

        const isGrupal = !!this.reserva.grupo_id || habitacionIds.length > 1;

        if (isGrupal) {
          this.tipo_reserva = 'grupal';
          this.reserva.is_grupal = true;
          this.selectedHabitaciones = habitacionIds.length > 0
            ? habitacionIds
            : [Number(this.reserva.habitacion_id)];
          this.reserva.habitacion_ids = [...this.selectedHabitaciones];
        } else {
          this.tipo_reserva = 'individual';
          this.reserva.is_grupal = false;
          this.selectedHabitaciones = [Number(this.reserva.habitacion_id)];
          this.reserva.habitacion_ids = [...this.selectedHabitaciones];
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
        this.selectedHabitaciones = this.reserva.habitacion_id ? [Number(this.reserva.habitacion_id)] : [];
        this.reserva.habitacion_ids = [...this.selectedHabitaciones];
      }

      // En tu ngOnInit o donde cargues los datos de la reserva
      if (!this.reserva.pais_procedencia_id) {
        this.reserva.pais_procedencia_id = 1;
      }

      if (!this.reserva.nacionalidad_id) {
        this.reserva.nacionalidad_id = 1;
      }
    }

    this.productos_filtrados = [...this.productos];
    this.categoriaService.listar().subscribe({
      next: (res) => {
        this.categorias = res;
        this.filtrarProductos();
      }
    });
    this.inicializarNuevoServicio();
    if (!this.reserva.transacciones) {
      this.reserva.transacciones = [];
    }
    this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
    this.isVisibleServiciosExtra = (this.reserva.transacciones && this.reserva.transacciones.length > 0) ? true : false;
  }

  toggleServiciosExtra(): void {
    this.isVisibleServiciosExtra = !this.isVisibleServiciosExtra;
  }

  //Begin: Filtrar habitacion
  changeHabitacion(event: any): void {
    const selectedId = event.value;
    const selectedHabitacion = this.habitaciones.find(h => h.id === selectedId);
    if (selectedHabitacion) {
      if (!this.reserva.cantidad_adulto || this.reserva.cantidad_adulto <= 0) {
        this.reserva.cantidad_adulto = 1;
      }
      if (this.reserva.precio_unit_adulto === undefined || this.reserva.precio_unit_adulto === null) {
        this.reserva.precio_unit_adulto = 0;
      }
      if (this.reserva.cantidad_ninio === undefined || this.reserva.cantidad_ninio === null) {
        this.reserva.cantidad_ninio = 0;
      }
      if (this.reserva.precio_unit_ninio === undefined || this.reserva.precio_unit_ninio === null) {
        this.reserva.precio_unit_ninio = 0;
      }
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
    if (!this.reserva.cantidad_adulto || this.reserva.cantidad_adulto <= 0) {
      this.reserva.cantidad_adulto = 1;
    }
    if (this.reserva.precio_unit_adulto === undefined || this.reserva.precio_unit_adulto === null) {
      this.reserva.precio_unit_adulto = 0;
    }
    this.calcularTotal();
  }

  focusHabitacion(): void {
    if (this.cboHabitacion?.focus) {
      this.cboHabitacion.focus();
    } else if (this.cboCanalReserva?.focus) {
      this.cboCanalReserva.focus();
    }
  }
  compareHabitacionId(id1: any, id2: any): boolean {
    return id1 != null && id2 != null && Number(id1) === Number(id2);
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
      this.reserva.anticipo = this.getYaPagado();
      this.reserva.detalle_anticipo = '';
      if (this.reserva.grupo_id || this.reserva.is_grupal) {
        this.selectedHabitaciones = (this.reserva.habitacion_ids && this.reserva.habitacion_ids.length > 0)
          ? this.reserva.habitacion_ids.map(id => Number(id))
          : [Number(this.reserva.habitacion_id)];
      } else {
        this.selectedHabitaciones = [Number(this.reserva.habitacion_id)];
      }
      this.botonGuardarDirectiva.habilitarFormBoton();
      return;
    }

    this.dialogRef.close();
  }

  submitReserva(f: NgForm) {
    if (f.valid) {
      if (!this.reserva.nombre || !this.reserva.nombre.trim()) {
        this.alertService.show("El nombre es obligatorio", { duration: 5000, type: 'info' });
        return;
      }
      if (!this.reserva.primer_apellido || !this.reserva.primer_apellido.trim()) {
        this.alertService.show("El primer apellido es obligatorio", { duration: 5000, type: 'info' });
        return;
      }
      const noches = this.getNoches();
      if (!noches || noches <= 0) {
        this.alertService.show("La cantidad de noches debe ser mayor a 0", { duration: 5000, type: 'info' });
        return;
      }
      if (!this.reserva.total || Number(this.reserva.total) <= 0) {
        this.alertService.show("El monto no puede ser vacío o cero", { duration: 5000, type: 'info' });
        return;
      }
      if (this.reserva.anticipo && Number(this.reserva.anticipo) > 0 && (!this.reserva.id || this.isEditReserva)) {
        if (!this.reserva.forma_pago_id) {
          this.alertService.show("Debe seleccionar la forma de pago del anticipo", { duration: 5000, type: 'info' });
          return;
        }
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
      if (this.nuevoServicio.producto_id && Number(this.nuevoServicio.cantidad) > 0) {
        this.calcularTotalNuevoServicio();
        if (!this.reserva.transacciones) {
          this.reserva.transacciones = [];
        }
        this.reserva.transacciones.push({ ...this.nuevoServicio });
        this.inicializarNuevoServicio();
      }
      this.botonGuardarDirectiva.deshabilitarFormBoton();
      if (this.reserva.id > 0) {
        this.modificarReserva();
      } else {
        this.crearReserva();
      }
    } else {
      const invalidFields: string[] = [];
      if (f.controls) {
        Object.keys(f.controls).forEach(key => {
          if (f.controls[key].invalid) {
            invalidFields.push(key);
          }
        });
      }
      console.warn('Campos inválidos en formulario:', invalidFields);
      this.alertService.show("Debe llenar todos los campos requeridos", { duration: 5000, type: 'info' });
    }
  }

  crearReserva() {
    const cantAdulto = Number(this.reserva.cantidad_adulto) || 0;
    const precioAdulto = Number(this.reserva.precio_unit_adulto) || 0;
    const cantNinio = Number(this.reserva.cantidad_ninio) || 0;
    const precioNinio = Number(this.reserva.precio_unit_ninio) || 0;
    const totalPorNoche = (cantAdulto * precioAdulto) + (cantNinio * precioNinio);

    const payload: any = {
      ...this.reserva,
      email: this.reserva.correo || (this.reserva as any).email || '',
      cantidad: this.getNoches(),
      precio_unitario: totalPorNoche,
      cantidad_huesped: (this.reserva as any).cantidad_huesped || 1,
      transacciones: this.reserva.transacciones || []
    };

    this.reservaService.crear(payload).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          this.reserva = data.reserva as ReservaModel;
          this.balance.set(data.balance); //Establecer valor a por medio de signal                
          this.reserva.anticipo = this.getYaPagado();
          this.reserva.detalle_anticipo = '';
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
    this.reserva.anticipo = 0;
    this.reserva.detalle_anticipo = '';
  }

  modificarReserva() {
    const cantAdulto = Number(this.reserva.cantidad_adulto) || 0;
    const precioAdulto = Number(this.reserva.precio_unit_adulto) || 0;
    const cantNinio = Number(this.reserva.cantidad_ninio) || 0;
    const precioNinio = Number(this.reserva.precio_unit_ninio) || 0;
    const totalPorNoche = (cantAdulto * precioAdulto) + (cantNinio * precioNinio);

    const payload: any = {
      ...this.reserva,
      email: this.reserva.correo || (this.reserva as any).email || '',
      cantidad: this.getNoches(),
      precio_unitario: totalPorNoche,
      cantidad_huesped: (this.reserva as any).cantidad_huesped || 1,
      transacciones: this.reserva.transacciones || []
    };

    this.reservaService.modificar(payload).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          this.reserva = data.reserva as ReservaModel;
          this.balance.set(data.balance); //Establecer valor a por medio de signal                
          this.reserva.anticipo = this.getYaPagado();
          this.reserva.detalle_anticipo = '';
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

          // Si es grupal, mantener / sincronizar selectedHabitaciones
          if (this.reserva.grupo_id || this.reserva.is_grupal) {
            if (this.reserva.habitacion_ids && this.reserva.habitacion_ids.length > 0) {
              this.selectedHabitaciones = this.reserva.habitacion_ids.map(id => Number(id));
            }
          }

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

  onDniEnter(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.verificarNroDocumento(this.reserva.nro_documento);
    if (this.cboTipoDocId) {
      this.cboTipoDocId.focus();
    }
  }

  verificarNroDocumento(nro_documento: string) {
    if (this.isDisabled) return;
    const doc = nro_documento ? (nro_documento + '').trim() : '';
    if (!doc) return;

    this.isSearchingDni = true;
    this.personaService.personaPorNroDocumento(doc).subscribe({
      next: (res: any) => {
        this.isSearchingDni = false;
        if (res && typeof res === 'object' && Object.keys(res).length > 0) {
          const {
            tipo_doc_id,
            nacionalidad_id,
            nombre,
            primer_apellido,
            segundo_apellido,
            telefono,
            email,
            id
          } = res;

          this.reserva.tipo_doc_id = tipo_doc_id ? Number(tipo_doc_id) : (this.reserva.tipo_doc_id || 1);
          this.reserva.nacionalidad_id = nacionalidad_id ? Number(nacionalidad_id) : (this.reserva.nacionalidad_id || 1);
          this.reserva.nombre = nombre || '';
          this.reserva.primer_apellido = primer_apellido || '';
          this.reserva.segundo_apellido = segundo_apellido || '';
          this.reserva.telefono = telefono || '';
          this.reserva.correo = email || res.correo || '';
          if (id) {
            this.reserva.cliente_id = Number(id);
          }
        } else {
          // Cliente nuevo: asegurar valores válidos para selectores requeridos
          if (!this.reserva.tipo_doc_id) {
            this.reserva.tipo_doc_id = 1;
          }
          if (!this.reserva.nacionalidad_id) {
            this.reserva.nacionalidad_id = 1;
          }
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSearchingDni = false;
        console.error('Error al verificar documento:', error);
        if (!this.reserva.tipo_doc_id) this.reserva.tipo_doc_id = 1;
        if (!this.reserva.nacionalidad_id) this.reserva.nacionalidad_id = 1;
        this.cdr.detectChanges();
      }
    });
  }

  getNoches(): number {
    if (!this.reserva.fecha_ini || !this.reserva.fecha_fin) return 1;
    const fecha_inicio = moment(this.reserva.fecha_ini);
    const fecha_fin = moment(this.reserva.fecha_fin);
    let diff = Math.round(fecha_fin.diff(fecha_inicio, 'days', true));
    return diff <= 0 ? 1 : diff;
  }

  calcularCantidad() {
    this.calcularTotal();
  }

  calcularFechaFin() {
    if (this.reserva.fecha_ini) {
      const diasASumar = this.getNoches();
      this.reserva.fecha_fin = moment(this.reserva.fecha_ini).add(diasASumar, 'days').format('YYYY-MM-DD');
      this.calcularTotal();
    }
  }

  calcularTotal() {
    const cantAdulto = Number(this.reserva.cantidad_adulto) || 0;
    const precioAdulto = Number(this.reserva.precio_unit_adulto) || 0;
    const cantNinio = Number(this.reserva.cantidad_ninio) || 0;
    const precioNinio = Number(this.reserva.precio_unit_ninio) || 0;

    const totalPorNoche = (cantAdulto * precioAdulto) + (cantNinio * precioNinio);
    const noches = this.getNoches();
    this.reserva.total = Math.max(0, Math.round((totalPorNoche * noches) * 100) / 100);
    this.validarAnticipo();
  }

  getYaPagado(): number {
    if (!this.reserva || !this.reserva.id || this.reserva.id <= 0) {
      return 0;
    }
    const totalReserva = Number(this.reserva.total) || 0;
    let pago = 0;
    if (this.balance && this.balance() && this.balance().pago !== undefined && this.balance().pago !== null) {
      pago = Number(this.balance().pago) || 0;
    } else {
      const saldo = Number(this.reserva.saldo) || 0;
      pago = Math.max(0, totalReserva - saldo);
    }
    return Math.min(totalReserva, Math.max(0, Number(pago.toFixed(2))));
  }

  validarAnticipo(): void {
    const total = Number(this.reserva.total) || 0;
    let anticipo = Number(this.reserva.anticipo) || 0;
    if (anticipo < 0) {
      this.reserva.anticipo = 0;
      anticipo = 0;
    }
    const yaPagado = this.getYaPagado();
    const maxPermitido = this.reserva.id > 0 ? Math.max(0, Number((total - yaPagado).toFixed(2))) : total;
    if (anticipo > maxPermitido) {
      this.reserva.anticipo = maxPermitido;
      anticipo = maxPermitido;
    }
    if (anticipo > 0 && !this.reserva.forma_pago_id && this.forma_pagos && this.forma_pagos.length > 0) {
      const efectivo = this.forma_pagos.find(f => f.descripcion && f.descripcion.toLowerCase().includes('efectivo'));
      this.reserva.forma_pago_id = efectivo ? efectivo.id : this.forma_pagos[0].id;
    }
  }

  focusFormaPagoAnticipo(): void {
    if (this.cboFormaPagoAnticipo?.focus) {
      this.cboFormaPagoAnticipo.focus();
    }
  }

  getSaldoCalculado(): number {
    const totalReserva = Number(this.reserva?.total) || 0;
    const yaPagado = this.getYaPagado();
    const anticipo = (this.isEditReserva || !this.reserva?.id) ? (Number(this.reserva?.anticipo) || 0) : 0;
    const saldo = totalReserva - yaPagado - anticipo;
    return saldo > 0 ? Number(saldo.toFixed(2)) : 0;
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

  inicializarNuevoServicio(): void {
    this.nuevoServicio = new TransaccionModel();
    this.nuevoServicio.cantidad = 1;
    this.nuevoServicio.precio_unitario = 0;
    this.nuevoServicio.total = 0;
    this.filtrarProductos();
  }

  filtrarProductos(): void {
    if (this.nuevoServicio.categoria_id) {
      this.productos_filtrados = this.productos.filter(p => p.categoria_id === this.nuevoServicio.categoria_id);
    } else {
      this.productos_filtrados = [...this.productos];
    }
    if (this.nuevoServicio.producto_id && !this.productos_filtrados.some(p => p.id === this.nuevoServicio.producto_id)) {
      this.nuevoServicio.producto_id = null;
      this.nuevoServicio.precio_unitario = 0;
      this.nuevoServicio.total = 0;
    }
  }

  onProductoServicioChange(event: any): void {
    const selectedId = event?.value !== undefined ? event.value : event;
    const selectedProducto = event?.object || this.productos.find(p => p.id === selectedId);
    if (selectedProducto) {
      this.nuevoServicio.producto_id = selectedProducto.id;
      this.nuevoServicio.descripcion = selectedProducto.descripcion;
      this.nuevoServicio.categoria_id = selectedProducto.categoria_id;
      this.nuevoServicio.precio_unitario = Number(selectedProducto.precio) || 0;
      if (!this.nuevoServicio.cantidad || this.nuevoServicio.cantidad <= 0) {
        this.nuevoServicio.cantidad = 1;
      }
      this.calcularTotalNuevoServicio();
    }
  }

  calcularTotalNuevoServicio(): void {
    const cantidad = Number(this.nuevoServicio.cantidad) || 0;
    const precio = Number(this.nuevoServicio.precio_unitario) || 0;
    this.nuevoServicio.total = Math.round((cantidad * precio) * 100) / 100;
  }

  agregarServicioAdicional(): void {
    if (!this.nuevoServicio.producto_id) {
      this.alertService.show("Seleccione un producto", { duration: 3000, type: 'info' });
      return;
    }
    const cantidad = Number(this.nuevoServicio.cantidad) || 0;
    if (cantidad <= 0) {
      this.alertService.show("La cantidad debe ser mayor a 0", { duration: 3000, type: 'info' });
      return;
    }
    const precio = Number(this.nuevoServicio.precio_unitario) || 0;
    if (precio < 0) {
      this.alertService.show("El monto no puede ser negativo", { duration: 3000, type: 'info' });
      return;
    }

    this.calcularTotalNuevoServicio();

    // Si la reserva ya fue guardada en BD
    if (this.reserva && this.reserva.id > 0) {
      this.isProcessingServicio = true;
      const itemAGuardar = { ...this.nuevoServicio, reserva_id: this.reserva.id };
      this.transaccionService.crear(itemAGuardar).subscribe({
        next: (res) => {
          this.isProcessingServicio = false;
          if (res.correcto) {
            const data = JSON.parse(res.dato);
            this.reserva.transacciones = data.transacciones as TransaccionModel[];
            this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
            this.balance.set(data.balance);
            this.reserva.saldo = data.balance.saldo;
            if (this.items) {
              this.items.update({ id: this.reserva.id, saldo: this.reserva.saldo });
            }
            this.comunicacionService.executeActionReserva.set(true);
            this.comunicacionService.loadBitacoraSignal.set({ reserva_id: this.reserva.id, trigger: Date.now() });
            this.inicializarNuevoServicio();
          } else {
            this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          }
        },
        error: (err) => {
          this.isProcessingServicio = false;
          console.error(err);
          this.alertService.show("Error al guardar el servicio adicional", { duration: 5000, type: 'info' });
        }
      });
    } else {
      // Para reserva nueva (aún no guardada)
      this.isProcessingServicio = true;
      if (!this.reserva.transacciones) {
        this.reserva.transacciones = [];
      }
      this.reserva.transacciones.push({ ...this.nuevoServicio });
      this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
      this.inicializarNuevoServicio();
      setTimeout(() => {
        this.isProcessingServicio = false;
      }, 300);
    }
  }

  eliminarServicioAdicional(index: number, item: TransaccionModel): void {
    if (item.id && item.id > 0) {
      this.transaccionService.eliminar(item.id).subscribe({
        next: (res) => {
          if (res.correcto) {
            const data = JSON.parse(res.dato);
            this.reserva.transacciones = data.transacciones as TransaccionModel[];
            this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
            this.balance.set(data.balance);
            this.reserva.saldo = data.balance.saldo;
            if (this.items) {
              this.items.update({ id: this.reserva.id, saldo: this.reserva.saldo });
            }
            this.comunicacionService.executeActionReserva.set(true);
            this.comunicacionService.loadBitacoraSignal.set({ reserva_id: this.reserva.id, trigger: Date.now() });
            this.alertService.show("Servicio adicional eliminado", { duration: 3000, type: 'success' });
          } else {
            this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          }
        }
      });
    } else {
      this.reserva.transacciones.splice(index, 1);
      this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
    }
  }

  getTotalServiciosAdicionales(): number {
    if (!this.reserva?.transacciones || this.reserva.transacciones.length === 0) return 0;
    return this.reserva.transacciones.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  }

  getTotalGeneral(): number {
    const totalPrecios = Number(this.reserva?.total) || 0;
    const totalServicios = this.getTotalServiciosAdicionales();
    return Math.round((totalPrecios + totalServicios) * 100) / 100;
  }

  cargarDatosTransaccion(reserva_id: number) {
    forkJoin({
      transacciones: this.transaccionService.listarTransaccionesPorReservaId(reserva_id),
    }).subscribe({
      next: (res) => {
        this.reserva.transacciones = res.transacciones;
        this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.reserva.transacciones);
        this.dataSourceTransaccion.paginator = this.paginator;
        if (this.reserva.transacciones && this.reserva.transacciones.length > 0) {
          this.isVisibleServiciosExtra = true;
        }
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

