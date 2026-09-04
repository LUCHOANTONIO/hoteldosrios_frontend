import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { HuespedModel } from "../models/huesped.model";
import { EstadoHuespedModel } from "../models/estado_huesped.model";
import { environment } from "../../../environments/environment";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn:'root'
})

export class HuespedService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/huespedes";

    constructor(private http:HttpClient){

    }
    
    listar(id:number): Observable<HuespedModel[]> {           
       return this.http.get<HuespedModel[]>(`${this.URL_API_BASE}/${id}`);
    }   
  
    crear(Huesped:HuespedModel):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,Huesped);
    }

    editar(id:number):Observable<HuespedModel>{
        return this.http.get<HuespedModel>(`${this.URL_API_BASE}/${id}`);
    }

    modificar(Huesped:HuespedModel):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${Huesped.huesped_id}`,Huesped);
    }
  
    eliminar(id:number):Observable<RespuestaRequest<any>>{
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }

    estado(estadoHuesped:EstadoHuespedModel):Observable<RespuestaRequest<any>>{       
        return this.http.post<RespuestaRequest<any>>(`${this.URL_API_BASE}/estado`,estadoHuesped);
    }
}
