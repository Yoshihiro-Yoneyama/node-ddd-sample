import {OrderedProducts, ProductType} from "../ordered-product/ordered-product";
import {isFoodAndBeverage} from "./unclassified-taxable-product";

const DISCOUNT_RATE = 0.9;

export function applyDiscountRule(orderedProducts: OrderedProducts): (totalWithTax: number) => number {
  const foodAndBeverageAndNewsPaperTotal = orderedProducts
    .filter(orderedProducts => isFoodAndBeverage(orderedProducts) || orderedProducts.productType === ProductType.Newspaper)
    .reduce((acc, crr) => acc + crr.price, 0);
  const otherTotal = orderedProducts
    .filter(orderedProducts => !isFoodAndBeverage(orderedProducts) && orderedProducts.productType !== ProductType.Newspaper)
    .reduce((acc, crr) => acc + crr.price, 0);
  const isEligibleForDiscount = foodAndBeverageAndNewsPaperTotal * 1.5 === otherTotal;
  return isEligibleForDiscount
    ? (totalWithTax: number) => Math.floor(totalWithTax * DISCOUNT_RATE)
    : (totalWithTax: number) => totalWithTax;
}