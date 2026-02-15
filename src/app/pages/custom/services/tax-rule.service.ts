import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { TaxRule } from "../models/tax-rule.model";
import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: "root" })
export class TaxRuleService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/taxes/tax-rules`;

  getAllRules(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  createRule(payload: Partial<TaxRule>): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload);
  }

  updateRule(id: string, payload: Partial<TaxRule>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  deleteRule(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
