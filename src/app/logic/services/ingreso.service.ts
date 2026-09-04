import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";
import { environment } from "../../../environments/environment";
import { IngresoModel } from "../models/ingreso.model";

@Injectable({
    providedIn:'root'
})

export class IngresoService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/ingresos";

    constructor(private http:HttpClient){

    }
    
    listar(): Observable<IngresoModel[]> {
      return this.http.get<IngresoModel[]>(this.URL_API_BASE);
    }
  
    crear(ingreso:IngresoModel):Observable<RespuestaRequest<any>>{        
       return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,ingreso);
    }

    modificar(ingreso:IngresoModel):Observable<RespuestaRequest<any>>{
       return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${ingreso.id}`,ingreso);
    }
  
    eliminar(id:number):Observable<RespuestaRequest<any>>{
       return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
}
