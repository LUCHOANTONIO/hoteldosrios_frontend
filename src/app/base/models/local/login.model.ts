import { AgenciaModel } from '../agencia.model';
import { ConfiguracionModel } from '../configuracion.model';
import { PersonaModel } from '../persona.model';
import { RegionalModel } from '../regional.model';
import { RolModel } from '../rol.model';
import { UsuarioModel } from "../usuario.model";

export class LoginModel{
    //usuario:UsuarioModel|null=null;
    access_token:string="";
    token_type:string="";
    expires_in:number=0;
    usuario!:UsuarioModel;
    persona!:PersonaModel;
    agencia!:AgenciaModel;
    regional!:RegionalModel;
    roles:RolModel[]=[];
    configuraciones:ConfiguracionModel[]=[];
    session_life_time!:number;
}