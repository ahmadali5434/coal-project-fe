import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { TaxService } from "../../custom/services/tax.service";
import { TaxRuleService } from "../../custom/services/tax-rule.service";
import { TaxRulesDialogComponent } from "./tax-rules-dialog/tax-rules-dialog.component";
import { ConfirmDialogComponent } from "../../../shared/components/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-tax-rules",
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './tax-rules.component.html',
})
export class TaxRulesComponent implements OnInit {
  private taxRuleService = inject(TaxRuleService);
  private taxService = inject(TaxService);
  private dialog = inject(MatDialog);

  rules: any[] = [];
  taxes: any[] = [];

  columns = ["tax", "importerType", "rate", "effectiveFrom", "effectiveTo", "actions"];

  ngOnInit() {
    this.loadTaxes();
    this.loadRules();
  }

  loadTaxes() {
    this.taxService.fetchAllTaxes().subscribe((res) => {
      this.taxes = res;
    });
  }

  loadRules() {
    this.taxRuleService.getAllRules().subscribe((res) => {
      this.rules = res.data || res;
    });
  }

  getTaxName(taxId: string) {
    const tax = this.taxes.find((t) => t.id === taxId);
    return tax ? `${tax.code} - ${tax.name}` : taxId;
  }

  openCreateDialog() {
    const ref = this.dialog.open(TaxRulesDialogComponent, {
      panelClass: 'dialog-container-lg',
    });

    ref.afterClosed().subscribe((res) => res && this.loadRules());
  }

  openEditDialog(rule: any) {
    const ref = this.dialog.open(TaxRulesDialogComponent, {
      panelClass: 'dialog-container-lg',
      data: rule,
    });

    ref.afterClosed().subscribe((res) => res && this.loadRules());
  }

  deleteRule(id: string) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: "350px",
      data: { message: "Are you sure you want to delete this tax rule?" },
    });

    ref.afterClosed().subscribe((confirm) => {
      if (!confirm) return;

      this.taxRuleService.deleteRule(id).subscribe(() => this.loadRules());
    });
  }
}
