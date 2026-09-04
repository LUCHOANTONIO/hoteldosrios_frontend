import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { TransaccionModel } from "../models/transaccion.model";
import { environment } from "../../../environments/environment";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn:'root'
})

export class TransaccionService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/transacciones";

    constructor(private http:HttpClient){

    }

    listarTransaccionesPorReservaId(id: number): Observable<TransaccionModel[]> {
        return this.http.get<TransaccionModel[]>(`${this.URL_API_BASE}/reserva/${id}`);
    }      
  
    crear(Transaccion:TransaccionModel):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,Transaccion);
    }

    modificar(Transaccion:TransaccionModel):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${Transaccion.id}`,Transaccion);
    }
  
    eliminar(id:number):Observable<RespuestaRequest<any>>{
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }

}
