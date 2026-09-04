import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { EstadoCivilModel } from "../models/estadocivil.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class EstadoCivilService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/estado_civil";

    constructor(private http:HttpClient){

    }

    listar(): Observable<EstadoCivilModel[]> {
      return this.http.get<EstadoCivilModel[]>(this.URL_API_BASE);
    }
}
