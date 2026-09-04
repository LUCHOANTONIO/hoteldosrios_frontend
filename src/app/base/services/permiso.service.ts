import {HttpClient } from "@angular/common/http"
import { computed, Injectable, OnDestroy, signal } from "@angular/core";
import { Observable, Subscription} from "rxjs";
import { PermisoModel,PermisoAsignadoModel } from "../models/permiso.model";
import { environment } from "../../../environments/environment";
import { AuthService } from "./auth.service";
import { AppService } from "./local/app.service";

@Injectable({
    providedIn:'root'
})

export class PermisoService implements OnDestroy{
    //URL BACKEND
    private permisosSignal=signal<PermisoModel[]>([]);
    public readonly permisos=computed(()=>this.permisosSignal())
    private URL_API_BASE=environment.URL_API_BASE+ '/permisos';
    private onAuthChange: Subscription;
    
    constructor(private http:HttpClient,protected authService: AuthService,protected appService: AppService){
        // ==============================================================================
        //cargar permisos automaticamente luego de login
        // ==============================================================================
        this.onAuthChange = this.authService.onAuthChange.subscribe((autenticado) => {
            //console.log("autenticado:"+autenticado);
            if (autenticado) {
              this.listarPermisosPorRol(this.appService.session.ROL_ID).subscribe({
                next: (res) => {
                    this.permisosSignal.set(res);
                    //console.log(this.permisos);
                },
                error: (error) => { }
              });
            }
          });
    }
    
    // ==============================================================================
    ngOnDestroy(): void {
        this.onAuthChange.unsubscribe();
    }

    // ==============================================================================
    //LISTAR TODOS LOS PERMISOS
    // ==============================================================================

    listar(): Observable<PermisoModel[]> {
       return this.http.get<PermisoModel[]>(this.URL_API_BASE);
    }

    // ==============================================================================
    //LISTAR SOLO PERMISOS ASIGNADOS A UN  ROL
    // ==============================================================================
    listarPermisosPorRol(rol_id:number=0): Observable<PermisoModel[]> {
        return this.http.get<PermisoModel[]>(this.URL_API_BASE+"/por_rol/"+rol_id);
     }

    // ==============================================================================
    //LISTAR TODOS LOS PERMISOS ASIGNADOS Y NO ASIGNADOS POR ROL
    // ==============================================================================
    listarPermisosAsignadosPorRol(rol_id:number=0): Observable<PermisoAsignadoModel[]> {
        return this.http.get<PermisoAsignadoModel[]>(this.URL_API_BASE+"/asignados/"+rol_id);
     }

     // ==============================================================================
    // guardar asignacion de permisos a rol
    // ==============================================================================
    guardarPermisosAsignadosPorRol(rol_id:number,permisosAsignados:PermisoAsignadoModel[]):Observable<PermisoAsignadoModel[]>{
        return this.http.post<PermisoAsignadoModel[]>(this.URL_API_BASE+"/guardar_asignados/"+rol_id,permisosAsignados);
    }
    // ==============================================================================
    // CREAR
    // ==============================================================================
    crear(permiso:PermisoModel):Observable<PermisoModel>{
        return this.http.post<PermisoModel>(this.URL_API_BASE,permiso);
    }
    // ==============================================================================
    // MODIFICAR
    // ==============================================================================

    modificar(permiso:PermisoModel):Observable<PermisoModel>{
        return this.http.put<PermisoModel>(`${this.URL_API_BASE}/${permiso.id}`,permiso);
    }

    // ==============================================================================
    // ELIMINAR
    // ==============================================================================

    eliminar(id:number):Observable<PermisoModel>{
        return this.http.delete<PermisoModel>(`${this.URL_API_BASE}/${id}`);
    }

    permisoPorNroDocumento(nro_documento:string): Observable<PermisoModel> {
      return this.http.get<PermisoModel>(`${this.URL_API_BASE}/nro_documento/${nro_documento}`);
    }

}
