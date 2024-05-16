import {Brand} from "../../lib/brand";
import {UnclassifiedProduct} from "./unclassified-taxable-product";
import {ProductType} from "../ordered-product/ordered-product";
import {option} from "fp-ts";
import {Option} from "fp-ts/Option";
import {pipe} from "fp-ts/function";

export type TaxableProductAndTaxRate = [TaxableProduct, TaxRate]

export type TaxableProduct = {
  type: TaxableProductType,
  price: TaxableProductPrice
}

export enum TaxableProductType {
  FoodAndBeverage = "FoodAndBeverage",
  Newspaper = "Newspaper",
  ReducedTaxRateIntegratedAsset = "ReducedTaxRateIntegratedAsset",
  StandardTaxRateIntegratedAsset = "StandardTaxRateIntegratedAsset",
  Other = "Other",
}

export type TaxableProductPrice = Brand<number, "TaxableProductPrice">;
export function TaxableProductPrice(value: number): TaxableProductPrice {
  if (value < 0 || value > 99999) {
    throw new Error("金額は0〜99999の整数で入力してください。")
  }
  return value as TaxableProductPrice;
}

// 税率未分類の商品から税率別の商品へ変換する関数
export function translateToTaxableProduct(unClassifyProducts: UnclassifiedProduct[]): TaxableProduct[] {
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

function reducedTaxRateIntegratedAsset(unclassifiedProduct: UnclassifiedProduct): Option<TaxableProduct> {
  const isReducedTaxRateIntegratedAsset = unclassifiedProduct.type === "UnclassifiedIntegratedAsset" &&
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

function standardTaxRateIntegratedAsset(unclassifiedProduct: UnclassifiedProduct): Option<TaxableProduct> {
  return unclassifiedProduct.type === "UnclassifiedIntegratedAsset"
    ? option.some({
      type: TaxableProductType.StandardTaxRateIntegratedAsset,
      price: TaxableProductPrice(unclassifiedProduct.oralProduct.price + unclassifiedProduct.nonOralProduct.price)
    })
    : option.none
}

function newspaper(unclassifiedProduct: UnclassifiedProduct): Option<TaxableProduct> {
  return unclassifiedProduct.type === "UnclassifiedSingleProduct" &&
  unclassifiedProduct.productType === ProductType.Newspaper
    ? option.some({
      type: TaxableProductType.Newspaper,
      price: TaxableProductPrice(unclassifiedProduct.singleProductPrice)
    })
    : option.none
}

function foodAndBeverage(unclassifiedProduct: UnclassifiedProduct): Option<TaxableProduct> {
  return unclassifiedProduct.type === "UnclassifiedSingleProduct" &&
  unclassifiedProduct.isFoodAndBeverage
    ? option.some({
      type: TaxableProductType.FoodAndBeverage,
      price: TaxableProductPrice(unclassifiedProduct.singleProductPrice)
    })
    : option.none
}

function other(unclassifiedProduct: UnclassifiedProduct): TaxableProduct {
  if (unclassifiedProduct.type === "UnclassifiedSingleProduct") {
    return {
      type: TaxableProductType.Other,
      price: TaxableProductPrice(unclassifiedProduct.singleProductPrice)
    }
  } else throw Error("assertion error");
}

type TaxRate =
  | ReducedTaxRate
  | StandardTaxRate
type ReducedTaxRate = {
  taxRate: 1.08,
}
type StandardTaxRate = {
  taxRate: 1.1,
}