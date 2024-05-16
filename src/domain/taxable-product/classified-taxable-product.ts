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

/**
 * 税率未分類の商品リストから税率別の商品リストへ変換する関数
 *
 * @remarks
 * このメソッドでは税率未分類の商品リストをから1件ずつ抜き出し、 \
 * 税率別の商品リストに変換している。 \
 * 以下、各分類メソッド
 * <br>
 *  <li>reducedTaxRateIntegratedAsset: 軽減税率対象の一体資産へ変換</li>
 *  <li>standardTaxRateIntegratedAsset: 通常税率対象の一体資産へ変換</li>
 *  <li>newspaper: 単体商品の新聞へ変換</li>
 *  <li>foodAndBeverage: 単体商品の飲食料品へ変換</li>
 *  <li>other: 単体商品へ変換</li>
 * </br>
 * @param unclassifiedProducts 税率未分類の商品リスト
 * @returns TaxableProduct 税率別の商品リスト
 */
export function translateToTaxableProduct(unclassifiedProducts: UnclassifiedProduct[]): TaxableProduct[] {
  return unclassifiedProducts
    .flatMap(unclassifiedProduct => pipe(
      reducedTaxRateIntegratedAsset(unclassifiedProduct),
      option.alt(() => standardTaxRateIntegratedAsset(unclassifiedProduct)),
      option.alt(() => newspaper(unclassifiedProduct)),
      option.alt(() => foodAndBeverage(unclassifiedProduct)),
      option.fold(
        () => [other(unclassifiedProduct)],
        taxableProduct => [taxableProduct]
      ))
    )
}

/**
 * 税率別の商品と税率組み合わせを返す関数
 *
 * @param taxableProduct 税率別の商品
 * @returns TaxableProductAndTaxRate 税率別の商品と税率組み合わせ
 */
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