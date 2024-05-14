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

export type UnClassifiedIntegratedAsset = {
  type: "UnClassifiedIntegratedAsset",
  oralProduct: {
    price: OralProductPrice,
    isFoodAndBeverage: IsFoodAndBeverage,
  },
  nonOralProduct: {
    price: NonOralProductPrice
  },
}
export type UnClassifiedSingleProduct = {
  type: "UnClassifiedSingleProduct",
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
  if (value <= 0 || value >= 99999) {
    throw new Error("金額は0〜99999の整数で入力してください。")
  }
  return value as OralProductPrice;
}

export type NonOralProductPrice = Brand<number, "NonOralProductPrice">;
export function NonOralProductPrice(value: number): NonOralProductPrice {
  if (value <= 0 || value >= 99999) {
    throw new Error("金額は0〜99999の整数で入力してください。")
  }
  return value as NonOralProductPrice;
}

export type SingleProductPrice = Brand<number, "SingleProductPrice">;
export function SingleProductPrice(value: number): SingleProductPrice {
  if (value <= 0 || value >= 99999) {
    throw new Error("金額は0〜99999の整数で入力してください。")
  }
  return value as SingleProductPrice;
}

export type UnClassifiedProduct = UnClassifiedIntegratedAsset | UnClassifiedSingleProduct

//一体資産の商品の組を作成する関数
export function f(orderedProducts: OrderedProducts): OrderedProducts[] {
  return pipe(
    orderedProducts,
    zip(orderedProducts.slice(1)),
    filter(([a, b]) => a.isOralProduct && !b.isOralProduct)
  )
}

// 一体資産を作成する関数
export function g(pair: OrderedProducts[]): UnClassifiedIntegratedAsset[] {
  return pair.map(([a, b]) => {
    return {
      type: "UnClassifiedIntegratedAsset",
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

// OrderedProductsから一体資産の組の商品を除外する関数
export function h(orderedProducts: OrderedProducts, productsForIntegratedAsset: OrderedProducts[]): UnClassifiedSingleProduct[] {
  const flat = productsForIntegratedAsset.flat();
  //idでの同一性チェック
  return orderedProducts
    .filter(product => !flat.some(b => product.id === b.id))
    .map((product) => {
      return {
        type: "UnClassifiedSingleProduct",
        productType: product.productType,
        singleProductPrice: SingleProductPrice(product.price),
        isOralProduct: IsOralProduct(product.isOralProduct),
        isFoodAndBeverage: isFoodAndBeverage(product),
      }
    });
}

// 注文内容から税率未分類の商品を作成する関数
export function translateToUnclassifiedTaxRateProduct(orderedProducts: OrderedProducts): UnClassifiedProduct[] {
  const pairs = f(orderedProducts);
  const integratedAssets = g(pairs);
  const singles = h(orderedProducts, pairs);
  return [...integratedAssets, ...singles];
}

export function isFoodAndBeverage(product: OrderedProduct): IsFoodAndBeverage {
  // プロダクトが経口摂取する商品であること
  if (!product.isOralProduct) {
    return IsFoodAndBeverage(false);
  }

  // プロダクトタイプが指定のものでないこと
  const excludedTypes: ProductType[] = [ProductType.Alcohol, ProductType.QuasiDrug, ProductType.Medicine];
  if (excludedTypes.includes(product.productType)) {
    return IsFoodAndBeverage(false);
  }

  // サービスタイプがテイクアウトであること
  if (product.serviceType !== ServiceType.TakeOut) {
    return IsFoodAndBeverage(false);
  }

  // 配送方法がケータリングでない、またはケータリングであっても配送先が有料老人ホームであること
  if (product.deliveryMethod === DeliveryMethod.Catering) {
    if (product.deliveryTo !== DeliveryTo.NursingHome) {
      return IsFoodAndBeverage(false);
    }
  }

  // すべてのチェックを通過した場合、trueを返す
  return IsFoodAndBeverage(true);
}