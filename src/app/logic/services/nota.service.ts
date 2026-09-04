import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { NotaModel } from "../models/nota.model";
import { environment } from "../../../environments/environment";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";


@Injectable({
    providedIn:'root'
})

export class NotaService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/notas";

    constructor(private http:HttpClient){

    }

    listar(id:number): Observable<NotaModel[]> {
        return this.http.get<NotaModel[]>(`${this.URL_API_BASE}/${id}`);
    }

    crear(Nota:NotaModel):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,Nota);
    }

    modificar(Nota:NotaModel):Observable<NotaModel>{
        return this.http.put<NotaModel>(`${this.URL_API_BASE}/${Nota.id}`,Nota);
    }

    eliminar(id:number):Observable<NotaModel>{
        return this.http.delete<NotaModel>(`${this.URL_API_BASE}/${id}`);
    }
}
