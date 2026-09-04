import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { TipoArchivoModel } from "../models/tipo_archivo.model";

@Injectable({
    providedIn:'root'
})

export class TipoArchivoService{  
    private URL_API_BASE = environment.URL_API_BASE + "/tipo_archivo";
    
    constructor(private http:HttpClient){
    }

    listar(): Observable<TipoArchivoModel[]> {
       return this.http.get<TipoArchivoModel[]>(this.URL_API_BASE);
    }

}
