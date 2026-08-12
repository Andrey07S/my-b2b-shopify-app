import type { GiftVariantOption } from '@/features/gift-products/model/types';
import type { AdminGraphql } from '@/shared/api/adminGraphql.server';
import { parseJsonStringArray } from '@/shared/lib/json';

import { FILTER_GIFT_CARDS_QUERY, GIFT_VARIANTS_QUERY } from './graphql';

type VariantNode = {
  id?: string;
  title?: string;
  image?: { url?: string } | null;
  product?: {
    id?: string;
    title?: string;
    isGiftCard?: boolean;
    featuredImage?: { url?: string } | null;
  };
} | null;

export const loadGiftVariantOptions = async (
  admin: AdminGraphql,
  giftVariantIdsJson: string,
): Promise<GiftVariantOption[]> => {
  const ids = parseJsonStringArray(giftVariantIdsJson);
  if (ids.length === 0) return [];

  const response = await admin.graphql(GIFT_VARIANTS_QUERY, {
    variables: { ids },
  });
  const json = (await response.json()) as {
    data?: { nodes?: VariantNode[] };
  };
  const nodes = json.data?.nodes ?? [];

  const options: GiftVariantOption[] = [];
  for (const id of ids) {
    const node = nodes.find((candidate) => candidate?.id === id);
    if (!node?.id) continue;
    if (node.product?.isGiftCard) continue;

    const productTitle = node.product?.title || 'Product';
    const variantTitle = node.title || 'Default';
    options.push({
      id: node.id,
      label: variantTitle,
      productId: node.product?.id || '',
      productTitle,
      imageUrl: node.image?.url || node.product?.featuredImage?.url,
    });
  }

  return options;
};

/** Platform rejects $0 Gift Cards as free gifts. */
export const filterOutGiftCardVariantIds = async (
  admin: AdminGraphql,
  ids: string[],
): Promise<string[]> => {
  if (ids.length === 0) return [];

  const response = await admin.graphql(FILTER_GIFT_CARDS_QUERY, {
    variables: { ids },
  });
  const json = (await response.json()) as {
    data?: {
      nodes?: Array<{
        id?: string;
        product?: { isGiftCard?: boolean };
      } | null>;
    };
  };
  const nodes = json.data?.nodes ?? [];

  return ids.filter((id) => {
    const node = nodes.find((candidate) => candidate?.id === id);
    return Boolean(node?.id) && !node?.product?.isGiftCard;
  });
};
