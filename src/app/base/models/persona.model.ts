export class PersonaModel{
        id:number|null=null;
        tipo_doc_id:number|null=null;          
        nacionalidad_id: number = 1;
        detalle:number|null=null;
        genero_id:number|null=null;
        estado_civil_id:number|null=null;
        nro_documento:string="";
        nombre:string="";
        primer_apellido:string="";
        segundo_apellido:string="";
        fecha_nacimiento:string="";
        email:string="";
        telefono:string="";
        direccion:string="";
}

