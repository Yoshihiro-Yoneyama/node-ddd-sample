import {WorkflowInputs} from "./derive-sum-price-workflow-input";
import {
  createOrderedProduct,
  createProduct,
  DeliveryMethod,
  DeliveryTo, OrderedProducts, Product, ProductPrice,
  ProductType,
  ServiceType
} from "../domain/product/product";

export class DeriveSumPriceWorkflow {
  deriveSumPrice(inputs: WorkflowInputs): OrderedProducts {
    // inputからOrderを作成する
    const orderedProducts = createOrderedProduct(
      inputs.map(input => createProduct(
        input.productType as ProductType,
        {value: input.isOralProduct},
        input.serviceType as ServiceType,
        input.deliveryMethod as DeliveryMethod,
        input.deliveryTo as DeliveryTo,
        ProductPrice(input.price)
      ))
    )
    // Orderから税率未分類の商品リストを作成する
    // 税率未分類の商品からTaxableProductのリストを作成する
    // TaxableProductのリストからTaxableProductAndTaxRateのリストを作成する
    // TaxableProductAndTaxRateのリストから合計金額を算出する
    //　値引きルールを適用する
    //　最終金額を返す
    return orderedProducts;
  }
}

// inputからOrderを作成する

// Orderから税率未分類の商品リストを作成する

// 税率未分類の商品からTaxableProductのリストを作成する

// TaxableProductのリストからTaxableProductAndTaxRateのリストを作成する

// TaxableProductAndTaxRateのリストから合計金額を算出する

//　値引きルールを適用する

//　最終金額を返す