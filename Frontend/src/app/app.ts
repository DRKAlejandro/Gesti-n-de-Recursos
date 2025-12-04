import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { Content } from './components/content/content';

@Component({
  selector: 'app-root',
  imports: [Header, Content],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Frontend';
}
