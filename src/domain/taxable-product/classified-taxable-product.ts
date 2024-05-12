import {Brand} from "../../lib/brand";
import {UnClassifiedProduct} from "./unclassified-taxable-product";
import {DeliveryMethod, DeliveryTo, Product, ProductType, ServiceType} from "../product/product";

// 税率未分類の商品から税率別の商品へ変換する関数
export function classifyToTaxableProduct(unClassifyProducts: UnClassifiedProduct[]): TaxableProduct[] {
  return unClassifyProducts.map((unClassifyProduct) => {
    switch (unClassifyProduct.type) {
      case "UnClassifiedIntegratedAsset":
        if ((unClassifyProduct.oralProduct.price + unClassifyProduct.nonOralProduct.price) * 1.1 < 10000 &&
          unClassifyProduct.oralProduct.price < unClassifyProduct.nonOralProduct.price / 2 &&
          isFoodAndBeverage(unClassifyProduct.oralProduct)) {
          return {
            type: TaxableProductType.ReducedTaxRateIntegratedAsset,
            price: TaxableProductPrice(unClassifyProduct.oralProduct.price + unClassifyProduct.nonOralProduct.price)
          }
        } else {
          return {
            type: TaxableProductType.StandardTaxRateIntegratedAsset,
            price: TaxableProductPrice(unClassifyProduct.oralProduct.price + unClassifyProduct.nonOralProduct.price)
          }
        }
      case "UnClassifiedSingleProduct":
        if (unClassifyProduct.product.productType === ProductType.Newspaper) {
          return {
            type: TaxableProductType.Newspaper,
            price: TaxableProductPrice(unClassifyProduct.product.price)
          }
        } else if (isFoodAndBeverage(unClassifyProduct.product)) {
          return {
            type: TaxableProductType.FoodAndBeverage,
            price: TaxableProductPrice(unClassifyProduct.product.price)
          }
        } else {
          return {
            type: TaxableProductType.Other,
            price: TaxableProductPrice(unClassifyProduct.product.price)
          }
        }
    }
  });
}

//　商品を税率別に分類し、TaxableProductAndTaxRateを返す関数
export function createTaxableProductAndTaxRate(taxableProduct: TaxableProduct): TaxableProductAndTaxRate {
  switch (taxableProduct.type) {
    case TaxableProductType.FoodAndBeverage:
      return [taxableProduct, {taxRate: 1.08}]
    case TaxableProductType.Newspaper:
      return [taxableProduct, {taxRate: 1.08}]
    case TaxableProductType.StandardTaxRateIntegratedAsset:
      return [taxableProduct, {taxRate: 1.1}]
    case TaxableProductType.ReducedTaxRateIntegratedAsset:
      return [taxableProduct, {taxRate: 1.08}]
    case TaxableProductType.Other:
      return [taxableProduct, {taxRate: 1.1}]
    default:
      const _: never = taxableProduct;
  }
}

export type TaxableProductAndTaxRate = [TaxableProduct, TaxRate]

// 税率別の商品の型
export type TaxableProduct =
  | FoodAndBeverage
  | Newspaper
  | ReducedTaxRateIntegratedAsset
  | StandardTaxRateIntegratedAsset
  | Other;


export type TaxableProductPrice = Brand<number, "TaxableProductPrice">;

export function TaxableProductPrice(value: number): TaxableProductPrice {
  if (value <= 0 || value >= 99999) {
    throw new Error("金額は0〜99999の整数で入力してください。")
  }
  return value as TaxableProductPrice;
}

export enum TaxableProductType {
  FoodAndBeverage = "FoodAndBeverage",
  Newspaper = "Newspaper",
  ReducedTaxRateIntegratedAsset = "ReducedTaxRateIntegratedAsset",
  StandardTaxRateIntegratedAsset = "StandardTaxRateIntegratedAsset",
  Other = "Other",
}

export interface FoodAndBeverage {
  type: TaxableProductType.FoodAndBeverage,
  price: TaxableProductPrice
}

export interface Newspaper {
  type: TaxableProductType.Newspaper,
  price: TaxableProductPrice,
}

export interface ReducedTaxRateIntegratedAsset {
  type: TaxableProductType.ReducedTaxRateIntegratedAsset,
  price: TaxableProductPrice,
}

export interface StandardTaxRateIntegratedAsset {
  type: TaxableProductType.StandardTaxRateIntegratedAsset,
  price: TaxableProductPrice,
}

export interface Other {
  type: TaxableProductType.Other,
  price: TaxableProductPrice,
}

// 税率の型
export type TaxRate =
  | ReducedTaxRate
  | StandardTaxRate

export type ReducedTaxRate = {
  taxRate: 1.08,
}

export type StandardTaxRate = {
  taxRate: 1.1,
}

function isFoodAndBeverage(product: Product): boolean {
  // プロダクトが口腔製品であること
  if (!product.isOralProduct.value) {
    return false;
  }

  // プロダクトタイプが指定のものでないこと
  const excludedTypes = [ProductType.Alcohol, ProductType.QuasiDrug, ProductType.Medicine];
  if (excludedTypes.includes(product.productType)) {
    return false;
  }

  // サービスタイプがテイクアウトであること
  if (product.serviceType !== ServiceType.TakeOut) {
    return false;
  }

  // 配送方法がケータリングでない、またはケータリングでも看護ホームに配送されないこと
  if (product.deliveryMethod === DeliveryMethod.Catering) {
    if (product.deliveryTo === DeliveryTo.NursingHome) {
      return false;
    }
  }

  // すべてのチェックを通過した場合、trueを返す
  return true;
}
