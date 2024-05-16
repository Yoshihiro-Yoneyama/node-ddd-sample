import {DeriveTotalPriceWorkflowInputs} from "./derive-total-price-workflow-input";
import {createProduct, IsOralProduct, OrderedProducts, ProductPrice} from "../domain/ordered-product/ordered-product";
import {translateToUnclassifiedProduct} from "../domain/taxable-product/unclassified-taxable-product";
import {
  createTaxableProductAndTaxRate,
  TaxableProductAndTaxRate,
  translateToTaxableProduct
} from "../domain/taxable-product/classified-taxable-product";
import {applyDiscountRule} from "../domain/taxable-product/discount-rule";
import {calculateTotalWithTax} from "../domain/taxable-product/calculate-total-with-tax";

export namespace DeriveTotalPriceWorkflow {
  export function deriveTotalPrice(inputs: DeriveTotalPriceWorkflowInputs) {
    // 入力文字列から注文商品リストを作成する
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
    // 注文商品リストから税率未分類の商品リストを作成する
    const unClassifiedProducts = translateToUnclassifiedProduct(orderedProducts);
    // 税率未分類の商品リストから税率分類の商品リストを作成する
    const classifiedProducts = translateToTaxableProduct(unClassifiedProducts);
    // 税率分類の商品リストから商品と税率の組のリストを作成する
    const taxableProductAndTaxRateList: TaxableProductAndTaxRate[] = classifiedProducts
      .map(classifiedProduct => createTaxableProductAndTaxRate(classifiedProduct));
    // 商品と税率の組のリストから合計金額を算出する
    const totalWithTax = calculateTotalWithTax(taxableProductAndTaxRateList);
    // 値引き対象の判定及び最終金額を返す
    return applyDiscountRule(orderedProducts)(totalWithTax);
  }
}