export class RespuestaRequest<T> {
    correcto:boolean=true;
    codigo:number =1;
    mensaje:string="";
    dato!: T;
}
