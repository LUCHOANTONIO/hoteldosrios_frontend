import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { TipoHospedajeModel } from "../models/tipo_hospedaje.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn: 'root'
})
export class TipoHospedajeService {
    private URL_API_BASE = environment.URL_API_BASE + "/tipo_hospedajes";

    constructor(private http: HttpClient) { }

    listar(): Observable<TipoHospedajeModel[]> {
        return this.http.get<TipoHospedajeModel[]>(this.URL_API_BASE);
    }

    getById(id: number): Observable<TipoHospedajeModel> {
        return this.http.get<TipoHospedajeModel>(`${this.URL_API_BASE}/${id}`);
    }

    crear(tipoHospedaje: TipoHospedajeModel): Observable<RespuestaRequest<any>> {
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE, tipoHospedaje);
    }

    modificar(tipoHospedaje: TipoHospedajeModel): Observable<RespuestaRequest<any>> {
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${tipoHospedaje.id}`, tipoHospedaje);
    }

    eliminar(id: number): Observable<RespuestaRequest<any>> {
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
}
