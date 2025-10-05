import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { AddNewWarehouseDialogComponent } from './add-new-warehouse-dialog/add-new-warehouse-dialog.component';
import { WarehouseService } from './data-access/warehouse.service';
import {
  Warehouse,
  CreateOrUpdateWarehousePayload,
} from '../buy-stock/data-access/buy-stock.dto';
import { LocationService } from '../../shared/services/location.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { City, Country } from '../../shared/model';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { HasPermissionDirective } from "../../core/directives/has-permission.directive";
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-warehouses',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    HasPermissionDirective
],
  templateUrl: './warehouse.component.html',
})
export class WarehouseComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  private readonly warehouseService = inject(WarehouseService);
  private readonly locationService = inject(LocationService);
  private readonly snackBar = inject(MatSnackBar);
private readonly authService = inject(AuthService);
  protected warehousesDetail: Warehouse[] = [];
  private countries: Country[] = [];
  private cities: City[] = [];
isAdmin = false;
  addNewWarehouse() {
    const dialogRef = this.dialog.open(AddNewWarehouseDialogComponent, {
      panelClass: 'dialog-container-lg',
    });

    dialogRef
      .afterClosed()
      .subscribe((result: CreateOrUpdateWarehousePayload | undefined) => {
        if (result) {
          this.warehouseService.addNewWarehouseDetail(result).subscribe({
            next: (res) => {
              if (res.success) {
                this.snackBar.open('Warehouse added successfully!', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                });
                this.loadWarehouses();
              }
            },
            error: (err) => console.error('Error adding warehouse:', err),
          });
        }
      });
  }
  editWarehouse(warehouse: Warehouse) {
    const dialogRef = this.dialog.open(AddNewWarehouseDialogComponent, {
      data: warehouse,
      panelClass: 'dialog-container-lg',
    });

    dialogRef
      .afterClosed()
      .subscribe((result: CreateOrUpdateWarehousePayload | undefined) => {
        if (result) {
          this.warehouseService
            .updateWarehouseDetail(warehouse.id.toString(), result)
            .subscribe({
              next: (res) => {
                if (res.success) {
                  this.snackBar.open(
                    'Warehouse updated successfully!',
                    'Close',
                    {
                      duration: 3000,
                    }
                  );
                  this.loadWarehouses();
                }
              },
              error: (err) => console.error('Error updating warehouse:', err),
            });
        }
      });
  }

  deleteWarehouse(id: number | string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this warehouse?' },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.warehouseService.deleteWarehouseDetail(String(id)).subscribe({
          next: (res) => {
            if (res.success) {
              this.snackBar.open('Warehouse deleted successfully!', 'Close', {
                duration: 3000,
              });
              this.loadWarehouses();
            }
          },
          error: (err) => console.error('Error deleting warehouse:', err),
        });
      }
    });
  }

  ngOnInit() {
     const currentUser = this.authService.currentUser;
    this.isAdmin = currentUser?.role === 'admin';
    
    this.locationService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        this.loadWarehouses();
      },
    });
  }
  private loadWarehouses() {
    this.warehouseService.fetchAllWarehousesDetail().subscribe({
      next: (res) => {
        if (res.success) {
          this.warehousesDetail = res.data.map((w) => ({
            ...w,
            country:
              w.country ??
              this.countries.find((c) => String(c.id) === String(w.countryId)),
            city: w.city,
          }));
          this.warehousesDetail.forEach((warehouse, index) => {
            if (!warehouse.city && warehouse.countryId) {
              this.locationService
                .getCitiesByCountry(warehouse.countryId.toString())
                .subscribe({
                  next: (cities) => {
                    const foundCity = cities.find(
                      (c) => String(c.id) === String(warehouse.cityId)
                    );
                    this.warehousesDetail[index].city = foundCity;
                  },
                  error: (err) =>
                    console.error('Error fetching city for warehouse:', err),
                });
            }
          });
        }
      },
      error: (err) => console.error('Error fetching warehouses:', err),
    });
  }

  constructor() {}
}
