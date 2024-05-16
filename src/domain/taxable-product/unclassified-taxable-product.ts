import {
  DeliveryMethod,
  DeliveryTo, IsOralProduct,
  OrderedProduct, OrderedProducts,
  ProductType,
  ServiceType
} from "../ordered-product/ordered-product";
import {Brand} from "../../lib/brand";
import {pipe} from 'fp-ts/function'
import {filter, zip} from 'fp-ts/Array'
import {option} from "fp-ts";

export type UnclassifiedProduct = UnclassifiedIntegratedAsset | UnclassifiedSingleProduct

export type UnclassifiedIntegratedAsset = {
  type: "UnclassifiedIntegratedAsset",
  oralProduct: {
    price: OralProductPrice,
    isFoodAndBeverage: IsFoodAndBeverage,
  },
  nonOralProduct: {
    price: NonOralProductPrice
  },
}
export type UnclassifiedSingleProduct = {
  type: "UnclassifiedSingleProduct",
  productType: ProductType,
  singleProductPrice: SingleProductPrice,
  isOralProduct: IsOralProduct,
  isFoodAndBeverage: IsFoodAndBeverage,
}

export type IsFoodAndBeverage = Brand<boolean, "IsFoodAndBeverage">
export function IsFoodAndBeverage(value: boolean): IsFoodAndBeverage {
  return value as IsFoodAndBeverage;
}

export type OralProductPrice = Brand<number, "OralProductPrice">;
export function OralProductPrice(value: number): OralProductPrice {
  if (value < 0 || value > 99999) {
    throw new Error("金額は0〜99999の整数で入力してください。")
  }
  return value as OralProductPrice;
}

export type NonOralProductPrice = Brand<number, "NonOralProductPrice">;
export function NonOralProductPrice(value: number): NonOralProductPrice {
  if (value < 0 || value > 99999) {
    throw new Error("金額は0〜99999の整数で入力してください。")
  }
  return value as NonOralProductPrice;
}

export type SingleProductPrice = Brand<number, "SingleProductPrice">;
export function SingleProductPrice(value: number): SingleProductPrice {
  if (value < 0 || value > 99999) {
    throw new Error("金額は0〜99999の整数で入力してください。")
  }
  return value as SingleProductPrice;
}

/**
 * 注文内容から税率未分類の商品を作成する関数
 *
 *
 *
 * @param orderedProducts
 * @return UnclassifiedProduct[]: 税率未分類の商品リスト
 */
export function translateToUnclassifiedProduct(orderedProducts: OrderedProducts): UnclassifiedProduct[] {
  const pairs = createUnclassifiedIntegratedAssetBundle(orderedProducts);
  const integratedAssets = createUnclassifiedIntegratedAsset(pairs);
  const singles = extractUnclassifiedSingleProduct(orderedProducts, pairs);
  return [...integratedAssets, ...singles];
}

/**
 * 一体資産の商品の組を作成する関数
 * @param orderedProducts
 */
function createUnclassifiedIntegratedAssetBundle(orderedProducts: OrderedProducts): OrderedProducts[] {
  return pipe(
    orderedProducts,
    zip(orderedProducts.slice(1)),
    filter(([a, b]) => a.isOralProduct && !b.isOralProduct)
  )
}

/** 一体資産を作成する関数 */
function createUnclassifiedIntegratedAsset(pair: OrderedProducts[]): UnclassifiedIntegratedAsset[] {
  return pair.map(([a, b]) => {
    return {
      type: "UnclassifiedIntegratedAsset",
      oralProduct: {
        price: OralProductPrice(a.price),
        isFoodAndBeverage: isFoodAndBeverage(a),
      },
      nonOralProduct: {
        price: NonOralProductPrice(b.price),
      },
    }
  });
}

// 注文した商品リストから一体資産ではない商品のリストを抽出する関数
function extractUnclassifiedSingleProduct(orderedProducts: OrderedProducts, orderedProductsForIntegratedAsset: OrderedProducts[]): UnclassifiedSingleProduct[] {
  const orderedProductsFromIntegratedAsset = orderedProductsForIntegratedAsset.flat();
  //idでの同一性チェック
  return orderedProducts
    .filter(product => !orderedProductsFromIntegratedAsset.some(b => product.id === b.id))
    .map((product) => {
      return {
        type: "UnclassifiedSingleProduct",
        productType: product.productType,
        singleProductPrice: SingleProductPrice(product.price),
        isOralProduct: IsOralProduct(product.isOralProduct),
        isFoodAndBeverage: isFoodAndBeverage(product),
      }
    });
}

// 飲食料品かの判定を行う関数
export function isFoodAndBeverage(product: OrderedProduct): IsFoodAndBeverage {
  return pipe(
    !product.isOralProduct ? option.some(false) : option.none,
    option.alt(() => EXCLUDED_TYPES.includes(product.productType) ? option.some(false) : option.none),
    option.alt(() => product.serviceType !== ServiceType.TakeOut ? option.some(false) : option.none),
    option.alt(() => product.deliveryMethod === DeliveryMethod.Catering &&
      product.deliveryTo !== DeliveryTo.NursingHome
        ? option.some(false)
        : option.none
    ),
    option.map((value) => IsFoodAndBeverage(value)),
    option.getOrElse(() => IsFoodAndBeverage(true))
  )
}
const EXCLUDED_TYPES: ProductType[] = [ProductType.Alcohol, ProductType.QuasiDrug, ProductType.Medicine];
