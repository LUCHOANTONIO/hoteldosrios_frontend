export class IngresoModel{
  id: number;  
  fecha:string=""; 
  cuenta_id: number;
  agencia_id: number;
  detalle: string = "";
  forma_pago_id :number=null;
  cantidad: number=1;
  monto: number;
}
