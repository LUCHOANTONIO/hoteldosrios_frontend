import { Routes } from '@angular/router';
import { BASE_ROUTES } from './base/base.routes';
import { LOGIC_ROUTES } from './logic/logic.routes';

export const routes: Routes = [
    ...BASE_ROUTES,
    ...LOGIC_ROUTES
];