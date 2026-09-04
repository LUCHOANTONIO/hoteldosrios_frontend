import {HttpClient} from "@angular/common/http"
import { Injectable, signal } from "@angular/core";
import { Observable} from "rxjs";

@Injectable({
    providedIn:'root'
})

export class  ComunicacionService{   
   executeActionReserva = signal<boolean>(false);//Usado para verificar si actualiza o no en item       
   loadBitacoraSignal = signal({ reserva_id: null, trigger: 0 }); //Se uso trigger para hacer que cada envio sea un nuevo valor, porque signal no ejecuta cuando es el mismo valor mas de un vez       
}
