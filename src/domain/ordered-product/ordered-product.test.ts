import {describe, expect, it} from "@jest/globals";
import {
  createOrderedProductId,
  createProduct,
  DeliveryMethod,
  DeliveryTo,
  IsOralProduct,
  OrderedProductId,
  OrderedProducts,
  ProductPrice,
  ProductType,
  ServiceType
} from "./ordered-product";

describe('Ordered Product Tests', () => {
  describe('OrderedProduct', () => {
    it('OrderedProductを生成する', () => {
      const orderedProduct = {
        id: OrderedProductId("test"),
        productType: ProductType.Newspaper,
        isOralProduct: IsOralProduct(false),
        serviceType: ServiceType.TakeOut,
        deliveryMethod: DeliveryMethod.Catering,
        deliveryTo: DeliveryMethod.InternetDelivery,
        price: ProductPrice(1000),
      }
      expect(orderedProduct).toBeTruthy();
    });
  });

  describe('OrderedProducts', () => {
    it('OrderedProductsを生成する', () => {
      const orderedProducts = [
        {
          id: OrderedProductId("test"),
          productType: ProductType.Newspaper,
          isOralProduct: IsOralProduct(false),
          serviceType: ServiceType.TakeOut,
          deliveryMethod: DeliveryMethod.Catering,
          deliveryTo: DeliveryMethod.InternetDelivery,
          price: ProductPrice(1000),
        }
      ]
      expect(orderedProducts).toBeTruthy();
    });
    it('OrderedProductsが0個の場合エラーを返す', () => {
      expect(() => OrderedProducts([])).toThrowError("商品は1〜10000個で入力してください。");
    });
    it('OrderedProductsが10000個より大きい場合エラーを返す', () => {
      expect(() => OrderedProducts(new Array(10001).fill({
        id: OrderedProductId("test"),
        productType: ProductType.Newspaper,
        isOralProduct: IsOralProduct(false),
        serviceType: ServiceType.TakeOut,
        deliveryMethod: DeliveryMethod.Catering,
        deliveryTo: DeliveryMethod.InternetDelivery,
        price: ProductPrice(1000),
      }))).toThrowError("商品は1〜10000個で入力してください。");
    });
  });

  describe('OrderedProductId', () => {
    it('OrderedProductIdを生成する', () => {
      const actual = OrderedProductId("test");
      expect(actual).toBe("test");
    });
  });

  describe('createOrderedProductId', () => {
    it('createOrderedProductIdを生成する', () => {
      const actual = createOrderedProductId();
      expect(actual).toBeTruthy()
    });
  });

  describe('ProductType', () => {
    it('ProductTypeを生成する', () => {
      const actual = ProductType.Newspaper;
      expect(actual).toBe("Newspaper");
    });
  });

  describe('ProductPrice', () => {
    it('ProductPriceを生成する', () => {
      const actual = ProductPrice(1000);
      expect(actual).toBe(1000);
    });
    it('ProductPriceが0未満の場合エラーを返す', () => {
      expect(() => ProductPrice(-1)).toThrowError("金額は0〜99999の整数で入力してください。");
    });
    it('ProductPriceが99999以上の場合エラーを返す', () => {
      expect(() => ProductPrice(100000)).toThrowError("金額は0〜99999の整数で入力してください。");
    });
  });

  describe('createProduct', () => {
    it('createProductを生成する', () => {
      const actual = createProduct(
        ProductType.Newspaper,
        IsOralProduct(false),
        ServiceType.TakeOut,
        DeliveryMethod.Catering,
        DeliveryTo.Apartment,
        ProductPrice(1000),
      );
      expect(actual).toBeTruthy()
    });
  });
});
