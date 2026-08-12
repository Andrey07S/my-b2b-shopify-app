export const SHOP_ID_QUERY = `#graphql
  query ShopId {
    shop { id }
  }
`;

export const SET_TIER_RULES_MUTATION = `#graphql
  mutation SetTierRules($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id key value }
      userErrors { field message }
    }
  }
`;
