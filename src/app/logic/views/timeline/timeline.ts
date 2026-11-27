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
import { TipoHabitacionModel } from '../../models/tipo_habitacion.model';
import { EstadoHabitacionModel } from '../../models/estado_habitacion.model';

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
import { TipoHabitacionService } from '../../services/tipo_habitacion.service';
import { EstadoHabitacionService } from '../../services/estado_habitacion.service';
import { AppService } from '../../../base/services/local/app.service';


//COMPONENT
import { ReservaFormComponent } from './reserva-form/reserva-form';
import { ContextMenuComponent } from '../context-menu/context-menu';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import { IrFechaModalComponent } from './ir-fecha-modal/ir-fecha-modal';

//VARIOS
import { Component, ElementRef, inject, effect, ViewChild, AfterViewInit, signal, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
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
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ContextMenuComponent
  ],
  templateUrl: './timeline.html',
  styleUrls: ['./timeline.scss'],
})
export class TimelineComponent implements AfterViewInit {
  @ViewChild('contextMenu') contextMenu!: ContextMenuComponent;
  tabActiva: 'habitaciones' | 'fullday' | 'camping' | 'todas' = 'habitaciones';
  tipo_habitaciones: TipoHabitacionModel[] = [];
  estado_habitaciones: EstadoHabitacionModel[] = [];
  habitaciones: HabitacionModel[] = [];

  // Menú contextual rápido de Estado de Habitación
  menuEstadoVisible = false;
  menuEstadoTop = '0px';
  menuEstadoLeft = '0px';
  habitacionMenuSeleccionada: HabitacionModel | null = null;
  cambiandoEstadoHabitacion = false;

  // Vista rápida (Popover) de Habitaciones en Reserva Grupal sin abrir el formulario
  grupoPreviewVisible = false;
  grupoPreviewTop = '0px';
  grupoPreviewLeft = '0px';
  grupoPreviewData: {
    grupo_id: number | null;
    correlativo: number | string;
    grupo_nombre: string;
    titular: string;
    fechas: string;
    currentHabitacionId: number;
    labelPlural: string;
    labelSeccion: string;
    reservaIds: number[];
    habitaciones: Array<{
      reserva_id: number;
      habitacion_id: number;
      badge: string;
      titulo: string;
      subtitulo: string;
      piso: string;
    }>;
  } | null = null;
  private grupoPreviewShowTimer: any = null;
  private grupoPreviewHideTimer: any = null;
  private currentHoveredItemId: number | null = null;

  // Buscador de reservas por número o cliente
  terminoBusqueda: string = '';
  resultadosBusqueda: ReservaModel[] = [];
  mostrarResultadosBusqueda: boolean = false;
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
    private estadoCivilService: EstadoCivilService,
    private tipoHabitacionService: TipoHabitacionService,
    private estadoHabitacionService: EstadoHabitacionService,
    private appService: AppService,

    private cdr: ChangeDetectorRef
  ) {
    if (this.appService.isFreelancer()) {
      this.router.navigate(['/reserva_externa']);
      return;
    }

    this.cargarDatos();

    effect(() => { //Para actualizar el color de estado de habitacion LIMPIEZA
      const habitacionId = this.updateGroupsSignal();
      if (habitacionId) {
        this.ejecutarUpdateGroups(habitacionId);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.appService.isFreelancer()) return;
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
      estado_civil: this.estadoCivilService.listar(),
      tipo_habitaciones: this.tipoHabitacionService.listar(),
      estado_habitaciones: this.estadoHabitacionService.listar()
    }).subscribe({
      next: (res) => {
        this.tipo_habitaciones = res.tipo_habitaciones;
        this.estado_habitaciones = res.estado_habitaciones || [];
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

  get tipoCamping(): TipoHabitacionModel | undefined {
    return this.tipo_habitaciones.find(th =>
      th.codigo?.toUpperCase() === 'CAMP' ||
      th.descripcion?.trim().toUpperCase() === 'CAMPING'
    );
  }

  get tipoFullDay(): TipoHabitacionModel | undefined {
    return this.tipo_habitaciones.find(th =>
      th.codigo?.toUpperCase() === 'FULL' ||
      th.descripcion?.trim().toUpperCase() === 'FULL DAY'
    );
  }

  get labelCamping(): string {
    return this.tipoCamping?.descripcion || 'Camping';
  }

  get labelFullDay(): string {
    return this.tipoFullDay?.descripcion || 'Full Day';
  }

  isCamping(habitacion: HabitacionModel): boolean {
    if (!habitacion) return false;
    if (this.tipoCamping && Number(habitacion.tipo_habitacion_id) === Number(this.tipoCamping.id)) {
      return true;
    }
    const tipo = (habitacion.tipo_habitacion || '').trim().toUpperCase();
    return tipo === 'CAMPING' || (this.tipoCamping && tipo === this.tipoCamping.descripcion?.trim().toUpperCase());
  }

  isFullDay(habitacion: HabitacionModel): boolean {
    if (!habitacion) return false;
    if (this.tipoFullDay && Number(habitacion.tipo_habitacion_id) === Number(this.tipoFullDay.id)) {
      return true;
    }
    const tipo = (habitacion.tipo_habitacion || '').trim().toUpperCase();
    return tipo === 'FULL DAY' || (this.tipoFullDay && tipo === this.tipoFullDay.descripcion?.trim().toUpperCase());
  }

  isHabitacion(habitacion: HabitacionModel): boolean {
    return !this.isFullDay(habitacion) && !this.isCamping(habitacion);
  }

  isFullDayOrCamping(habitacion: HabitacionModel): boolean {
    return this.isFullDay(habitacion) || this.isCamping(habitacion);
  }

  private sortPorNumeroHabitacion(lista: HabitacionModel[]): HabitacionModel[] {
    return [...lista].sort((a, b) => {
      const nroA = parseInt(a.nro_habitacion || '', 10);
      const nroB = parseInt(b.nro_habitacion || '', 10);
      const aEsNum = !isNaN(nroA) && nroA > 0;
      const bEsNum = !isNaN(nroB) && nroB > 0;
      if (aEsNum && bEsNum && nroA !== nroB) return nroA - nroB;
      if (aEsNum && !bEsNum) return -1;
      if (!aEsNum && bEsNum) return 1;
      return (a.nro_habitacion || '').localeCompare(b.nro_habitacion || '', undefined, { numeric: true });
    });
  }

  getHabitacionesFiltradas(): HabitacionModel[] {
    if (this.tabActiva === 'fullday') {
      return this.sortPorNumeroHabitacion(this.habitaciones.filter((h) => this.isFullDay(h)));
    } else if (this.tabActiva === 'camping') {
      return this.sortPorNumeroHabitacion(this.habitaciones.filter((h) => this.isCamping(h)));
    } else if (this.tabActiva === 'habitaciones') {
      return this.sortPorNumeroHabitacion(this.habitaciones.filter((h) => this.isHabitacion(h)));
    } else {
      const habitaciones = this.sortPorNumeroHabitacion(this.habitaciones.filter((h) => this.isHabitacion(h)));
      const fullDay = this.sortPorNumeroHabitacion(this.habitaciones.filter((h) => this.isFullDay(h)));
      const camping = this.sortPorNumeroHabitacion(this.habitaciones.filter((h) => this.isCamping(h)));
      return [...habitaciones, ...fullDay, ...camping];
    }
  }

  get countHabitaciones(): number {
    return this.habitaciones.filter((h) => this.isHabitacion(h)).length;
  }

  get countFullDay(): number {
    return this.habitaciones.filter((h) => this.isFullDay(h)).length;
  }

  get countCamping(): number {
    return this.habitaciones.filter((h) => this.isCamping(h)).length;
  }

  get countFullDayCamping(): number {
    return this.habitaciones.filter((h) => this.isFullDayOrCamping(h)).length;
  }

  get countTodas(): number {
    return this.habitaciones.length;
  }

  cambiarTab(nuevaTab: 'habitaciones' | 'fullday' | 'camping' | 'todas') {
    this.cerrarMenuEstadoHabitacion();
    if (this.tabActiva === nuevaTab) return;
    this.tabActiva = nuevaTab;
    this.loadGroups();
    if (this.timeLine) {
      this.items.remove('hover-item');
      this.selectedItems = [];
      this.timeLine.redraw();
    }
  }

  loadGroups() {
    const habitacionesFiltradas = this.getHabitacionesFiltradas();
    const dataGroups = habitacionesFiltradas.map((habitacion, index) => {
      const iconoSeparador = '⏵'; //'⟶'; // Puedes usar otros como '•', '→', '⇨', '⮞', '⏵'
      const colorGrupo = this.getColorGrupo(habitacion);
      return {
        id: habitacion.id,
        order: index,
        content: `${habitacion.nro_habitacion} ${iconoSeparador} ${habitacion.descripcion}`,
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

    if (this.groups) {
      this.groups.clear();
      this.groups.add(dataGroups);
      if (this.timeLine) {
        this.timeLine.setGroups(this.groups);
      }
    } else {
      this.groups = new DataSet(dataGroups);
    }
  }

  readonly COLOR_HABITACION_CELESTE = '#8ecae6';
  readonly COLOR_FULLDAY_NARANJA = '#ffa726';
  readonly COLOR_CAMPING_VERDE_CLARO = '#86efac';

  getColorGrupo(habitacion: HabitacionModel): string {
    if (this.isFullDay(habitacion)) {
      return this.COLOR_FULLDAY_NARANJA;
    }
    if (this.isCamping(habitacion)) {
      return this.COLOR_CAMPING_VERDE_CLARO;
    }
    // Para Habitaciones: si tiene un estado distinto a Disponible (1), usar el color del estado; de lo contrario, celeste
    if (Number(habitacion.estado_habitacion_id) !== 1) {
      if (habitacion.color_estado && habitacion.color_estado.trim() !== '' && habitacion.color_estado.toLowerCase() !== '#ffffff') {
        return habitacion.color_estado;
      }
      const est = this.estado_habitaciones.find(e => Number(e.id) === Number(habitacion.estado_habitacion_id));
      if (est) {
        return this.getColorEstadoMenuDot(est);
      }
      if (habitacion.color && habitacion.color.trim() !== '' && habitacion.color.toLowerCase() !== '#ffffff') {
        return habitacion.color;
      }
    }
    return this.COLOR_HABITACION_CELESTE;
  }

  ejecutarUpdateGroups(habitacion_id) {
    const hab = this.habitaciones.find(h => Number(h.id) === Number(habitacion_id));
    if (hab && this.isFullDayOrCamping(hab)) {
      return; // Full Day y Camping no tienen estado de habitación
    }
    if (hab) {
      hab.estado_habitacion_id = '2';
      const estLimpieza = this.estado_habitaciones.find(e => Number(e.id) === 2);
      if (estLimpieza) {
        hab.estado_habitacion = estLimpieza.descripcion;
        hab.color_estado = estLimpieza.color || '#FF0000';
      }
      hab.color = hab.color_estado || '#FF0000';
    }
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
    // Precalcular mapa de grupos para identificar reservas grupales y sus habitaciones
    const grupoMap = new Map<string, ReservaModel[]>();
    (this.reservas || []).forEach((r) => {
      const key = this.getGrupoKey(r);
      if (key) {
        const list = grupoMap.get(key) || [];
        list.push(r);
        grupoMap.set(key, list);
      }
    });

    const dataItems = this.reservas.map((reserva) => {
      const isNaranja = reserva.is_externo == 1 && reserva.estado_reserva_id == 1;

      const start = moment(reserva.fecha_ini);
      const end = moment(reserva.fecha_fin);

      const key = this.getGrupoKey(reserva);
      const miembros = key ? (grupoMap.get(key) || [reserva]) : [reserva];
      const esGrupal = !!reserva.grupo_id || miembros.length > 1;
      const habLabels = esGrupal
        ? miembros
            .map(m => {
              const h = this.habitaciones.find(hab => Number(hab.id) === Number(m.habitacion_id));
              return h ? (this.isHabitacion(h) ? h.nro_habitacion : h.descripcion) : (m.nro_habitacion || '');
            })
            .filter(Boolean)
        : [];

      const baseColor = isNaranja ? 'orange' : (reserva.color || '');
      const groupCls = esGrupal ? ' is-group-reservation' : '';

      return {
        id: reserva.id,
        correlativo: reserva.correlativo,
        start: start,
        end: end,
        group: reserva.habitacion_id,
        className: (baseColor + groupCls).trim(),
        style: isNaranja ? `background-color: ${hexNaranja} !important; color: ${this.getContrastColor(hexNaranja)} !important;` : '',
        cliente: reserva.cliente,
        tiene_mensaje: reserva.tiene_mensaje,
        saldo: reserva.saldo,
        grupo_id: reserva.grupo_id,
        grupo_nombre: reserva.grupo_nombre,
        es_grupal: esGrupal,
        grupo_count: miembros.length,
        grupo_habs_short: habLabels.slice(0, 4).join(', ') + (habLabels.length > 4 ? ` +${habLabels.length - 4}` : ''),
      };
    });

    if (this.items) {
      this.items.clear();
      this.items.add(dataItems);
      if (this.timeLine) {
        this.timeLine.setItems(this.items);
      }
    } else {
      this.items = new DataSet(dataItems);
    }
  }

  loadOptions() {
    const inicio = moment().startOf('day');
    const rangoFin = moment(inicio).clone().add(10, 'days');
    this.options = {
      groupOrder: 'order',
      multiselect: true,
      selectable: true,
      editable: {
        updateTime: true,// mover los items en una misma linea
        updateGroup: false,// Opcional: impide cambiar de grupo , como cambiar de linea
        remove: false,
        add: true
      },
      margin: {
        axis: 5,
        item: {
          horizontal: 0,
          vertical: 5,
        },
      },
      stack: true, //ESTO EVITA EL SALTO DE LÍNEA VERTICAL
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
        this.cerrarGrupoPreviewInmediato();
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
        this.cerrarGrupoPreviewInmediato();
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
        this.cerrarMenuEstadoHabitacion();
        this.contextMenu.show(event, itemId);
        return;
      }

      const targetEl = event?.target as HTMLElement | null;
      const esPanelHabitacion = props.what === 'group-label' || !!targetEl?.closest('.vis-panel.vis-left, .vis-label');
      if (props.group && esPanelHabitacion) {
        const hab = this.habitaciones.find(h => Number(h.id) === Number(props.group));
        // Solo para Habitaciones (no Full Day ni Camping)
        if (hab && this.isHabitacion(hab)) {
          event.preventDefault();
          event.stopPropagation();
          this.mostrarMenuEstadoHabitacion(event, hab);
          return;
        }
      }

      this.cerrarMenuEstadoHabitacion();
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

    // 2. Al salir del área de grupos/filas o pasar sobre una reserva grupal
    this.timeLine.on('mouseOver', (props) => {
      if (!props.group) this.items.remove(HOVER_ID);
    });

    this.timeLine.on('itemover', (props: any) => {
      if (props && props.item && props.item !== HOVER_ID) {
        this.programarMostrarGrupoPreview(Number(props.item), props.event as MouseEvent);
      }
    });

    this.timeLine.on('itemout', () => {
      this.ocultarGrupoPreviewConRetraso();
    });

    // 3. SOLUCIÓN: Al salir totalmente del contenedor del Timeline
    this.timeLine.on('mouseOut', () => {
      this.items.remove(HOVER_ID);
      this.ocultarGrupoPreviewConRetraso();
    });

    // 4. SOLUCIÓN: Al desplazar o mover el calendario (Scroll/Drag)
    this.timeLine.on('rangechange', () => {
      this.items.remove(HOVER_ID);
      this.cerrarGrupoPreviewInmediato();
      if (this.menuEstadoVisible) {
        this.cerrarMenuEstadoHabitacion();
      }
    });
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.menuEstadoVisible) {
      this.cerrarMenuEstadoHabitacion();
    }
    this.cerrarGrupoPreviewInmediato();
    this.mostrarResultadosBusqueda = false;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.menuEstadoVisible) {
      this.cerrarMenuEstadoHabitacion();
    }
    this.cerrarGrupoPreviewInmediato();
    this.mostrarResultadosBusqueda = false;
  }

  mostrarMenuEstadoHabitacion(event: MouseEvent, habitacion: HabitacionModel) {
    if (!this.isHabitacion(habitacion)) return;

    this.habitacionMenuSeleccionada = habitacion;
    const menuWidth = 240;
    const menuHeight = 250;

    let left = event.clientX + 4;
    let top = event.clientY - 10;

    if (left + menuWidth > window.innerWidth) {
      left = Math.max(10, window.innerWidth - menuWidth - 10);
    }
    if (top + menuHeight > window.innerHeight) {
      top = Math.max(10, window.innerHeight - menuHeight - 10);
    }
    if (top < 10) {
      top = 10;
    }

    this.menuEstadoLeft = `${left}px`;
    this.menuEstadoTop = `${top}px`;
    this.menuEstadoVisible = true;
    this.cdr.detectChanges();
  }

  cerrarMenuEstadoHabitacion() {
    if (!this.menuEstadoVisible && !this.habitacionMenuSeleccionada) return;
    this.menuEstadoVisible = false;
    this.habitacionMenuSeleccionada = null;
    this.cdr.detectChanges();
  }

  isEstadoActualHabitacion(estado: EstadoHabitacionModel): boolean {
    if (!this.habitacionMenuSeleccionada || !estado) return false;
    return Number(this.habitacionMenuSeleccionada.estado_habitacion_id) === Number(estado.id);
  }

  getColorEstadoMenuDot(estado: EstadoHabitacionModel): string {
    if (!estado) return '#cbd5e1';
    const id = Number(estado.id);
    const desc = (estado.descripcion || '').trim().toLowerCase();
    const color = (estado.color || '').trim();

    if (id === 1 || desc.includes('disponible')) {
      if (!color || color.toLowerCase() === '#ffffff' || color.toLowerCase() === 'white') {
        return '#cbd5e1';
      }
      return color;
    }

    if (color && color.toLowerCase() !== '#ffffff' && color.toLowerCase() !== 'white') {
      return color;
    }

    if (desc.includes('superficial')) return '#ffff00';
    if (desc.includes('limpieza')) return '#ff0000';
    if (desc.includes('mantenimiento')) return '#ff00ff';

    switch (id) {
      case 2: return '#ff0000';
      case 3: return '#ffff00';
      case 4: return '#ff00ff';
      default: return '#94a3b8';
    }
  }

  private actualizarEstiloGrupoHabitacion(habitacion: HabitacionModel) {
    if (!this.groups || !habitacion) return;
    const grupoActual = this.groups.get(habitacion.id);
    if (grupoActual) {
      const colorGrupo = this.getColorGrupo(habitacion);
      grupoActual.style = `
          background-color: ${colorGrupo};
          color: ${this.getContrastColor(colorGrupo)};
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

  cambiarEstadoHabitacionRapido(estado: EstadoHabitacionModel) {
    if (!this.habitacionMenuSeleccionada || !estado || this.cambiandoEstadoHabitacion) return;
    const hab = this.habitacionMenuSeleccionada;
    if (!this.isHabitacion(hab)) {
      this.cerrarMenuEstadoHabitacion();
      return;
    }

    if (Number(hab.estado_habitacion_id) === Number(estado.id)) {
      this.cerrarMenuEstadoHabitacion();
      return;
    }

    const estadoAnteriorId = hab.estado_habitacion_id;
    const estadoAnteriorDesc = hab.estado_habitacion;
    const colorAnterior = hab.color;
    const colorEstadoAnterior = hab.color_estado;

    // Actualización optimista inmediata en el Timeline
    hab.estado_habitacion_id = String(estado.id);
    hab.estado_habitacion = estado.descripcion;
    hab.color_estado = estado.color;

    if (Number(estado.id) === 1) {
      hab.color = this.COLOR_HABITACION_CELESTE;
    } else {
      hab.color = (estado.color && estado.color.trim() !== '' && estado.color.toLowerCase() !== '#ffffff')
        ? estado.color
        : this.getColorEstadoMenuDot(estado);
    }

    this.actualizarEstiloGrupoHabitacion(hab);
    this.cerrarMenuEstadoHabitacion();
    this.cambiandoEstadoHabitacion = true;

    const payload: HabitacionModel = { ...hab, estado_habitacion_id: String(estado.id) };
    this.habitacionService.modificar(payload).subscribe({
      next: () => {
        this.cambiandoEstadoHabitacion = false;

        this.habitacionService.listar().subscribe({
          next: (lista) => {
            if (Array.isArray(lista)) {
              this.habitaciones = lista;
              const habRefrescada = this.habitaciones.find(h => Number(h.id) === Number(hab.id));
              if (habRefrescada) {
                this.actualizarEstiloGrupoHabitacion(habRefrescada);
              }
            }
          }
        });
      },
      error: () => {
        this.cambiandoEstadoHabitacion = false;
        hab.estado_habitacion_id = estadoAnteriorId;
        hab.estado_habitacion = estadoAnteriorDesc;
        hab.color = colorAnterior;
        hab.color_estado = colorEstadoAnterior;
        this.actualizarEstiloGrupoHabitacion(hab);
      }
    });
  }

  centrarTimelineEnHoy() {
    const fechaActual = new Date(); // fecha actual
    this.timeLine.moveTo(fechaActual); // timeline es la instancia de vis.Timeline
  }

  readonly dialog = inject(MatDialog);
  mostrarFormularioNuevo(fecha_ini, fecha_fin, habitacion_id) {
    const habSeleccionada = this.habitaciones.find(h => Number(h.id) === Number(habitacion_id));
    const esFD = habSeleccionada ? this.isFullDay(habSeleccionada) : (this.tabActiva === 'fullday');

    this.reserva = new ReservaModel();
    this.reserva.fecha_ini = fecha_ini;
    this.reserva.fecha_fin = esFD ? fecha_ini : fecha_fin;
    this.reserva.habitacion_id = habitacion_id;
    this.reserva.cantidad_adulto = 1;
    this.reserva.precio_unit_adulto = 0;
    this.reserva.cantidad_ninio = 0;
    this.reserva.precio_unit_ninio = 0;
    this.reserva.canal_reserva_id = (this.canal_reservas && this.canal_reservas.length > 0) ? this.canal_reservas[0].id : 1;
    this.reserva.total = 0;

    const dialogRef = this.dialog.open(ReservaFormComponent, {
      data: {
        reserva: this.reserva,
        reservas: this.reservas,
        habitaciones: this.getHabitacionesFiltradas(),
        tipo_documentos: this.tipo_documentos,
        estado_civil: this.estado_civil,
        paises: this.paises,
        forma_pagos: this.forma_pagos,
        canal_reservas: this.canal_reservas,
        tipo_huespedes: this.tipo_huespedes,
        motivos: this.motivos,
        productos: this.productos,
        tipo_habitaciones: this.tipo_habitaciones,
        items: this.items,
        updateGroupsSignal: this.updateGroupsSignal
      },
      width: "98vw",
      maxWidth: "600px",
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) { return; }
      let executeActionReserva = this.comunicacionService.executeActionReserva();
      if (executeActionReserva) {
        this.reservaService.listar().subscribe({
          next: (res) => {
            if (res && res.dato) {
              this.reservas = JSON.parse(res.dato) as ReservaModel[];
              this.loadItems();
            }
          }
        });
      }
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
            balance: res.response.balance,
            reservas: this.reservas,
            habitaciones: this.habitaciones,
            tipo_documentos: this.tipo_documentos,
            estado_civil: this.estado_civil,
            paises: this.paises,
            forma_pagos: this.forma_pagos,
            canal_reservas: this.canal_reservas,
            tipo_huespedes: this.tipo_huespedes,
            motivos: this.motivos,
            productos: this.productos,
            tipo_habitaciones: this.tipo_habitaciones,
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
          } else {
            this.reservaService.listar().subscribe({
              next: (res) => {
                if (res && res.dato) {
                  this.reservas = JSON.parse(res.dato) as ReservaModel[];
                  this.loadItems();
                }
              }
            });
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

  readonly router = inject(Router);
  irAlimentos() {
    this.router.navigate(['/reporte_alimentos']);
  }

  onBuscarReserva() {
    const term = this.terminoBusqueda.trim().toLowerCase();
    if (!term) {
      this.resultadosBusqueda = [];
      this.mostrarResultadosBusqueda = false;
      return;
    }

    const termSinNumeral = term.replace(/^#/, '');
    const filtradas = (this.reservas || []).filter((r) => {
      const correlativo = String(r.correlativo || '').toLowerCase();
      const idStr = String(r.id || '').toLowerCase();
      const cliente = (r.cliente || '').toLowerCase();
      const nombreCorto = (r.nombre_corto_cliente || '').toLowerCase();
      const nombreCompleto = `${r.nombre || ''} ${r.primer_apellido || ''} ${r.segundo_apellido || ''}`.toLowerCase();

      return (
        (termSinNumeral && (correlativo.includes(termSinNumeral) || idStr === termSinNumeral)) ||
        cliente.includes(term) ||
        nombreCorto.includes(term) ||
        nombreCompleto.includes(term)
      );
    });

    filtradas.sort((a, b) => {
      const exactA = String(a.correlativo || '').toLowerCase() === termSinNumeral ? 1 : 0;
      const exactB = String(b.correlativo || '').toLowerCase() === termSinNumeral ? 1 : 0;
      if (exactA !== exactB) return exactB - exactA;
      return moment(b.fecha_ini).valueOf() - moment(a.fecha_ini).valueOf();
    });

    this.resultadosBusqueda = filtradas.slice(0, 15);
    this.mostrarResultadosBusqueda = true;
  }

  onFocusBusqueda() {
    if (this.terminoBusqueda.trim()) {
      this.onBuscarReserva();
    }
  }

  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.resultadosBusqueda = [];
    this.mostrarResultadosBusqueda = false;
  }

  seleccionarPrimerResultado() {
    if (this.resultadosBusqueda.length > 0) {
      this.irAReservaEnTimeline(this.resultadosBusqueda[0]);
    }
  }

  irAReservaEnTimeline(reserva: ReservaModel) {
    if (!reserva || !this.timeLine) return;

    this.mostrarResultadosBusqueda = false;

    const hab = this.habitaciones.find(h => Number(h.id) === Number(reserva.habitacion_id));
    let cambioTab = false;
    if (hab && this.tabActiva !== 'todas') {
      const tabDestino: 'habitaciones' | 'fullday' | 'camping' =
        this.isFullDay(hab) ? 'fullday' : (this.isCamping(hab) ? 'camping' : 'habitaciones');
      if (this.tabActiva !== tabDestino) {
        this.cambiarTab(tabDestino);
        cambioTab = true;
      }
    }

    const enfocarReserva = () => {
      this.selectedItems = [reserva.id];
      this.timeLine.setSelection([reserva.id]);
      this.timeLine.focus(reserva.id, { animation: true, zoom: false });
    };

    if (cambioTab) {
      setTimeout(enfocarReserva, 80);
    } else {
      enfocarReserva();
    }
  }

  getNombreHabitacionBusqueda(reserva: ReservaModel): string {
    if (this.isReservaGrupal(reserva)) {
      const miembros = this.getHabitacionesGrupo(reserva);
      const etiquetas = miembros.map(m => {
        const h = this.habitaciones.find(hab => Number(hab.id) === Number(m.habitacion_id));
        return h ? (this.isHabitacion(h) ? h.nro_habitacion : h.descripcion) : (m.nro_habitacion || '');
      }).filter(Boolean);
      if (etiquetas.length > 0) {
        return `Hab. ${etiquetas.join(', ')}`;
      }
    }
    const hab = this.habitaciones.find(h => Number(h.id) === Number(reserva.habitacion_id));
    if (hab) {
      return `${hab.nro_habitacion} - ${hab.descripcion}`;
    }
    return reserva.nro_habitacion ? `Hab. ${reserva.nro_habitacion}` : '';
  }

  formatearFechaCorta(fecha: string): string {
    if (!fecha) return '';
    return moment(fecha).format('DD/MM/YYYY');
  }

  // =========================================================
  // VISTA RÁPIDA DE HABITACIONES EN RESERVA GRUPAL (SIN ABRIR FORM)
  // =========================================================
  private getGrupoKey(reserva: ReservaModel): string | null {
    if (!reserva) return null;
    if (reserva.grupo_id && Number(reserva.grupo_id) > 0) {
      return `grp_${reserva.grupo_id}`;
    }
    if (reserva.correlativo && Number(reserva.correlativo) > 0) {
      return `corr_${reserva.correlativo}`;
    }
    return null;
  }

  getHabitacionesGrupo(reserva: ReservaModel): ReservaModel[] {
    if (!reserva || !this.reservas) return reserva ? [reserva] : [];
    const key = this.getGrupoKey(reserva);
    if (!key) return [reserva];

    const miembros = this.reservas.filter(r => this.getGrupoKey(r) === key);
    if (miembros.length <= 1) return [reserva];

    return [...miembros].sort((a, b) => {
      const habA = this.habitaciones.find(h => Number(h.id) === Number(a.habitacion_id));
      const habB = this.habitaciones.find(h => Number(h.id) === Number(b.habitacion_id));
      const nroA = parseInt(habA?.nro_habitacion || a.nro_habitacion || '', 10);
      const nroB = parseInt(habB?.nro_habitacion || b.nro_habitacion || '', 10);
      if (!isNaN(nroA) && !isNaN(nroB) && nroA !== nroB) return nroA - nroB;
      return (habA?.nro_habitacion || '').localeCompare(habB?.nro_habitacion || '', undefined, { numeric: true });
    });
  }

  isReservaGrupal(reserva: ReservaModel): boolean {
    if (!reserva) return false;
    const miembros = this.getHabitacionesGrupo(reserva);
    return !!reserva.grupo_id || miembros.length > 1;
  }

  programarMostrarGrupoPreview(itemId: number, event?: MouseEvent) {
    if (this.menuEstadoVisible) return;
    if (this.grupoPreviewHideTimer) {
      clearTimeout(this.grupoPreviewHideTimer);
      this.grupoPreviewHideTimer = null;
    }

    const reserva = (this.reservas || []).find(r => Number(r.id) === Number(itemId));
    if (!reserva || !this.isReservaGrupal(reserva)) {
      if (this.grupoPreviewVisible) {
        this.ocultarGrupoPreviewConRetraso();
      }
      return;
    }

    // Si ya está mostrando el mismo item, solo mantenerlo activo
    if (this.grupoPreviewVisible && this.currentHoveredItemId === itemId) {
      return;
    }

    if (this.grupoPreviewShowTimer) {
      clearTimeout(this.grupoPreviewShowTimer);
    }

    const targetEl = (event?.target as HTMLElement | null)?.closest('.vis-item') as HTMLElement | null;
    const fallbackRect = targetEl ? targetEl.getBoundingClientRect() : null;
    const mouseX = event?.clientX || 0;
    const mouseY = event?.clientY || 0;

    // Pequeño retardo (220ms) para que no sea intrusivo al mover rápido el cursor
    this.grupoPreviewShowTimer = setTimeout(() => {
      this.mostrarGrupoPreview(reserva, fallbackRect, mouseX, mouseY);
    }, 220);
  }

  private mostrarGrupoPreview(
    reserva: ReservaModel,
    anchorRect: DOMRect | null,
    mouseX: number,
    mouseY: number
  ) {
    const miembros = this.getHabitacionesGrupo(reserva);
    if (!reserva.grupo_id && miembros.length <= 1) return;

    const habsDetalle = miembros.map(m => {
      const hab = this.habitaciones.find(h => Number(h.id) === Number(m.habitacion_id));
      const esArea = hab ? this.isFullDayOrCamping(hab) : false;
      const nro = hab?.nro_habitacion || m.nro_habitacion || '';
      const desc = hab?.descripcion || m.tipo_habitacion || 'Habitación';
      return {
        reserva_id: Number(m.id),
        habitacion_id: Number(m.habitacion_id),
        badge: (!esArea && nro) ? nro : (nro || desc.substring(0, 6)),
        titulo: (!esArea && nro) ? `Hab. ${nro}` : desc,
        subtitulo: desc,
        piso: (!esArea && hab?.piso) ? String(hab.piso) : ''
      };
    });

    const firstHab = this.habitaciones.find(h => Number(h.id) === Number(reserva.habitacion_id));
    const esCamping = firstHab ? this.isCamping(firstHab) : false;
    const esFD = firstHab ? this.isFullDay(firstHab) : false;

    const titularNombre = [reserva.nombre, reserva.primer_apellido, reserva.segundo_apellido]
      .filter(Boolean)
      .join(' ')
      .trim() || reserva.cliente;

    const fIni = moment(reserva.fecha_ini).format('DD/MM');
    const fFin = moment(reserva.fecha_fin).format('DD/MM/YYYY');

    this.currentHoveredItemId = Number(reserva.id);
    this.grupoPreviewData = {
      grupo_id: reserva.grupo_id || null,
      correlativo: reserva.correlativo || reserva.id,
      grupo_nombre: reserva.grupo_nombre || reserva.cliente || 'Reserva Grupal',
      titular: titularNombre,
      fechas: `${fIni} al ${fFin}`,
      currentHabitacionId: Number(reserva.habitacion_id),
      labelPlural: esCamping ? 'campings' : (esFD ? 'áreas' : (habsDetalle.length === 1 ? 'habitación' : 'habitaciones')),
      labelSeccion: esCamping ? 'CAMPINGS DEL GRUPO' : (esFD ? 'ÁREAS DEL GRUPO' : 'HABITACIONES DEL GRUPO'),
      reservaIds: miembros.map(m => Number(m.id)),
      habitaciones: habsDetalle
    };

    this.aplicarResaltadoGrupoEnTimeline(this.grupoPreviewData.reservaIds, true);

    const cardWidth = 310;
    const cardHeight = Math.min(280, 110 + Math.ceil(habsDetalle.length / 2) * 44);

    let left = anchorRect ? (anchorRect.left + anchorRect.width / 2 - cardWidth / 2) : (mouseX - cardWidth / 2);
    let top = anchorRect ? (anchorRect.bottom + 8) : (mouseY + 14);

    if (left + cardWidth > window.innerWidth - 12) {
      left = window.innerWidth - cardWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    if (top + cardHeight > window.innerHeight - 12 && anchorRect) {
      top = Math.max(12, anchorRect.top - cardHeight - 8);
    }

    this.grupoPreviewLeft = `${Math.round(left)}px`;
    this.grupoPreviewTop = `${Math.round(top)}px`;
    this.grupoPreviewVisible = true;
    this.cdr.detectChanges();
  }

  mantenerGrupoPreview() {
    if (this.grupoPreviewHideTimer) {
      clearTimeout(this.grupoPreviewHideTimer);
      this.grupoPreviewHideTimer = null;
    }
  }

  ocultarGrupoPreviewConRetraso() {
    if (this.grupoPreviewShowTimer) {
      clearTimeout(this.grupoPreviewShowTimer);
      this.grupoPreviewShowTimer = null;
    }
    if (this.grupoPreviewHideTimer) {
      clearTimeout(this.grupoPreviewHideTimer);
    }
    this.grupoPreviewHideTimer = setTimeout(() => {
      this.cerrarGrupoPreviewInmediato();
    }, 180);
  }

  cerrarGrupoPreviewInmediato() {
    if (this.grupoPreviewShowTimer) {
      clearTimeout(this.grupoPreviewShowTimer);
      this.grupoPreviewShowTimer = null;
    }
    if (this.grupoPreviewHideTimer) {
      clearTimeout(this.grupoPreviewHideTimer);
      this.grupoPreviewHideTimer = null;
    }
    if (this.grupoPreviewData?.reservaIds) {
      this.aplicarResaltadoGrupoEnTimeline(this.grupoPreviewData.reservaIds, false);
    }
    if (!this.grupoPreviewVisible && !this.grupoPreviewData) return;
    this.grupoPreviewVisible = false;
    this.grupoPreviewData = null;
    this.currentHoveredItemId = null;
    this.cdr.detectChanges();
  }

  private aplicarResaltadoGrupoEnTimeline(reservaIds: number[], activo: boolean) {
    if (!this.items || !reservaIds || reservaIds.length === 0) return;
    const updates: any[] = [];
    reservaIds.forEach(id => {
      const it = this.items.get(id);
      if (it) {
        const clsActual = (it.className || '').replace(/\bgroup-peer-highlight\b/g, '').trim();
        const nuevoCls = activo ? `${clsActual} group-peer-highlight`.trim() : clsActual;
        if (it.className !== nuevoCls) {
          updates.push({ id: it.id, className: nuevoCls });
        }
      }
    });
    if (updates.length > 0) {
      this.items.update(updates);
    }
  }

  enfocarHabitacionGrupo(habItem: { reserva_id: number; habitacion_id: number }) {
    const reservaDestino = (this.reservas || []).find(r => Number(r.id) === Number(habItem.reserva_id));
    this.cerrarGrupoPreviewInmediato();
    if (reservaDestino) {
      this.irAReservaEnTimeline(reservaDestino);
    }
  }

}
