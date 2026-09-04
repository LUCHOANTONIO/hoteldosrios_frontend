import {HttpClient} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})

export class DocumentoService{
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/documentos";
    constructor(private http:HttpClient){
    }

    obtenerVoucherReserva(id:number): Observable<string> {        
        return this.http.get<string>(`${this.URL_API_BASE}/voucher_reserva/${id}`);
    }

    obtenerVoucherCargo(id:number): Observable<string> {        
        return this.http.get<string>(`${this.URL_API_BASE}/voucher_cargo/${id}`);
    }

    obtenerVoucherArqueo(id:number): Observable<string> {        
        return this.http.get<string>(`${this.URL_API_BASE}/voucher_arqueo/${id}`);
    }

    obtenerVoucherCotizacion(id:number): Observable<string> {        
        return this.http.get<string>(`${this.URL_API_BASE}/voucher_cotizacion/${id}`);
    }
    
}
