import { FILTER_GIFT_CARDS_QUERY } from './graphql';

export const filterOutGiftCardVariantIdsClient = async (ids: string[]): Promise<string[]> => {
  if (ids.length === 0) return [];

  try {
    const response = await fetch('shopify:admin/api/graphql.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: FILTER_GIFT_CARDS_QUERY,
        variables: { ids },
      }),
    });
    if (!response.ok) return ids;

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
  } catch {
    return ids;
  }
};
