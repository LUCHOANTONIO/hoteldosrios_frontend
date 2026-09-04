import { PersonaModel } from './persona.model';
export class UsuarioModel extends PersonaModel {
    usuario:string="";
    nombre_usuario:string="";
    password:string="";
    usuario_email:string="";
    agencia_id:number|null=null;
    regional_id:number|null=null;
    rol_ids: number[]=[];
}
