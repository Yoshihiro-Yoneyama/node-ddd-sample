import {TaxableProductAndTaxRate} from "./classified-taxable-product";

export function calculateTotalWithTax(taxableProductAndTaxRateList: TaxableProductAndTaxRate[]): number {
  return taxableProductAndTaxRateList
    .reduce((totalWithTax, [taxableProduct, taxRate]) => {
    return totalWithTax + Math.round(taxableProduct.price * taxRate.taxRate);
  }, 0);
}
