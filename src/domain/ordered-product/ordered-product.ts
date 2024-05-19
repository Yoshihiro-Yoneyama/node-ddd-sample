import {Brand} from "../../lib/brand";
import * as crypto from "node:crypto";

/**
 * 注文商品
 */
export type OrderedProduct = {
  id: OrderedProductId,
  productType: ProductType,
  isOralProduct: IsOralProduct,
  serviceType: ServiceType,
  deliveryMethod: DeliveryMethod,
  deliveryTo: DeliveryTo,
  price: ProductPrice,
}

/**
 * 注文商品リスト
 */
export type OrderedProducts = OrderedProduct[];
export function OrderedProducts(products: OrderedProducts): OrderedProducts {
  if (products.length === 0 || products.length > 10000) {
    throw new Error("商品は1〜10000個で入力してください。")
  }
  return products;
}

export type OrderedProductId = Brand<string, "OrderedProductId">
export function OrderedProductId(value: string): OrderedProductId {
  return value as OrderedProductId;
}
export function createOrderedProductId(): OrderedProductId {
  return OrderedProductId(crypto.randomUUID());
}

export const ProductType = {
  Book : "Book",
  Beverage : "Beverage",
  Alcohol : "Alcohol",
  QuasiDrug : "QuasiDrug",
  Newspaper : "Newspaper",
  Medicine : "Medicine",
  Other : "Other",
  Food : "Food",
} as const;
export type ProductType = typeof ProductType[keyof typeof ProductType];

export type IsOralProduct = Brand<boolean, "IsOralProduct">
export function IsOralProduct(value: boolean): IsOralProduct {
  return value as IsOralProduct;
}

export const ServiceType = {
  TakeOut : "TakeOut",
  EatIn : "EatIn",
} as const;
export type ServiceType = typeof ServiceType[keyof typeof ServiceType];

export const DeliveryMethod = {
  Catering : "Catering",
  Delivery : "Delivery",
  InternetDelivery : "InternetDelivery",
} as const;
export type DeliveryMethod = typeof DeliveryMethod[keyof typeof DeliveryMethod];

export const DeliveryTo = {
  House : "House",
  NursingHome : "NursingHome",
  Apartment : "Apartment",
  NoPlace : "NoPlace",
} as const;
export type DeliveryTo = typeof DeliveryTo[keyof typeof DeliveryTo];

export type ProductPrice = Brand<number, "ProductPrice">;
export function ProductPrice(value: number): ProductPrice {
  if (value < 0 || value > 99999) {
    throw new Error("金額は0〜99999の整数で入力してください。")
  }
  return value as ProductPrice;
}

export function createProduct(
  productType: ProductType,
  isOralProduct: IsOralProduct,
  serviceType: ServiceType,
  deliveryMethod: DeliveryMethod,
  deliveryTo: DeliveryTo,
  price: ProductPrice,
): OrderedProduct {
  return {
    id: createOrderedProductId(),
    productType,
    isOralProduct,
    serviceType,
    deliveryMethod,
    deliveryTo,
    price,
  }
}



