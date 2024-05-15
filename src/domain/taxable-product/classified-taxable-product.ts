import {Brand} from "../../lib/brand";
import {UnClassifiedProduct} from "./unclassified-taxable-product";
import {ProductType} from "../ordered-product/ordered-product";
import {option} from "fp-ts";
import {Option} from "fp-ts/Option";
import {pipe} from "fp-ts/function";

export type TaxableProductAndTaxRate = [TaxableProduct, TaxRate]

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

export type TaxableProduct = {
  type: TaxableProductType,
  price: TaxableProductPrice
}

export type TaxRate =
  | ReducedTaxRate
  | StandardTaxRate

export type ReducedTaxRate = {
  taxRate: 1.08,
}

export type StandardTaxRate = {
  taxRate: 1.1,
}

export function reducedTaxRateIntegratedAsset(unclassifiedProduct: UnClassifiedProduct): Option<TaxableProduct> {
  const isReducedTaxRateIntegratedAsset = unclassifiedProduct.type === "UnClassifiedIntegratedAsset" &&
    (unclassifiedProduct.oralProduct.price + unclassifiedProduct.nonOralProduct.price) * 1.1 < 10000 &&
    unclassifiedProduct.oralProduct.price * 2 > unclassifiedProduct.nonOralProduct.price &&
    unclassifiedProduct.oralProduct.isFoodAndBeverage;
  return isReducedTaxRateIntegratedAsset
    ? option.some({
      type: TaxableProductType.ReducedTaxRateIntegratedAsset,
      price: TaxableProductPrice(unclassifiedProduct.oralProduct.price + unclassifiedProduct.nonOralProduct.price)
    })
    : option.none
}

export function standardTaxRateIntegratedAsset(unclassifiedProduct: UnClassifiedProduct): Option<TaxableProduct> {
  return unclassifiedProduct.type === "UnClassifiedIntegratedAsset"
    ? option.some({
      type: TaxableProductType.StandardTaxRateIntegratedAsset,
      price: TaxableProductPrice(unclassifiedProduct.oralProduct.price + unclassifiedProduct.nonOralProduct.price)
    })
    : option.none
}

export function newspaper(unclassifiedProduct: UnClassifiedProduct): Option<TaxableProduct> {
  return unclassifiedProduct.type === "UnClassifiedSingleProduct" &&
  unclassifiedProduct.productType === ProductType.Newspaper
    ? option.some({
      type: TaxableProductType.Newspaper,
      price: TaxableProductPrice(unclassifiedProduct.singleProductPrice)
    })
    : option.none
}

export function foodAndBeverage(unclassifiedProduct: UnClassifiedProduct): Option<TaxableProduct> {
  return unclassifiedProduct.type === "UnClassifiedSingleProduct" &&
  unclassifiedProduct.isFoodAndBeverage
    ? option.some({
      type: TaxableProductType.FoodAndBeverage,
      price: TaxableProductPrice(unclassifiedProduct.singleProductPrice)
    })
    : option.none
}

export function other(unclassifiedProduct: UnClassifiedProduct): TaxableProduct {
  if (unclassifiedProduct.type === "UnClassifiedSingleProduct") {
    return {
      type: TaxableProductType.Other,
      price: TaxableProductPrice(unclassifiedProduct.singleProductPrice)
    }
  } else throw Error("assertion error");
}

// 税率未分類の商品から税率別の商品へ変換する関数
export function translateToTaxableProduct(unClassifyProducts: UnClassifiedProduct[]): TaxableProduct[] {
  return unClassifyProducts
    .flatMap(unClassifiedProduct => pipe(
      reducedTaxRateIntegratedAsset(unClassifiedProduct),
      option.alt(() => standardTaxRateIntegratedAsset(unClassifiedProduct)),
      option.alt(() => newspaper(unClassifiedProduct)),
      option.alt(() => foodAndBeverage(unClassifiedProduct)),
      option.fold(
        () => [other(unClassifiedProduct)],
        taxableProduct => [taxableProduct]
      ))
    )
}

//　商品を税率別に分類し、TaxableProductAndTaxRateを返す関数
export function createTaxableProductAndTaxRate(taxableProduct: TaxableProduct): TaxableProductAndTaxRate {
  const type = taxableProduct.type;
  switch (type) {
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
      const _: never = type;
  }
}