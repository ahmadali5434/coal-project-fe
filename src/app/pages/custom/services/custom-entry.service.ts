import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CustomEntry } from "../models/custom-entry.model";
import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: "root" })
export class CustomEntryService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + "/custom-entries";

  getAll(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<CustomEntry>): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<CustomEntry>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
