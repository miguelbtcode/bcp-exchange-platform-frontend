import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Parameter,
  CreateParameterRequest,
  UpdateParameterRequest,
} from '../models/parameter.model';

@Injectable({
  providedIn: 'root',
})
export class ParameterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/parameters`;

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (environment.functionKey) {
      headers = headers.set('x-functions-key', environment.functionKey);
    }

    return headers;
  }

  private getParams(): HttpParams {
    let params = new HttpParams();

    if (environment.functionKey) {
      params = params.set('code', environment.functionKey);
    }

    return params;
  }

  getAll(): Observable<Parameter[]> {
    return this.http.get<Parameter[]>(this.baseUrl, {
      headers: this.getHeaders(),
      params: this.getParams(),
    });
  }

  getByParentCode(parentCode: string): Observable<Parameter[]> {
    let params = this.getParams();
    params = params.set('parentCode', parentCode);
    
    return this.http.get<Parameter[]>(`${this.baseUrl}/by-parent`, {
      headers: this.getHeaders(),
      params: params,
    });
  }

  create(request: CreateParameterRequest): Observable<Parameter> {
    return this.http.post<Parameter>(this.baseUrl, request, {
      headers: this.getHeaders(),
      params: this.getParams(),
    });
  }

  update(id: string, request: UpdateParameterRequest): Observable<Parameter> {
    return this.http.put<Parameter>(`${this.baseUrl}/${id}`, request, {
      headers: this.getHeaders(),
      params: this.getParams(),
    });
  }

  delete(id: string, modifiedBy?: string): Observable<void> {
    let params = this.getParams();
    if (modifiedBy) {
      params = params.set('modifiedBy', modifiedBy);
    }

    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
      params,
    });
  }
}
