import {describe, expect, it} from "@jest/globals";
import {
  createTaxableProductAndTaxRate,
  TaxableProductPrice,
  TaxableProductType,
  translateToTaxableProduct
} from "./classified-taxable-product";
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
    it('TaxableProductPriceが0未満の場合エラーを返す', () => {
      expect(() => TaxableProductPrice(-1)).toThrowError("金額は0〜99999の整数で入力してください。");
    });
    it('TaxableProductPriceが99999より大きい場合エラーを返す', () => {
      expect(() => TaxableProductPrice(100000)).toThrowError("金額は0〜99999の整数で入力してください。");
    });
    it.each([0, 99999])('TaxableProductPriceを生成する', (price) => {
      const actual = TaxableProductPrice(price);
      expect(actual).toBe(price);
    });
  });

  describe('createTaxableProductAndTaxRate', () => {
    it('ReducedTaxRateIntegratedAssetの場合税率8%のTaxableProductAndTaxRateが生成される', () => {
      const taxableProduct = {
        type: TaxableProductType.ReducedTaxRateIntegratedAsset,
        price: TaxableProductPrice(100)
      };
      const actual = createTaxableProductAndTaxRate(taxableProduct);
      expect(actual).toEqual([taxableProduct, {taxRate: 1.08}]);
    });
    it('StandardTaxRateIntegratedAssetの場合税率10%のTaxableProductAndTaxRateが生成される', () => {
      const taxableProduct = {
        type: TaxableProductType.StandardTaxRateIntegratedAsset,
        price: TaxableProductPrice(100)
      };
      const actual = createTaxableProductAndTaxRate(taxableProduct);
      expect(actual).toEqual([taxableProduct, {taxRate: 1.1}]);
    });
    it('Newspaperの場合税率8%のTaxableProductAndTaxRateが生成される', () => {
      const taxableProduct = {
        type: TaxableProductType.Newspaper,
        price: TaxableProductPrice(100)
      };
      const actual = createTaxableProductAndTaxRate(taxableProduct);
      expect(actual).toEqual([taxableProduct, {taxRate: 1.08}]);
    });
    it('FoodAndBeverageの場合税率8%のTaxableProductAndTaxRateが生成される', () => {
      const taxableProduct = {
        type: TaxableProductType.FoodAndBeverage,
        price: TaxableProductPrice(100)
      };
      const actual = createTaxableProductAndTaxRate(taxableProduct);
      expect(actual).toEqual([taxableProduct, {taxRate: 1.08}]);
    });
    it('Otherの場合税率10%のTaxableProductAndTaxRateが生成される', () => {
      const taxableProduct = {
        type: TaxableProductType.Other,
        price: TaxableProductPrice(100)
      };
      const actual = createTaxableProductAndTaxRate(taxableProduct);
      expect(actual).toEqual([taxableProduct, {taxRate: 1.1}]);
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
          type: "UnclassifiedIntegratedAsset",
          oralProduct: {
            price: OralProductPrice(100),
            isFoodAndBeverage: IsFoodAndBeverage(false),
          },
          nonOralProduct: {
            price: NonOralProductPrice(200),
          }
        },
        {
          type: "UnclassifiedSingleProduct",
          productType: ProductType.Newspaper,
          singleProductPrice: SingleProductPrice(300),
          isOralProduct: IsOralProduct(false),
          isFoodAndBeverage: IsFoodAndBeverage(false),
        },
        {
          type: "UnclassifiedSingleProduct",
          productType: ProductType.Food,
          singleProductPrice: SingleProductPrice(300),
          isOralProduct: IsOralProduct(true),
          isFoodAndBeverage: IsFoodAndBeverage(true),
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
          type: TaxableProductType.StandardTaxRateIntegratedAsset,
          price: TaxableProductPrice(300)
        },
        {
          type: TaxableProductType.Newspaper,
          price: TaxableProductPrice(300)
        },
        {
          type: TaxableProductType.FoodAndBeverage,
          price: TaxableProductPrice(300)
        },
        {
          type: TaxableProductType.Other,
          price: TaxableProductPrice(200)
        }
      ]);
    });
  });
});
