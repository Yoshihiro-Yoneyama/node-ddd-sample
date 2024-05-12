import {TaxableProduct, TaxableProductAndTaxRate} from "../taxable-product/classified-taxable-product";
import {Brand} from "../../lib/brand";

const DISCOUNT_RATE = 0.9;

export type IsEligibleForDiscount = Brand<boolean, "IsEligibleForDiscount">;
export function IsEligibleForDiscount(value: boolean): IsEligibleForDiscount {
  return value as IsEligibleForDiscount;
}

export function checkIsEligibleForDiscount(taxableProducts: TaxableProduct[]): IsEligibleForDiscount {
  let FoodAndBeverageAndNewspaperPrice = 0;
  let OtherPrice = 0;
  taxableProducts.forEach((taxableProduct) => {
    if (taxableProduct.type === "FoodAndBeverage" || taxableProduct.type === "Newspaper") {
      FoodAndBeverageAndNewspaperPrice += taxableProduct.price;
    } else {
      OtherPrice += taxableProduct.price;
    }
  });
  return IsEligibleForDiscount(FoodAndBeverageAndNewspaperPrice * 1.5 === OtherPrice);
}

export function discount(sumPrice: number, isEligibleForDiscount: IsEligibleForDiscount): number {
  if (isEligibleForDiscount) {
    return Math.floor(sumPrice * DISCOUNT_RATE);
  }
  return sumPrice;
}