import {describe, expect, it} from "@jest/globals";
import {checkIsEligibleForDiscount, discount, IsEligibleForDiscount} from "./discount-rule";
import {
  DeliveryMethod,
  DeliveryTo,
  IsOralProduct,
  OrderedProductId,
  OrderedProducts,
  ProductPrice,
  ProductType,
  ServiceType
} from "../ordered-product/ordered-product";

describe('Discount Rule Tests', () => {
  describe('IsEligibleForDiscount', () => {
    it('valueがtrueのオジェクトを生成する', () => {
      const actual = IsEligibleForDiscount(true);
      expect(actual).toBe(true);
    });

    it('valueがfalseのオブジェクトを生成する', () => {
      const actual = IsEligibleForDiscount(false);
      expect(actual).toBe(false);
    });
  });

  describe('checkIsEligibleForDiscount', () => {
    it('課税商品の一覧が値引き対象だったらIsEligibleForDiscountがTrueのオブジェクトを返却する', () => {
      const orderedProducts: OrderedProducts = [
        {
          id: OrderedProductId("test"),
          productType: ProductType.Newspaper,
          isOralProduct: IsOralProduct(true),
          serviceType: ServiceType.TakeOut,
          deliveryMethod: DeliveryMethod.Catering,
          deliveryTo: DeliveryTo.Apartment,
          price: ProductPrice(200),
        },
        {
          id: OrderedProductId("test"),
          productType: ProductType.Book,
          isOralProduct: IsOralProduct(false),
          serviceType: ServiceType.TakeOut,
          deliveryMethod: DeliveryMethod.Catering,
          deliveryTo: DeliveryTo.Apartment,
          price: ProductPrice(300),
        },
      ];
      const actual = checkIsEligibleForDiscount(orderedProducts);
      expect(actual).toBe(true);
    });

    it('課税商品の一覧が値引き対象でなかったらIsEligibleForDiscountがFalseのオブジェクトを返却する', () => {
      const orderedProducts: OrderedProducts = [
        {
          id: OrderedProductId("test"),
          productType: ProductType.Newspaper,
          isOralProduct: IsOralProduct(true),
          serviceType: ServiceType.TakeOut,
          deliveryMethod: DeliveryMethod.Catering,
          deliveryTo: DeliveryTo.Apartment,
          price: ProductPrice(200),
        }
      ];
      const actual = checkIsEligibleForDiscount(orderedProducts);
      expect(actual).toBe(false);
    });
  });

  describe('discount', () => {
    it('IsEligibleForDiscountがtrueの場合、割引後の金額を返す', () => {
      const actual = discount(1000, IsEligibleForDiscount(true));
      expect(actual).toBe(900);
    });

    it('IsEligibleForDiscountがfalseの場合、割引前の金額を返す', () => {
      const actual = discount(1000, IsEligibleForDiscount(false));
      expect(actual).toBe(1000);
    });
  });
});