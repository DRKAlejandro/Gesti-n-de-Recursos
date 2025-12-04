import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Inventario } from './pages/inventario/inventario';
import { Solicitudes } from './pages/solicitudes/solicitudes';
import { Asignacion } from './pages/asignacion/asignacion';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'inventario', component: Inventario },
  { path: 'solicitudes', component: Solicitudes },
  { path: 'asignacion', component: Asignacion },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
