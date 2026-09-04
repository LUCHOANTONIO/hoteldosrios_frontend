import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { PaqueteModel } from "../models/paquete.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn: 'root'
})
export class PaqueteService {
    private URL_API_BASE = environment.URL_API_BASE + "/paquetes";

    constructor(private http: HttpClient) { }

    listar(): Observable<PaqueteModel[]> {
        return this.http.get<PaqueteModel[]>(this.URL_API_BASE);
    }

    getById(id: number): Observable<PaqueteModel> {
        return this.http.get<PaqueteModel>(`${this.URL_API_BASE}/${id}`);
    }

    crear(paquete: PaqueteModel): Observable<RespuestaRequest<any>> {
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE, paquete);
    }

    modificar(paquete: PaqueteModel): Observable<RespuestaRequest<any>> {
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${paquete.id}`, paquete);
    }

    eliminar(id: number): Observable<RespuestaRequest<any>> {
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
}
