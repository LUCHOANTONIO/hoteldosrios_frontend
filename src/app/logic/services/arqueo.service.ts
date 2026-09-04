import {HttpClient, HttpParams} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";
import { ArqueoModel } from "../models/arqueo.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class ArqueoService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/arqueo";

    constructor(private http:HttpClient){

    }
    
    listar(): Observable<ArqueoModel[]> {
      return this.http.get<ArqueoModel[]>(`${this.URL_API_BASE}}`);
    }

    // getArqueoByCajaId():Observable<ArqueoModel>{
    //     const params = new HttpParams()
    //         .set('caja_id', caja_id.toString())
    //         .set('divisa_id', divisa_id.toString());
    //     return this.http.get<ArqueoModel>(`${this.URL_API_BASE}/${id}`);
    // }

    getArqueoById(caja_id:number):Observable<ArqueoModel>{
        const params = new HttpParams()
        .set('caja_id', `${caja_id ?? ''}`);      
        return this.http.get<ArqueoModel>(`${this.URL_API_BASE}/get_arqueo_caja`,{params});
    }
  
    crear(arqueo:ArqueoModel):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,arqueo);
    }

    modificar(arqueo:ArqueoModel):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${arqueo.id}`,arqueo);
    }
  
    eliminar(id:number):Observable<RespuestaRequest<any>>{
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
    
}
