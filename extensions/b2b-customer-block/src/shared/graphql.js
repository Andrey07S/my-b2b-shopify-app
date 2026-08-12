export const B2B_CUSTOMER_BLOCK_QUERY = `query B2bCustomerBlock($id: ID!) {
  customer(id: $id) {
    id
    displayName
    tags
  }
  shop {
    metafield(namespace: "$app", key: "tier_rules") {
      jsonValue
    }
  }
}`;

export const REMOVE_B2B_TAG_MUTATION = `mutation RemoveB2bTag($id: ID!, $tags: [String!]!) {
  tagsRemove(id: $id, tags: $tags) {
    node { ... on Customer { id tags } }
    userErrors { message }
  }
}`;

export const ADD_B2B_TAG_MUTATION = `mutation AddB2bTag($id: ID!, $tags: [String!]!) {
  tagsAdd(id: $id, tags: $tags) {
    node { ... on Customer { id tags } }
    userErrors { message }
  }
}`;
