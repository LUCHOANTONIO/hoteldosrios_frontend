export class ReservaArchivoModel{
    id:number=0;
    reserva_id:number=0;
    secuencia:number=0;
    nombre_archivo:string='';
    extension:string='';
    peso_bytes:number=0;
    url:string='';
    base64_min:string='';
    base64_real:string='';
    detalle:string='';   
    tipo_archivo_id:number|null=null;
    predeterminado:boolean=false;
    usuario_alta_id:number=0;        
    eliminado:number=0;

    //Datos persona
    huesped_id:number|null=null;    
    nro_documento:string="";
    tipo_doc_id:number|null=null;
    nombre:string="";
    primer_apellido:string="";
    segundo_apellido:string="";
}
