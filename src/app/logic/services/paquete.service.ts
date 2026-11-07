import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import { PaqueteModel } from "../models/paquete.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn: 'root'
})
export class PaqueteService {
    private URL_API_BASE = environment.URL_API_BASE + "/paquetes";
    private cache: PaqueteModel[] | null = null;

    constructor(private http: HttpClient) { }

    listar(forzarRecarga: boolean = false): Observable<PaqueteModel[]> {
        if (this.cache && !forzarRecarga) {
            return of(this.cache);
        }
        return this.http.get<PaqueteModel[]>(this.URL_API_BASE).pipe(
            tap(res => this.cache = res)
        );
    }

    actualizarCache(lista: PaqueteModel[]) {
        this.cache = lista;
    }

    limpiarCache() {
        this.cache = null;
    }

    getById(id: number): Observable<PaqueteModel> {
        return this.http.get<PaqueteModel>(`${this.URL_API_BASE}/${id}`);
    }

    crear(paquete: PaqueteModel): Observable<RespuestaRequest<any>> {
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE, paquete).pipe(
            tap(res => {
                if (res && res.correcto && res.dato) {
                    try {
                        const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
                        if (data.paquetes) this.cache = data.paquetes;
                    } catch (_) {}
                }
            })
        );
    }

    modificar(paquete: PaqueteModel): Observable<RespuestaRequest<any>> {
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${paquete.id}`, paquete).pipe(
            tap(res => {
                if (res && res.correcto && res.dato) {
                    try {
                        const data = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
                        if (data.paquetes) this.cache = data.paquetes;
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
                        if (data.paquetes) this.cache = data.paquetes;
                    } catch (_) {}
                }
            })
        );
    }
}
