import {describe, it, expect} from "@jest/globals";
import {
  foodAndBeverage,
  newspaper, other,
  reducedTaxRateIntegratedAsset,
  standardTaxRateIntegratedAsset,
  TaxableProductPrice, TaxableProductType, translateToTaxableProduct
} from "./classified-taxable-product";
import {
  IsFoodAndBeverage,
  NonOralProductPrice,
  OralProductPrice, SingleProductPrice,
  UnClassifiedProduct
} from "./unclassified-taxable-product";
import {option} from "fp-ts";
import {IsOralProduct, ProductType} from "../ordered-product/ordered-product";

describe('Classified Taxable Product', () => {
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

  describe('reduceTaxableProductPrice', () => {
    it('低減税率対象の一体資産の条件を満たす場合そのオブジェクトを返す', () => {
      const unclassifiedTaxableProduct: UnClassifiedProduct = {
        type: "UnClassifiedIntegratedAsset",
        oralProduct: {
          price: OralProductPrice(101),
          isFoodAndBeverage: IsFoodAndBeverage(true),
        },
        nonOralProduct: {
          price: NonOralProductPrice(200),
        }
      };
      const actual = reducedTaxRateIntegratedAsset(unclassifiedTaxableProduct);
      expect(actual).toEqual(option.some({
        type: TaxableProductType.ReducedTaxRateIntegratedAsset,
        price: TaxableProductPrice(301)
      }));
    });
    it('低減税率対象の一体資産の条件を満たさない場合noneを返す', () => {
      const unclassifiedTaxableProduct: UnClassifiedProduct = {
        type: "UnClassifiedIntegratedAsset",
        oralProduct: {
          price: OralProductPrice(100),
          isFoodAndBeverage: IsFoodAndBeverage(false),
        },
        nonOralProduct: {
          price: NonOralProductPrice(200),
        }
      };
      const actual = reducedTaxRateIntegratedAsset(unclassifiedTaxableProduct);
      expect(actual).toEqual(option.none);
    });
  });
  describe('standardTaxRateIntegratedAsset', () => {
    it('標準税率対象の一体資産の条件を満たす場合そのオブジェクトを返す', () => {
      const unclassifiedTaxableProduct: UnClassifiedProduct = {
        type: "UnClassifiedIntegratedAsset",
        oralProduct: {
          price: OralProductPrice(100),
          isFoodAndBeverage: IsFoodAndBeverage(false),
        },
        nonOralProduct: {
          price: NonOralProductPrice(200),
        }
      };
      const actual = standardTaxRateIntegratedAsset(unclassifiedTaxableProduct);
      expect(actual).toEqual(option.some({
        type: TaxableProductType.StandardTaxRateIntegratedAsset,
        price: TaxableProductPrice(300)
      }));
    });
    it('標準税率対象の一体資産の条件を満たさない場合noneを返す', () => {
      const unclassifiedTaxableProduct: UnClassifiedProduct = {
        type: "UnClassifiedSingleProduct",
        productType: ProductType.Newspaper,
        singleProductPrice: SingleProductPrice(200),
        isOralProduct: IsOralProduct(false),
        isFoodAndBeverage: IsFoodAndBeverage(false),
      };
      const actual = standardTaxRateIntegratedAsset(unclassifiedTaxableProduct);
      expect(actual).toEqual(option.none);
    });
  });

  describe('newspaper', () => {
    it('新聞の場合そのオブジェクトを返す', () => {
      const unclassifiedTaxableProduct: UnClassifiedProduct = {
        type: "UnClassifiedSingleProduct",
        productType: ProductType.Newspaper,
        singleProductPrice: SingleProductPrice(200),
        isOralProduct: IsOralProduct(false),
        isFoodAndBeverage: IsFoodAndBeverage(false),
      };
      const actual = newspaper(unclassifiedTaxableProduct);
      expect(actual).toEqual(option.some({
        type: TaxableProductType.Newspaper,
        price: TaxableProductPrice(200)
      }));
    });
    it('新聞でない場合noneを返す', () => {
      const unclassifiedTaxableProduct: UnClassifiedProduct = {
        type: "UnClassifiedSingleProduct",
        productType: ProductType.Book,
        singleProductPrice: SingleProductPrice(200),
        isOralProduct: IsOralProduct(false),
        isFoodAndBeverage: IsFoodAndBeverage(false),
      };
      const actual = newspaper(unclassifiedTaxableProduct);
      expect(actual).toEqual(option.none);
    });
  });

  describe('foodAndBeverage', () => {
    it('飲食料品の場合そのオブジェクトを返す', () => {
      const unclassifiedTaxableProduct: UnClassifiedProduct = {
        type: "UnClassifiedSingleProduct",
        productType: ProductType.Newspaper,
        singleProductPrice: SingleProductPrice(200),
        isOralProduct: IsOralProduct(false),
        isFoodAndBeverage: IsFoodAndBeverage(true),
      };
      const actual = foodAndBeverage(unclassifiedTaxableProduct);
      expect(actual).toEqual(option.some({
        type: TaxableProductType.FoodAndBeverage,
        price: TaxableProductPrice(200)
      }));
    });
    it('飲食料品でない場合noneを返す', () => {
      const unclassifiedTaxableProduct: UnClassifiedProduct = {
        type: "UnClassifiedSingleProduct",
        productType: ProductType.Book,
        singleProductPrice: SingleProductPrice(200),
        isOralProduct: IsOralProduct(false),
        isFoodAndBeverage: IsFoodAndBeverage(false),
      };
      const actual = foodAndBeverage(unclassifiedTaxableProduct);
      expect(actual).toEqual(option.none);
    });
  });

  describe('Other', () => {
    it('その他の場合そのオブジェクトを返す', () => {
      const unclassifiedTaxableProduct: UnClassifiedProduct = {
        type: "UnClassifiedSingleProduct",
        productType: ProductType.Book,
        singleProductPrice: SingleProductPrice(200),
        isOralProduct: IsOralProduct(false),
        isFoodAndBeverage: IsFoodAndBeverage(false),
      };
      const actual = other(unclassifiedTaxableProduct);
      expect(actual).toEqual({
        type: TaxableProductType.Other,
        price: TaxableProductPrice(200)
      });
    });
  });

  describe('translateToTaxableProduct', () => {
    it('税率未分類の商品リストから税率別の商品リストへ変換する', () => {
      const unclassifiedTaxableProduct: UnClassifiedProduct[] = [
        {
          type: "UnClassifiedIntegratedAsset",
          oralProduct: {
            price: OralProductPrice(101),
            isFoodAndBeverage: IsFoodAndBeverage(true),
          },
          nonOralProduct: {
            price: NonOralProductPrice(200),
          }
        },
        {
          type: "UnClassifiedSingleProduct",
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
