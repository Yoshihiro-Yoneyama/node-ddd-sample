import {Brand} from "../../lib/brand";
import * as crypto from "node:crypto";

export type OrderedProducts = {
  products: OrderedProduct[],
}

export type OrderedProduct = {
  id: OrderedProductId,
  productType: ProductType,
  isOralProduct: IsOralProduct,
  serviceType: ServiceType,
  deliveryMethod: DeliveryMethod,
  deliveryTo: DeliveryTo,
  price: ProductPrice,
}

export type OrderedProductId = Brand<string, "OrderedProductId">
export function OrderedProductId(value: string): OrderedProductId {
  return value as OrderedProductId;
}
export function createOrderedProductId(): OrderedProductId {
  return OrderedProductId(crypto.randomUUID());
}



export enum ProductType {
  Book = "Book",
  Beverage = "Beverage",
  Alcohol = "Alcohol",
  QuasiDrug = "QuasiDrug",
  Newspaper = "Newspaper",
  Medicine = "Medicine",
  Other = "Other",
  Food = "Food",
}

export type IsOralProduct = Brand<boolean, "IsOralProduct">
export function IsOralProduct(value: boolean): IsOralProduct {
  return value as IsOralProduct;
}

export enum ServiceType  {
  TakeOut = "TakeOut",
  EatIn = "EatIn",
}

export enum DeliveryMethod {
  Catering = "Catering",
  Delivery = "Delivery",
  InternetDelivery = "InternetDelivery",
}

export enum DeliveryTo {
  House = "House",
  NursingHome = "NursingHome",
  Apartment = "Apartment",
  NoPlace = "NoPlace",
}

export type ProductPrice = Brand<number, "ProductPrice">;
export function ProductPrice(value: number): ProductPrice {
  if (value <= 0 || value >= 99999) {
    throw new Error("金額は0〜99999の整数で入力してください。")
  }
  return value as ProductPrice;
}

export function createOrderedProduct(
  products: OrderedProduct[],
): OrderedProducts {
  return {
    products,
  }
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



