export interface InvUnidadMedidaModel {
  unidad_medida_id: number;
  descripcion: string;
}

export interface InvCategoriaModel {
  id?: number;
  nombre: string;
  descripcion?: string;
}

export interface InvProductoModel {
  id?: number;
  categoria_id: number;
  categoria_nombre?: string;
  unidad_medida_id?: number;
  unidad_medida: string;
  sku: string;
  nombre: string;
  stock_minimo: number;
  costo_referencial: number;
  stock_actual?: number;
  valor_total?: number;
  alerta_stock?: boolean;
}

export interface InvDetalleCompraModel {
  id?: number;
  compra_id?: number;
  producto_id: number;
  producto_sku?: string;
  producto_nombre?: string;
  unidad_medida?: string;
  cantidad: number;
  costo_unitario: number;
  subtotal?: number;
}

export interface InvCompraModel {
  id?: number;
  nro_compra?: number;
  nro_documento?: string;
  proveedor_nombre: string;
  fecha: string;
  observacion?: string;
  total?: number;
  detalles: InvDetalleCompraModel[];
}

export interface InvConsolidadoItemModel {
  producto_id: number;
  sku: string;
  nombre: string;
  categoria_id: number;
  categoria_nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  alerta_stock_minimo: boolean;
  ultimo_costo: number;
  valor_total: number;
  capas_activas: number;
}

export interface InvConsolidadoResponse {
  resumen: {
    total_productos: number;
    productos_alerta_stock: number;
    valorizacion_total: number;
  };
  items: InvConsolidadoItemModel[];
}

export interface InvCapaUepsModel {
  id: number;
  producto_id: number;
  origen_tipo: 'COMPRA' | 'AJUSTE';
  compra_id?: number;
  detalle_compra_id?: number;
  fecha_ingreso: string;
  cantidad_inicial: number;
  cantidad_disponible: number;
  costo_unitario: number;
  estado: 'ACTIVA' | 'AGOTADA' | 'ANULADA';
}

export interface InvKardexItemModel {
  id: number;
  producto_id: number;
  capa_ueps_id?: number;
  fecha: string;
  tipo_movimiento: string;
  referencia_tipo: string;
  referencia_id?: number;
  referencia_doc: string;
  cantidad_entrada: number;
  cantidad_salida: number;
  costo_unitario: number;
  costo_total: number;
  saldo_cantidad: number;
  saldo_valorizado: number;
  observacion?: string;
}

export interface InvKardexRowModel {
  id: number;
  producto_id: number;
  codigo: string;
  categoria: string;
  producto: string;
  detalle: string;
  costo_unitario: number;
  cantidad_entrada: number;
  cantidad_salida: number;
  saldo_cantidad: number;
  valor_entrada: number;
  valor_salida: number;
  saldo_valorizado: number;
  fecha?: string;
}

export interface InvKardexProductoResponse {
  producto: {
    id: number;
    sku: string;
    nombre: string;
    categoria_nombre: string;
    unidad_medida: string;
    stock_minimo: number;
    costo_referencial: number;
    stock_actual: number;
    valor_total: number;
  };
  capas_ueps: InvCapaUepsModel[];
  kardex: InvKardexItemModel[];
}
