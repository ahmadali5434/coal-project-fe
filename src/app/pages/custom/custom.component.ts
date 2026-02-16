import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { Router } from "@angular/router";
import { CustomEntryService } from "./services/custom-entry.service";
import { CustomEntryDialogComponent } from "./components/custom-entry-dialog/custom-entry-dialog.component";
import { ConfirmDialogComponent } from "../../shared/components/confirm-dialog/confirm-dialog.component";


@Component({
  selector: "app-custom-entries",
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './custom.component.html',
})
export class CustomEntriesComponent implements OnInit {
  private customEntryService = inject(CustomEntryService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  entries: any[] = [];
  columns = ["gdNumber", "gdDate", "importValue", "importerType", "psidAmount", "packages", "actions"];

  ngOnInit() {
    this.load();
  }

  load() {
    this.customEntryService.getAll().subscribe((res) => {
      this.entries = res.data || res;
    });
  }

  viewDetails(id: number) {
    this.router.navigate([`/custom-entries/${id}`]);
  }

  openCreateDialog() {
    const ref = this.dialog.open(CustomEntryDialogComponent, {
      panelClass: 'dialog-container-lg',
    });

    ref.afterClosed().subscribe((res) => res && this.load());
  }

  openEditDialog(entry: any) {
    const ref = this.dialog.open(CustomEntryDialogComponent, {
      panelClass: 'dialog-container-lg',
      data: entry,
    });

    ref.afterClosed().subscribe((res) => res && this.load());
  }

  deleteEntry(id: number) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: "350px",
      data: { message: "Are you sure you want to delete this custom entry?" },
    });

    ref.afterClosed().subscribe((confirm) => {
      if (!confirm) return;

      this.customEntryService.delete(id).subscribe(() => this.load());
    });
  }
}
