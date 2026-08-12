import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/BlockExtension.js' {
  const shopify: import('@shopify/ui-extensions/admin.customer-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/components/CustomerBlock.js' {
  const shopify: import('@shopify/ui-extensions/admin.customer-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/constants.js' {
  const shopify: import('@shopify/ui-extensions/admin.customer-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/shared/graphql.js' {
  const shopify: import('@shopify/ui-extensions/admin.customer-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}
