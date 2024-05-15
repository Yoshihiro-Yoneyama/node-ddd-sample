import {describe, expect, it} from "@jest/globals";
import {
  DeliveryMethod, DeliveryTo,
  IsOralProduct,
  OrderedProductId,
  OrderedProducts, ProductPrice,
  ProductType,
  ServiceType
} from "../ordered-product/ordered-product";
import {applyDiscountRule} from "./discount-rule";

describe('Discount Rule Tests', () => {
  describe('applyDiscountRule', () => {
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
      const actual = applyDiscountRule(orderedProducts)(500);
      expect(actual).toBe(450);
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
      const actual = applyDiscountRule(orderedProducts)(200);
      expect(actual).toBe(200);
    });
  })
});