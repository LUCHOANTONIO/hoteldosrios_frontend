//MODELS
import { ReservaModel } from '../../models/reserva.model';
import { TipoDocumentoModel } from '../../../base/models/tipodocumento.model';
import { PaisModel } from '../../models/pais.model';
import { CanalReservaModel } from '../../models/canal_reserva.model';
import { HabitacionModel } from '../../models/habitacion.model';
import { MotivoModel } from '../../models/motivo.model';
import { TipoHuespedModel } from '../../models/tipo_huesped.model';
import { ProductoModel } from '../../models/producto.model';
import { FormaPagoModel } from '../../models/forma_pago.model';
import { EstadoCivilModel } from '../../../base/models/estadocivil.model';

//SERVICES
import { HabitacionService } from '../../services/habitacion.service';
import { TipoDocumentoService } from '../../../base/services/tipodocumento.service';
import { PaisService } from '../../services/pais.service';
import { CanalReservaService } from '../../services/canal_reserva.service';
import { ReservaService } from '../../services/reserva.service';
import { FormaPagoService } from '../../services/forma_pago.service';
import { TipoHuespedService } from '../../services/tipo_huesped.service';
import { MotivoService } from '../../services/motivo.service';
import { ProductoService } from '../../services/producto.service';
import { ComunicacionService } from '../../services/local/comunicacion.service';
import { EstadoCivilService } from '../../../base/services/estadocivil.service';

//COMPONENT
import { ReservaFormComponent } from './reserva-form/reserva-form';
import { ContextMenuComponent } from '../context-menu/context-menu';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { IrFechaModalComponent } from './ir-fecha-modal/ir-fecha-modal';

//VARIOS
import { Component, ElementRef, inject, effect, ViewChild, AfterViewInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Timeline } from 'vis-timeline';
import { DataSet } from 'vis-data';

import { forkJoin } from 'rxjs';

//Moment 
import moment from 'moment';
import 'moment/locale/es'; // Carga el idioma español en Moment.js para que las fechas del Timeline salen en español
moment.locale('es');


//ANGULAR MATERIAL
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [MatMenuModule, ContextMenuComponent],
  templateUrl: './timeline.html',
  styleUrls: ['./timeline.scss'],
})
export class TimelineComponent implements AfterViewInit {
  @ViewChild('contextMenu') contextMenu!: ContextMenuComponent;
  habitaciones: HabitacionModel[] = [];
  productos: ProductoModel[] = [];
  tipo_documentos: TipoDocumentoModel[] = [];
  estado_civil: EstadoCivilModel[] = [];
  paises: PaisModel[] = [];
  canal_reservas: CanalReservaModel[] = [];
  forma_pagos: FormaPagoModel[] = [];
  reservas: ReservaModel[] = [];
  reserva: ReservaModel = new ReservaModel();
  motivos: MotivoModel[] = [];
  tipo_huespedes: TipoHuespedModel[] = [];
  fechaActual: Date;
  fecha_inicio: string = "";
  fecha_final: string = "";

  //VARIABLES PARA TIMELINE
  groups: any;
  items: any;
  item_original: any;
  options: any;
  timeLine: any;
  timelineContainer: HTMLElement | null = null;
  selectedItems: any[] = [];

  //Variable Signals
  updateGroupsSignal = signal<number | null>(null);

  constructor(
    private elementRef: ElementRef,
    private habitacionService: HabitacionService,
    private productoService: ProductoService,
    private reservaService: ReservaService,
    private tipoDocumentoService: TipoDocumentoService,
    private paisService: PaisService,
    private canalReservaService: CanalReservaService,
    private tipoHuespedService: TipoHuespedService,
    private motivoService: MotivoService,
    private formaPagoService: FormaPagoService,
    private comunicacionService: ComunicacionService,
    private estadoCivilService: EstadoCivilService
  ) {
    this.cargarDatos();

    effect(() => { //Para actualizar el color de estado de habitacion LIMPIEZA
      const habitacionId = this.updateGroupsSignal();
      if (habitacionId) {
        this.ejecutarUpdateGroups(habitacionId);
      }
    });
  }

  ngAfterViewInit(): void {

  }

  cargarDatos() {
    forkJoin({
      habitaciones: this.habitacionService.listar(),
      productos: this.productoService.listar(),
      reservas: this.reservaService.listar(),
      tipo_documentos: this.tipoDocumentoService.listar(),
      paises: this.paisService.listar(),
      canal_reservas: this.canalReservaService.listar(),
      tipo_huespedes: this.tipoHuespedService.listar(),
      motivos: this.motivoService.listar(),
      forma_pagos: this.formaPagoService.listar(),
      estado_civil: this.estadoCivilService.listar()
    }).subscribe({
      next: (res) => {
        this.estado_civil = res.estado_civil;
        this.habitaciones = res.habitaciones;
        this.productos = res.productos;
        this.tipo_documentos = res.tipo_documentos;
        this.paises = res.paises;
        this.canal_reservas = res.canal_reservas;
        this.tipo_huespedes = res.tipo_huespedes;
        this.motivos = res.motivos;
        this.forma_pagos = res.forma_pagos;
        this.reservas = JSON.parse(res.reservas.dato) as ReservaModel[];
        this.loadItems();
        this.loadGroups();
        this.loadOptions();
        this.inicializarTimeline();
      },
    });
  }

  loadGroups() {
    const dataGroups = this.habitaciones.map((habitacion) => {
      const iconoSeparador = '⏵'; //'⟶'; // Puedes usar otros como '•', '→', '⇨', '⮞', '⏵'
      const colorGrupo = habitacion.color || '#FFFFFF'; // Protección contra null
      return {
        id: habitacion.id,
        content: `${habitacion.piso} ${iconoSeparador} ${habitacion.descripcion}`,
        style: `
            background-color: ${colorGrupo};
            color: ${this.getContrastColor(colorGrupo)};
            border-radius: 4px;
            padding-left: 10px;/* Estilos de fuente */
              font-size: 14px;    
              font-family: 'Roboto', 'Helvetica Neue', sans-serif; 
              font-weight: 500;
              display: flex;
              align-items: center;
              height: 100%;              
            `,
      };
    });

    this.groups = new DataSet(dataGroups);
  }

  ejecutarUpdateGroups(habitacion_id) {
    const grupoActual = this.groups.get(habitacion_id);
    if (grupoActual) {
      grupoActual.style = `
          background-color: #FF0000 !important;
          color: #FFFFFF !important;
          border-radius: 4px;
          padding-left: 10px;
          font-size: 14px;    
          font-family: 'Roboto', 'Helvetica Neue', sans-serif; 
          font-weight: 500;
          display: flex;
          align-items: center;
          height: 100%;              
        `;
      this.groups.update(grupoActual);
    }
  }

  getContrastColor(hexColor: string | undefined): string {
    // Valor por defecto si hexColor es undefined o inválido
    if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#') || hexColor.length !== 7) {
      return 'white'; // Color por defecto (texto claro sobre fondo oscuro)
    }

    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 0.5 ? 'black' : 'white';
  }

  loadItems() {
    const hexNaranja = '#FFA500';
    const dataItems = this.reservas.map((reserva) => {
      const isNaranja = reserva.is_externo == 1 && reserva.estado_reserva_id == 1;

      return {
        id: reserva.id,
        correlativo: reserva.correlativo,
        start: reserva.fecha_ini,
        end: reserva.fecha_fin,
        group: reserva.habitacion_id,
        className: isNaranja ? 'orange' : reserva.color,
        style: isNaranja ? `background-color: ${hexNaranja} !important; color: ${this.getContrastColor(hexNaranja)} !important;` : '',
        cliente: reserva.cliente,
        tiene_mensaje: reserva.tiene_mensaje,
        saldo: reserva.saldo,
      };
    });
    this.items = new DataSet(dataItems);
  }

  loadOptions() {
    const inicio = moment().startOf('day');
    const rangoFin = moment(inicio).clone().add(10, 'days');
    this.options = {
      multiselect: true,
      selectable: true,
      editable: {
        updateTime: true,// mover los items en una misma linea
        updateGroup: false,// Opcional: impide cambiar de grupo , como cambiar de linea
        remove: false,
        add: true
      },
      margin: { item: 10 },
      stack: false, //ESTO EVITA EL SALTO DE LÍNEA VERTICAL
      type: 'range',
      showCurrentTime: true,
      start: inicio.toDate(),
      end: rangoFin.toDate(),
      zoomable: false, // Desactivar zoom con el scroll del mouse sobre el timeline
      timeAxis: { //Paramantener ta,año fijo de las celdas 
        scale: 'day',
        step: 1
      },
      locale: 'es',
      format: {
        minorLabels: { //Para dias
          day: 'ddd D',
        },
        majorLabels: { //Para los meses
          month: 'MMMM YYYY',
        },
      },
      orientation: {
        axis: 'both',
        item: 'top',
      },
      width: '100%',
      template: (item) => {
        // SI ES EL ITEM DE HOVER, NO RENDERIZAMOS NADA
        if (item.id === 'hover-item') {
          return '';
        }

        const container = document.createElement('div');
        container.style.padding = '0px';

        if (item.color) {
          container.className = item.color;
        }

        const iconoMensaje = item.tiene_mensaje
          ? '<span class="material-icons" style="font-size: 13px; vertical-align: middle; margin: 0 3px; color: white;">chat</span>'
          : '';

        const iconoBillete = item.saldo > 0
          ? '<span class="material-icons" style="font-size: 13px; vertical-align: middle; margin: 0 3px; color: #FF5F1F;">payments</span>'
          : '';

        // Nombre del cliente
        const nombre = document.createElement('div');
        nombre.innerHTML = `${item.correlativo}⏵${iconoMensaje}${iconoBillete}<span>${item.cliente}</span>`;

        // Estilos unificados (Elegante y compacto)
        nombre.style.fontFamily = `'Helvetica Neue', Helvetica, Arial, sans-serif`;
        nombre.style.fontSize = '12px';
        nombre.style.lineHeight = '1'; // Fuerza a que la altura dependa estrictamente del texto
        nombre.style.margin = '0';
        nombre.style.padding = '2px 0'; // Controlas el aire superior/inferior de forma exacta

        // Agregar al contenedor final 
        container.appendChild(nombre);

        return container;
      },

      onAdd: (item, callback) => {
        let fechaInicio = moment(item.start);
        let fechaFin = moment(fechaInicio).add(1, 'days');
        const fechaIniFormateada = fechaInicio.format("YYYY-MM-DD");
        const fechaFinFormateada = fechaFin.format("YYYY-MM-DD");
        callback(null);
        this.mostrarFormularioNuevo(fechaIniFormateada, fechaFinFormateada, item.group);
      },
      //---------- EVENTO ACTUALIZANDO ITEM -----------------------
      onUpdate: (item, callback) => {
        this.item_original = this.items.get(item.id);//Se recupera el Item original para restablecer cuando se cancele la accion                
        let fechaInicio = moment(item.start);
        let fechaFin = moment(item.end);
        this.fecha_inicio = fechaInicio.format("YYYY-MM-DD");
        this.fecha_final = fechaFin.format("YYYY-MM-DD");

        if (item.id) {
          this.mostrarEditar(item.id);
        }
      },
      // onRemove: (item, callback) => {
      //    callback(null);
      //    this.mostrarConfirmarEliminar('0ms', '0ms',item.id)
      //    callback(null); 
      // },
      onMove: (item, callback) => {
        this.item_original = this.items.get(item.id);//Se recupera el Item original para restablecer cuando se cancele la accion                 
        let fechaInicio = moment(item.start);
        let fechaFin = moment(item.end);
        this.fecha_inicio = fechaInicio.format("YYYY-MM-DD");
        this.fecha_final = fechaFin.format("YYYY-MM-DD");
        this.mostrarEditar(item.id);
        callback(item);
      }
    };
  }

  inicializarTimeline() {
    const container = this.elementRef.nativeElement.querySelector('.timeline-container');

    // Cálculo dinámico para evitar que las fechas se superpongan (cada día necesita ~100px)
    // Restamos ~200px que ocupa el panel izquierdo de las habitaciones
    let availableWidth = container.clientWidth - 200;
    if (availableWidth < 100) availableWidth = window.innerWidth - 150; // Respaldo por si clientWidth es muy pequeño o 0

    let diasMostrar = Math.floor(availableWidth / 100);
    if (diasMostrar < 2) diasMostrar = 2; // Mínimo 2 días (celulares pequeños)
    if (diasMostrar > 15) diasMostrar = 15; // Máximo 15 días (monitores muy anchos)

    // Reajustar opciones con los días calculados
    const inicio = moment().startOf('day');
    const rangoFin = moment(inicio).clone().add(diasMostrar, 'days');

    this.options.start = inicio.toDate();
    this.options.end = rangoFin.toDate();
    // Bloquear el zoom para mantener siempre esta cantidad de días visible en pantalla
    this.options.zoomMin = 1000 * 60 * 60 * 24 * diasMostrar;
    this.options.zoomMax = 1000 * 60 * 60 * 24 * diasMostrar;

    this.timeLine = new Timeline(container, this.items, this.groups, this.options);

    this.timeLine.on('select', (properties) => {
      this.selectedItems = properties.items || [];
    });

    this.timeLine.on('contextmenu', (props: any) => {
      const event = props.event as MouseEvent;
      const itemId = props.item;

      if (itemId) {
        this.contextMenu.show(event, itemId);
      }
    });

    this.timeLine.once('rangechanged', () => { //Se ejecuta una sola ves para establecer el timeline en la fecha actual
      this.centrarTimelineEnHoy();
    });

    this.mouseOverCellTimeline();

  }

  mouseOverCellTimeline() {
    const HOVER_ID = 'hover-item';

    // 1. Al mover el mouse: Crear/Actualizar el resaltado
    this.timeLine.on('mouseMove', (props) => {
      if (!props.group || !props.time) {
        this.items.remove(HOVER_ID);
        return;
      }

      const startOfDay = moment(props.time).startOf('day');
      const endOfDay = moment(startOfDay).clone().add(1, 'days');

      const hoverItem = {
        id: HOVER_ID,
        group: props.group,
        start: startOfDay.toDate(),
        end: endOfDay.toDate(),
        type: 'background',
        className: 'hover-highlight',
        content: ' ',
        title: ''
      };

      this.items.update(hoverItem);
    });

    // 2. Al salir del área de grupos/filas
    this.timeLine.on('mouseOver', (props) => {
      if (!props.group) this.items.remove(HOVER_ID);
    });

    // 3. SOLUCIÓN: Al salir totalmente del contenedor del Timeline
    this.timeLine.on('mouseOut', () => {
      this.items.remove(HOVER_ID);
    });

    // 4. SOLUCIÓN: Al desplazar o mover el calendario (Scroll/Drag)
    this.timeLine.on('rangechange', () => {
      this.items.remove(HOVER_ID);
    });
  }

  centrarTimelineEnHoy() {
    const fechaActual = new Date(); // fecha actual
    this.timeLine.moveTo(fechaActual); // timeline es la instancia de vis.Timeline
  }

  readonly dialog = inject(MatDialog);
  mostrarFormularioNuevo(fecha_ini, fecha_fin, habitacion_id) {
    this.reserva = new ReservaModel();
    this.reserva.fecha_ini = fecha_ini;
    this.reserva.fecha_fin = fecha_fin;
    this.reserva.habitacion_id = habitacion_id;
    this.reserva.cantidad_adulto = 1;
    this.reserva.precio_unit_adulto = 0;
    this.reserva.cantidad_ninio = 0;
    this.reserva.precio_unit_ninio = 0;
    this.reserva.total = 0;

    const dialogRef = this.dialog.open(ReservaFormComponent, {
      data: {
        reserva: this.reserva,
        habitaciones: this.habitaciones,
        tipo_documentos: this.tipo_documentos,
        estado_civil: this.estado_civil,
        paises: this.paises,
        forma_pagos: this.forma_pagos,
        canal_reservas: this.canal_reservas,
        tipo_huespedes: this.tipo_huespedes,
        motivos: this.motivos,
        productos: this.productos,
        items: this.items,
        updateGroupsSignal: this.updateGroupsSignal
      },
      width: "98vw",
      maxWidth: "600px",
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) { return; }
    });

  }

  mostrarEditar(reserva_id: number) {
    forkJoin({
      response: this.reservaService.mostrar(reserva_id),
    }).subscribe({
      next: (res) => {
        //Cargar datos de reserva
        this.reserva = res.response.reserva as ReservaModel;
        this.comunicacionService.executeActionReserva.set(false);//Resetear a valor por defecto (Actualizado 19/07/2025)
        //El problema era que cuando se movia el item, siempre traia lo mismo, pero ahora esta respetando los valores actuales del item
        this.reserva.fecha_ini = this.fecha_inicio;
        this.reserva.fecha_fin = this.fecha_final;

        const dialogRef = this.dialog.open(ReservaFormComponent, {
          data: {
            reserva: this.reserva,
            habitaciones: this.habitaciones,
            tipo_documentos: this.tipo_documentos,
            estado_civil: this.estado_civil,
            paises: this.paises,
            forma_pagos: this.forma_pagos,
            canal_reservas: this.canal_reservas,
            tipo_huespedes: this.tipo_huespedes,
            motivos: this.motivos,
            productos: this.productos,
            items: this.items,
            updateGroupsSignal: this.updateGroupsSignal
          },
          width: "98vw",
          maxHeight: "90vh",
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {

          if (!result) { return; }

          let executeActionReserva = this.comunicacionService.executeActionReserva();
          if (executeActionReserva == false) {
            this.items.update(this.item_original);
            this.timeLine.redraw();
          }
        });
      },
    });
  }

  mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string, reserva_id: number) {
    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: reserva_id
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {//eliminar
        forkJoin({
          reserva: this.reservaService.eliminar(reserva_id),
        }).subscribe({
          next: (res) => {
            this.reserva = JSON.parse(res.reserva.dato) as ReservaModel;
            this.items.remove(this.reserva.id);
          },
        });
      }
    });
  }

  mostrarIrFecha(enterAnimationDuration: string, exitAnimationDuration: string) {
    const dialogRef = this.dialog.open(IrFechaModalComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.timeLine.moveTo(result); //result es la fecha seleccionada
      }
    });
  }

}
