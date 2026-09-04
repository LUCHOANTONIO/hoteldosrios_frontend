import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { TipoPermisoModel } from "../models/tipopermiso.model";





@Injectable({
    providedIn:'root'
})

export class TipoPermisoService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/tipo_permisos";

    constructor(private http:HttpClient){

    }

    listar(): Observable<TipoPermisoModel[]> {
      return this.http.get<TipoPermisoModel[]>(this.URL_API_BASE);
    }

}
