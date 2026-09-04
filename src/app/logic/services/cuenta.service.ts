import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { CuentaModel } from "../models/cuenta.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn:'root'
})

export class CuentaService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/cuentas";
    constructor(private http:HttpClient){
    }

    listar(): Observable<CuentaModel[]> {
       return this.http.get<CuentaModel[]>(this.URL_API_BASE);
    }

    cuenta_ingresos(): Observable<CuentaModel[]> {
       return this.http.get<CuentaModel[]>(`${this.URL_API_BASE}/ingresos`);
    }

    cuenta_egresos(): Observable<CuentaModel[]> {
       return this.http.get<CuentaModel[]>(`${this.URL_API_BASE}/egresos`);
    }
    
    crear(cuenta:CuentaModel):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,cuenta);
    }
    
    editar(id:number):Observable<CuentaModel>{
        return this.http.get<CuentaModel>(`${this.URL_API_BASE}/${id}`);
    }

    modificar(cuenta:CuentaModel):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${cuenta.id}`,cuenta);
    }
    
    eliminar(id:number):Observable<RespuestaRequest<any>>{
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
   
}
