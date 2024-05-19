import {DeriveTotalPriceWorkflowInputs} from "./derive-total-price-workflow-input";
import {createProduct, IsOralProduct, OrderedProducts, ProductPrice} from "../domain/ordered-product/ordered-product";
import {translateToUnclassifiedProduct} from "../domain/taxable-product/unclassified-taxable-product";
import {
  createTaxableProductAndTaxRate,
  TaxableProductAndTaxRate,
  translateToTaxableProduct
} from "../domain/taxable-product/classified-taxable-product";
import {applyDiscountRule} from "../domain/taxable-product/discount-rule";
import {calculateTotalWithTax} from "../domain/taxable-product/total-with-tax-calculator";

export namespace DeriveTotalPriceWorkflow {

  /**
   * 注文データを各種別ごとに分類した入力値から最終的な合計金額を算出し返却する関数
   *
   * @remarks
   * 以下の手順で最終的な合計金額を算出する
   * 1. 注文データを各種別ごとに分類した入力値から注文商品リストを作成する
   * 2. 注文商品リストから税率未分類の商品リストを作成する
   * 3. 税率未分類の商品リストから税率別の商品リストを作成する
   * 4. 税率別の商品リストから税率別の商品と税率の組のリストを作成する
   * 5. 税率別の商品と税率の組のリストから合計税込金額を算出する
   * 6. 注文商品リストを基に合計税込金額に対して値引きルールの適用し、最終的な合計金額を算出する
   */
  export function deriveTotalPrice(inputs: DeriveTotalPriceWorkflowInputs) {
    const orderedProducts: OrderedProducts = OrderedProducts(
      inputs
        .map(input => createProduct(
          input.productType,
          IsOralProduct(input.isOralProduct),
          input.serviceType,
          input.deliveryMethod,
          input.deliveryTo,
          ProductPrice(input.price)
        ))
    );
    const unClassifiedProducts = translateToUnclassifiedProduct(orderedProducts);
    const classifiedProducts = translateToTaxableProduct(unClassifiedProducts);
    const taxableProductAndTaxRateList: TaxableProductAndTaxRate[] = classifiedProducts
      .map(classifiedProduct => createTaxableProductAndTaxRate(classifiedProduct));
    const totalWithTax = calculateTotalWithTax(taxableProductAndTaxRateList);
    return applyDiscountRule(orderedProducts)(totalWithTax);
  }
}