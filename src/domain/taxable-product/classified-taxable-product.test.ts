import {describe, expect, it} from "@jest/globals";
import {TaxableProductPrice, TaxableProductType, translateToTaxableProduct} from "./classified-taxable-product";
import {
  IsFoodAndBeverage,
  NonOralProductPrice,
  OralProductPrice,
  SingleProductPrice,
  UnclassifiedProduct
} from "./unclassified-taxable-product";
import {IsOralProduct, ProductType} from "../ordered-product/ordered-product";

describe('classified Taxable Product', () => {
  describe('TaxableProductPrice', () => {
    it('TaxableProductPriceの0未満の場合エラーを返す', () => {
      expect(() => TaxableProductPrice(-1)).toThrowError("金額は0〜99999の整数で入力してください。");
    });
    it('TaxableProductPriceの99999より大きい場合エラーを返す', () => {
      expect(() => TaxableProductPrice(100000)).toThrowError("金額は0〜99999の整数で入力してください。");
    });
    it('TaxableProductPriceを生成する', () => {
      const actual = TaxableProductPrice(100);
      expect(actual).toBe(100);
    });
  });

  describe('translateToTaxableProduct', () => {
    it('税率未分類の商品リストから税率別の商品リストへ変換する', () => {
      const unclassifiedTaxableProduct: UnclassifiedProduct[] = [
        {
          type: "UnclassifiedIntegratedAsset",
          oralProduct: {
            price: OralProductPrice(101),
            isFoodAndBeverage: IsFoodAndBeverage(true),
          },
          nonOralProduct: {
            price: NonOralProductPrice(200),
          }
        },
        {
          type: "UnclassifiedSingleProduct",
          productType: ProductType.Book,
          singleProductPrice: SingleProductPrice(200),
          isOralProduct: IsOralProduct(false),
          isFoodAndBeverage: IsFoodAndBeverage(false),
        }
      ];

      const actual = translateToTaxableProduct(unclassifiedTaxableProduct);
      expect(actual).toEqual([
        {
          type: TaxableProductType.ReducedTaxRateIntegratedAsset,
          price: TaxableProductPrice(301)
        },
        {
          type: TaxableProductType.Other,
          price: TaxableProductPrice(200)
        }
      ]);
    });
  });
});
