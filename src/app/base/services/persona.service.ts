import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { PersonaModel } from "../models/persona.model";
import { environment } from "../../../environments/environment";


@Injectable({
    providedIn:'root'
})

export class PersonaService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/personas";
    constructor(private http:HttpClient){
    }

    // ==============================================================================
    //LISTAR
    // ==============================================================================

    listar(): Observable<PersonaModel[]> {
       return this.http.get<PersonaModel[]>(this.URL_API_BASE);
    }

    // ==============================================================================
    // CREAR
    // ==============================================================================
    crear(persona:PersonaModel):Observable<PersonaModel>{
        return this.http.post<PersonaModel>(this.URL_API_BASE,persona);
    }
    // ==============================================================================
    // MODIFICAR
    // ==============================================================================

    modificar(persona:PersonaModel):Observable<PersonaModel>{
        return this.http.put<PersonaModel>(`${this.URL_API_BASE}/${persona.id}`,persona);
    }

    // ==============================================================================
    // ELIMINAR
    // ==============================================================================

    eliminar(id:string):Observable<PersonaModel>{
        return this.http.delete<PersonaModel>(`${this.URL_API_BASE}/${id}`);
    }

    personaPorNroDocumento(nro_documento:string): Observable<PersonaModel> {
        return this.http.get<PersonaModel>(`${this.URL_API_BASE}/nro_documento/${nro_documento}`);
    }

}
