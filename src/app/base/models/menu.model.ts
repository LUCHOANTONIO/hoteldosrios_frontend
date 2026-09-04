export class MenuModel{
  id: number|null = null;
  padre_id: number = 0;
  nombre: string = "";
  orden?: number =0;
  icono?: string = "";
  url: string = "";
  permiso_id: number|null = null;
  fecha_alta?:Date|null = null;
  usuario_alta_id?: number = 0;
  subMenus?:MenuModel[]=[];
  asignado?:boolean;
  expandido?:boolean=false;
}