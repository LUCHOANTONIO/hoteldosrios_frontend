export class BalanceDetalleModel {
    id?: number;
    transaccion_id?: number;
    categoria_id?: number;
    detalle: string;
    monto: number;
    pagado?: number;
    saldo?: number;
    is_base?: number;
}

export class BalanceModel {   
    total: number = 0;
    habitacion: number = 0;
    extra: number = 0;
    lavanderia: number = 0;
    servicio: number = 0;
    pago: number = 0;
    saldo: number = 0;
    porcentaje_pago?: number = 0;
    detalles?: BalanceDetalleModel[] = [];
}

