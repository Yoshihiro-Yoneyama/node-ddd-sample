import {OrderedProducts, Product} from "../product/product";

export type UnClassifiedIntegratedAsset = {
  type: "UnClassifiedIntegratedAsset",
  oralProduct: Product,
  nonOralProduct: Product,
}
export type UnClassifiedSingleProduct = {
  type: "UnClassifiedSingleProduct",
  product: Product,
}
export type UnClassifiedProduct = UnClassifiedIntegratedAsset | UnClassifiedSingleProduct


// 注文内容から税率未分類の商品を作成する関数
export function translateToUnclassifiedTaxRateProduct(orderedProducts: OrderedProducts): UnClassifiedProduct[] {
  let unClassifiedProducts: UnClassifiedProduct[] = [];
  let currentUnClassifiedProduct: Product | null = null;

  for (const product of orderedProducts.products) {
    if (currentUnClassifiedProduct === null) {
      currentUnClassifiedProduct = product;
    }
    else if (currentUnClassifiedProduct.isOralProduct !== product.isOralProduct) {
      const unClassifiedIntegratedAsset: UnClassifiedIntegratedAsset = {
        type: "UnClassifiedIntegratedAsset",
        oralProduct: currentUnClassifiedProduct.isOralProduct ? currentUnClassifiedProduct : product,
        nonOralProduct: currentUnClassifiedProduct.isOralProduct ? product : currentUnClassifiedProduct,
      };
      unClassifiedProducts.push(unClassifiedIntegratedAsset);
      currentUnClassifiedProduct = null;
    }
    else {
      const unClassifiedSingleProduct: UnClassifiedSingleProduct = {
        type: "UnClassifiedSingleProduct",
        product: currentUnClassifiedProduct
      };
      unClassifiedProducts.push(unClassifiedSingleProduct)
      currentUnClassifiedProduct = product;
    }
  }
  if (currentUnClassifiedProduct !== null) {
    unClassifiedProducts.push({
      type: "UnClassifiedSingleProduct",
      product: currentUnClassifiedProduct
    });
  }

  return unClassifiedProducts;
}