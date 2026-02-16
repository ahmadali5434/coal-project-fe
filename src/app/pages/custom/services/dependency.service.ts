import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: "root" })
export class DependencyService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/taxes/tax-rules`;

  getDependencies(ruleId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${ruleId}/dependencies`);
  }

  addDependency(ruleId: string, payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${ruleId}/dependencies`, payload);
  }

  deleteDependency(ruleId: string, depId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${ruleId}/dependencies/${depId}`);
  }
}
