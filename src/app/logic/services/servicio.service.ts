import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ServicioModel } from "../models/servicio.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn: 'root'
})
export class ServicioService {
    private URL_API_BASE = environment.URL_API_BASE + "/servicios";

    constructor(private http: HttpClient) { }

    listar(): Observable<ServicioModel[]> {
        return this.http.get<ServicioModel[]>(this.URL_API_BASE);
    }

    getById(id: number): Observable<ServicioModel> {
        return this.http.get<ServicioModel>(`${this.URL_API_BASE}/${id}`);
    }

    crear(servicio: ServicioModel): Observable<RespuestaRequest<any>> {
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE, servicio);
    }

    modificar(servicio: ServicioModel): Observable<RespuestaRequest<any>> {
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${servicio.id}`, servicio);
    }

    eliminar(id: number): Observable<RespuestaRequest<any>> {
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
}
