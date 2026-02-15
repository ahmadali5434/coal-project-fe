import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CustomEntryService } from '../../services/custom-entry.service';

@Component({
  selector: 'app-custom-entry-details',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './custom-entry-details.component.html',
})
export class CustomEntryDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customEntryService = inject(CustomEntryService);

  entry: any = null;

  taxColumns = [
    'taxCode',
    'calculationType',
    'baseValue',
    'rate',
    'calculatedAmount',
  ];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEntry(id);
  }

  loadEntry(id: number) {
    this.customEntryService.getById(id).subscribe((res) => {
      this.entry = res.data || res;
    });
  }

  goBack() {
    this.router.navigate(['/custom-entries']);
  }
}
