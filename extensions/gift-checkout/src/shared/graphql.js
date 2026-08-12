export const GIFT_VARIANTS_QUERY = `query GiftVariants($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on ProductVariant {
      id
      title
      product {
        title
        isGiftCard
      }
    }
  }
}`;
