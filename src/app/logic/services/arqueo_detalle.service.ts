import {HttpClient, HttpParams} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";
import { ArqueoDetalleModel } from "../models/arqueo_detalle.model";
import { environment } from "../../../environments/environment";
import { ArqueoModel } from "../models/arqueo.model";

@Injectable({
    providedIn:'root'
})

export class ArqueoDetalleService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/arqueo_detalle";

    constructor(private http:HttpClient){

    }
    
    listar(arqueo_id: number): Observable<ArqueoDetalleModel[]> {       
        const params = new HttpParams().set('arqueo_id', (arqueo_id ?? '').toString());
        return this.http.get<ArqueoDetalleModel[]>(`${this.URL_API_BASE}`, { params });
    }
  
    crear(arqueo:ArqueoModel,arqueo_detalle_list:ArqueoDetalleModel[]):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,{arqueo,arqueo_detalle_list});
    }

    modificar(arqueo:ArqueoModel,arqueo_detalle_list:ArqueoDetalleModel[]):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${arqueo.id}`,{arqueo,arqueo_detalle_list});
    }
  
    eliminar(id:number):Observable<RespuestaRequest<any>>{
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
    
}
