
//MODELS
import { ReservaCheckOutModel } from '../../models/reserva_checkout.model';

//SERVICES
import { ReservaCheckOutService } from '../../services/reserva_checkout.service';
import { AlertService } from '../../../base/services/local/alert.service';

//DATA PICKER
import { MatDatepickerModule } from '@angular/material/datepicker';
import moment from "moment";

//MATERIAL DESING
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';


//COMPONENT
import { ReservaCheckoutFormComponent } from './reserva_checkout-form/reserva_checkout-form';
import { ConfirmarEliminarComponent } from '../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';

//VARIOS
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SpanishPaginatorIntl } from '../../../base/utils/spanish-paginator-intl';
import { FormsModule } from '@angular/forms';
import { ConfirmarComponent } from '../../shared/views/confirmar/confirmar';

@Component({
  selector: 'app-reserva_checkout',
  standalone: true,
  imports: [MatTableModule, FormsModule, MatIconModule, MatPaginatorModule, MatButtonModule, MatDialogModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatDatepickerModule
  ],
  templateUrl: './reserva_checkout.html',
  styleUrl: './reserva_checkout.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
})

export class ReservaCheckOutComponent implements AfterViewInit {
  list_reserva_checkout: ReservaCheckOutModel[] = [];
  reserva_checkout: ReservaCheckOutModel = new ReservaCheckOutModel();
  fecha_ini_filter: Date = moment().toDate();
  fecha_fin_filter: Date = moment().toDate();

  //Comprobante              
  dialogVoucherRef: any;
  pdf_base64: string = '';

  displayedColumns: string[] = ['cliente', 'habitacion', 'sucursal', 'fecha_fin', 'hora_fin'];
  dataSource: MatTableDataSource<ReservaCheckOutModel>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private reservaCheckOutService: ReservaCheckOutService,
    private alertService: AlertService
  ) {
    this.cargarDatos();
  }


  ngAfterViewInit() {

  }

  cargarDatos() {
    forkJoin({
      reserva_checkout: this.reservaCheckOutService.listar(),
    }).subscribe({
      next: (res) => {

        this.list_reserva_checkout = res.reserva_checkout as ReservaCheckOutModel[];
        this.dataSource = new MatTableDataSource<ReservaCheckOutModel>(this.list_reserva_checkout);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  readonly dialog = inject(MatDialog);
  mostrarEditar(a: ReservaCheckOutModel) {
    this.reserva_checkout = { ...a };//clone 

    if (this.reserva_checkout.fecha_fin) {
      this.reserva_checkout.fecha_fin = moment(this.reserva_checkout.fecha_fin, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }

    const dialogRef = this.dialog.open(ReservaCheckoutFormComponent,
      {
        data: { reserva_checkout: this.reserva_checkout },
        width: '30vw',
        maxWidth: '95vw',
        disableClose: true
      });
    this.cambiarfondoFila("azure");
    dialogRef.afterClosed().subscribe(res => {
      if (!res) { return; }

      if (res.correcto) {
        this.cargarDatos();
      } else {
        this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
      }

    });
  }

  mostrarConfirmarEliminar(enterAnimationDuration: string, exitAnimationDuration: string, a: ReservaCheckOutModel) {
    this.reserva_checkout = a;

    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: this.reserva_checkout
    });
    this.cambiarfondoFila("MistyRose");
    dialogRef.afterClosed().subscribe(result => {

      if (!result) { return; } //Cuando cancele la hoja_ruta salia error por que no devolvia res, con este codigo se soluciono

      if (result) {//eliminar
        this.reservaCheckOutService.eliminar(this.reserva_checkout.id).subscribe({
          next: (res) => {
            if (res.correcto) {
              this.cargarDatos();
            } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
            }
          },
          error: (error) => {
            console.error(error);
          }
        })
      } else {
        this.cambiarfondoFila("");//cancelar
      }
    });
  }

  actualizarCheckOut() {

    const dialogRef = this.dialog.open(ConfirmarComponent, {
      width: '250px',
      data: { title: "Esta seguro de actualizar Check Out?" }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) { return; }
      this.reservaCheckOutService.actualizar_lote().subscribe({
        next: (res) => {
          if (res) {
            this.list_reserva_checkout = res as ReservaCheckOutModel[];
            this.dataSource = new MatTableDataSource<ReservaCheckOutModel>(this.list_reserva_checkout);
            this.dataSource.paginator = this.paginator;
          }
        }
      });
    });
  }

  busqueda(textoBusqueda: string) {
    const filterValue = textoBusqueda;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private cambiarfondoFila(color: string) {
    document.querySelectorAll<HTMLElement>("#fila" + this.reserva_checkout.id + " td").forEach(celda => {
      celda.style.backgroundColor = color;
    });
  }
}

