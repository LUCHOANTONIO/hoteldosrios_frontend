import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { ModuloModel } from "../models/modulo.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class ModuloService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/modulos";

    constructor(private http:HttpClient){

    }

    listar(): Observable<ModuloModel[]> {
      return this.http.get<ModuloModel[]>(this.URL_API_BASE);
    }

}
