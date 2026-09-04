import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RolModel } from '../models/rol.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  //URL BACKEND
  private URL_API_BASE = environment.URL_API_BASE + "/roles";


  constructor(private http: HttpClient) { }

  // ==============================================================================
  //LISTAR
  // ==============================================================================
  listar(): Observable<RolModel[]> {
    return this.http.get<RolModel[]>(this.URL_API_BASE)
  }

  listarRolesUsuario(id: number): Observable<RolModel[]> {
    return this.http.get<RolModel[]>(`${this.URL_API_BASE}/list_rol_usuario/${id}`)
  }

  // ==============================================================================
  // CREAR
  // ==============================================================================
  crear(rol:RolModel):Observable<RolModel>{
      return this.http.post<RolModel>(this.URL_API_BASE,rol);
  }
  // ==============================================================================
  // MODIFICAR
  // ==============================================================================

  modificar(rol:RolModel):Observable<RolModel>{
      return this.http.put<RolModel>(`${this.URL_API_BASE}/${rol.id}`,rol);
  }

  // ==============================================================================
  // ELIMINAR
  // ==============================================================================

  eliminar(id:number):Observable<RolModel>{
      return this.http.delete<RolModel>(`${this.URL_API_BASE}/${id}`);
  }

}
