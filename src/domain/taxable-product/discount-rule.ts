import {TaxableProduct} from "./classified-taxable-product";
import {Brand} from "../../lib/brand";

const DISCOUNT_RATE = 0.9;

export type IsEligibleForDiscount = Brand<boolean, "IsEligibleForDiscount">;
export function IsEligibleForDiscount(value: boolean): IsEligibleForDiscount {
  return value as IsEligibleForDiscount;
}

export function checkIsEligibleForDiscount(taxableProducts: TaxableProduct[]): IsEligibleForDiscount {
  let foodAndBeverageAndNewspaperPriceTotal = 0;
  let otherPriceTotal = 0;
  taxableProducts.forEach((taxableProduct) => {
    if (taxableProduct.type === "FoodAndBeverage" || taxableProduct.type === "Newspaper") {
      foodAndBeverageAndNewspaperPriceTotal += taxableProduct.price;
    } else {
      otherPriceTotal += taxableProduct.price;
    }
  });
  return IsEligibleForDiscount(foodAndBeverageAndNewspaperPriceTotal * 1.5 === otherPriceTotal);
}

export function discount(totalWithTax: number, isEligibleForDiscount: IsEligibleForDiscount): number {
  if (isEligibleForDiscount) {
    return Math.floor(totalWithTax * DISCOUNT_RATE);
  }
  return totalWithTax;
}