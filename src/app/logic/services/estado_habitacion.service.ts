import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { EstadoHabitacionModel } from "../models/estado_habitacion.model";


@Injectable({
    providedIn:'root'
})

export class EstadoHabitacionService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/estado_habitaciones";

    constructor(private http:HttpClient){

    }

    listar(): Observable<EstadoHabitacionModel[]> {
        return this.http.get<EstadoHabitacionModel[]>(this.URL_API_BASE);
    }

}
