export class InventarioModel {
  id: number;
  producto_id: number;
  descripcion: string = "";
  tipo_movimiento_id: number;
  tipo_movimiento: string = "";
  cantidad: number;
  precio_unitario: number;
}
