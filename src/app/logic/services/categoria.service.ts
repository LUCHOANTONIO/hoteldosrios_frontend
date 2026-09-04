import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { CategoriaModel } from "../models/categoria.model";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn:'root'
})

export class CategoriaService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/categorias";
    constructor(private http:HttpClient){
    }

    listar(): Observable<CategoriaModel[]> {
       return this.http.get<CategoriaModel[]>(this.URL_API_BASE);
    }

    crear(categoria:CategoriaModel):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,categoria);
    }

    modificar(categoria:CategoriaModel):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}/${categoria.id}`,categoria);
    }
    
    eliminar(id:number):Observable<RespuestaRequest<any>>{
        return this.http.delete<RespuestaRequest<any>>(`${this.URL_API_BASE}/${id}`);
    }
   
}
