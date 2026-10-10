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

import { ReservaModel } from '../../../models/reserva.model';
import { HabitacionModel } from '../../../models/habitacion.model';
import { TipoDocumentoModel } from '../../../../base/models/tipodocumento.model';
import { PaisModel } from '../../../models/pais.model';
import { CanalReservaModel } from '../../../models/canal_reserva.model';

import { ReservaService } from '../../../services/reserva.service';
import { PersonaService } from '../../../../base/services/persona.service';
import { AlertService } from '../../../../base/services/local/alert.service';
import { DocumentoService } from '../../../services/documento.service';
import { PdfViewerComponent } from '../../../shared/views/pdf-viewer/pdf-viewer';

@Component({
  selector: 'app-reserva-externa-modal',
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
  templateUrl: './reserva_externa-reserva-modal.html',
  styleUrls: ['./reserva_externa-reserva-modal.scss']
})
export class ReservaExternaModalComponent implements OnInit {
  guardando: boolean = false;
  buscandoPersona: boolean = false;

  habitacionSeleccionada: any = null;
  habitacionesDisponibles: any[] = [];
  tipoDocumentos: TipoDocumentoModel[] = [];
  paises: PaisModel[] = [];
  canalReservas: CanalReservaModel[] = [];
  canalSeleccionadoId: number = 1;

  // Form Model
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
    public dialogRef: MatDialogRef<ReservaExternaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private reservaService: ReservaService,
    private personaService: PersonaService,
    private documentoService: DocumentoService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {
    this.habitacionSeleccionada = data.habitacionSeleccionada || null;
    this.habitacionesDisponibles = data.habitacionesDisponibles || [];
    this.tipoDocumentos = data.tipoDocumentos || [];
    this.paises = data.paises || [];
    this.canalReservas = data.canalReservas || [];

    if (data.fecha_ini) {
      this.form.fecha_ini = moment(data.fecha_ini).toDate();
    }
    if (data.fecha_fin) {
      this.form.fecha_fin = moment(data.fecha_fin).toDate();
    }

    if (this.habitacionSeleccionada) {
      this.form.habitacion_id = Number(this.habitacionSeleccionada.id);
      if (!this.habitacionesDisponibles.some(h => Number(h.id) === this.form.habitacion_id)) {
        this.habitacionesDisponibles = [this.habitacionSeleccionada, ...this.habitacionesDisponibles];
      }
    } else if (this.habitacionesDisponibles.length > 0) {
      this.form.habitacion_id = Number(this.habitacionesDisponibles[0].id);
    }

    if (this.paises.length > 0) {
      const bolivia = this.paises.find(p => p.descripcion?.toLowerCase().includes('bolivia'));
      this.form.pais_id = bolivia ? bolivia.id : this.paises[0].id;
    }
    if (this.tipoDocumentos.length > 0) {
      this.form.tipo_doc_id = this.tipoDocumentos[0].id || 1;
    }
    if (this.canalReservas.length > 0) {
      const defCanal = this.canalReservas.find(c =>
        c.descripcion?.toLowerCase().includes('whatsapp') ||
        c.descripcion?.toLowerCase().includes('directo') ||
        c.descripcion?.toLowerCase().includes('externo')
      );
      this.canalSeleccionadoId = defCanal ? defCanal.id : this.canalReservas[0].id;
    }

    // Determinar cantidad de adultos por tipo
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

  guardarReserva(form: NgForm): void {
    if (form.invalid) {
      this.alertService.show("Por favor complete todos los campos obligatorios", { duration: 4000, type: 'warning' });
      return;
    }

    if (!this.form.habitacion_id) {
      this.alertService.show("Debe seleccionar una habitación disponible", { duration: 4000, type: 'warning' });
      return;
    }

    const fIni = moment(this.form.fecha_ini).startOf('day');
    const fFin = moment(this.form.fecha_fin).startOf('day');
    if (!fIni.isValid() || !fFin.isValid() || fIni.isAfter(fFin)) {
      this.alertService.show("La Fecha de Salida no puede ser anterior a la Fecha de Llegada", { duration: 4000, type: 'warning' });
      return;
    }

    this.guardando = true;

    // Buscar canal Externo o canal por defecto
    let canalId = 1;
    if (this.canalReservas && this.canalReservas.length > 0) {
      const canalExterno = this.canalReservas.find(c =>
        c.descripcion?.toLowerCase().includes('externo') ||
        c.descripcion?.toLowerCase().includes('directo')
      );
      canalId = canalExterno ? canalExterno.id : this.canalReservas[0].id;
    }

    // Habitación seleccionada
    const habId = Number(this.form.habitacion_id);
    const habSeleccionada = this.habitacionesDisponibles.find(h => Number(h.id) === habId);
    const precioBaseHabitacion = habSeleccionada && habSeleccionada.precio ? Number(habSeleccionada.precio) : 0;
    const totalInterno = precioBaseHabitacion * this.noches;

    // Construcción del payload sin exponer montos al usuario externo
    const payload: any = {
      ...new ReservaModel(),
      is_externo: 1, // Indica registro realizado como Reserva Externa
      estado_reserva_id: 1, // 1 = Estado Reserva
      habitacion_id: habId,
      habitacion_ids: [habId],
      nro_documento: (this.form.dni || '').trim(),
      tipo_doc_id: this.form.tipo_doc_id ? Number(this.form.tipo_doc_id) : 1,
      nombre: (this.form.nombre || '').trim(),
      primer_apellido: (this.form.primer_apellido || '').trim(),
      segundo_apellido: (this.form.segundo_apellido || '').trim(),
      cliente: `${this.form.nombre} ${this.form.primer_apellido}`.trim(),
      telefono: (this.form.telefono || '').trim(),
      correo: (this.form.correo || '').trim(),
      email: (this.form.correo || '').trim(),
      pais_procedencia_id: this.form.pais_id ? Number(this.form.pais_id) : 1,
      nacionalidad_id: this.form.pais_id ? Number(this.form.pais_id) : 1,
      canal_reserva_id: this.canalSeleccionadoId || canalId,
      fecha_ini: fIni.format('YYYY-MM-DD'),
      fecha_fin: fFin.format('YYYY-MM-DD'),
      cantidad_adulto: Number(this.form.cantidad_adulto) || 1,
      cantidad_ninio: Number(this.form.cantidad_ninio) || 0,
      cantidad_huesped: (Number(this.form.cantidad_adulto) || 1) + (Number(this.form.cantidad_ninio) || 0),
      precio_unit_adulto: precioBaseHabitacion,
      precio_unit_ninio: 0,
      precio_unitario: precioBaseHabitacion,
      total: totalInterno > 0 ? totalInterno : precioBaseHabitacion,
      saldo: totalInterno > 0 ? totalInterno : precioBaseHabitacion,
      anticipo: 0,
      detalle_anticipo: '',
      forma_pago_id: null,
      detalle: `[Reserva Externa] ${this.form.detalle || ''}`.trim(),
      transacciones: []
    };

    this.reservaService.crear(payload).subscribe({
      next: (res: any) => {
        this.guardando = false;
        if (res && res.correcto) {
          let reservaCreada = null;
          if (res.dato) {
            try {
              const dataRes = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
              reservaCreada = dataRes?.reserva || dataRes;
            } catch { }
          }
          this.alertService.show("¡Reserva realizada con éxito!", { duration: 5000, type: 'success' });

          // Ofrecer ver el voucher de confirmación
          if (reservaCreada && reservaCreada.id) {
            this.verComprobante(reservaCreada.id);
          }
          this.dialogRef.close({ success: true, reserva: reservaCreada });
        } else {
          this.alertService.show(res?.mensaje || "Error al procesar la reserva", { duration: 5000, type: 'warning' });
        }
      },
      error: (err) => {
        this.guardando = false;
        console.error("Error al crear reserva externa:", err);
        const errorMsg = err?.error?.mensaje || (err?.error?.errors ? Object.values(err.error.errors).flat().join(', ') : "Ocurrió un error al guardar la reserva. Verifique los datos ingresados.");
        this.alertService.show(errorMsg, { duration: 5000, type: 'error' });
      }
    });
  }

  verComprobante(reservaId: number): void {
    this.documentoService.obtenerVoucherReserva(reservaId).subscribe({
      next: (pdfBase64: string) => {
        if (pdfBase64) {
          this.dialog.open(PdfViewerComponent, {
            width: '92vw',
            maxWidth: '1100px',
            height: '90vh',
            data: {
              pdf_base64: pdfBase64,
              titulo_documento: `Voucher de Reserva #${reservaId}`
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
