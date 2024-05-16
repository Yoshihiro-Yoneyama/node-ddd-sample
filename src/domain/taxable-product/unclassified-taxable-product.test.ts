import {describe, expect, it} from "@jest/globals";
import {
  createUnclassifiedIntegratedAsset,
  createUnclassifiedIntegratedAssetBundle, extractUnclassifiedSingleProduct, isFoodAndBeverage,
  OralProductPrice
} from "./unclassified-taxable-product";
import {
  DeliveryMethod,
  DeliveryTo,
  IsOralProduct,
  OrderedProductId, OrderedProducts,
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

  });

  describe("createUnclassifiedIntegratedAssetBundle", () => {
    it("注文した商品リストから未分類の一体資産の組を作成する", () => {
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
      const actual = createUnclassifiedIntegratedAssetBundle(orderedProducts);
      expect(actual).toEqual([
        [
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
        ]
      ]);
    });
    it("注文した商品リストから未分類の一体資産の組がない場合空の配列を返す", () => {
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
          productType: ProductType.Newspaper,
          isOralProduct: IsOralProduct(true),
          serviceType: ServiceType.TakeOut,
          deliveryMethod: DeliveryMethod.Catering,
          deliveryTo: DeliveryTo.Apartment,
          price: ProductPrice(3000),
        }
      ];
      const actual = createUnclassifiedIntegratedAssetBundle(orderedProducts);
      expect(actual).toEqual([]);
    });
  });

  describe("createUnclassifiedIntegratedAsset", () => {
    it("未分類の一体資産の組からから未分類の一体資産を作成する", () => {
      const pair = [
        [
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
          }
        ]
      ];
      const actual = createUnclassifiedIntegratedAsset(pair);
      expect(actual).toEqual([
        {
          type: "UnclassifiedIntegratedAsset",
          oralProduct: {
            price: 1000,
            isFoodAndBeverage: false,
          },
          nonOralProduct: {
            price: 2000,
          },
        }
      ]);
    });
    it("未分類の一体資産の組からから未分類の一体資産がない場合空の配列を返す", () => {
      const pair = [];
      const actual = createUnclassifiedIntegratedAsset(pair);
      expect(actual).toEqual([]);
    });
  });

  describe("extractUnclassifiedSingleProduct", () => {
    it("注文した商品リストから一体資産ではない商品のリストを抽出する", () => {
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
      const productsForIntegratedAsset = [
        [
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
        ]
      ];
      const actual = extractUnclassifiedSingleProduct(orderedProducts, productsForIntegratedAsset);
      expect(actual).toEqual([
        {
          type: "UnclassifiedSingleProduct",
          productType: ProductType.Newspaper,
          singleProductPrice: 1000,
          isOralProduct: true,
          isFoodAndBeverage: false,
        }
      ]);
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