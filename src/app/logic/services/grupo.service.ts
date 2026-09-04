import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { GrupoModel } from "../models/grupo.model";
import { environment } from "../../../environments/environment";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";


@Injectable({
    providedIn:'root'
})

export class GrupoService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/grupos";

    constructor(private http:HttpClient){

    }

    listar(selectedItems:any[]): Observable<RespuestaRequest<any>> {       
       return this.http.post<RespuestaRequest<any>>(`${this.URL_API_BASE}/list`,{ selectedItems });
    }

    crear(grupo:GrupoModel):Observable<RespuestaRequest<any>>{           
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,grupo);
    }

    modificar(grupo:GrupoModel):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${grupo.id}`,grupo);
    }

    eliminar(id:number):Observable<RespuestaRequest<any>>{
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
}
