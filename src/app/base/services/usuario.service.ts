import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioModel } from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  //URL BACKEND
  private URL_API_BASE = environment.URL_API_BASE + "/usuarios";


  constructor(private http: HttpClient) { }

  // ==============================================================================
  //LISTAR
  // ==============================================================================
  listar(): Observable<UsuarioModel[]> {
    return this.http.get<UsuarioModel[]>(this.URL_API_BASE)
  }

  // ==============================================================================
  // CREAR
  // ==============================================================================
  crear(usuario: UsuarioModel): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(this.URL_API_BASE, usuario);
  }
  // ==============================================================================
  // MODIFICAR
  // ==============================================================================

  modificar(usuario: UsuarioModel): Observable<UsuarioModel> {
    return this.http.put<UsuarioModel>(`${this.URL_API_BASE}/${usuario.id}`,usuario);
  }

  // ==============================================================================
  // ELIMINAR
  // ==============================================================================

  eliminar(id: number): Observable<UsuarioModel> {
    return this.http.delete<UsuarioModel>(`${this.URL_API_BASE}/${id}`);
  }

  // ==============================================================================
  // CAMBIAR PASSWORD
  // ==============================================================================
  cambiarPassword(usuario_id:number,new_password: string,new_password_confirmation:string): Observable<string> {
    return this.http.post<string>(this.URL_API_BASE+"/updatepassword", {usuario_id,new_password,new_password_confirmation});
  }

}
