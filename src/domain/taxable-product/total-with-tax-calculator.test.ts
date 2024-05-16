import {describe, expect, it} from "@jest/globals";
import {calculateTotalWithTax} from "./total-with-tax-calculator";
import {TaxableProductAndTaxRate, TaxableProductPrice, TaxableProductType} from "./classified-taxable-product";

describe('CalculateTotalWithTax', () => {
  describe('calculateTotalWithTax', () => {
    it('課税商品の一覧から税込合計金額を算出する', () => {
      const taxableProductAndTaxRateList: TaxableProductAndTaxRate[]= [
        [
          {
            type: TaxableProductType.FoodAndBeverage,
            price: TaxableProductPrice(100)
          },
          {
            taxRate: 1.08
          }
        ],
        [
          {
            type: TaxableProductType.Newspaper,
            price: TaxableProductPrice(200)
          },
          {
            taxRate: 1.08
          }
        ],
        [
          {
            type: TaxableProductType.Other,
            price: TaxableProductPrice(300)
          },
          {
            taxRate: 1.1
          }
        ]
      ];
      const actual = calculateTotalWithTax(taxableProductAndTaxRateList);
      expect(actual).toBe(654);
    });
  });
});