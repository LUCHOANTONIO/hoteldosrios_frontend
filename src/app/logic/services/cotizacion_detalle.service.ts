import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { CotizacionDetalleModel } from "../models/cotizacion_detalle.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn: 'root'
})
export class CotizacionDetalleService {
    private URL_API_BASE = environment.URL_API_BASE + "/cotizacion_detalles";

    constructor(private http: HttpClient) { }

    listar(cotizacion_id?: number): Observable<CotizacionDetalleModel[]> {
        const url = cotizacion_id ? `${this.URL_API_BASE}/list/${cotizacion_id}` : `${this.URL_API_BASE}/list`;
        return this.http.get<CotizacionDetalleModel[]>(url);
    }

    getById(id: number): Observable<CotizacionDetalleModel> {
        return this.http.get<CotizacionDetalleModel>(`${this.URL_API_BASE}/${id}`);
    }

    crear(detalle: CotizacionDetalleModel): Observable<RespuestaRequest<any>> {
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE, detalle);
    }

    modificar(detalle: CotizacionDetalleModel): Observable<RespuestaRequest<any>> {
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${detalle.id}`, detalle);
    }

    eliminar(id: number): Observable<RespuestaRequest<any>> {
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
}
