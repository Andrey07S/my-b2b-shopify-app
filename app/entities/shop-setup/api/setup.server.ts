import { getRules, syncRulesToMetafield } from '@/entities/discount-rule';
import type { SetupResult, SetupStepStatus } from '@/entities/shop-setup/model/types';
import type { AdminGraphql } from '@/shared/api/adminGraphql.server';
import { gql } from '@/shared/api/adminGraphql.server';
import { DISCOUNT_TITLE, HANDLES, VALIDATION_TITLE } from '@/shared/config/shopifyHandles';

import {
  CLEANUP_CART_TRANSFORM_MUTATION,
  CLEANUP_CART_TRANSFORMS_QUERY,
  CLEANUP_DISCOUNT_MUTATION,
  CLEANUP_DISCOUNT_NODES_QUERY,
  CLEANUP_VALIDATION_MUTATION,
  CLEANUP_VALIDATIONS_QUERY,
  SETUP_CART_TRANSFORM_MUTATION,
  SETUP_CART_TRANSFORMS_QUERY,
  SETUP_DISCOUNT_MUTATION,
  SETUP_DISCOUNT_NODES_QUERY,
  SETUP_FUNCTIONS_QUERY,
  SETUP_VALIDATION_MUTATION,
  SETUP_VALIDATIONS_QUERY,
  STATUS_CART_TRANSFORMS_QUERY,
  STATUS_VALIDATIONS_QUERY,
} from './graphql';

type ShopifyFunctionNode = {
  id: string;
  handle: string;
  title: string;
  apiType: string;
};

const listFunctions = async (admin: AdminGraphql): Promise<ShopifyFunctionNode[]> => {
  const data = await gql<{
    shopifyFunctions: { nodes: ShopifyFunctionNode[] };
  }>(admin, SETUP_FUNCTIONS_QUERY);
  return data.shopifyFunctions.nodes;
}

const findFunction = (
  functions: ShopifyFunctionNode[],
  handle: string,
): ShopifyFunctionNode | undefined => {
  return functions.find((fn) => fn.handle === handle);
}

const sameFunctionId = (a: string, b: string): boolean => {
  if (!a || !b) return false;
  return a === b || a.endsWith(b) || b.endsWith(a);
}

type AppDiscountInfo = {
  title: string;
  status: string;
  functionId: string;
};

const listAppDiscounts = async (admin: AdminGraphql): Promise<AppDiscountInfo[]> => {
  const data = await gql<{
    discountNodes: {
      nodes: Array<{
        discount: {
          __typename: string;
          title?: string;
          status?: string;
          appDiscountType?: { functionId?: string } | null;
        };
      }>;
    };
  }>(admin, SETUP_DISCOUNT_NODES_QUERY);

  return data.discountNodes.nodes
    .filter((n) => n.discount.__typename === 'DiscountAutomaticApp')
    .map((n) => ({
      title: n.discount.title ?? '',
      status: n.discount.status ?? 'UNKNOWN',
      functionId: n.discount.appDiscountType?.functionId ?? '',
    }));
}

const findTierDiscount = (
  discounts: AppDiscountInfo[],
  functionId: string,
): AppDiscountInfo | undefined => {
  return (
    discounts.find((d) => sameFunctionId(d.functionId, functionId)) ||
    discounts.find((d) => d.title === DISCOUNT_TITLE) ||
    discounts.find((d) => /tier|b2b/i.test(d.title))
  );
}

const ensureDiscount = async (admin: AdminGraphql, functionId: string): Promise<SetupStepStatus> => {
  const discounts = await listAppDiscounts(admin);
  const match = findTierDiscount(discounts, functionId);

  if (match) {
    return {
      key: 'discount',
      label: 'Tier discount',
      ok: true,
      detail: `Already active (${match.status})`,
    };
  }

  const created = await gql<{
    discountAutomaticAppCreate: {
      automaticAppDiscount: { discountId: string; title: string; status: string } | null;
      userErrors: Array<{ message: string }>;
    };
  }>(admin, SETUP_DISCOUNT_MUTATION, {
    discount: {
      title: DISCOUNT_TITLE,
      functionId,
      startsAt: new Date().toISOString(),
      discountClasses: ['ORDER'],
    },
  });

  const errors = created.discountAutomaticAppCreate.userErrors;
  if (errors.length) {
    const message = errors.map((e) => e.message).join(', ');
    // unique title => already exists
    if (/unique/i.test(message)) {
      return {
        key: 'discount',
        label: 'Tier discount',
        ok: true,
        detail: 'Already exists on shop',
      };
    }
    return {
      key: 'discount',
      label: 'Tier discount',
      ok: false,
      detail: message,
    };
  }

  return {
    key: 'discount',
    label: 'Tier discount',
    ok: true,
    detail: `Created (${created.discountAutomaticAppCreate.automaticAppDiscount?.status})`,
  };
}

const ensureCartTransform = async (
  admin: AdminGraphql,
  functionHandle: string,
): Promise<SetupStepStatus> => {
  const existing = await gql<{
    cartTransforms: { nodes: Array<{ id: string; functionId: string }> };
  }>(admin, SETUP_CART_TRANSFORMS_QUERY);

  if (existing.cartTransforms.nodes.length > 0) {
    return {
      key: 'cartTransform',
      label: 'Free gift',
      ok: true,
      detail: `Already registered (${existing.cartTransforms.nodes.length})`,
    };
  }

  const created = await gql<{
    cartTransformCreate: {
      cartTransform: { id: string } | null;
      userErrors: Array<{ message: string; code?: string }>;
    };
  }>(admin, SETUP_CART_TRANSFORM_MUTATION, { functionHandle });

  const errors = created.cartTransformCreate.userErrors;
  if (errors.length) {
    return {
      key: 'cartTransform',
      label: 'Free gift',
      ok: false,
      detail: errors.map((e) => e.message).join(', '),
    };
  }

  return {
    key: 'cartTransform',
    label: 'Free gift',
    ok: true,
    detail: `Created (${created.cartTransformCreate.cartTransform?.id})`,
  };
}

const ensureValidation = async (
  admin: AdminGraphql,
  functionHandle: string,
): Promise<SetupStepStatus> => {
  const existing = await gql<{
    validations: {
      nodes: Array<{
        id: string;
        title: string;
        enabled: boolean;
        shopifyFunction?: { handle?: string } | null;
      }>;
    };
  }>(admin, SETUP_VALIDATIONS_QUERY);

  const match = existing.validations.nodes.find(
    (v) => v.shopifyFunction?.handle === functionHandle,
  );
  if (match) {
    return {
      key: 'validation',
      label: 'B2B minimum order',
      ok: true,
      detail: match.enabled ? 'Already enabled' : 'Exists but disabled',
    };
  }

  const created = await gql<{
    validationCreate: {
      validation: { id: string; enabled: boolean } | null;
      userErrors: Array<{ message: string }>;
    };
  }>(admin, SETUP_VALIDATION_MUTATION, {
    validation: {
      functionHandle,
      title: VALIDATION_TITLE,
      enable: true,
      blockOnFailure: false,
    },
  });

  const errors = created.validationCreate.userErrors;
  if (errors.length) {
    return {
      key: 'validation',
      label: 'B2B minimum order',
      ok: false,
      detail: errors.map((e) => e.message).join(', '),
    };
  }

  return {
    key: 'validation',
    label: 'B2B minimum order',
    ok: true,
    detail: 'Created and enabled',
  };
}

export const ensureShopSetup = async (admin: AdminGraphql, shop: string): Promise<SetupResult> => {
  const steps: SetupStepStatus[] = [];

  try {
    const rules = await getRules(shop);
    await syncRulesToMetafield(admin, rules);
    steps.push({
      key: 'rules',
      label: 'Tier rules metafield',
      ok: true,
      detail: 'Synced $app.tier_rules',
    });
  } catch (error) {
    steps.push({
      key: 'rules',
      label: 'Tier rules metafield',
      ok: false,
      detail: error instanceof Error ? error.message : 'Failed to sync rules',
    });
  }

  let functions: ShopifyFunctionNode[] = [];
  try {
    functions = await listFunctions(admin);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to list functions';
    steps.push(
      { key: 'discount', label: 'Tier discount', ok: false, detail: msg },
      { key: 'cartTransform', label: 'Free gift', ok: false, detail: msg },
      { key: 'validation', label: 'B2B minimum order', ok: false, detail: msg },
    );
    return { ok: false, steps };
  }

  const discountFn = findFunction(functions, HANDLES.discount);
  if (!discountFn) {
    steps.push({
      key: 'discount',
      label: 'Tier discount',
      ok: false,
      detail: `Function "${HANDLES.discount}" not found — deploy the app first`,
    });
  } else {
    steps.push(await ensureDiscount(admin, discountFn.id));
  }

  const transformFn = findFunction(functions, HANDLES.cartTransform);
  if (!transformFn) {
    steps.push({
      key: 'cartTransform',
      label: 'Free gift',
      ok: false,
      detail: `Function "${HANDLES.cartTransform}" not found — deploy the app first`,
    });
  } else {
    steps.push(await ensureCartTransform(admin, HANDLES.cartTransform));
  }

  const validationFn = findFunction(functions, HANDLES.validation);
  if (!validationFn) {
    steps.push({
      key: 'validation',
      label: 'B2B minimum order',
      ok: false,
      detail: `Function "${HANDLES.validation}" not found — deploy the app first`,
    });
  } else {
    steps.push(await ensureValidation(admin, HANDLES.validation));
  }

  const visible = steps.filter((s) => s.key !== 'rules');
  const isOk = visible.every((s) => s.ok);
  return {
    ok: isOk,
    steps: visible,
  };
}

export const getSetupStatus = async (admin: AdminGraphql): Promise<SetupStepStatus[]> => {
  const steps: SetupStepStatus[] = [];
  let functions: ShopifyFunctionNode[] = [];

  try {
    functions = await listFunctions(admin);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to list functions';
    return [
      { key: 'discount', label: 'Tier discount', ok: false, detail: msg },
      { key: 'cartTransform', label: 'Free gift', ok: false, detail: msg },
      { key: 'validation', label: 'B2B minimum order', ok: false, detail: msg },
    ];
  }

  const discountFn = findFunction(functions, HANDLES.discount);
  if (!discountFn) {
    steps.push({
      key: 'discount',
      label: 'Tier discount',
      ok: false,
      detail: 'Function not deployed',
    });
  } else {
    try {
      const discounts = await listAppDiscounts(admin);
      const match = findTierDiscount(discounts, discountFn.id);
      const isOk = Boolean(match);
      steps.push({
        key: 'discount',
        label: 'Tier discount',
        ok: isOk,
        detail: match ? 'On' : discounts.length ? 'Not linked yet' : 'Not created yet',
      });
    } catch (error) {
      steps.push({
        key: 'discount',
        label: 'Tier discount',
        ok: false,
        detail: error instanceof Error ? error.message : 'Status check failed',
      });
    }
  }

  try {
    const transforms = await gql<{
      cartTransforms: { nodes: Array<{ id: string }> };
    }>(admin, STATUS_CART_TRANSFORMS_QUERY);
    const isOk = transforms.cartTransforms.nodes.length > 0;
    steps.push({
      key: 'cartTransform',
      label: 'Free gift',
      ok: isOk,
      detail: isOk ? 'On' : 'Not created yet',
    });
  } catch (error) {
    steps.push({
      key: 'cartTransform',
      label: 'Free gift',
      ok: false,
      detail: error instanceof Error ? error.message : 'Status check failed',
    });
  }

  try {
    const validations = await gql<{
      validations: {
        nodes: Array<{
          enabled: boolean;
          shopifyFunction?: { handle?: string } | null;
        }>;
      };
    }>(admin, STATUS_VALIDATIONS_QUERY);
    const match = validations.validations.nodes.find(
      (v) => v.shopifyFunction?.handle === HANDLES.validation,
    );
    const isOk = Boolean(match?.enabled);
    steps.push({
      key: 'validation',
      label: 'B2B minimum order',
      ok: isOk,
      detail: match ? (match.enabled ? 'On' : 'Disabled') : 'Not created yet',
    });
  } catch (error) {
    steps.push({
      key: 'validation',
      label: 'B2B minimum order',
      ok: false,
      detail: error instanceof Error ? error.message : 'Status check failed',
    });
  }

  return steps;
}

export const cleanupShopOnShopify = async (admin: AdminGraphql): Promise<void> => {
  try {
    const transforms = await gql<{
      cartTransforms: { nodes: Array<{ id: string }> };
    }>(admin, CLEANUP_CART_TRANSFORMS_QUERY);
    for (const node of transforms.cartTransforms.nodes) {
      await gql(admin, CLEANUP_CART_TRANSFORM_MUTATION, { id: node.id });
    }
  } catch (error) {
    console.error('cleanup cartTransforms failed', error);
  }

  try {
    const validations = await gql<{
      validations: {
        nodes: Array<{ id: string }>;
      };
    }>(admin, CLEANUP_VALIDATIONS_QUERY);

    for (const node of validations.validations.nodes) {
      await gql(admin, CLEANUP_VALIDATION_MUTATION, { id: node.id });
    }
  } catch (error) {
    console.error('cleanup validations failed', error);
  }

  try {
    const discounts = await listAppDiscounts(admin);
    const match =
      discounts.find((d) => d.title === DISCOUNT_TITLE) ||
      discounts.find((d) => /tier|b2b/i.test(d.title));

    if (match) {
      const nodes = await gql<{
        discountNodes: {
          nodes: Array<{
            id: string;
            discount: { __typename: string; title?: string };
          }>;
        };
      }>(admin, CLEANUP_DISCOUNT_NODES_QUERY);

      for (const node of nodes.discountNodes.nodes) {
        if (
          node.discount.__typename === 'DiscountAutomaticApp' &&
          (node.discount.title === DISCOUNT_TITLE || /tier|b2b/i.test(node.discount.title ?? ''))
        ) {
          await gql(admin, CLEANUP_DISCOUNT_MUTATION, { id: node.id });
        }
      }
    }
  } catch (error) {
    console.error('cleanup discounts failed', error);
  }
}
