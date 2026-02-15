export interface TaxRuleDependency {
  id: string;
  taxRuleId: string;
  dependsOnTaxId: string;
  order: number;
}
