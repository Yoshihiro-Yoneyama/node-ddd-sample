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

/**
 * 税率未分類の商品
 */
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
 * 飲食料品かの判定を行う関数
 */
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

/**
 * 注文商品リストから税率未分類の商品リストを作成する関数
 *
 * @remarks
 * 以下の流れで税率未分類の商品リストを作成する。 \
 * 凡例　A:経口摂取する商品 B:経口摂取しない商品 C:一体資産 D:単体商品
 * 1. AとBが交互に並んでいる場合、A->Bの順で連続している箇所を一体資産の組として抽出する \
 * [A1, B2, B3, A4, B5] -> [[A1, B2], [B2, B3], [B3, A4], [A4, B5]]　->  [[A1, B2], [A4, B5]]
 * 2. 抽出した組から一体資産のリストを生成する \
 * [[A1, B2], [A4, B5]]  -> [C1, C2]
 * 3. 一体資産として扱わなかった商品を単体商品としてリストを作成する \
 * [A1, B2, B3, A4, A5] - [A1, B2, A4, B5] -> [B3] -> [D1]
 * 4. 税率未分類の商品リストを作成する \
 * [C1, C2] + [D1] -> [C1, C2, D1]
 */
export function translateToUnclassifiedProduct(orderedProducts: OrderedProducts): UnclassifiedProduct[] {
  const pairs = createUnclassifiedIntegratedAssetBundle(orderedProducts);
  const integratedAssets = createUnclassifiedIntegratedAsset(pairs);
  const singles = extractUnclassifiedSingleProduct(orderedProducts, pairs);
  return [...integratedAssets, ...singles];
}

/**
 * 一体資産として扱う商品の組のリストを作成する関数
 */
function createUnclassifiedIntegratedAssetBundle(orderedProducts: OrderedProducts): OrderedProducts[] {
  return pipe(
    orderedProducts,
    zip(orderedProducts.slice(1)),
    filter(([a, b]) => a.isOralProduct && !b.isOralProduct)
  )
}

/**
 * 一体資産のリストを作成する関数
 */
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

/**
 * 一体資産として扱わなかった単体商品のリストを作成する関数
 */
function extractUnclassifiedSingleProduct(orderedProducts: OrderedProducts, orderedProductsForIntegratedAsset: OrderedProducts[]): UnclassifiedSingleProduct[] {
  const orderedProductsFromIntegratedAsset = orderedProductsForIntegratedAsset.flat();
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