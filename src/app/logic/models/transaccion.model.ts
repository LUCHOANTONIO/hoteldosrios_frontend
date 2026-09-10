export class TransaccionModel {
    id: number;
    reserva_id: number;
    categoria_id: number;
    producto_id: number;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    cantidad_adulto: number = 0;
    precio_unit_adulto: number = 0;
    cantidad_ninio: number = 0;
    precio_unit_ninio: number = 0;
    total: number;
    estado: string = "";
}
