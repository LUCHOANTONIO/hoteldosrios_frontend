import { HttpClient } from "@angular/common/http"
import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { Observable, Subscription } from "rxjs";
import { MenuModel } from '../models/menu.model';
import { environment } from "../../../environments/environment";
import { AuthService } from "./auth.service";
import { AppService } from "./local/app.service";

@Injectable({
    providedIn: 'root'
})

export class MenuService implements OnDestroy {
    private menusLoadSignal = signal<MenuModel[]>([]);
    public readonly menus=computed(()=>this.menusLoadSignal()) ;
    private onAuthChange: Subscription;
    //URL BACKEND
    private URL_API_BASE = environment.URL_API_BASE + "/menus";

    constructor(private http: HttpClient,protected authService: AuthService,protected appService: AppService) {
        // ==============================================================================
        //cargar menus automaticamente luego de login
        // ==============================================================================
        this.onAuthChange = this.authService.onAuthChange.subscribe((autenticado) => {
            //console.log("autenticado:"+autenticado);
            if (autenticado) {
              this.listMenusPorRolId(this.appService.session.ROL_ID).subscribe({
                next: (res) => {
                  this.menusLoadSignal.set(res);
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
    //LISTAR
    // ==============================================================================

    listar(): Observable<MenuModel[]> {
        return this.http.get<MenuModel[]>(this.URL_API_BASE);
    }

    // ==============================================================================
    // CREAR
    // ==============================================================================
    crear(menu: MenuModel): Observable<MenuModel> {
        return this.http.post<MenuModel>(this.URL_API_BASE, menu);
    }

    // ==============================================================================
    // MODIFICAR
    // ==============================================================================

    modificar(menu: MenuModel): Observable<MenuModel> {
        return this.http.put<MenuModel>(`${this.URL_API_BASE}/${menu.id}`, menu);
    }

    // ==============================================================================
    // ELIMINAR
    // ==============================================================================

    eliminar(id: number): Observable<MenuModel> {
        return this.http.delete<MenuModel>(`${this.URL_API_BASE}/${id}`);
    }

    // ==============================================================================
    listMenusPorRolId(rol_id: number): Observable<MenuModel[]> {
        return this.http.get<MenuModel[]>(`${this.URL_API_BASE}/menusporrol/${rol_id}`);
    }

    // ==============================================================================
    listarMenusAsignadosPorRol(rol_id:number=0): Observable<MenuModel[]> {
        return this.http.get<MenuModel[]>(this.URL_API_BASE+"/asignados/"+rol_id);
    }

    // ==============================================================================
    guardarMenusAsignadosPorRol(rol_id:number,menusAsignados:MenuModel[]):Observable<MenuModel[]>{
        return this.http.post<MenuModel[]>(this.URL_API_BASE+"/guardar_asignados/"+rol_id,menusAsignados);
    }

    // ==============================================================================
    static convertArrayMenuToTree(menus: MenuModel[]): MenuModel {
        // Inicializar cada menú con un array vacío de subMenus
        menus.forEach(menu => menu.subMenus = []);
        const tree: MenuModel[] = [];
        // Construir la estructura de árbol
        menus.forEach(menu => {
            if (menu.padre_id === null) {
                // Menú de nivel superior
                tree.push(menu);
            } else {
                // Encontrar el menú padre y añadir el menú actual a sus subMenus
                const parent = menus.find(m => m.id === menu.padre_id);
                if (parent) {
                    parent.subMenus?.push(menu);
                }
            }
        });

        let raiz = new MenuModel();
        raiz.id = null;
        raiz.nombre = "RAIZ";
        raiz.subMenus = tree;
        return raiz;
    }
    // ==============================================================================
    static convertTreeMenuToArray(nodo: MenuModel,array:MenuModel[]=[]): MenuModel[] {
        const { subMenus, ...padre } = nodo; //separando el nodo en datos del menus y el array de submenus
        if(padre.nombre!="RAIZ"){ // EVITANDO EL MENU RAIZ EL CUAL FUE INVENTADO 
            array.push(padre); // Añadir el nodo actual (sin subMenus) al array
        }
        if (subMenus && subMenus.length > 0) {
            subMenus.forEach(m => this.convertTreeMenuToArray(m,array)); // Recorrer recursivamente los subMenús
        }
        return array;
    }
    // ==============================================================================
}
