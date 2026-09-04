import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { BitacoraModel } from "../models/bitacora.model";

@Injectable({
    providedIn:'root'
})

export class BitacoraService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/bitacoras";
    constructor(private http:HttpClient){
    }

    listar(id:number): Observable<BitacoraModel[]> {
       return this.http.get<BitacoraModel[]>(`${this.URL_API_BASE}/${id}`);
    }
   
}
