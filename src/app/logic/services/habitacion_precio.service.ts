import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";
import { HabitacionPrecioModel } from "../models/habitacion_precio.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class HabitacionPrecioService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/habitacion_precios";

    constructor(private http:HttpClient){

    }
    
    listar(habitacion_id:number): Observable<HabitacionPrecioModel[]> {
      return this.http.get<HabitacionPrecioModel[]>(`${this.URL_API_BASE}/${habitacion_id}`);
    }
  
    crear(habitacion_id:number,habitacion_precio_list:HabitacionPrecioModel[]):Observable<RespuestaRequest<any>>{
        return this.http.post<RespuestaRequest<any>>(this.URL_API_BASE,{habitacion_id,habitacion_precio_list});
    }

    modificar(habitacion_id:number,habitacion_precio_list:HabitacionPrecioModel[]):Observable<RespuestaRequest<any>>{
        return this.http.put<RespuestaRequest<any>>(`${this.URL_API_BASE}`,{habitacion_id,habitacion_precio_list});
    }    
    
}
