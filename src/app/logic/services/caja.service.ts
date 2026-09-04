import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { CajaModel } from "../models/caja.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class CajaService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/cajas";

    constructor(private http:HttpClient){

    }
    
    listar(): Observable<CajaModel[]> {
      return this.http.get<CajaModel[]>(this.URL_API_BASE);
    }
  
    crear(Caja:CajaModel):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,Caja);
    }

    modificar(Caja:CajaModel):Observable<CajaModel>{
        return this.http.put<CajaModel>(`${this.URL_API_BASE}/${Caja.id}`,Caja);
    }
  
    eliminar(id:number):Observable<CajaModel>{
        return this.http.delete<CajaModel>(`${this.URL_API_BASE}/${id}`);
    }

    cerrar():Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(`${this.URL_API_BASE}/close`, null);
    }

    voucherCierreCaja(caja_id:number): Observable<string> {
       return this.http.get<string>(`${this.URL_API_BASE}/cierre_caja/${caja_id}`);
    }
}
