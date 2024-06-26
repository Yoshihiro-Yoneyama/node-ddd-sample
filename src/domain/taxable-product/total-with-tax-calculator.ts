import {TaxableProductAndTaxRate} from "./classified-taxable-product";

/**
 * 税率別の商品と税率の組のリストから税込合計金額を計算する関数
 */
export function calculateTotalWithTax(taxableProductAndTaxRateList: TaxableProductAndTaxRate[]): number {
  return taxableProductAndTaxRateList
    .reduce((totalWithTax, [taxableProduct, taxRate]) => {
    return totalWithTax + Math.round(taxableProduct.price * taxRate.taxRate);
  }, 0);
}
