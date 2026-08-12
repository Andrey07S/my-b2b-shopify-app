export const GIFT_VARIANTS_QUERY = `#graphql
  query GiftVariants($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        title
        image { url }
        product {
          id
          title
          isGiftCard
          featuredImage { url }
        }
      }
    }
  }
`;

export const FILTER_GIFT_CARDS_QUERY = `#graphql
  query FilterGiftCards($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        product { isGiftCard }
      }
    }
  }
`;
