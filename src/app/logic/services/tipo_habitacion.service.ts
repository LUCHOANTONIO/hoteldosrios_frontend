import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { TipoHabitacionModel } from "../models/tipo_habitacion.model";
import { environment } from "../../../environments/environment";


@Injectable({
    providedIn:'root'
})

export class TipoHabitacionService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/tipo_habitaciones";

    constructor(private http:HttpClient){

    }

    listar(): Observable<TipoHabitacionModel[]> {
        return this.http.get<TipoHabitacionModel[]>(this.URL_API_BASE);
    }

    crear(TipoHabitacion:TipoHabitacionModel):Observable<TipoHabitacionModel>{
        return this.http.post<TipoHabitacionModel>(this.URL_API_BASE,TipoHabitacion);
    }

    modificar(TipoHabitacion:TipoHabitacionModel):Observable<TipoHabitacionModel>{
        return this.http.put<TipoHabitacionModel>(`${this.URL_API_BASE}/${TipoHabitacion.id}`,TipoHabitacion);
    }

    eliminar(id:number):Observable<TipoHabitacionModel>{
        return this.http.delete<TipoHabitacionModel>(`${this.URL_API_BASE}/${id}`);
    }
}
