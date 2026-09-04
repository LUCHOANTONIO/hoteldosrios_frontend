export class PermisoModel{
  id:number|null=null;
  modulo_id:number|null=null;
  tipo_permiso_id:number|null=null;
  nombre:string="";
  descripcion:string="";
  ruta_nombre:string="";
  fecha_alta:string="";
  usuario_alta_id:number|null=null;
}


export class PermisoAsignadoModel extends PermisoModel{
  modulo:string="";
  asignado:Boolean=false;
}