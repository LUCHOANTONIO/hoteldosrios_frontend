import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import moment from 'moment';

import { CotizacionModel } from '../../../models/cotizacion.model';
import { CotizacionDetalleModel } from '../../../models/cotizacion_detalle.model';
import { TipoDocumentoModel } from '../../../../base/models/tipodocumento.model';
import { HabitacionModel } from '../../../models/habitacion.model';
import { PaisModel } from '../../../models/pais.model';
import { CotizacionService } from '../../../services/cotizacion.service';
import { PersonaService } from '../../../../base/services/persona.service';
import { DocumentoService } from '../../../services/documento.service';
import { AlertService } from '../../../../base/services/local/alert.service';
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';

@Component({
  selector: 'app-reserva-externa-cotizacion-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTabsModule,
    DragDropModule
  ],
  templateUrl: './reserva_externa-cotizacion-modal.html',
  styleUrls: ['./reserva_externa-cotizacion-modal.scss']
})
export class ReservaExternaCotizacionModalComponent implements OnInit {
  guardando: boolean = false;
  buscandoPersona: boolean = false;

  habitacionSeleccionada: any = null;
  habitacionesDisponibles: any[] = [];
  tipoDocumentos: TipoDocumentoModel[] = [];
  paises: PaisModel[] = [];

  form: {
    habitacion_id: number | null;
    dni: string;
    tipo_doc_id: number;
    nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    telefono: string;
    correo: string;
    pais_id: number;
    fecha_ini: Date;
    fecha_fin: Date;
    cantidad_adulto: number;
    cantidad_ninio: number;
    detalle: string;
  } = {
    habitacion_id: null,
    dni: '',
    tipo_doc_id: 1,
    nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    telefono: '',
    correo: '',
    pais_id: 1,
    fecha_ini: new Date(),
    fecha_fin: new Date(),
    cantidad_adulto: 1,
    cantidad_ninio: 0,
    detalle: ''
  };

  noches: number = 1;

  constructor(
    public dialogRef: MatDialogRef<ReservaExternaCotizacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private cotizacionService: CotizacionService,
    private personaService: PersonaService,
    private documentoService: DocumentoService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {
    this.habitacionSeleccionada = data.habitacionSeleccionada || null;
    this.habitacionesDisponibles = data.habitacionesDisponibles || [];
    this.tipoDocumentos = data.tipoDocumentos || [];
    this.paises = data.paises || [];

    if (data.fecha_ini) {
      this.form.fecha_ini = moment(data.fecha_ini).toDate();
    }
    if (data.fecha_fin) {
      this.form.fecha_fin = moment(data.fecha_fin).toDate();
    }
    if (this.tipoDocumentos.length > 0) {
      this.form.tipo_doc_id = this.tipoDocumentos[0].id || 1;
    }
    if (this.paises.length > 0) {
      const b = this.paises.find(p => p.descripcion?.toLowerCase().includes('bolivia'));
      this.form.pais_id = b ? b.id : this.paises[0].id;
    }

    if (this.habitacionSeleccionada) {
      this.form.habitacion_id = (this.habitacionSeleccionada as any).categoria_id || this.habitacionSeleccionada.id;
    }

    const tipoUpper = (this.habitacionSeleccionada?.tipo_habitacion || '').toUpperCase();
    if (tipoUpper.includes('TRIPLE')) {
      this.form.cantidad_adulto = 3;
    } else if (tipoUpper.includes('SIMPLE') || tipoUpper.includes('INDIVIDUAL')) {
      this.form.cantidad_adulto = 1;
    } else {
      this.form.cantidad_adulto = 2;
    }
  }

  ngOnInit(): void {
    this.calcularNoches();
  }

  calcularNoches(): void {
    if (this.form.fecha_ini && this.form.fecha_fin) {
      const fIni = moment(this.form.fecha_ini).startOf('day');
      const fFin = moment(this.form.fecha_fin).startOf('day');
      const diff = fFin.diff(fIni, 'days');
      this.noches = diff > 0 ? diff : 1;
    }
  }

  onFechaChange(): void {
    this.calcularNoches();
  }

  buscarPersonaPorDni(): void {
    const doc = (this.form.dni || '').trim();
    if (!doc) return;

    this.buscandoPersona = true;
    this.personaService.personaPorNroDocumento(doc).subscribe({
      next: (res: any) => {
        this.buscandoPersona = false;
        if (res && typeof res === 'object' && Object.keys(res).length > 0) {
          this.form.tipo_doc_id = res.tipo_doc_id ? Number(res.tipo_doc_id) : this.form.tipo_doc_id;
          this.form.nombre = res.nombre || '';
          this.form.primer_apellido = res.primer_apellido || '';
          this.form.segundo_apellido = res.segundo_apellido || '';
          this.form.telefono = res.telefono || '';
          this.form.correo = res.correo || '';
          this.alertService.show(`Cliente encontrado: ${res.nombre || ''} ${res.primer_apellido || ''}`, { duration: 3000, type: 'success' });
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.buscandoPersona = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarCotizacion(form: NgForm): void {
    if (form.invalid) {
      this.alertService.show("Por favor complete los campos obligatorios", { duration: 4000, type: 'warning' });
      return;
    }

    const fIni = moment(this.form.fecha_ini).startOf('day');
    const fFin = moment(this.form.fecha_fin).startOf('day');
    if (!fIni.isValid() || !fFin.isValid() || fIni.isSameOrAfter(fFin)) {
      this.alertService.show("La Fecha de Salida debe ser posterior a la Fecha de Llegada", { duration: 4000, type: 'warning' });
      return;
    }

    this.guardando = true;

    // Habitación/Categoría seleccionada
    const habObj = this.habitacionesDisponibles.find(h => ((h as any).categoria_id || h.id) === Number(this.form.habitacion_id)) || this.habitacionSeleccionada;

    const cotizacion = new CotizacionModel();
    cotizacion.dni = (this.form.dni || '').trim();
    cotizacion.tipo_doc_id = this.form.tipo_doc_id ? Number(this.form.tipo_doc_id) : 1;
    cotizacion.nombre = (this.form.nombre || '').trim();
    cotizacion.primer_apellido = (this.form.primer_apellido || '').trim();
    cotizacion.segundo_apellido = (this.form.segundo_apellido || '').trim();
    cotizacion.cliente = `${this.form.nombre} ${this.form.primer_apellido}`.trim();
    cotizacion.telefono = (this.form.telefono || '').trim();
    cotizacion.fecha_ini = fIni.format('YYYY-MM-DD');
    cotizacion.fecha_fin = fFin.format('YYYY-MM-DD');

    const nomHab = habObj
      ? `${(habObj as any).categoria || habObj.tipo_habitacion || (habObj.nro_habitacion ? 'Hab. ' + habObj.nro_habitacion : 'Hospedaje')}`
      : 'Hospedaje General';
    const tipoHosp = (habObj as any)?.categoria || habObj?.tipo_habitacion || 'Hospedaje General';

    cotizacion.detalle = `[Cotización Externa - ${nomHab}] ${this.form.detalle || ''}`.trim();

    // Detalle base del hospedaje
    const detalleBase = new CotizacionDetalleModel();
    detalleBase.servicio = `Hospedaje ${nomHab}`;
    detalleBase.tipo_hospedaje = tipoHosp;
    detalleBase.cantidad = this.noches;
    detalleBase.cantidad_adulto = Number(this.form.cantidad_adulto) || 1;
    detalleBase.cantidad_ninio = Number(this.form.cantidad_ninio) || 0;
    detalleBase.precio_unit_adulto = habObj && habObj.precio ? Number(habObj.precio) : 0;
    detalleBase.precio_unit_ninio = 0;
    detalleBase.precio_unitario = habObj && habObj.precio ? Number(habObj.precio) : 0;
    detalleBase.subtotal = (habObj && habObj.precio ? Number(habObj.precio) : 0) * this.noches;
    detalleBase.total = detalleBase.subtotal;
    detalleBase.is_base = 1;
    detalleBase.detalle = `Hospedaje ${nomHab} (${this.noches} ${this.noches === 1 ? 'noche' : 'noches'})`;

    cotizacion.detalles = [detalleBase];

    this.cotizacionService.crear(cotizacion).subscribe({
      next: (res: any) => {
        this.guardando = false;
        if (res && res.correcto) {
          const dataRes = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
          const idCreada = dataRes?.cotizacion?.id || dataRes?.id;
          this.alertService.show("¡Cotización generada con éxito!", { duration: 5000, type: 'success' });

          if (idCreada) {
            this.verDocumento(idCreada);
          }
          this.dialogRef.close({ success: true, cotizacion: dataRes });
        } else {
          this.alertService.show(res?.mensaje || "Error al procesar la cotización", { duration: 5000, type: 'warning' });
        }
      },
      error: (err) => {
        this.guardando = false;
        console.error("Error al crear cotización externa:", err);
        this.alertService.show("Ocurrió un error al guardar la cotización", { duration: 5000, type: 'error' });
      }
    });
  }

  verDocumento(id: number): void {
    this.documentoService.obtenerVoucherCotizacion(id).subscribe({
      next: (pdfBase64: string) => {
        if (pdfBase64) {
          this.dialog.open(PdfViewerComponent, {
            width: '92vw',
            maxWidth: '1100px',
            height: '90vh',
            data: {
              pdf_base64: pdfBase64,
              titulo_documento: `Cotización #${id}`
            }
          });
        }
      },
      error: (e) => console.error(e)
    });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
