import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtDecoderService {
  constructor() {
   }

  public decodeToken(jwt_token:String){
    const base64Url=jwt_token.split('.')[1];//obtiene el contenido del payload yy.payload.sign
    const base64=base64Url.replace(/-/g,'+').replace(/_/g,'/');
    const jsonPayload=decodeURIComponent(
      atob(base64)
      .split('')
      .map((c)=>{
        return '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  }
}
