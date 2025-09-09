import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  Warehouse,
  CreateOrUpdateWarehousePayload,
} from '../../buy-stock/data-access/buy-stock.dto';


@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
 private readonly http = inject(HttpClient);
private readonly apiUrl = `${environment.apiBaseUrl}/warehouses`;
  constructor() { }

 fetchAllWarehousesDetail(): Observable<ApiResponse<Warehouse[]>> {
    return this.http.get<ApiResponse<Warehouse[]>>(this.apiUrl);
  }


  addNewWarehouseDetail(
    payload: CreateOrUpdateWarehousePayload
  ): Observable<ApiResponse<Warehouse>> {
    return this.http.post<ApiResponse<Warehouse>>(this.apiUrl, payload);
  }
  updateWarehouseDetail(
  id: string,
  payload: CreateOrUpdateWarehousePayload
): Observable<ApiResponse<Warehouse>> {
  return this.http.put<ApiResponse<Warehouse>>(`${this.apiUrl}/${id}`, payload);
}

deleteWarehouseDetail(id: string): Observable<ApiResponse<null>> {
  return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
}
}
