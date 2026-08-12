export const SETUP_FUNCTIONS_QUERY = `#graphql
  query SetupFunctions {
    shopifyFunctions(first: 50) {
      nodes { id handle title apiType }
    }
  }
`;

export const SETUP_DISCOUNT_NODES_QUERY = `#graphql
  query SetupDiscountNodes {
    discountNodes(first: 50) {
      nodes {
        discount {
          __typename
          ... on DiscountAutomaticApp {
            title
            status
            appDiscountType { functionId }
          }
        }
      }
    }
  }
`;

export const SETUP_DISCOUNT_MUTATION = `#graphql
  mutation SetupDiscount($discount: DiscountAutomaticAppInput!) {
    discountAutomaticAppCreate(automaticAppDiscount: $discount) {
      automaticAppDiscount { discountId title status }
      userErrors { field message }
    }
  }
`;

export const SETUP_CART_TRANSFORMS_QUERY = `#graphql
  query SetupCartTransforms {
    cartTransforms(first: 25) {
      nodes { id functionId }
    }
  }
`;

export const SETUP_CART_TRANSFORM_MUTATION = `#graphql
  mutation SetupCartTransform($functionHandle: String!) {
    cartTransformCreate(functionHandle: $functionHandle, blockOnFailure: false) {
      cartTransform { id functionId }
      userErrors { field message code }
    }
  }
`;

export const SETUP_VALIDATIONS_QUERY = `#graphql
  query SetupValidations {
    validations(first: 25) {
      nodes {
        id
        title
        enabled
        shopifyFunction { handle }
      }
    }
  }
`;

export const SETUP_VALIDATION_MUTATION = `#graphql
  mutation SetupValidation($validation: ValidationCreateInput!) {
    validationCreate(validation: $validation) {
      validation { id title enabled }
      userErrors { field message }
    }
  }
`;

export const STATUS_CART_TRANSFORMS_QUERY = `#graphql
  query StatusCartTransforms {
    cartTransforms(first: 10) { nodes { id } }
  }
`;

export const STATUS_VALIDATIONS_QUERY = `#graphql
  query StatusValidations {
    validations(first: 25) {
      nodes { enabled shopifyFunction { handle } }
    }
  }
`;

export const CLEANUP_CART_TRANSFORMS_QUERY = `#graphql
  query CleanupCartTransforms {
    cartTransforms(first: 25) { nodes { id } }
  }
`;

export const CLEANUP_CART_TRANSFORM_MUTATION = `#graphql
  mutation CleanupCartTransform($id: ID!) {
    cartTransformDelete(id: $id) {
      deletedId
      userErrors { message }
    }
  }
`;

export const CLEANUP_VALIDATIONS_QUERY = `#graphql
  query CleanupValidations {
    validations(first: 25) {
      nodes { id }
    }
  }
`;

export const CLEANUP_VALIDATION_MUTATION = `#graphql
  mutation CleanupValidation($id: ID!) {
    validationDelete(id: $id) {
      deletedId
      userErrors { message }
    }
  }
`;

export const CLEANUP_DISCOUNT_NODES_QUERY = `#graphql
  query CleanupDiscountNodes {
    discountNodes(first: 50) {
      nodes {
        id
        discount {
          __typename
          ... on DiscountAutomaticApp { title }
        }
      }
    }
  }
`;

export const CLEANUP_DISCOUNT_MUTATION = `#graphql
  mutation CleanupDiscount($id: ID!) {
    discountAutomaticDelete(id: $id) {
      deletedAutomaticDiscountId
      userErrors { message }
    }
  }
`;
