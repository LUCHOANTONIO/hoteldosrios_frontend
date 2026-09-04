import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";
import { EgresoModel } from "../models/egreso.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class EgresoService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/egresos";

    constructor(private http:HttpClient){

    }
    
    listar(): Observable<EgresoModel[]> {
      return this.http.get<EgresoModel[]>(this.URL_API_BASE);
    }
  
    crear(egreso:EgresoModel):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,egreso);
    }

    modificar(egreso:EgresoModel):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${egreso.id}`,egreso);
    }
  
    eliminar(id:number):Observable<RespuestaRequest<any>>{
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
}
