export class TransaccionModel{   
    id :number;
    reserva_id :number;
    categoria_id :number;
    producto_id:number; 
    descripcion:string; 
    cantidad :number;     
    precio_unitario :number; 
    total :number;   
    estado: string = "";          
}
