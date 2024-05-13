import {describe, expect, test} from "@jest/globals";
import {checkIsEligibleForDiscount, discount, IsEligibleForDiscount} from "./discount-rule";
import {TaxableProduct, TaxableProductPrice, TaxableProductType} from "./classified-taxable-product";

describe('Discount Rule Tests', () => {
  describe('IsEligibleForDiscount', () => {
    test('valueがtrueのオジェクトを生成する', () => {
      const actual = IsEligibleForDiscount(true);
      expect(actual).toBe(true);
    });

    test('valueがfalseのオブジェクトを生成する', () => {
      const actual = IsEligibleForDiscount(false);
      expect(actual).toBe(false);
    });
  });

  describe('checkIsEligibleForDiscount', () => {
    test('課税商品の一覧が値引き対象だったらIsEligibleForDiscountがTrueのオブジェクトを返却する', () => {
      const taxableProducts: TaxableProduct[] = [
        {
          type: TaxableProductType.FoodAndBeverage,
          price: TaxableProductPrice(100)
        },
        {
          type: TaxableProductType.Newspaper,
          price: TaxableProductPrice(200)
        },
        {
          type: TaxableProductType.Other,
          price: TaxableProductPrice(450)
        }
      ];
      const actual = checkIsEligibleForDiscount(taxableProducts);
      expect(actual).toBe(true);
    });

    test('課税商品の一覧が値引き対象でなかったらIsEligibleForDiscountがFalseのオブジェクトを返却する', () => {
      const taxableProducts: TaxableProduct[] = [
        {
          type: TaxableProductType.FoodAndBeverage,
          price: TaxableProductPrice(100)
        },
        {
          type: TaxableProductType.Newspaper,
          price: TaxableProductPrice(200)
        },
        {
          type: TaxableProductType.Other,
          price: TaxableProductPrice(300)
        }
      ];
      const actual = checkIsEligibleForDiscount(taxableProducts);
      expect(actual).toBe(false);
    });
  });

  describe('discount', () => {
    test('IsEligibleForDiscountがtrueの場合、割引後の金額を返す', () => {
      const actual = discount(1000, IsEligibleForDiscount(true));
      expect(actual).toBe(900);
    });

    test('IsEligibleForDiscountがfalseの場合、割引前の金額を返す', () => {
      const actual = discount(1000, IsEligibleForDiscount(false));
      expect(actual).toBe(1000);
    });
  });
});