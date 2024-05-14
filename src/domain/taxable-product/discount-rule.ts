import {Brand} from "../../lib/brand";
import {OrderedProducts, ProductType} from "../ordered-product/ordered-product";
import {isFoodAndBeverage} from "./unclassified-taxable-product";

const DISCOUNT_RATE = 0.9;

export type IsEligibleForDiscount = Brand<boolean, "IsEligibleForDiscount">;
export function IsEligibleForDiscount(value: boolean): IsEligibleForDiscount {
  return value as IsEligibleForDiscount;
}

export function checkIsEligibleForDiscount(orderedProducts: OrderedProducts): IsEligibleForDiscount {
  let foodAndBeverageAndNewspaperPriceTotal = 0;
  let otherPriceTotal = 0;
  orderedProducts.forEach(orderedProduct => {
    const i = isFoodAndBeverage(orderedProduct);
    if (i || orderedProduct.productType === ProductType.Newspaper) {
      foodAndBeverageAndNewspaperPriceTotal += orderedProduct.price;
    } else {
      otherPriceTotal += orderedProduct.price;
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