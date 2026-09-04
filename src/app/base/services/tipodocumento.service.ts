import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { TipoDocumentoModel } from "../models/tipodocumento.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class TipoDocumentoService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/tipo_documentos";

    constructor(private http:HttpClient){

    }

    listar(): Observable<TipoDocumentoModel[]> {
      return this.http.get<TipoDocumentoModel[]>(this.URL_API_BASE);
    }
}
