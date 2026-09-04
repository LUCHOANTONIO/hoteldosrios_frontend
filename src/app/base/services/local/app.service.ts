import { Injectable, signal, WritableSignal } from '@angular/core';
import { SessionModel } from '../../models/local/session.model';
import { TokenModel } from '../../models/local/token.model';
import { JwtDecoderService } from '../../utils/jwt-decoder.service';

@Injectable({
  providedIn: 'root'
})

export class AppService {
  private readonly STORAGE_KEY = 'agencia_nombre_persistente';
  mostrarSideNav:boolean=true;
  tamPantalla:string="xs";

  session!:SessionModel;
  token!:TokenModel;  
    
  constructor(private jwtDecoderService:JwtDecoderService) {
    this.getSession();
    this.getToken();
    if(this.session==null){ //evita que errores de valores nulos, cuando aun no se ha iniciado sesion.
      this.session=new SessionModel();
      this.token=new TokenModel();
    }    
  }

  //BEGIN:Signal para almacenar el nombre de la agencia
  public agenciaNombre: WritableSignal<string> = signal(
        localStorage.getItem(this.STORAGE_KEY) || ''
  );

  public updateAgenciaNombre(nombre: string): void { 
      this.agenciaNombre.set(nombre);  
      localStorage.setItem(this.STORAGE_KEY, nombre);                              
  } //END:Signal para almacenar el nombre de la agencia

  public setSession(session:SessionModel){
     this.session=session;
     sessionStorage.setItem("session",JSON.stringify(this.session));
  }

  getSession(){
     this.session=JSON.parse(sessionStorage.getItem("session") ?? 'null');               
  }

  setToken(token:TokenModel){   
    if(token){    
      let payload_json=this.jwtDecoderService.decodeToken(token.access_token);
      token.iat=payload_json.iat;
      token.exp=payload_json.exp;
    }
    this.token=token;
    sessionStorage.setItem("token",JSON.stringify(this.token));    
  }

  getToken(){       
     this.token = JSON.parse(sessionStorage.getItem("token") ?? 'null');    
  }
  
  clear(){
    sessionStorage.clear();   
    this.token=new TokenModel();
    this.session=new SessionModel();
  }

}
