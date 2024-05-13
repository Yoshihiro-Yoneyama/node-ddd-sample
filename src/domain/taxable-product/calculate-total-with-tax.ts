import {TaxableProductAndTaxRate} from "./classified-taxable-product";

export function calculateTotalWithTax(taxableProductAndTaxRateList: TaxableProductAndTaxRate[]): number {
  let totalWithTax = 0;
  for (const [taxableProduct, taxRate] of taxableProductAndTaxRateList) {
    totalWithTax += Math.floor(taxableProduct.price * taxRate.taxRate);
  }
  return totalWithTax;
}
