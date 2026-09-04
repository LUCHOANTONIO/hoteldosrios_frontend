import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";
import { environment } from "../../../environments/environment";
import { MovimientoModel } from "../models/movimiento.model";

@Injectable({
    providedIn:'root'
})

export class MovimientoService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/movimientos";

    constructor(private http:HttpClient){

    }        

    pagos(id:number): Observable<RespuestaRequest<any>> {
        return this.http.get<RespuestaRequest<any>>(`${this.URL_API_BASE}/pagos/${id}`);
    }
  
    crear(transaccion_pago:MovimientoModel):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,transaccion_pago);
    }

    eliminar(id: number, data?: MovimientoModel): Observable<RespuestaRequest<any>> {
        const options = data ? { body: data } : {};
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`, options);
    }

}
