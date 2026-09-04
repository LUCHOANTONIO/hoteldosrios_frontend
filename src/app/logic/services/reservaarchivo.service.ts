import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ReservaArchivoModel } from "../models/reservaarchivo.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn: 'root'
})

export class ReservaArchivoService { 
    private URL_API_BASE = environment.URL_API_BASE + '/reservaarchivos';
    constructor(private http: HttpClient) {
    }

    listar(reserva_id:number=0): Observable<ReservaArchivoModel[]> {
        return this.http.get<ReservaArchivoModel[]>(this.URL_API_BASE+"?reserva_id="+reserva_id);
    }   
   
    crear(reservaArchivo: ReservaArchivoModel, archivo: File): Observable<{reservaArchivo:ReservaArchivoModel,reservaArchivos:ReservaArchivoModel[]}> {                
        const fd = new FormData(); //para subir archivos se requiere de form-data. No se puede pasar como json.       
        const reservaArchivoJsonString = JSON.stringify(reservaArchivo);       
        fd.append("data_json",reservaArchivoJsonString);
        fd.append("archivo", archivo,reservaArchivo.nombre_archivo);// adicionando archivo a formdata. elnombre de archivo ya tiene la extension 
        return this.http.post<{reservaArchivo:ReservaArchivoModel,reservaArchivos:ReservaArchivoModel[]}>(this.URL_API_BASE, fd);
    }

    modificar(reservaArchivo: ReservaArchivoModel,archivo: File): Observable<{reservaArchivo:ReservaArchivoModel,reservaArchivos:ReservaArchivoModel[]}> {                       
        const fd = new FormData();
        const reservaArchivoJsonString = JSON.stringify(reservaArchivo);
        fd.append("data_json",reservaArchivoJsonString);
        if(archivo!=null)
            fd.append("archivo", archivo,reservaArchivo.nombre_archivo);
        return this.http.post<{reservaArchivo:ReservaArchivoModel,reservaArchivos:ReservaArchivoModel[]}>(`${this.URL_API_BASE}/${reservaArchivo.id}`, fd);
    }

    eliminar(id: number): Observable<ReservaArchivoModel> {
        return this.http.delete<ReservaArchivoModel>(`${this.URL_API_BASE}/${id}`);
    }
        
    reservaArchivoPorNroDocumento(nro_documento: string): Observable<ReservaArchivoModel> {
        return this.http.get<ReservaArchivoModel>(`${this.URL_API_BASE}/nro_documento/${nro_documento}`);
    }
  
    cargarImagenBlobDesdeURL(nombreArchivo: string): Observable<Blob> {
        const headers = new HttpHeaders({
            'skip-loader': '',
          });
        return this.http.get<Blob>(`${this.URL_API_BASE}/images/${nombreArchivo}`,{headers:headers,responseType: 'blob' as 'json'});
    }

}
