import {HttpClient} from "@angular/common/http"
import { Injectable, signal } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { DashboardRemindersModel } from "../models/dashboard_reminders.model";

@Injectable({
    providedIn:'root'
})

export class DashboardService{       
    private URL_API_BASE = environment.URL_API_BASE + "/dashboard";  //URL BACKEND
    constructor(private http:HttpClient){

    }

    getStats(): Observable<any> {
       return this.http.get<any>(`${this.URL_API_BASE}/stats`);
    }

    getRevenue(): Observable<any> {
       return this.http.get<any>(`${this.URL_API_BASE}/revenue`);
    }

    getAnalytics(): Observable<any> {
       return this.http.get<any>(`${this.URL_API_BASE}/analytics`);
    }

    getReminders(): Observable<DashboardRemindersModel[]> {
       return this.http.get<DashboardRemindersModel[]>(`${this.URL_API_BASE}/reminders`);
    }
    
}
