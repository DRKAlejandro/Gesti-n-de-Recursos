import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Método para GET
  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { params: httpParams });
  }

  // Método para POST
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data);
  }

  // ESTOS 2 DE MOMENTO NO ESTAN CONFIGURADOS EN EL FACKEND POR LO QUE ESTARAN COMENTADOS MOMENTANEAMENTE
  // // Método para PUT
  // put<T>(endpoint: string, data: any): Observable<T> {

  //   return this.http.put<T>(`${this.apiUrl}${endpoint}`, data);
  // }

  // // Método para DELETE
  // delete<T>(endpoint: string): Observable<T> {
  //   return this.http.delete<T>(`${this.apiUrl}${endpoint}`);
  // }
}
