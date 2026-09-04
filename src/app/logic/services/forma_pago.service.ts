import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { FormaPagoModel } from "../models/forma_pago.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn:'root'
})

export class FormaPagoService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/forma_pagos";
    constructor(private http:HttpClient){
    }

    listar(): Observable<FormaPagoModel[]> {
       return this.http.get<FormaPagoModel[]>(this.URL_API_BASE);       
    }

    listar_public(): Observable<FormaPagoModel[]> {
       return this.http.get<FormaPagoModel[]>(`${this.URL_API_BASE}/public`);       
    }

    crear(formaPago:FormaPagoModel):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,formaPago);
    }

    modificar(formaPago:FormaPagoModel):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${formaPago.id}`,formaPago);
    }
    
    eliminar(id:number):Observable<RespuestaRequest<any>>{
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
       
}
