import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subscription } from 'rxjs';
import { RespuestaRequest } from '../models/local/respuesta.request.model';
import { LoginModel } from '../models/local/login.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { JwtDecoderService } from '../utils/jwt-decoder.service';
import { AppService } from '../services/local/app.service';
import moment, { Moment } from 'moment/moment'
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private onAuthChangeSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly onAuthChange: Observable<boolean> = this.onAuthChangeSubject.asObservable();

  private clickObservable!: Observable<Event>;
  private clickSubscription!: Subscription;

  intervalo_inactivadad_logout: any;
  intervalo_refresh_tk: any;  

  constructor(protected http: HttpClient, protected jwtDecoderService: JwtDecoderService, protected appService: AppService, private router: Router) {
    this.triggerAuthChange(this.isAuth());// se encarga de emitir el valor correcto al recargar la pagina.autenticado=true o false.
  }
  
  login(usuario: string, password: string): Observable<RespuestaRequest<LoginModel>> {
    return this.http.post<RespuestaRequest<LoginModel>>(environment.URL_API_BASE + "/auth/login", { usuario: usuario, password: password });
  }
  
  logout(): Observable<any> {
    return this.http.post<any>(environment.URL_API_BASE + "/auth/logout", {});
  }
  
  refresh(): Observable<{ new_access_token: string }> {    
    return this.http.post<{ new_access_token: string }>(environment.URL_API_BASE + "/auth/refresh", {}, { headers: { 'skip-loader': '' } });
  }

  //-----------------------------------------------------------------------------------------------------------------------------
  isAuth(): boolean {
    let token = this.appService.token.access_token;
    if (token)
      return true;
    else
      return false;
  }

  //-----------------------------------------------------------------------------------------------------------------------------
  triggerAuthChange(value: boolean): void {
    this.onAuthChangeSubject.next(value);
    if (value)
      this.iniciarControlExpiracion();
    else
      this.detenerControlExpiracion();
  }

  //-----------------------------------------------------------------------------------------------------------------------------
  private iniciarControlExpiracion() {
    this.ObservarActividadUsuario();
    this.inciarIntervaloInactivadadLogout();
    this.iniciarIntervaloRefreshTK();   
  }

  //-----------------------------------------------------------------------------------------------------------------------------
  private detenerControlExpiracion() {
    clearInterval(this.intervalo_inactivadad_logout);
    clearInterval(this.intervalo_refresh_tk);   
    if (this.clickSubscription) this.clickSubscription.unsubscribe();
  }
  
  limite_tiempo_inactivo!: number;
  private inciarIntervaloInactivadadLogout() {    
    this.limite_tiempo_inactivo = this.appService.session.SESSION_LIFETIME;   
    // solo se debe ejecutar una vez luego de haber iniciado el intervalo en base al SESSION_LIFETIME, el mismo es reiniciado cada vez que el usuario tiene actividad en la pagina (click en pagina)
    this.intervalo_inactivadad_logout = setInterval(() => {      
      if(this.limite_tiempo_inactivo==0){
        console.log("el tiempo de sesion es de 0");
      }
      this.cerrarSesion();
      this.detenerControlExpiracion();
    }, this.limite_tiempo_inactivo * 1000);
  }
  
  private ObservarActividadUsuario() {    
    this.clickObservable = fromEvent(document, 'click');
    this.clickSubscription = this.clickObservable.subscribe((event) => {
      clearInterval(this.intervalo_inactivadad_logout);
      this.inciarIntervaloInactivadadLogout();     
    });
  }
  
  private iniciarIntervaloRefreshTK() {
    let fecha_hora_actual = moment();
    let fecha_hora_tk_exp = moment.unix(this.appService.token.exp);
    let diferencia_segundos = fecha_hora_tk_exp.diff(fecha_hora_actual, 'seconds') - 50;    
    this.intervalo_refresh_tk = setInterval(() => {
      this.renovar_token();
    }, 1000 * (diferencia_segundos));

  }
  
  cerrarSesion() {
    this.logout().subscribe({
      next: (res) => {
        this.router.navigate(['/']);
        this.appService.clear();
        this.triggerAuthChange(false);
      },
      error: (error) => {
        this.appService.clear();
        console.error(error);
      },
    });
  }
  
  renovar_token() {   
    clearInterval(this.intervalo_refresh_tk);
    this.refresh().subscribe({
      next: (res) => {
        let nuevo_token = { ...this.appService.token };
        nuevo_token.access_token = res.new_access_token;
        this.appService.setToken(nuevo_token);       
        this.iniciarIntervaloRefreshTK();
      },

      error: (error) => { console.error(error); }

    });
  }

}
