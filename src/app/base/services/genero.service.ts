import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { GeneroModel } from "../models/genero.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class GeneroService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/generos";

    constructor(private http:HttpClient){
    }

    listar(): Observable<GeneroModel[]> {
      return this.http.get<GeneroModel[]>(this.URL_API_BASE);
    }
}
