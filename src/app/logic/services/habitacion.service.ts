import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { HabitacionModel } from "../models/habitacion.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class HabitacionService{
   
    private URL_API_BASE = environment.URL_API_BASE + "/habitaciones";

    constructor(private http:HttpClient){

    }
    
    listar(): Observable<HabitacionModel[]> {
      return this.http.get<HabitacionModel[]>(this.URL_API_BASE);
    }

    ocupabilidad(): Observable<any[]> {
      return this.http.get<any[]>(`${this.URL_API_BASE}/ocupabilidad`);
    }

    disponibilidad(fecha: Date): Observable<any[]> {
       return this.http.post<any[]>(`${this.URL_API_BASE}/disponibilidad`,{fecha:fecha});
    }
  
    crear(Habitacion:HabitacionModel):Observable<HabitacionModel>{
        return this.http.post<HabitacionModel>(this.URL_API_BASE,Habitacion);
    }

    modificar(Habitacion:HabitacionModel):Observable<HabitacionModel>{
        return this.http.put<HabitacionModel>(`${this.URL_API_BASE}/${Habitacion.id}`,Habitacion);
    }
  
    eliminar(id:number):Observable<HabitacionModel>{
        return this.http.delete<HabitacionModel>(`${this.URL_API_BASE}/${id}`);
    }
}
