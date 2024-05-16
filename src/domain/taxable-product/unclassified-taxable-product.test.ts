import {describe, expect, it} from "@jest/globals";
import {
  IsFoodAndBeverage,
  isFoodAndBeverage, NonOralProductPrice,
  OralProductPrice, SingleProductPrice, translateToUnclassifiedProduct
} from "./unclassified-taxable-product";
import {
  DeliveryMethod,
  DeliveryTo,
  IsOralProduct,
  OrderedProductId,
  ProductPrice,
  ProductType,
  ServiceType
} from "../ordered-product/ordered-product";

describe("unclassified Taxable Product", () => {
  describe("OralProductPrice", () => {
    it("OralProductPriceの0未満の場合エラーを返す", () => {
      expect(() => OralProductPrice(-1)).toThrowError("金額は0〜99999の整数で入力してください。");
    });
    it("OralProductPriceの99999より大きい場合エラーを返す", () => {
      expect(() => OralProductPrice(100000)).toThrowError("金額は0〜99999の整数で入力してください。");
    });
    it("OralProductPriceを生成する", () => {
      const actual = OralProductPrice(100);
      expect(actual).toBe(100);
    });
  });

  describe("translateToUnclassifiedProduct", () => {
    it("未分類の一体資産の組から未分類の一体資産を作成する", () => {
      const orderedProducts = [
        {
          id: OrderedProductId("test1"),
          productType: ProductType.Newspaper,
          isOralProduct: IsOralProduct(true),
          serviceType: ServiceType.TakeOut,
          deliveryMethod: DeliveryMethod.Catering,
          deliveryTo: DeliveryTo.Apartment,
          price: ProductPrice(1000),
        },
        {
          id: OrderedProductId("test2"),
          productType: ProductType.Book,
          isOralProduct: IsOralProduct(true),
          serviceType: ServiceType.TakeOut,
          deliveryMethod: DeliveryMethod.Catering,
          deliveryTo: DeliveryTo.Apartment,
          price: ProductPrice(2000),
        },
        {
          id: OrderedProductId("test3"),
          productType: ProductType.QuasiDrug,
          isOralProduct: IsOralProduct(false),
          serviceType: ServiceType.TakeOut,
          deliveryMethod: DeliveryMethod.Delivery,
          deliveryTo: DeliveryTo.Apartment,
          price: ProductPrice(3000),
        }
      ];
      const actual = translateToUnclassifiedProduct(orderedProducts);
      expect(actual).toEqual([
        {
          type: "UnclassifiedIntegratedAsset",
          oralProduct: {
            price: OralProductPrice(2000),
            isFoodAndBeverage: IsFoodAndBeverage(false),
          },
          nonOralProduct: {
            price: NonOralProductPrice(3000),
          }
        },
        {
          type: "UnclassifiedSingleProduct",
          productType: ProductType.Newspaper,
          singleProductPrice: SingleProductPrice(1000),
          isOralProduct: IsOralProduct(true),
          isFoodAndBeverage: IsFoodAndBeverage(false)
        }

      ]);
    });
    it("未分類の一体資産の組がない場合空の配列を返す", () => {
      const pair = [];
      const actual = translateToUnclassifiedProduct(pair);
      expect(actual).toEqual([]);
    });
  });


  describe("isFoodAndBeverage", () => {
    it("飲食料品の場合trueを返す", () => {
      const product = {
        id: OrderedProductId("test1"),
        productType: ProductType.Newspaper,
        isOralProduct: IsOralProduct(true),
        serviceType: ServiceType.TakeOut,
        deliveryMethod: DeliveryMethod.Catering,
        deliveryTo: DeliveryTo.Apartment,
        price: ProductPrice(1000),
      };
      const actual = isFoodAndBeverage(product);
      expect(actual).toBe(false);
    });
    it("飲食料品でない場合falseを返す", () => {
      const product = {
        id: OrderedProductId("test1"),
        productType: ProductType.Newspaper,
        isOralProduct: IsOralProduct(true),
        serviceType: ServiceType.TakeOut,
        deliveryMethod: DeliveryMethod.Catering,
        deliveryTo: DeliveryTo.Apartment,
        price: ProductPrice(1000),
      };
      const actual = isFoodAndBeverage(product);
      expect(actual).toBe(false);
    });
  });
});