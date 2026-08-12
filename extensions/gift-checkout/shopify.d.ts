import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/Checkout.js' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/CheckoutCartLines.js' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.cart-line-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/components/GiftUi.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.checkout.block.render').Api
    | import('@shopify/ui-extensions/purchase.checkout.cart-line-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/components/GiftChoiceList.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.checkout.block.render').Api
    | import('@shopify/ui-extensions/purchase.checkout.cart-line-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/components/GiftStatusBanner.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.checkout.block.render').Api
    | import('@shopify/ui-extensions/purchase.checkout.cart-line-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/constants.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.checkout.block.render').Api
    | import('@shopify/ui-extensions/purchase.checkout.cart-line-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/graphql.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.checkout.block.render').Api
    | import('@shopify/ui-extensions/purchase.checkout.cart-line-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/merchandise.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.checkout.block.render').Api
    | import('@shopify/ui-extensions/purchase.checkout.cart-line-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/parseRules.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.checkout.block.render').Api
    | import('@shopify/ui-extensions/purchase.checkout.cart-line-list.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}
