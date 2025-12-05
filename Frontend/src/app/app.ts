import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { Content } from './components/content/content';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from './services/api';
import { EquipoService } from './services/equipo';
import { RolService } from './services/rol';
import { SolicitudService } from './services/solicitud';

@Component({
  selector: 'app-root',
  imports: [Header, Content, HttpClientModule],
  providers: [
    ApiService,
    EquipoService,
    SolicitudService,
    RolService
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Frontend';
}
