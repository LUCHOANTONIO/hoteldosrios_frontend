import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { TipoCuentaModel } from "../models/tipo_cuenta.model";

@Injectable({
    providedIn:'root'
})

export class TipoCuentaService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/tipo_cuentas";
    constructor(private http:HttpClient){
    }

    listar(): Observable<TipoCuentaModel[]> {
       return this.http.get<TipoCuentaModel[]>(this.URL_API_BASE);
    }    
   
}
