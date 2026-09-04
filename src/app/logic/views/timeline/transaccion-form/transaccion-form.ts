//MODELS
import { ReservaModel } from '../../../models/reserva.model';
import { TransaccionModel } from '../../../models/transaccion.model';
import { ProductoModel } from '../../../models/producto.model';
import { CategoriaModel } from '../../../models/categoria.model';

//SERVICES
import { AlertService } from '../../../../base/services/local/alert.service';
import { TransaccionService } from '../../../services/transaccion.service';
import { BalanceService } from '../../../services/balance.service';
import { ComunicacionService } from '../../../services/local/comunicacion.service';
import { PermisoService } from '../../../../base/services/permiso.service';
import { CategoriaService } from '../../../services/categoria.service';

//COMPONENTES
import { SelectSearchComponent } from '../../../../base/shared/views/select-search/select-search';

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

//DIRECTIVAS
import { PreventEnterSubmitDirective } from '../../../../base/shared/directives/prevent-enter-submit.directive';
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';

//DATA TABLE
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

//VARIOS
import { Component, ViewChild, Input, OnInit, inject, effect } from '@angular/core';
import { forkJoin } from 'rxjs';
import { NgForm, FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ConfirmarEliminarComponent } from '../../../../base/shared/views/confirmar-eliminar/confirmar-eliminar';
import moment from 'moment';

@Component({
  selector: 'app-transaccion-form',
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
    PreventEnterSubmitDirective,
    BotonGuardarDirective,
    //Otros
    FormsModule,
    MatDialogModule,
    MatPaginatorModule,
    SelectSearchComponent
  ],
  templateUrl: './transaccion-form.html',
  styleUrl: './transaccion-form.scss'
})
export class TransaccionFormComponent implements OnInit {
  @Input() reserva!: ReservaModel;
  @Input() productos: ProductoModel[] = [];
  @Input() items!: any;
  @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
  transacciones: TransaccionModel[] = [];
  transaccion: TransaccionModel = new TransaccionModel();
  categorias: CategoriaModel[] = [];
  productos_filtrados: ProductoModel[] = [];
  balance: any; //Variable signal cargado desde constructor    

  //Mostrar botones segun permisos
  mostrar_btn_destroy: boolean = false;

  //Transaccion
  displayedColumnsTransaccion: string[] = ['actions', 'fecha', 'descripcion', 'cantidad', 'precio_unitario', 'total'];
  dataSourceTransaccion: MatTableDataSource<TransaccionModel>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private comunicacionService: ComunicacionService,
    private transaccionService: TransaccionService,
    private alertService: AlertService,
    private balanceService: BalanceService,
    private permisoService: PermisoService,
    private categoriaService: CategoriaService
  ) {
    this.balance = this.balanceService.balance;
    effect(() => {
      const permisos = this.permisoService.permisos();
      if (permisos.length > 0) {
        this.mostrar_btn_destroy = permisos.some(p => p.nombre === 'ELIMINAR TRANSACCION CALENDARIO');
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.reserva) {
        this.cargarDatosTransaccion(this.reserva.id);
      }
    });
  }

  submitTransaccion(f: NgForm) {
    if (f.valid) {
      this.guardarTransaccion();
      this.botonGuardarDirectiva.deshabilitarFormBoton();
    } else {
      f.control.markAllAsTouched(); //Para marcar con borde rojo los campos requeridos 
      this.alertService.show("Debe llenar los campos", { duration: 3000, type: 'info' });
    }
  }

  onSelectionChange(event: any): void {
    const selectedId = event.value;
    const selectedProducto = this.productos.find(h => h.id === selectedId);
    if (selectedProducto) {
      this.transaccion.cantidad = 1; //Cantidad por defecto
      this.transaccion.precio_unitario = selectedProducto.precio;
      this.transaccion.total = selectedProducto.precio;
    }
  }

  cargarDatosTransaccion(reserva_id: number) {
    forkJoin({
      transacciones: this.transaccionService.listarTransaccionesPorReservaId(reserva_id),
      categorias: this.categoriaService.listar(),
    }).subscribe({
      next: (res) => {
        this.categorias = res.categorias;
        this.transacciones = res.transacciones;
        this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.transacciones);
        this.dataSourceTransaccion.paginator = this.paginator;
      }
    });
  }

  //Begin: Operaciones con transaccion
  guardarTransaccion() {
    this.transaccion.reserva_id = this.reserva.id;
    this.transaccionService.crear(this.transaccion).subscribe({
      next: (res) => {
        if (res.correcto) {
          const data = JSON.parse(res.dato);
          this.transacciones = data.transacciones as TransaccionModel[];
          this.balance.set(data.balance);
          this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.transacciones);
          this.transaccion = new TransaccionModel();

          const fechaIni = moment(this.reserva.fecha_ini).startOf('day').hour(14).minute(0).second(0);
          const fechaFin = moment(this.reserva.fecha_fin).startOf('day').hour(11).minute(0).second(0);
          this.reserva.fecha_ini = moment(fechaIni).format("YYYY-MM-DD HH:mm");
          this.reserva.fecha_fin = moment(fechaFin).format("YYYY-MM-DD HH:mm");

          this.reserva.saldo = data.balance.saldo;

          this.items.update({ id: this.reserva.id, cliente: this.reserva.cliente, start: this.reserva.fecha_ini, end: this.reserva.fecha_fin, group: this.reserva.habitacion_id, className: this.reserva.color, saldo: this.reserva.saldo });

          this.comunicacionService.executeActionReserva.set(true); //Señal para indicar que hubo accion en reserva               
          this.comunicacionService.loadBitacoraSignal.set({ reserva_id: this.reserva.id, trigger: Date.now() });

        } else {
          this.alertService.show(res.mensaje, { duration: 10000, type: 'info' });
        }
        this.botonGuardarDirectiva.habilitarFormBoton();
      },
      error: (error) => {
        this.botonGuardarDirectiva.habilitarFormBoton();
      }
    })
  }

  readonly dialog = inject(MatDialog);
  eliminarTransaccion(enterAnimationDuration: string, exitAnimationDuration: string, a: TransaccionModel) {
    const transaccion_id = a.id;

    const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: transaccion_id
    });
    this.cambiarfondoFila("MistyRose");
    dialogRef.afterClosed().subscribe(result => {
      if (result) {//eliminar
        this.transaccionService.eliminar(transaccion_id).subscribe({
          next: (res) => {
            if (res.correcto) {
              const data = JSON.parse(res.dato);
              this.transacciones = data.transacciones as TransaccionModel[];
              this.balance.set(data.balance); //Establecer valor por medio de signal
              this.dataSourceTransaccion = new MatTableDataSource<TransaccionModel>(this.transacciones);

              const fechaIni = moment(this.reserva.fecha_ini).startOf('day').hour(14).minute(0).second(0);
              const fechaFin = moment(this.reserva.fecha_fin).startOf('day').hour(11).minute(0).second(0);
              this.reserva.fecha_ini = moment(fechaIni).format("YYYY-MM-DD HH:mm");
              this.reserva.fecha_fin = moment(fechaFin).format("YYYY-MM-DD HH:mm");

              this.reserva.saldo = data.balance.saldo;
              this.items.update({ id: this.reserva.id, cliente: this.reserva.cliente, start: this.reserva.fecha_ini, end: this.reserva.fecha_fin, group: this.reserva.habitacion_id, className: this.reserva.color, saldo: this.reserva.saldo });

              this.comunicacionService.executeActionReserva.set(true); //Señal para indicar que hubo accion en reserva               
              this.comunicacionService.loadBitacoraSignal.set({ reserva_id: this.reserva.id, trigger: Date.now() });

            } else {
              this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
            }

            this.botonGuardarDirectiva.habilitarFormBoton();
          },
          error: (error) => {
            this.botonGuardarDirectiva.habilitarFormBoton();
            console.error(error);
          }
        })
      } else {
        this.cambiarfondoFila("");//cancelar
      }
    });
  }

  calcularTotal(): void {
    let cantidad = this.transaccion.cantidad || 0;
    let precio_unitario = this.transaccion.precio_unitario || 0;
    this.transaccion.total = Math.round((cantidad * precio_unitario) * 100) / 100; // Redondeo a 2 decimales
  }

  filtrarProductos(): void {
    this.productos_filtrados = this.productos.filter(p => p.categoria_id === this.transaccion.categoria_id);
    if (this.productos_filtrados.length === 0) {
      this.transaccion.producto_id = null;
    }
  }

  private cambiarfondoFila(color: string) {
    document.querySelectorAll<HTMLElement>("#fila" + this.transaccion.id + " td").forEach(celda => {
      celda.style.backgroundColor = color;
    });
  }
  //End: Operaciones con transaccion
}
