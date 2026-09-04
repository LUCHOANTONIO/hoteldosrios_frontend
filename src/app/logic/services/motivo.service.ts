import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { MotivoModel } from "../models/motivo.model";

@Injectable({
    providedIn:'root'
})

export class MotivoService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/motivos";
    constructor(private http:HttpClient){
    }

    listar(): Observable<MotivoModel[]> {
       return this.http.get<MotivoModel[]>(this.URL_API_BASE);
    }
   
}
