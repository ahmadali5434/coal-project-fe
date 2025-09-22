import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { City, Country } from '../../../shared/model';
import { AddNewCountryDialogComponent } from '../add-new-country-dailoge/add-new-country-dialog.component';
import { AddNewCityDialogComponent } from '../add-new-city-diolog/add-new-city-dialog.component';
import { CountryService } from '../city and country data accses/country.service';
import { CityService } from '../city and country data accses/city.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-country-city-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './country-city-table.component.html',
})
export class CountryCityTableComponent implements OnInit {
  private countryService = inject(CountryService);
  private cityService = inject(CityService);
  private dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  countries: Country[] = [];
  citiesByCountry: { [countryId: string]: City[] } = {};
  displayedColumns: string[] = ['name', 'actions'];

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.countryService.fetchAllCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        this.citiesByCountry = {};
        countries.forEach((c) => this.loadCities(c.id));
      },
      error: () =>
        this._snackBar.open('Failed to load countries', 'Close', {
          duration: 3000,
        }),
    });
  }

  loadCities(countryId: string) {
    this.cityService.fetchCitiesByCountry(Number(countryId)).subscribe({
      next: (cities) => (this.citiesByCountry[countryId] = cities || []),
      error: () =>
        this._snackBar.open('Failed to load cities', 'Close', {
          duration: 3000,
        }),
    });
  }

  addCountry() {
    const dialogRef = this.dialog.open(AddNewCountryDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) this.loadCountries();
    });
  }

  getCityCount(countryId: string): number {
    return this.citiesByCountry[countryId]?.length || 0;
  }

  editCountry(country: Country) {
    const dialogRef = this.dialog.open(AddNewCountryDialogComponent, {
      width: '400px',
      data: { country },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) this.loadCountries();
    });
  }

  deleteCountry(country: Country) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Are you sure you want to delete country "${country.name}"?` },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.countryService.deleteCountry(Number(country.id)).subscribe({
          next: () => {
            this.countries = this.countries.filter(c => c.id !== country.id);
            delete this.citiesByCountry[country.id];
            this._snackBar.open('Country deleted', 'Close', { duration: 3000 });
          },
          error: () =>
            this._snackBar.open('Error deleting country', 'Close', {
              duration: 3000,
            }),
        });
      }
    });
  }
  addCity(countryId: string) {
    const dialogRef = this.dialog.open(AddNewCityDialogComponent, {
      width: '400px',
      data: { countryId: Number(countryId) },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) this.loadCities(countryId);
    });
  }
  editCity(countryId: string, city: City) {
    const dialogRef = this.dialog.open(AddNewCityDialogComponent, {
      width: '400px',
      data: { countryId: Number(countryId), city },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) this.loadCities(countryId);
    });
  }

  deleteCity(countryId: string, city: City) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Are you sure you want to delete city "${city.name}"?` },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.cityService.deleteCity(Number(city.id)).subscribe({
          next: () => {
            this.citiesByCountry[countryId] = this.citiesByCountry[countryId]
              .filter(c => c.id !== city.id);

            this._snackBar.open('City deleted', 'Close', { duration: 3000 });
          },
          error: () =>
            this._snackBar.open('Error deleting city', 'Close', {
              duration: 3000,
            }),
        });
      }
    });
  }
}
