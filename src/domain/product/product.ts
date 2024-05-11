import {Brand} from "../../lib/brand";

export type OrderedProducts = {
  products: Product[],
}
export function createOrderedProduct(
  products: Product[],
): OrderedProducts {
  return {
    products,
  }
}

export type Product = {
  productType: ProductType,
  isOralProduct: IsOralProduct,
  serviceType: ServiceType,
  deliveryMethod: DeliveryMethod,
  deliveryTo: DeliveryTo,
  price: ProductPrice,
}
export function createProduct(
  productType: ProductType,
  isOralProduct: IsOralProduct,
  serviceType: ServiceType,
  deliveryMethod: DeliveryMethod,
  deliveryTo: DeliveryTo,
  price: ProductPrice,
): Product {
  return {
    productType,
    isOralProduct,
    serviceType,
    deliveryMethod,
    deliveryTo,
    price,
  }
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

export type IsOralProduct = {
  value: boolean
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

export type ProductPrice = Brand<number, 'ProductPrice'>;
function ProductPrice(value: number): ProductPrice {
  if (value <= 0 || value >= 99999) {
    throw new Error("金額は0〜99999の整数で入力してください。")
  }
  return value as ProductPrice;
}

