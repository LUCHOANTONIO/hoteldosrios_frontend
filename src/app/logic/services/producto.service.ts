import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { ProductoModel } from "../models/producto.model";
import { environment } from "../../../environments/environment";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn:'root'
})

export class ProductoService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/productos";

    constructor(private http:HttpClient){

    }
    
    listar(): Observable<ProductoModel[]> {
       return this.http.get<ProductoModel[]>(this.URL_API_BASE);
    }
  
    crear(Producto:ProductoModel):Observable<{producto:ProductoModel,productos:ProductoModel[]}>{
       return this.http.post<{producto:ProductoModel,productos:ProductoModel[]}>(this.URL_API_BASE,Producto);
    }

    modificar(Producto:ProductoModel):Observable<{producto:ProductoModel,productos:ProductoModel[]}>{
       return this.http.put<{producto:ProductoModel,productos:ProductoModel[]}>(`${this.URL_API_BASE}/${Producto.id}`,Producto);
    }
  
    eliminar(id:number):Observable<{producto:ProductoModel,productos:ProductoModel[]}>{
       return this.http.delete<{producto:ProductoModel,productos:ProductoModel[]}>(`${this.URL_API_BASE}/${id}`);
    }
    
}
