import { Routes } from '@angular/router';
import { authGuard } from '../base/guards/auth.guard';
import { HabitacionComponent } from './views/habitacion/habitacion';
import { DisponibilidadComponent } from './views/disponibilidad/disponibilidad';
import { TipoHabitacionComponent } from './views/tipo_habitacion/tipo_habitacion'
import { EstadoHabitacionComponent } from './views/estado_habitacion/estado_habitacion';
import { TimelineComponent } from './views/timeline/timeline'
import { ProductoComponent } from './views/producto/producto';
import { CajaComponent } from './views/caja/caja';
import { CuentaComponent } from './views/cuenta/cuenta';
import { FormaPagoComponent } from './views/forma_pago/forma_pago';
import { CategoriaComponent } from './views/categoria/categoria';
import { CanalReservaComponent } from './views/canal_reserva/canal_reserva';
import { ReporteHuespedComponent } from './views/reporte/huesped/huesped';
import { ReporteProductoComponent } from './views/reporte/producto/producto';
import { ReporteIngresoComponent } from './views/reporte/ingreso/ingreso';
import { ReporteEgresoComponent } from './views/reporte/egreso/egreso';
import { ReporteCajaComponent } from './views/reporte/caja/caja';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { ReservaCheckOutComponent } from './views/reserva_checkout/reserva_checkout';
import { IngresoComponent } from './views/ingreso/ingreso';
import { EgresoComponent } from './views/egreso/egreso';
import { CuentaCobrarComponent } from './views/cuenta_cobrar/cuenta_cobrar';
import { ReporteIngresoMensualComponent } from './views/reporte/ingreso_mensual/ingreso_mensual';
import { ReporteIngresoHabitacionComponent } from './views/reporte/ingreso_habitacion/ingreso_habitacion';
import { ReporteIngresoFormaPagoComponent } from './views/reporte/ingreso_formapago/ingreso_formapago';
import { ReporteEgresoCuentaComponent } from './views/reporte/egreso_cuenta/egreso_cuenta';
import { ReporteSiatComponent } from './views/reporte/siat/siat';
import { InventarioComponent } from './views/inventario/inventario';
import { ReporteCuentasCobrarComponent } from './views/reporte/cuenta_cobrar/cuenta_cobrar';

export const LOGIC_ROUTES: Routes = [
    { path: 'timeline', component: TimelineComponent, canActivate: [authGuard] },
    { path: 'habitaciones', component: HabitacionComponent, canActivate: [authGuard] },
    { path: 'disponibilidad', component: DisponibilidadComponent, canActivate: [authGuard] },
    { path: 'tipo_habitaciones', component: TipoHabitacionComponent, canActivate: [authGuard] },
    { path: 'estado_habitacion', component: EstadoHabitacionComponent, canActivate: [authGuard] },
    { path: 'productos', component: ProductoComponent, canActivate: [authGuard] },
    { path: 'cajas', component: CajaComponent, canActivate: [authGuard] },
    { path: 'cuentas', component: CuentaComponent, canActivate: [authGuard] },
    { path: 'forma_pagos', component: FormaPagoComponent, canActivate: [authGuard] },
    { path: 'categorias', component: CategoriaComponent, canActivate: [authGuard] },
    { path: 'canal_reservas', component: CanalReservaComponent, canActivate: [authGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'checkout', component: ReservaCheckOutComponent, canActivate: [authGuard] },  
    { path: 'ingresos', component: IngresoComponent, canActivate: [authGuard] },
    { path: 'egresos', component: EgresoComponent, canActivate: [authGuard] },
    { path: 'cuenta_cobrar', component: CuentaCobrarComponent, canActivate: [authGuard] },
    { path: 'reporte_huesped', component: ReporteHuespedComponent, canActivate: [authGuard] },
    { path: 'reporte_producto', component: ReporteProductoComponent, canActivate: [authGuard] },
    { path: 'reporte_ingreso', component: ReporteIngresoComponent, canActivate: [authGuard] },
    { path: 'reporte_egreso', component: ReporteEgresoComponent, canActivate: [authGuard] },
    { path: 'reporte_caja', component: ReporteCajaComponent, canActivate: [authGuard] },
    { path: 'reporte_ingreso_mensual', component: ReporteIngresoMensualComponent, canActivate: [authGuard] },
    { path: 'reporte_ingreso_habitacion', component: ReporteIngresoHabitacionComponent, canActivate: [authGuard] },
    { path: 'reporte_ingreso_formapago', component: ReporteIngresoFormaPagoComponent, canActivate: [authGuard] },
    { path: 'reporte_egreso_cuenta', component: ReporteEgresoCuentaComponent, canActivate: [authGuard] },
    { path: 'reporte_siat', component: ReporteSiatComponent, canActivate: [authGuard] },
    { path: 'reporte_cuentas_cobrar', component: ReporteCuentasCobrarComponent, canActivate: [authGuard] },
    { path: 'inventarios', component: InventarioComponent, canActivate: [authGuard] }
];
