import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HomeComponent } from './views/home/home';
import { AgenciaComponent } from './views/agencia/agencia';
import { LoginComponent } from './views/login/login';
import { UsuarioComponent } from './views/usuario/usuario';
import { CambioPasswordComponent } from './views/cambio-password/cambio-password';
import { RolComponent } from './views/roles/rol';
import { PermisoComponent } from './views/permiso/permiso';
import { RegionalComponent } from './views/regional/regional';

export const BASE_ROUTES: Routes = [
    {path: '', redirectTo:'login', pathMatch : 'full'},
    {path:'***',redirectTo:'login', pathMatch : 'full'},
    {path:'login',component:LoginComponent},
    {path:'passwordupdate',component:CambioPasswordComponent,canActivate:[authGuard]},
    {path:'seguridad/roles',component:RolComponent,canActivate:[authGuard]},
    {path:'seguridad/permisos',component:PermisoComponent,canActivate:[authGuard]},
    {path:'home',component:HomeComponent,canActivate:[authGuard]},
    {path:'',component:HomeComponent,canActivate:[authGuard]},
    {path:'usuarios',component:UsuarioComponent,canActivate:[authGuard]},
    {path:'regionales',component:RegionalComponent,canActivate:[authGuard]},
    {path:'agencias',component:AgenciaComponent,canActivate:[authGuard]},
];
