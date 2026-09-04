import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";
import { environment } from "../../../environments/environment";
import { CuentaCobrarModel } from "../models/cuenta_cobrar.model";

@Injectable({
    providedIn:'root'
})

export class CuentaCobrarService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/cuentas_cobrar";

    constructor(private http:HttpClient){

    }        

    listar(): Observable<CuentaCobrarModel[]> {
        return this.http.get<CuentaCobrarModel[]>(`${this.URL_API_BASE}`);
    } 
    
    cobranza(cuentaCobrar:CuentaCobrarModel): Observable<RespuestaRequest<any>> {
        return this.http.post<RespuestaRequest<any>>(`${this.URL_API_BASE}/cobranza`,cuentaCobrar);
    } 
    
    getPagos(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.URL_API_BASE}/pagos/${id}`);
    }

    updatePago(id: number, data: any): Observable<RespuestaRequest<any>> {
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/pagos/${id}`, data);
    }
    
    deletePago(id: number): Observable<RespuestaRequest<any>> {
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/pagos/${id}`);
    }

    exportar_comprobante(id: number): Observable<RespuestaRequest<any>> {
        return this.http.get<RespuestaRequest<any>>(`${this.URL_API_BASE}/comprobante/${id}`);
    }
}
