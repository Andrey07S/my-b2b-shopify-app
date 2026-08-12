export const B2B_ORDER_BLOCK_QUERY = `query B2bOrderBlock($id: ID!) {
  order(id: $id) {
    name
    customAttributes {
      key
      value
    }
    discountApplications(first: 20) {
      nodes {
        __typename
        ... on AutomaticDiscountApplication {
          title
        }
        ... on ManualDiscountApplication {
          title
        }
        ... on ScriptDiscountApplication {
          title
        }
        ... on DiscountCodeApplication {
          code
        }
      }
    }
    lineItems(first: 50) {
      nodes {
        title
        originalTotalSet {
          shopMoney {
            amount
          }
        }
        discountedTotalSet {
          shopMoney {
            amount
          }
        }
      }
    }
    customer {
      displayName
      tags
    }
  }
  shop {
    metafield(namespace: "$app", key: "tier_rules") {
      jsonValue
    }
  }
}`;
