import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { CiudadModel } from "../models/ciudad.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class CiudadService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/ciudades";

    constructor(private http:HttpClient){

    }

    listar(): Observable<CiudadModel[]> {
      return this.http.get<CiudadModel[]>(this.URL_API_BASE);
    }

}
