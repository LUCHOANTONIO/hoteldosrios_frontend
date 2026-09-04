import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { TipoHuespedModel } from "../models/tipo_huesped.model";

@Injectable({
    providedIn:'root'
})

export class TipoHuespedService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/tipo_huesped";
    constructor(private http:HttpClient){
    }

    listar(): Observable<TipoHuespedModel[]> {
       return this.http.get<TipoHuespedModel[]>(this.URL_API_BASE);
    }
   
}
