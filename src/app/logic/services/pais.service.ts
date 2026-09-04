import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { PaisModel } from "../models/pais.model";

@Injectable({
    providedIn:'root'
})

export class PaisService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/paises";
    constructor(private http:HttpClient){
    }

    listar(): Observable<PaisModel[]> {
       return this.http.get<PaisModel[]>(this.URL_API_BASE);
    }
   
}
