import { CotizacionDetalleModel } from './cotizacion_detalle.model';

export class CotizacionModel {
    id: number;
    correlativo: number;
    dni: string = '';
    tipo_doc_id?: number | null = null;
    tipo_doc?: string = '';
    nombre: string = '';
    primer_apellido: string = '';
    segundo_apellido: string = '';
    cliente?: string = '';
    fecha_ini: string = '';
    fecha_fin: string = '';
    detalle: string = '';
    created_at?: string = '';
    updated_at?: string = '';
    detalles?: CotizacionDetalleModel[] = [];
}
