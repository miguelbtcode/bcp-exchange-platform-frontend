import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExchangeRate, CreateExchangeRateRequest, UpdateExchangeRateRequest } from '../models/exchange-rate.model';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/exchange-rates`;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-functions-key': environment.functionKey
    });
  }

  getAll(): Observable<ExchangeRate[]> {
    return this.http.get<ExchangeRate[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  getById(id: string): Observable<ExchangeRate> {
    return this.http.get<ExchangeRate>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  create(request: CreateExchangeRateRequest): Observable<ExchangeRate> {
    return this.http.post<ExchangeRate>(this.apiUrl, request, {
      headers: this.getHeaders()
    });
  }

  update(id: string, request: UpdateExchangeRateRequest): Observable<ExchangeRate> {
    return this.http.put<ExchangeRate>(`${this.apiUrl}/${id}`, request, {
      headers: this.getHeaders()
    });
  }

  delete(id: string, modifiedBy: string): Observable<void> {
    const params = new HttpParams().set('modifiedBy', modifiedBy);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
      params: params
    });
  }
}
