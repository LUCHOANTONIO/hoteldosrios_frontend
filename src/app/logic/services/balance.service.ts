import {HttpClient} from "@angular/common/http"
import { Injectable, signal } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { BalanceModel } from "../models/balance.model";

@Injectable({
    providedIn:'root'
})

export class BalanceService{   
    balance = signal<BalanceModel>(new BalanceModel());
    private URL_API_BASE = environment.URL_API_BASE + "/balances";  //URL BACKEND
    constructor(private http:HttpClient){

    }

    getBalance(reserva_id:number): Observable<BalanceModel> {
       return this.http.get<BalanceModel>(`${this.URL_API_BASE}/${reserva_id}`);
    }
}
