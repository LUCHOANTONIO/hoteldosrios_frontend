import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { ReservaModel } from "../models/reserva.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn:'root'
})

export class ReservaService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/reservas";
    constructor(private http:HttpClient){
    }

    listar(): Observable<RespuestaRequest<any>> {
       return this.http.get<RespuestaRequest<any>>(this.URL_API_BASE);
    }

    mostrar(reserva_id:number): Observable<any> {
        return this.http.get<any>(`${this.URL_API_BASE}/${reserva_id}`);
    }

    crear(reserva:ReservaModel):Observable<RespuestaRequest<any>>{       
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,reserva);
    }

    modificar(reserva:ReservaModel):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${reserva.id}`,reserva);
    }          

    eliminar(id:number):Observable<RespuestaRequest<any>>{
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }

    estado(reserva:ReservaModel):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE + "/estado",reserva);
    }

    obtenerComprobante(id:number):Observable<String>{
        return this.http.get<String>(`${this.URL_API_BASE}/voucher/${id}`);
    }
    
}
