import {OrderedProducts, ProductType} from "../ordered-product/ordered-product";
import {isFoodAndBeverage} from "./unclassified-taxable-product";

/**
 * 注文商品リストから割引ルールを適用する関数を返す
 *
 * @remarks
 * 割引ルールの適用条件は飲食料品と新聞の税抜合計金額と \
 * その他の商品の税抜合計金額の比がちょうど2：3の場合である \
 * この条件を満たす場合、最終的な税込合計金額から10%の値引きを行う関数を返す。 \
 */
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

const DISCOUNT_RATE = 0.9;