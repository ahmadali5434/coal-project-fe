import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Tax } from "../models/tax.model";
import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: "root" })
export class TaxService {
  private http = inject(HttpClient);
  private apiBaseUrl = environment.apiBaseUrl + '/taxes';

  fetchAllTaxes(): Observable<Tax[]> {
    return this.http.get<Tax[]>(this.apiBaseUrl);
  }

  createTax(payload: Partial<Tax>): Observable<Tax> {
    return this.http.post<Tax>(this.apiBaseUrl, payload);
  }

  updateTax(id: string, payload: Partial<Tax>): Observable<Tax> {
    return this.http.put<Tax>(`${this.apiBaseUrl}/${id}`, payload);
  }

  deleteTax(id: string): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/${id}`);
  }
}
