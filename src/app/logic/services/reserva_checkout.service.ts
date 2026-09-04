import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { ReservaModel } from "../models/reserva.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";
import { ReservaCheckOutModel } from "../models/reserva_checkout.model";

@Injectable({
    providedIn:'root'
})

export class ReservaCheckOutService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/reserva_checkout";
    constructor(private http:HttpClient){
    }
    
    listar(): Observable<ReservaCheckOutModel[]> {
       return this.http.get<ReservaCheckOutModel[]>(this.URL_API_BASE + "/list_checkout");
    }

    actualizar_lote(): Observable<ReservaCheckOutModel[]> {
       return this.http.post<ReservaCheckOutModel[]>(this.URL_API_BASE + "/update_batch", {});
    }  

    modificar(checkout:ReservaCheckOutModel):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${checkout.id}`,checkout);
    }

    eliminar(id:number):Observable<RespuestaRequest<any>>{
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
    
}
