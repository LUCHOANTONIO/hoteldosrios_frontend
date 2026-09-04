import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { CanalReservaModel } from "../models/canal_reserva.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn:'root'
})

export class CanalReservaService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/canal_reservas";
    constructor(private http:HttpClient){
    }

    listar(): Observable<CanalReservaModel[]> {
       return this.http.get<CanalReservaModel[]>(this.URL_API_BASE);
    }

     crear(canal_reserva:CanalReservaModel):Observable<RespuestaRequest<any>>{
            return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,canal_reserva);
        }
    
    modificar(canal_reserva:CanalReservaModel):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${canal_reserva.id}`,canal_reserva);
    }
    
    eliminar(id:number):Observable<RespuestaRequest<any>>{
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
   
}
