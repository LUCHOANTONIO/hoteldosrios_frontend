import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { TipoEfectivoModel } from "../models/tipo_efectivo.model";

@Injectable({
    providedIn:'root'
})

export class TipoEfectivoService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/tipo_efectivo";
    constructor(private http:HttpClient){
    }

    listar(): Observable<TipoEfectivoModel[]> {
       return this.http.get<TipoEfectivoModel[]>(this.URL_API_BASE);
    }
   
}
