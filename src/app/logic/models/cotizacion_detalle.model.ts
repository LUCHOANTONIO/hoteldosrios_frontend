export class CotizacionDetalleModel {
    id: number;
    cotizacion_id: number;
    tarifa_id?: number | null = null;
    servicio?: string = '';
    tipo_hospedaje?: string = '';
    paquete?: string = '';
    cantidad_adulto: number = 0;
    precio_unit_adulto: number = 0;
    cantidad_ninio: number = 0;
    precio_unit_ninio: number = 0;
    subtotal?: number = 0;
    detalle?: string = '';
    eliminado?: number = 0;
    created_at?: string;
    updated_at?: string;
    estado?: string; // Para operaciones en interfaz si aplica
}
