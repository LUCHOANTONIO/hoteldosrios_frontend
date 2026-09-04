
import {HttpClient, HttpParams} from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { environment } from "../../../environments/environment";
import { RespuestaRequest } from "../../base/models/local/respuesta.request.model";

@Injectable({
    providedIn:'root'
})

export class ReporteService{
   
   private URL_API_BASE = environment.URL_API_BASE + "/reportes";

   constructor(private http:HttpClient){

   }
    
   //BEGIN:Reporte Huesped
   list_huesped(habitacion_id,fecha_ini,fecha_fin): Observable<RespuestaRequest<any>> {
      let params = new HttpParams()
      .set('fecha_ini', fecha_ini)
      .set('fecha_fin', fecha_fin)
      .set('habitacion_id', habitacion_id)  
      return this.http.get<RespuestaRequest<any>>(`${this.URL_API_BASE}/list_huesped`,{ params });
   }

   exportar_list_huesped(habitacion_id,fecha_ini,fecha_fin): Observable<String> {
     let params = new HttpParams()
      .set('fecha_ini', fecha_ini)
      .set('fecha_fin', fecha_fin)
      .set('habitacion_id', habitacion_id)
      return this.http.get<String>(`${this.URL_API_BASE}/export_list_huesped`,{ params });
   }
   //END:Reporte Huesped  

   //BEGIN:Reporte Producto
   list_producto(): Observable<any[]> {    
      return this.http.get<any[]>(`${this.URL_API_BASE}/list_producto`);
   }

   exportar_list_producto(): Observable<String> {    
      return this.http.get<String>(`${this.URL_API_BASE}/export_list_producto`);
   }
   //END:Reporte Producto

   //BEGIN:Reporte Ingreso
   list_ingreso(usuario_id:number,forma_pago_id:number,habitacion_id:number,agencia_id:number,fecha_ini:string,fecha_fin:string): Observable<RespuestaRequest<any>> {    
      let params = new HttpParams()
      .set('usuario_id', usuario_id)
      .set('forma_pago_id', forma_pago_id)
      .set('habitacion_id', habitacion_id) 
      .set('agencia_id', agencia_id) 
      .set('fecha_ini', fecha_ini)
      .set('fecha_fin', fecha_fin)
      return this.http.get<RespuestaRequest<any>>(`${this.URL_API_BASE}/list_ingreso`,{ params });
   }

   exportar_list_ingreso(usuario_id:number,forma_pago_id:number,habitacion_id:number,agencia_id:number,fecha_ini:string,fecha_fin:string): Observable<String> { 
      let params = new HttpParams()
      .set('usuario_id', usuario_id)
      .set('forma_pago_id', forma_pago_id)
      .set('habitacion_id', habitacion_id) 
      .set('agencia_id', agencia_id) 
      .set('fecha_ini', fecha_ini)
      .set('fecha_fin', fecha_fin) 
      return this.http.get<String>(`${this.URL_API_BASE}/export_list_ingreso`,{ params });
   }
   //END:Reporte Ingreso

   //BEGIN:Reporte Egreso
   list_egreso(usuario_id:number,forma_pago_id:number,agencia_id:number,fecha_ini:string,fecha_fin:string): Observable<RespuestaRequest<any>> {    
      let params = new HttpParams()
      .set('usuario_id', usuario_id)
      .set('forma_pago_id',forma_pago_id)    
      .set('agencia_id', agencia_id)        
      .set('fecha_ini', fecha_ini)
      .set('fecha_fin', fecha_fin)
      return this.http.get<RespuestaRequest<any>>(`${this.URL_API_BASE}/list_egreso`,{ params });
   }

   exportar_list_egreso(usuario_id:number,forma_pago_id:number,agencia_id:number,fecha_ini:string,fecha_fin:string): Observable<String> { 
      let params = new HttpParams()
      .set('usuario_id', usuario_id)
      .set('forma_pago_id',forma_pago_id)    
      .set('agencia_id', agencia_id)       
      .set('fecha_ini', fecha_ini)
      .set('fecha_fin', fecha_fin) 
      return this.http.get<String>(`${this.URL_API_BASE}/export_list_egreso`,{ params });
   }
   //END:Reporte Egreso

   //BEGIN:Reporte Caja
   list_caja(usuario_id:number,fecha_ini:string,fecha_fin:string): Observable<RespuestaRequest<any>> {      
      let params = new HttpParams()
      .set('usuario_id', usuario_id)       
      .set('fecha_ini', fecha_ini)
      .set('fecha_fin', fecha_fin)
      return this.http.get<RespuestaRequest<any>>(`${this.URL_API_BASE}/list_caja`,{ params });
   }  
   //END:Reporte Caja  

   //BEGIN:Reporte Ingreso Mensual
   ingreso_mensual(gestion: number, agencia_id: number): Observable<RespuestaRequest<any>> {        
      return this.http.post<RespuestaRequest<any>>(`${this.URL_API_BASE}/reporte_ingreso_mensual`, { gestion:gestion, agencia_id:agencia_id });
   }
   export_ingreso_mensual(gestion: number, agencia_id: number): Observable<string> {        
      return this.http.post<string>(`${this.URL_API_BASE}/export_ingreso_mensual`, { gestion:gestion, agencia_id:agencia_id });
   }
   export_ingreso_mensual_excel(gestion: number, agencia_id: number): Observable<string> {        
      return this.http.post<string>(`${this.URL_API_BASE}/export_ingreso_mensual_excel`, { gestion:gestion, agencia_id:agencia_id });
   } 
   //END:Reporte Ingreso Mensual

   //BEGIN:Reporte Ingreso por Habitacion
   ingreso_habitacion(gestion: number, agencia_id: number, habitacion_id: number): Observable<RespuestaRequest<any>> {            
      return this.http.post<RespuestaRequest<any>>(`${this.URL_API_BASE}/reporte_ingreso_habitacion`, { gestion:gestion, agencia_id:agencia_id, habitacion_id:habitacion_id });
   }  
   export_ingreso_habitacion(gestion: number, agencia_id: number, habitacion_id: number): Observable<string> {        
      return this.http.post<string>(`${this.URL_API_BASE}/export_ingreso_habitacion`, { gestion:gestion, agencia_id:agencia_id, habitacion_id:habitacion_id });
   }  
   export_ingreso_habitacion_excel(gestion: number, agencia_id: number, habitacion_id: number): Observable<string> {        
      return this.http.post<string>(`${this.URL_API_BASE}/export_ingreso_habitacion_excel`, { gestion:gestion, agencia_id:agencia_id, habitacion_id:habitacion_id });
   } 
   //END:Reporte Ingreso por Habitacion

   //BEGIN:Reporte Ingreso por forma de pago
   ingreso_forma_pago(gestion: number, agencia_id: number, forma_pago_id: number): Observable<RespuestaRequest<any>> {            
      return this.http.post<RespuestaRequest<any>>(`${this.URL_API_BASE}/reporte_ingreso_forma_pago`, { gestion:gestion, agencia_id:agencia_id, forma_pago_id:forma_pago_id });
   }
   export_ingreso_forma_pago(gestion: number, agencia_id: number, forma_pago_id: number): Observable<string> {        
      return this.http.post<string>(`${this.URL_API_BASE}/export_ingreso_forma_pago`, { gestion:gestion, agencia_id:agencia_id, forma_pago_id:forma_pago_id });
   }
   export_ingreso_forma_pago_excel(gestion: number, agencia_id: number, forma_pago_id: number): Observable<string> {        
      return this.http.post<string>(`${this.URL_API_BASE}/export_ingreso_forma_pago_excel`, { gestion:gestion, agencia_id:agencia_id, forma_pago_id:forma_pago_id });
   }
   //END:Reporte Ingreso por forma de pago

   //BEGIN:Reporte Egreso cuenta
   egreso_cuenta(gestion: number, agencia_id: number, cuenta_id: number): Observable<RespuestaRequest<any>> {            
      return this.http.post<RespuestaRequest<any>>(`${this.URL_API_BASE}/reporte_egreso_cuenta`, { gestion:gestion, agencia_id:agencia_id, cuenta_id:cuenta_id });
   }
   export_egreso_cuenta(gestion: number, agencia_id: number, cuenta_id: number): Observable<string> {        
      return this.http.post<string>(`${this.URL_API_BASE}/export_egreso_cuenta`, { gestion:gestion, agencia_id:agencia_id, cuenta_id:cuenta_id });
   }
   export_egreso_cuenta_excel(gestion: number, agencia_id: number, cuenta_id: number): Observable<string> {        
      return this.http.post<string>(`${this.URL_API_BASE}/export_egreso_cuenta_excel`, { gestion:gestion, agencia_id:agencia_id, cuenta_id:cuenta_id });
   }
   //END:Reporte Egreso cuenta


   //BEGIN:Reporte Siat
   list_siat(fecha_ini:string,fecha_fin:string): Observable<RespuestaRequest<any>> {        
      return this.http.post<RespuestaRequest<any>>(`${this.URL_API_BASE}/reporte_siat`, { fecha_ini:fecha_ini, fecha_fin:fecha_fin });
   }  
   export_list_siat_excel(fecha_ini:string,fecha_fin:string): Observable<string> {        
      return this.http.post<string>(`${this.URL_API_BASE}/export_reporte_siat_excel`, { fecha_ini:fecha_ini, fecha_fin:fecha_fin });
   } 
   //END:Reporte Siat

   //BEGIN:Reporte Cuentas por Cobrar
   list_cuentas_cobrar(fecha_ini:string,fecha_fin:string): Observable<RespuestaRequest<any>> {        
      return this.http.post<RespuestaRequest<any>>(`${this.URL_API_BASE}/cuentas_cobrar`, { fecha_ini:fecha_ini, fecha_fin:fecha_fin });
   }  
   exportar_list_cuentas_cobrar(fecha_ini:string,fecha_fin:string): Observable<RespuestaRequest<any>> {        
      return this.http.post<RespuestaRequest<any>>(`${this.URL_API_BASE}/cuentas_cobrar_pdf`, { fecha_ini:fecha_ini, fecha_fin:fecha_fin });
   } 
   //END:Reporte Cuentas por Cobrar

}
   