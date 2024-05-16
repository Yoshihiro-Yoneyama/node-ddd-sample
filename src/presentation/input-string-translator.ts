import {DeriveTotalPriceWorkflowInputs} from "../workflow/derive-total-price-workflow-input";
import {throwError} from "fp-ts/Option";
import {option} from "fp-ts";

export type TemporaryWorkflowInput = {
  remainder: string,
  productType: "Book" | "Beverage" | "Alcohol" | "QuasiDrug" | "Newspaper" | "Medicine" | "Other" | "Food",
  isOralProduct: boolean,
  serviceType: "TakeOut" | "EatIn",
  deliveryMethodType: "Catering" | "Delivery" | "InternetDelivery",
  deliveryToType: "House" | "NursingHome" | "Apartment" | "NoPlace",
  price: number,
}

export enum ProductCode {
  Book = "B",
  Beverage = "D",
  Alcohol = "Da",
  QuasiDrug = "de",
  Newspaper = "Bn",
  Medicine = "d",
  Other = "O",
  Food = "P"
}

// 製品種別と経口摂取情報をマッピング
export const productMapping: {
  [key in ProductCode]: {
    type: "Book" | "Beverage" | "Alcohol" | "QuasiDrug" | "Newspaper" | "Medicine" | "Other" | "Food",
    isOral: boolean
  }
} = {
  [ProductCode.Book]: {type: "Book", isOral: false},
  [ProductCode.Beverage]: {type: "Beverage", isOral: true},
  [ProductCode.Alcohol]: {type: "Alcohol", isOral: true},
  [ProductCode.QuasiDrug]: {type: "QuasiDrug", isOral: true},
  [ProductCode.Newspaper]: {type: "Newspaper", isOral: false},
  [ProductCode.Medicine]: {type: "Medicine", isOral: true},
  [ProductCode.Other]: {type: "Other", isOral: false},
  [ProductCode.Food]: {type: "Food", isOral: true}
};

export const ServiceCode = {
  TakeOut: "T",
  EatIn: "E",
} as const;
export type ServiceCode = typeof ServiceCode[keyof typeof ServiceCode];


export enum DeliveryMethodCode {
  Catering = "K",
  Delivery = "D",
  InternetDelivery = "N"
}

export enum DeliveryToCode {
  House = "D",
  NursingHome = "N",
  Apartment = "M",
  NoPlace = "",
}

/**
 * 入力文字列をワークフローの入力に変換する
 *
 *
 *
 * @param inputString
 */
export function translateToWorkflowInput(inputString: string): DeriveTotalPriceWorkflowInputs {
  return inputString
    .split(':')
    .map(part => ({remainder: part}))
    .map(extractProductType)
    .map(extractServiceType)
    .map(extractDeliveryMethodType)
    .map(extractDeliveryToType)
    .map(extractPrice)
    .map(input => {
      return {
        productType: input.productType,
        isOralProduct: input.isOralProduct,
        serviceType: input.serviceType,
        deliveryMethod: input.deliveryMethodType,
        deliveryTo: input.deliveryToType,
        price: input.price,
      }
    })
}

export function extractProductType(input: TemporaryWorkflowInput): TemporaryWorkflowInput {
  try {
    const productKey = Object.keys(productMapping)
      .sort((a, b) => b.length - a.length)
      .find(key => input.remainder.startsWith(key)) as ProductCode;
    const {type, isOral} = productMapping[productKey];
    return {
      ...input,
      productType: type,
      isOralProduct: isOral,
      remainder: input.remainder.slice(productKey.length)
    };
  } catch (e) {
    throw new Error("存在しない商品種別が指定されています。")
  }
}

export function extractServiceType(input: TemporaryWorkflowInput): TemporaryWorkflowInput {
  try {
    const [serviceKey] = Object.entries(ServiceCode)
      .filter(([key, value]) => input.remainder.startsWith(value))
      .map(([key, value]) => key as keyof typeof ServiceCode);
    if (!serviceKey) throw new Error();
    return {
      ...input,
      serviceType: serviceKey,
      remainder: input.remainder.slice(1)
    };
  } catch (e) {
    throw new Error("存在しないサービス種別が指定されています。")
  }
}

export function extractDeliveryMethodType(input: TemporaryWorkflowInput): TemporaryWorkflowInput {
  try {
    const deliveryMethodKey = Object.keys(DeliveryMethodCode)
      .find(key => input.remainder.startsWith(DeliveryMethodCode[key])) as keyof typeof DeliveryMethodCode;
    if (!deliveryMethodKey) throw new Error();
    return {
      ...input,
      deliveryMethodType: deliveryMethodKey,
      remainder: input.remainder.slice(1)
    };
  } catch (e) {
    throw new Error("存在しない提供方法が指定されています。")
  }
}

export function extractDeliveryToType(input: TemporaryWorkflowInput): TemporaryWorkflowInput {
  try {
    const deliveryToKey = Object.keys(DeliveryToCode)
      .find(key => input.remainder.startsWith(DeliveryToCode[key])) as keyof typeof DeliveryToCode;
    const remainder = deliveryToKey !== "NoPlace" ? input.remainder.slice(1) : input.remainder;
    if (isNaN(parseInt(remainder))) throw new Error("sss");
    return {
      ...input,
      deliveryToType: deliveryToKey,
      remainder: remainder
    };
  } catch (e) {
    throw new Error("存在しない提供場所が指定されています。")
  }
}

export function extractPrice(input: TemporaryWorkflowInput): TemporaryWorkflowInput {
  try {
    const price = Number(input.remainder);
    if (isNaN(price)) throw new Error();
    return {
      ...input,
      price: price
    }
  } catch (e) {
    throw new Error("金額が不正です。")
  }
}