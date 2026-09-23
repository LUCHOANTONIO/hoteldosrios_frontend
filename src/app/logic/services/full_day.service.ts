import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { FullDayModel } from "../models/full_day.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn: 'root'
})
export class FullDayService {
    private URL_API_BASE = environment.URL_API_BASE + "/full_days";

    constructor(private http: HttpClient) { }

    listar(fecha_ini?: string, fecha_fin?: string): Observable<RespuestaRequest<any>> {
        let params = new HttpParams();
        if (fecha_ini) params = params.set('fecha_ini', fecha_ini);
        if (fecha_fin) params = params.set('fecha_fin', fecha_fin);
        return this.http.get<RespuestaRequest<any>>(this.URL_API_BASE, { params });
    }

    mostrar(id: number): Observable<{ reserva: FullDayModel; balance: any }> {
        return this.http.get<{ reserva: FullDayModel; balance: any }>(`${this.URL_API_BASE}/${id}`);
    }

    crear(fullDay: any): Observable<RespuestaRequest<any>> {
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE, fullDay);
    }

    modificar(fullDay: any): Observable<RespuestaRequest<any>> {
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${fullDay.id}`, fullDay);
    }

    eliminar(id: number): Observable<RespuestaRequest<any>> {
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }

    cambiarEstado(data: { reserva_id: number; estado_reserva_id: number }): Observable<RespuestaRequest<any>> {
        return this.http.post<RespuestaRequest<any>>(`${this.URL_API_BASE}/estado`, data);
    }

    obtenerVoucher(id: number): Observable<any> {
        return this.http.get<any>(`${this.URL_API_BASE}/voucher/${id}`);
    }
}
