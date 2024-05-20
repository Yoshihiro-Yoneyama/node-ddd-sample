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

describe("discount rule", () => {
  describe("applyDiscountRule", () => {
    it("注文商品リストが値引き対象だったら税込合計金額から10%値引きした金額を返す", () => {
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

    it("注文商品リストが値引き対象でなければ税込合計金額を返す", () => {
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