import type { GiftProductGroup, GiftVariantOption } from '@/features/gift-products/model/types';

export const groupGiftsByProduct = (gifts: GiftVariantOption[]): GiftProductGroup[] => {
  const groups = new Map<string, GiftProductGroup>();

  for (const gift of gifts) {
    const key = gift.productId || 'unknown';
    const existing = groups.get(key);
    if (existing) {
      existing.variants.push(gift);
      if (!existing.imageUrl && gift.imageUrl) {
        existing.imageUrl = gift.imageUrl;
      }
      continue;
    }

    groups.set(key, {
      productId: key,
      productTitle: gift.productTitle || 'Product',
      imageUrl: gift.imageUrl,
      variants: [gift],
    });
  }

  return Array.from(groups.values());
};
