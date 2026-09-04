import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { TarifaModel } from "../models/tarifa.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn: 'root'
})
export class TarifaService {
    private URL_API_BASE = environment.URL_API_BASE + "/tarifas";

    constructor(private http: HttpClient) { }

    listar(): Observable<TarifaModel[]> {
        return this.http.get<TarifaModel[]>(this.URL_API_BASE);
    }

    getById(id: number): Observable<TarifaModel> {
        return this.http.get<TarifaModel>(`${this.URL_API_BASE}/${id}`);
    }

    crear(tarifa: TarifaModel): Observable<RespuestaRequest<any>> {
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE, tarifa);
    }

    modificar(tarifa: TarifaModel): Observable<RespuestaRequest<any>> {
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${tarifa.id}`, tarifa);
    }

    eliminar(id: number): Observable<RespuestaRequest<any>> {
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
}
