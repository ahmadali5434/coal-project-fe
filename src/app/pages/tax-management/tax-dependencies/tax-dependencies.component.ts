import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { TaxRuleService } from "../../custom/services/tax-rule.service";
import { DependencyService } from "../../custom/services/dependency.service";
import { TaxService } from "../../custom/services/tax.service";
import { ConfirmDialogComponent } from "../../../shared/components/confirm-dialog/confirm-dialog.component";


@Component({
  selector: "app-tax-dependencies",
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './tax-dependencies.component.html',
})
export class TaxDependenciesComponent implements OnInit {
  private taxRuleService = inject(TaxRuleService);
  private dependencyService = inject(DependencyService);
  private taxService = inject(TaxService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  rules: any[] = [];
  taxes: any[] = [];

  selectedRuleId: string = "";
  dependencies: any[] = [];

  columns = ["dependsOnTaxId", "order", "actions"];

  form = this.fb.group({
    dependsOnTaxId: ["", Validators.required],
    order: [1, Validators.required],
  });

  ngOnInit() {
    this.loadRules();
    this.loadTaxes();
  }

  loadRules() {
    this.taxRuleService.getAllRules().subscribe((res) => {
      this.rules = res.data || res;
    });
  }

  loadTaxes() {
    this.taxService.fetchAllTaxes().subscribe((res) => {
      this.taxes = res;
    });
  }

  getTaxName(taxId: string) {
    const tax = this.taxes.find((t) => t.id === taxId);
    return tax ? `${tax.code} - ${tax.name}` : taxId;
  }

  loadDependencies() {
    if (!this.selectedRuleId) return;

    this.dependencyService.getDependencies(this.selectedRuleId).subscribe((res) => {
      this.dependencies = res.data || res;
    });
  }

  addDependency() {
    if (this.form.invalid) return;
    if (!this.selectedRuleId) return;

    const payload = this.form.value;

    this.dependencyService.addDependency(this.selectedRuleId, payload).subscribe(() => {
      this.form.reset({ dependsOnTaxId: "", order: 1 });
      this.loadDependencies();
    });
  }

  deleteDependency(depId: string) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: "350px",
      data: { message: "Delete this dependency?" },
    });

    ref.afterClosed().subscribe((confirm) => {
      if (!confirm) return;

      this.dependencyService.deleteDependency(this.selectedRuleId, depId).subscribe(() => {
        this.loadDependencies();
      });
    });
  }
}
