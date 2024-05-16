import {describe, it, expect} from "@jest/globals";
import {DeriveTotalPriceWorkflow} from "./derive-total-price-workflow";
import deriveTotalPrice = DeriveTotalPriceWorkflow.deriveTotalPrice;
import {DeriveTotalPriceWorkflowInputs} from "./derive-total-price-workflow-input";

describe("derive total price workflow", () => {
  describe("deriveTotalPrice", () => {
    it("注文を種別ごとに分類した情報から最終的な合計金額を算出する", () => {
      const input: DeriveTotalPriceWorkflowInputs = [
        {
          productType: "Food",
          isOralProduct: true,
          serviceType: "TakeOut",
          deliveryMethod: "Catering",
          deliveryTo: "House",
          price: 400,
        },
        {
          productType: "Book",
          isOralProduct: false,
          serviceType: "TakeOut",
          deliveryMethod: "Catering",
          deliveryTo: "House",
          price: 500,
        },
        {
          productType: "Medicine",
          isOralProduct: true,
          serviceType: "TakeOut",
          deliveryMethod: "Catering",
          deliveryTo: "House",
          price: 300,
        },
      ];
      const actual = deriveTotalPrice(input);
      expect(actual).toBe(1320);
    });
  });
});