import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { CotizacionModel } from "../models/cotizacion.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn: 'root'
})
export class CotizacionService {
    private URL_API_BASE = environment.URL_API_BASE + "/cotizaciones";

    constructor(private http: HttpClient) { }

    listar(): Observable<CotizacionModel[]> {
        return this.http.get<CotizacionModel[]>(this.URL_API_BASE);
    }

    getById(id: number): Observable<CotizacionModel> {
        return this.http.get<CotizacionModel>(`${this.URL_API_BASE}/${id}`);
    }

    crear(cotizacion: CotizacionModel): Observable<RespuestaRequest<any>> {
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE, cotizacion);
    }

    modificar(cotizacion: CotizacionModel): Observable<RespuestaRequest<any>> {
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${cotizacion.id}`, cotizacion);
    }

    eliminar(id: number): Observable<RespuestaRequest<any>> {
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
}
