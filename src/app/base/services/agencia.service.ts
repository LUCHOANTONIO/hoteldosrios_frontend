import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { AgenciaModel } from "../models/agencia.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class AgenciaService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/agencias";

    constructor(private http:HttpClient){

    }

    // ==============================================================================
    //LISTAR
    // ==============================================================================
    listar(): Observable<AgenciaModel[]> {
      return this.http.get<AgenciaModel[]>(this.URL_API_BASE);
    }

    listaAgenciasByRegionalId(regional_id:number): Observable<AgenciaModel[]> {
        return this.http.get<AgenciaModel[]>(`${this.URL_API_BASE}/agencias_regional/${regional_id}`,{headers:{'skip-loader':''}});
    }

    listaAgenciasDestinoByRegionalId(regional_id:number): Observable<AgenciaModel[]> {
       return this.http.get<AgenciaModel[]>(`${this.URL_API_BASE}/agencias_destino_regional/${regional_id}`, {headers:{'skip-loader':''}});
    }

    // ==============================================================================
    // CREAR
    // ==============================================================================
    crear(agencia:AgenciaModel):Observable<AgenciaModel>{
        return this.http.post<AgenciaModel>(this.URL_API_BASE,agencia);
    }

    // ==============================================================================
    // MODIFICAR
    // ==============================================================================

    modificar(agencia:AgenciaModel):Observable<AgenciaModel>{
        return this.http.put<AgenciaModel>(`${this.URL_API_BASE}/${agencia.id}`,agencia);
    }

    // ==============================================================================
    // ELIMINAR
    // ==============================================================================

    eliminar(id:number):Observable<AgenciaModel>{
        return this.http.delete<AgenciaModel>(`${this.URL_API_BASE}/${id}`);
    }
}
