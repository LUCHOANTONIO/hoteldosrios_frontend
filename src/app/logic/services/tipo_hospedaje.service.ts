import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import { TipoHospedajeModel } from "../models/tipo_hospedaje.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn: 'root'
})
export class TipoHospedajeService {
    private URL_API_BASE = environment.URL_API_BASE + "/tipo_hospedajes";
    private cache: TipoHospedajeModel[] | null = null;

    constructor(private http: HttpClient) { }

    listar(forzarRecarga: boolean = false): Observable<TipoHospedajeModel[]> {
        if (this.cache && !forzarRecarga) {
            return of(this.cache);
        }
        return this.http.get<TipoHospedajeModel[]>(this.URL_API_BASE).pipe(
            tap(res => this.cache = res)
        );
    }

    actualizarCache(lista: TipoHospedajeModel[]) {
        this.cache = lista;
    }

    limpiarCache() {
        this.cache = null;
    }

    getById(id: number): Observable<TipoHospedajeModel> {
        return this.http.get<TipoHospedajeModel>(`${this.URL_API_BASE}/${id}`);
    }

    crear(tipoHospedaje: TipoHospedajeModel): Observable<RespuestaRequest<any>> {
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE, tipoHospedaje).pipe(
            tap(res => {
                if (res && res.correcto && res.dato) {
                    try {
                        const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
                        if (data.tipo_hospedajes) this.cache = data.tipo_hospedajes;
                    } catch (_) {}
                }
            })
        );
    }

    modificar(tipoHospedaje: TipoHospedajeModel): Observable<RespuestaRequest<any>> {
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${tipoHospedaje.id}`, tipoHospedaje).pipe(
            tap(res => {
                if (res && res.correcto && res.dato) {
                    try {
                        const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
                        if (data.tipo_hospedajes) this.cache = data.tipo_hospedajes;
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
                        if (data.tipo_hospedajes) this.cache = data.tipo_hospedajes;
                    } catch (_) {}
                }
            })
        );
    }
}
