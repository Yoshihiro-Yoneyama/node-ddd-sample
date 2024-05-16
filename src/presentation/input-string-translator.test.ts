import {describe, it, expect} from "@jest/globals";
import {
  extractDeliveryMethodType,
  extractDeliveryToType, extractPrice,
  extractProductType,
  extractServiceType, translateToWorkflowInput
} from "./input-string-translator";

describe("input string translator", () => {
  describe("translateToWorkflowInput", () => {
    it("入力文字列をワークフローの入力に変換する", () => {
      const inputString = "BTDD500";
      const actual = translateToWorkflowInput(inputString);
      expect(actual).toEqual([
        {
          productType: "Book",
          isOralProduct: false,
          serviceType: "TakeOut",
          deliveryMethod: "Delivery",
          deliveryTo: "House",
          price: 500,
        }
      ]);
    });
  });
  describe("extractProductType", () => {
    it("引数の文字列から商品種別(書籍)を抽出する", () => {
      const actual = [
        {remainder: "BTDD500"}
      ].map(extractProductType);
      expect(actual).toEqual([
        {
          remainder: "TDD500",
          productType: "Book",
          isOralProduct: false
        }
      ]);
    });
    it("引数の文字列から商品種別(清涼飲料水)を抽出する", () => {
      const actual = [
        {remainder: "DTDD500"}
      ].map(extractProductType);
      expect(actual).toEqual([
        {
          remainder: "TDD500",
          productType: "Beverage",
          isOralProduct: true
        }
      ]);
    });
    it("引数の文字列から商品種別(酒類)を抽出する", () => {
      const actual = [
        {remainder: "DaTDD500"}
      ].map(extractProductType);
      expect(actual).toEqual([
        {
          remainder: "TDD500",
          productType: "Alcohol",
          isOralProduct: true
        }
      ]);
    });
    it("引数の文字列から商品種別(医薬部外品)を抽出する", () => {
      const actual = [
        {remainder: "deTDD500"}
      ].map(extractProductType);
      expect(actual).toEqual([
        {
          remainder: "TDD500",
          productType: "QuasiDrug",
          isOralProduct: true
        }
      ]);
    });
    it("引数の文字列から商品種別(新聞)を抽出する", () => {
      const actual = [
        {remainder: "BnTDD500"}
      ].map(extractProductType);
      expect(actual).toEqual([
        {
          remainder: "TDD500",
          productType: "Newspaper",
          isOralProduct: false
        }
      ]);
    });
    it("引数の文字列から商品種別(医薬品)を抽出する", () => {
      const actual = [
        {remainder: "dTDD500"}
      ].map(extractProductType);
      expect(actual).toEqual([
        {
          remainder: "TDD500",
          productType: "Medicine",
          isOralProduct: true
        }
      ]);
    });
    it("引数の文字列から商品種別(その他)を抽出する", () => {
      const actual = [
        {remainder: "OTDD500"}
      ].map(extractProductType);
      expect(actual).toEqual([
        {
          remainder: "TDD500",
          productType: "Other",
          isOralProduct: false
        }
      ]);
    });
    it("引数の文字列から商品種別(食料品)を抽出する", () => {
      const actual = [
        {remainder: "PTDD500"}
      ].map(extractProductType);
      expect(actual).toEqual([
        {
          remainder: "TDD500",
          productType: "Food",
          isOralProduct: true
        }
      ]);
    });
    it("商品種別が存在しない場合はエラーを返す", () => {
      expect(() => [{remainder: "TDD500"}].map(extractProductType))
        .toThrowError("存在しない商品種別が指定されています。")
    });
  });

  describe("extractServiceType", () => {
    it("引数の文字列からサービス種別(テイクアウト)を抽出する", () => {
      const actual = [
        {remainder: "TDD500"}
      ].map(extractServiceType);
      expect(actual).toEqual([
        {
          remainder: "DD500",
          serviceType: "TakeOut"
        }
      ]);
    });
    it("引数の文字列からサービス種別(イートイン)を抽出する", () => {
      const actual = [
        {remainder: "EDD500"}
      ].map(extractServiceType);
      expect(actual).toEqual([
        {
          remainder: "DD500",
          serviceType: "EatIn"
        }
      ]);
    });
    it("サービス種別が存在しない場合はエラーを返す", () => {
      expect(() => [{remainder: "DDD500"}].map(extractServiceType))
        .toThrowError("存在しないサービス種別が指定されています。");
    });


  });
  describe("extractDeliveryMethodType", () => {
    it("引数の文字列から配送方法(ケータリング)を抽出する", () => {
      const actual = [
        {remainder: "KD500"}
      ].map(extractDeliveryMethodType);
      expect(actual).toEqual([
        {
          remainder: "D500",
          deliveryMethodType: "Catering"
        }
      ]);
    });
    it("引数の文字列から配送方法(配達)を抽出する", () => {
      const actual = [
        {remainder: "DD500"}
      ].map(extractDeliveryMethodType);
      expect(actual).toEqual([
        {
          remainder: "D500",
          deliveryMethodType: "Delivery"
        }
      ]);
    });
    it("引数の文字列から配送方法(インターネット配信)を抽出する", () => {
      const actual = [
        {remainder: "ND500"}
      ].map(extractDeliveryMethodType);
      expect(actual).toEqual([
        {
          remainder: "D500",
          deliveryMethodType: "InternetDelivery"
        }
      ]);
    });
    it("配送方法が存在しない場合はエラーを返す", () => {
      expect(() => [{remainder: "AD500"}].map(extractDeliveryMethodType))
        .toThrowError("存在しない提供方法が指定されています。");
    });
  });
  describe("extractDeliveryToType", () => {
    it("引数の文字列から提供場所(戸建て)を抽出する", () => {
      const actual = [
        {remainder: "D500"}
      ].map(extractDeliveryToType);
      expect(actual).toEqual([
        {
          remainder: "500",
          deliveryToType: "House"
        }
      ]);
    });
    it("引数の文字列から提供場所(老人ホーム)を抽出する", () => {
      const actual = [
        {remainder: "N500"}
      ].map(extractDeliveryToType);
      expect(actual).toEqual([
        {
          remainder: "500",
          deliveryToType: "NursingHome"
        }
      ]);
    });
    it("引数の文字列から提供場所(マンション)を抽出する", () => {
      const actual = [
        {remainder: "M500"}
      ].map(extractDeliveryToType);
      expect(actual).toEqual([
        {
          remainder: "500",
          deliveryToType: "Apartment"
        }
      ]);
    });
    it("引数の文字列から提供場所(なし)を抽出する", () => {
      const actual = [
        {remainder: "500"}
      ].map(extractDeliveryToType);
      expect(actual).toEqual([
        {
          remainder: "500",
          deliveryToType: "NoPlace"
        }
      ]);
    });
    it("提供場所が存在しない場合はエラーを返す", () => {
      expect(() => [{remainder: "A500"}].map(extractDeliveryToType))
        .toThrowError("存在しない提供場所が指定されています。");
    });
  });
  describe("extractPrice", () => {
    it("数値を抽出する", () => {
      const actual = [
        {remainder: "500"}
      ].map(extractPrice);
      expect(actual).toEqual([
        {
          remainder: "500",
          price: 500
        }
      ]);
    });
    it("数値が存在しない場合はエラーを返す", () => {
      expect(() => [{remainder: "A"}].map(extractPrice))
        .toThrowError("金額が不正です。");
    });
  });
});