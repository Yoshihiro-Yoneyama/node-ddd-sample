import {WorkflowInputs} from "./derive-sum-price-workflow-input";
import {
  createOrderedProduct,
  createProduct,
  DeliveryMethod,
  DeliveryTo,
  IsOralProduct,
  ProductPrice,
  ProductType,
  ServiceType
} from "../domain/ordered-product/ordered-product";
import {translateToUnclassifiedTaxRateProduct} from "../domain/taxable-product/unclassified-taxable-product";
import {
  classifyToTaxableProduct,
  createTaxableProductAndTaxRate,
  TaxableProductAndTaxRate
} from "../domain/taxable-product/classified-taxable-product";
import {checkIsEligibleForDiscount, discount} from "../domain/taxable-product/discount-rule";
import {calculateTotalWithTax} from "../domain/taxable-product/calculate-total-with-tax";

export class DeriveSumPriceWorkflow {
  deriveSumPrice(inputs: WorkflowInputs) {
    // inputからOrderを作成する
    const orderedProducts = createOrderedProduct(
      inputs.map(input => createProduct(
        input.productType as ProductType,
        IsOralProduct(input.isOralProduct),
        input.serviceType as ServiceType,
        input.deliveryMethod as DeliveryMethod,
        input.deliveryTo as DeliveryTo,
        ProductPrice(input.price)
      ))
    )
    // Orderから税率未分類の商品リストを作成する
    const unClassifiedProducts = translateToUnclassifiedTaxRateProduct(orderedProducts);
    // 税率未分類の商品からTaxableProductのリストを作成する
    const classifiedProducts = classifyToTaxableProduct(unClassifiedProducts);
    // TaxableProductのリストからTaxableProductAndTaxRateのリストを作成する
    const taxableProductAndTaxRateList: TaxableProductAndTaxRate[] = classifiedProducts
      .map(classifiedProduct => createTaxableProductAndTaxRate(classifiedProduct));
    // TaxableProductAndTaxRateのリストから合計金額を算出する
    const totalWithTax = calculateTotalWithTax(taxableProductAndTaxRateList);
    // 値引き対象か判定する
    const isEligibleForDiscount = checkIsEligibleForDiscount(classifiedProducts);
    //　値引きルールを適用する
    const calculateInclusiveTotal = discount(totalWithTax, isEligibleForDiscount);
    //　最終金額を返す
    return calculateInclusiveTotal
  }
}