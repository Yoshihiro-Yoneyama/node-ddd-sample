import {WorkflowInputs} from "../../workflow/derive-sum-price-workflow-input";
import * as console from "node:console";

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
const productMapping: { [key in ProductCode]: { type: string, isOral: boolean } } = {
  [ProductCode.Book]: {type: "Book", isOral: false},
  [ProductCode.Beverage]: {type: "Beverage", isOral: true},
  [ProductCode.Alcohol]: {type: "Alcohol", isOral: true},
  [ProductCode.QuasiDrug]: {type: "QuasiDrug", isOral: true},
  [ProductCode.Newspaper]: {type: "Newspaper", isOral: false},
  [ProductCode.Medicine]: {type: "Medicine", isOral: true},
  [ProductCode.Other]: {type: "Other", isOral: false},
  [ProductCode.Food]: {type: "Food", isOral: true}
};

enum ServiceCode {
  TakeOut = "T",
  EatIn = "E",
}

enum DeliveryMethodCode {
  Catering = "K",
  Delivery = "D",
  InternetDelivery = "N"
}

enum DeliveryToCode {
  House = "D",
  NursingHome = "N",
  Apartment = "M",
  NoPlace = "",
}

const extractProductType = (inputString: string) => {
  try {
    const productKey = Object.keys(productMapping)
      .sort((a, b) => b.length - a.length)
      .find(key => inputString.startsWith(key)) as ProductCode;
    const { type, isOral } = productMapping[productKey];
    return { productType: type, isOralProduct: isOral, remainder: inputString.slice(productKey.length) };
  } catch (e) {
    throw new Error("存在しない商品種別が指定されています。")
  }
};

function extractServiceType(remainder: string): { serviceType: string, remainder: string } {
  try {
    const serviceKey = Object.keys(ServiceCode)
      .find(key => remainder.startsWith(ServiceCode[key])) as keyof typeof ServiceCode;
    return {serviceType: serviceKey, remainder: remainder.slice(1)};
  } catch (e) {
    throw new Error("存在しないサービス種別が指定されていrます。")
  }
}

function extractDeliveryMethodType(remainder: string): { deliveryMethodType: string, remainder: string } {
  try {
    const deliveryMethodKey = Object.keys(DeliveryMethodCode)
      .find(key => remainder.startsWith(DeliveryMethodCode[key])) as keyof typeof DeliveryMethodCode;
    return {deliveryMethodType: deliveryMethodKey, remainder: remainder.slice(1)};
  } catch (e) {
    throw new Error("存在しない提供方法が指定されています。")
  }
}

function extractDeliveryToType(remainder: string): { deliveryToType: string, remainder: string } {
  try {
    const deliveryToKey = Object.keys(DeliveryToCode)
      .find(key => remainder.startsWith(DeliveryToCode[key])) as keyof typeof DeliveryToCode;
    return deliveryToKey !== "NoPlace" ?
      {deliveryToType: deliveryToKey, remainder: remainder.slice(1)} :
      {deliveryToType: deliveryToKey, remainder: remainder};
  } catch (e) {
    throw new Error("存在しない配送先が指定されています。")
  }
}


export function translateToWorkflowInput(inputString: string): WorkflowInputs {
  const parts = inputString.split(':');

  return parts.map(part => {
    const {productType, isOralProduct, remainder: remainderAfterExtractProductType} = extractProductType(part);
    const {serviceType, remainder: remainderAfterExtractServiceType} = extractServiceType(remainderAfterExtractProductType);
    const {deliveryMethodType, remainder: remainderAfterExtractDeliveryMethodType} = extractDeliveryMethodType(remainderAfterExtractServiceType)
    const {deliveryToType, remainder: remainderAfterExtractDeliveryToType} = extractDeliveryToType(remainderAfterExtractDeliveryMethodType);
    const price = parseInt(remainderAfterExtractDeliveryToType);
    return {
      productType: productType,
      isOralProduct: isOralProduct,
      serviceType: serviceType,
      deliveryMethod: deliveryMethodType,
      deliveryTo: deliveryToType,
      price: price,
    };
  });
}