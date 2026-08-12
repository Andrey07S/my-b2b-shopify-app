import { THEME_BLOCK_HANDLE } from '@/shared/config/constants';
import { SHOPIFY_API_KEY } from '@/shared/config/env.server';

import type { StorefrontLinks } from './storefrontLinks';

export type { StorefrontLinks } from './storefrontLinks';

const shopHandle = (shop: string): string => {
  return shop.replace(/\.myshopify\.com$/i, '');
};

/** Admin URLs must use admin.shopify.com — myshopify.com/admin is blocked from the embedded app iframe. */
export const buildStorefrontLinks = (shop: string): StorefrontLinks => {
  const apiKey = SHOPIFY_API_KEY;
  const handle = shopHandle(shop);
  const adminBase = `https://admin.shopify.com/store/${handle}`;

  return {
    themeBlockUrl: `${adminBase}/themes/current/editor?template=cart&addAppBlockId=${apiKey}/${THEME_BLOCK_HANDLE}&target=newAppsSection`,
    checkoutEditorUrl: `${adminBase}/settings/checkout/editor`,
  };
};
