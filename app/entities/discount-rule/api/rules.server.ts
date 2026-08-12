import type { DiscountRule } from '@prisma/client';

import type { RulesInput, TierRulesPayload } from '@/entities/discount-rule/model/types';
import type { AdminGraphql } from '@/shared/api/adminGraphql.server';
import prisma from '@/shared/api/db.server';
import { METAFIELD } from '@/shared/config/constants';

import { SET_TIER_RULES_MUTATION, SHOP_ID_QUERY } from './graphql';

export const getRules = async (shop: string): Promise<DiscountRule> => {
  return prisma.discountRule.upsert({
    where: { shop },
    create: { shop },
    update: {},
  });
};

const saveRules = async (shop: string, data: RulesInput): Promise<DiscountRule> => {
  return prisma.discountRule.upsert({
    where: { shop },
    create: { shop, ...data },
    update: { ...data },
  });
};

export const syncRulesToMetafield = async (admin: AdminGraphql, rules: DiscountRule) => {
  const shopRes = await admin.graphql(SHOP_ID_QUERY);
  const shopJson = (await shopRes.json()) as {
    data: { shop: { id: string } };
  };
  const shopId = shopJson.data.shop.id;

  const payload: TierRulesPayload = {
    threshold: rules.threshold,
    percentOff: rules.percentOff,
    giftThreshold: rules.giftThreshold,
    giftVariantIds: JSON.parse(rules.giftVariantIds) as string[],
    b2bMinOrder: rules.b2bMinOrder,
    active: rules.active,
  };

  const metaRes = await admin.graphql(SET_TIER_RULES_MUTATION, {
    variables: {
      metafields: [
        {
          ownerId: shopId,
          namespace: METAFIELD.namespace,
          key: METAFIELD.tierRulesKey,
          type: METAFIELD.tierRulesType,
          value: JSON.stringify(payload),
        },
      ],
    },
  });

  const metaJson = (await metaRes.json()) as {
    data?: {
      metafieldsSet?: {
        metafields: unknown;
        userErrors: Array<{ message: string }>;
      };
    };
  };
  const errors = metaJson.data?.metafieldsSet?.userErrors ?? [];
  if (errors.length) {
    throw new Error(errors.map((e) => e.message).join(', '));
  }

  const metafields = metaJson.data?.metafieldsSet?.metafields;
  if (!metafields) {
    throw new Error('Failed to sync tier rules metafield');
  }

  return metafields;
};

export const saveAndSyncRules = async (admin: AdminGraphql, shop: string, data: RulesInput) => {
  const rules = await saveRules(shop, data);
  await syncRulesToMetafield(admin, rules);
  return rules;
};
