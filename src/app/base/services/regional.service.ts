import {HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { RegionalModel } from "../models/regional.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class RegionalService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/regionales";

    constructor(private http:HttpClient){}

    // ==============================================================================
    //LISTAR
    // ==============================================================================

    listar(): Observable<RegionalModel[]> {
      return this.http.get<RegionalModel[]>(this.URL_API_BASE);
    }

    // ==============================================================================
    // CREAR
    // ==============================================================================
    crear(regional:RegionalModel):Observable<{ regional: RegionalModel, regionales: RegionalModel[] }>{
        return this.http.post<{ regional: RegionalModel, regionales: RegionalModel[] }>(this.URL_API_BASE,regional);
    }
    // ==============================================================================
    // MODIFICAR
    // ==============================================================================

    modificar(regional:RegionalModel):Observable<{ regional: RegionalModel, regionales: RegionalModel[] }>{
        return this.http.put<{ regional: RegionalModel, regionales: RegionalModel[] }>(`${this.URL_API_BASE}/${regional.id}`,regional);
    }

    // ==============================================================================
    // ELIMINAR
    // ==============================================================================

    eliminar(id:number):Observable<RegionalModel>{
        return this.http.delete<RegionalModel>(`${this.URL_API_BASE}/${id}`);
    }

}
