import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { InventarioModel } from "../models/inventario.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})
export class InventarioService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/inventarios";

    constructor(private http:HttpClient){

    }
    
    listar(): Observable<InventarioModel[]> {
       return this.http.get<InventarioModel[]>(this.URL_API_BASE);
    }
  
    crear(Inventario:InventarioModel):Observable<{inventario:InventarioModel,inventarios:InventarioModel[]}>{
       return this.http.post<{inventario:InventarioModel,inventarios:InventarioModel[]}>(this.URL_API_BASE,Inventario);
    }

    modificar(Inventario:InventarioModel):Observable<{inventario:InventarioModel,inventarios:InventarioModel[]}>{
       return this.http.put<{inventario:InventarioModel,inventarios:InventarioModel[]}>(`${this.URL_API_BASE}/${Inventario.id}`,Inventario);
    }
  
    eliminar(id:number):Observable<{inventario:InventarioModel,inventarios:InventarioModel[]}>{
       return this.http.delete<{inventario:InventarioModel,inventarios:InventarioModel[]}>(`${this.URL_API_BASE}/${id}`);
    }
}
