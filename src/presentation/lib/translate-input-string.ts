import {WorkflowInputs} from "../../workflow/derive-sum-price-workflow-input";

export function translateToWorkflowInput(inputString: string): WorkflowInputs {
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

type TemporaryWorkflowInput = {
  remainder: string,
  productType: "Book" | "Beverage" | "Alcohol" | "QuasiDrug" | "Newspaper" | "Medicine" | "Other" | "Food",
  isOralProduct: boolean,
  serviceType: "TakeOut" | "EatIn",
  deliveryMethodType: "Catering" | "Delivery" | "InternetDelivery",
  deliveryToType: "House" | "NursingHome" | "Apartment" | "NoPlace",
  price: number,
}

enum ProductCode {
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
const productMapping: {
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

function extractProductType(input: TemporaryWorkflowInput): TemporaryWorkflowInput {
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

function extractServiceType(input: TemporaryWorkflowInput): TemporaryWorkflowInput {
  try {
    const serviceKey = Object.keys(ServiceCode)
      .find(key => input.remainder.startsWith(ServiceCode[key])) as keyof typeof ServiceCode;
    return {
      ...input,
      serviceType: serviceKey,
      remainder: input.remainder.slice(1)
    };
  } catch (e) {
    throw new Error("存在しないサービス種別が指定されていrます。")
  }
}

function extractDeliveryMethodType(input: TemporaryWorkflowInput): TemporaryWorkflowInput {
  try {
    const deliveryMethodKey = Object.keys(DeliveryMethodCode)
      .find(key => input.remainder.startsWith(DeliveryMethodCode[key])) as keyof typeof DeliveryMethodCode;
    return {
      ...input,
      deliveryMethodType: deliveryMethodKey,
      remainder: input.remainder.slice(1)
    };
  } catch (e) {
    throw new Error("存在しない提供方法が指定されています。")
  }
}

function extractDeliveryToType(input: TemporaryWorkflowInput): TemporaryWorkflowInput {
  try {
    const deliveryToKey = Object.keys(DeliveryToCode)
      .find(key => input.remainder.startsWith(DeliveryToCode[key])) as keyof typeof DeliveryToCode;
    const remainder = deliveryToKey !== "NoPlace" ? input.remainder.slice(1) : input.remainder;
    return {
      ...input,
      deliveryToType: deliveryToKey,
      remainder: remainder
    }
  } catch (e) {
    throw new Error("存在しない配送先が指定されています。")
  }
}

function extractPrice(input: TemporaryWorkflowInput): TemporaryWorkflowInput {
  try {
    const price = Number(input.remainder);
    return {
      ...input,
      price: price
    }
  } catch (e) {
    throw new Error("金額が不正です。")
  }
}