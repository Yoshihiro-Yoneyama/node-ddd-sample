import {Brand} from "../../lib/brand";
import {UnclassifiedProduct} from "./unclassified-taxable-product";
import {ProductType} from "../ordered-product/ordered-product";
import {option} from "fp-ts";
import {Option} from "fp-ts/Option";
import {pipe} from "fp-ts/function";

export type TaxableProductAndTaxRate = [TaxableProduct, TaxRate]

/**
 * 税率別の商品
 */
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
 * 税率別の商品と税率組み合わせを返す関数
 *
 * @param taxableProduct 税率別の商品
 * @returns 税率別の商品と税率組み合わせ
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

/**
 * 税率未分類の商品リストから税率別の商品リストへ変換する関数
 *
 * @remarks
 * このメソッドでは税率未分類の商品リストをから1件ずつ抜き出し、 \
 * 各変換メソッドを用いて税率別の商品に変換している
 *
 * @param unclassifiedProducts 税率未分類の商品リスト
 * @returns 税率別の商品リスト
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
 * 税率未分類の商品を軽減税率対象の一体資産に変換する関数
 *
 * @remarks
 * 以下の条件を満たす場合、軽減税率対象の一体資産として扱う
 * 1. typeがUnclassifiedIntegratedAssetである
 * 2. 税込額が1万円未満である
 * 3. 税抜合計額に対して、経口摂取しない商品の税抜額が2/3以上を占めない
 * 4. 経口摂取する商品のisFoodAndBeverageがtrueである
 *
 * @param unclassifiedProduct 税率未分類の商品
 * @returns 軽減税率対象の一体資産またはoption.none
 */
function reducedTaxRateIntegratedAsset(unclassifiedProduct: UnclassifiedProduct): Option<TaxableProduct> {
  const isReducedTaxRateIntegratedAsset =
    unclassifiedProduct.type === "UnclassifiedIntegratedAsset"
    && (unclassifiedProduct.oralProduct.price + unclassifiedProduct.nonOralProduct.price) * 1.1 < 10000
    && unclassifiedProduct.oralProduct.price * 2 > unclassifiedProduct.nonOralProduct.price
    && unclassifiedProduct.oralProduct.isFoodAndBeverage;
  return isReducedTaxRateIntegratedAsset
    ? option.some({
      type: TaxableProductType.ReducedTaxRateIntegratedAsset,
      price: TaxableProductPrice(unclassifiedProduct.oralProduct.price + unclassifiedProduct.nonOralProduct.price)
    })
    : option.none
}

/**
 * 税率未分類の商品を一般税率の一体資産に変換する関数
 *
 * @remarks
 * 以下の条件を満たす場合、一般税率の一体資産として扱う
 * 1. typeがUnclassifiedIntegratedAssetである
 * 2. 軽減税率対象の一体資産ではない
 *
 * @param unclassifiedProduct 税率未分類の商品
 * @returns 一般税率の一体資産またはoption.none
 */
function standardTaxRateIntegratedAsset(unclassifiedProduct: UnclassifiedProduct): Option<TaxableProduct> {
  return unclassifiedProduct.type === "UnclassifiedIntegratedAsset"
    ? option.some({
      type: TaxableProductType.StandardTaxRateIntegratedAsset,
      price: TaxableProductPrice(unclassifiedProduct.oralProduct.price + unclassifiedProduct.nonOralProduct.price)
    })
    : option.none
}

/**
 * 税率未分類の商品を新聞に変換する関数
 *
 * @remarks
 * 以下の条件を満たす場合、新聞として扱う
 * 1. typeがUnclassifiedSingleProductである
 * 2. productTypeがNewspaperである
 *
 * @param unclassifiedProduct 税率未分類の商品
 * @returns 新聞またはoption.none
 */
function newspaper(unclassifiedProduct: UnclassifiedProduct): Option<TaxableProduct> {
  return unclassifiedProduct.type === "UnclassifiedSingleProduct"
  && unclassifiedProduct.productType === ProductType.Newspaper
    ? option.some({
      type: TaxableProductType.Newspaper,
      price: TaxableProductPrice(unclassifiedProduct.singleProductPrice)
    })
    : option.none
}

/**
 * 税率未分類の商品を飲食料品に変換する関数
 *
 * @remarks
 * 以下の条件を満たす場合、飲食料品として扱う
 * 1. typeがUnclassifiedSingleProductである
 * 2. isFoodAndBeverageがtrueである
 *
 * @param unclassifiedProduct 税率未分類の商品
 * @returns 飲食料品またはoption.none
 */
function foodAndBeverage(unclassifiedProduct: UnclassifiedProduct): Option<TaxableProduct> {
  return unclassifiedProduct.type === "UnclassifiedSingleProduct" &&
  unclassifiedProduct.isFoodAndBeverage
    ? option.some({
      type: TaxableProductType.FoodAndBeverage,
      price: TaxableProductPrice(unclassifiedProduct.singleProductPrice)
    })
    : option.none
}

/**
 * 税率未分類の商品をその他の商品に変換する関数
 *
 * @remarks
 * 以下の条件を満たす場合、その他の商品として扱う
 * 1. typeがUnclassifiedSingleProductである
 * 2. 他の変換メソッドの条件を満たさない
 *
 * @param unclassifiedProduct 税率未分類の商品
 * @returns その他の商品
 */
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