import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import { ServicioModel } from "../models/servicio.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn: 'root'
})
export class ServicioService {
    private URL_API_BASE = environment.URL_API_BASE + "/servicios";
    private cache: ServicioModel[] | null = null;

    constructor(private http: HttpClient) { }

    listar(forzarRecarga: boolean = false): Observable<ServicioModel[]> {
        if (this.cache && !forzarRecarga) {
            return of(this.cache);
        }
        return this.http.get<ServicioModel[]>(this.URL_API_BASE).pipe(
            tap(res => this.cache = res)
        );
    }

    actualizarCache(lista: ServicioModel[]) {
        this.cache = lista;
    }

    limpiarCache() {
        this.cache = null;
    }

    getById(id: number): Observable<ServicioModel> {
        return this.http.get<ServicioModel>(`${this.URL_API_BASE}/${id}`);
    }

    crear(servicio: ServicioModel): Observable<RespuestaRequest<any>> {
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE, servicio).pipe(
            tap(res => {
                if (res && res.correcto && res.dato) {
                    try {
                        const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
                        if (data.servicios) this.cache = data.servicios;
                    } catch (_) {}
                }
            })
        );
    }

    modificar(servicio: ServicioModel): Observable<RespuestaRequest<any>> {
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${servicio.id}`, servicio).pipe(
            tap(res => {
                if (res && res.correcto && res.dato) {
                    try {
                        const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
                        if (data.servicios) this.cache = data.servicios;
                    } catch (_) {}
                }
            })
        );
    }

    eliminar(id: number): Observable<RespuestaRequest<any>> {
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`).pipe(
            tap(res => {
                if (res && res.correcto && res.dato) {
                    try {
                        const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
                        if (data.servicios) this.cache = data.servicios;
                    } catch (_) {}
                }
            })
        );
    }
}
