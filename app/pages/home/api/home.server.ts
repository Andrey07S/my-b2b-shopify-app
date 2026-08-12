import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

import { getRules, saveAndSyncRules } from '@/entities/discount-rule';
import { ensureShopSetup, getSetupStatus } from '@/entities/shop-setup';
import {
  filterOutGiftCardVariantIds,
  loadGiftVariantOptions,
} from '@/features/gift-products/api/giftVariants.server';
import { authenticate } from '@/shared/api/shopify.server';
import { FORM_INTENT } from '@/shared/config/constants';
import { isNonNegativeNumber, parseJsonStringArray } from '@/shared/lib/json';
import { buildStorefrontLinks } from '@/shared/lib/storefrontLinks.server';

export const homeLoader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const [rules, setupSteps] = await Promise.all([getRules(session.shop), getSetupStatus(admin)]);
  const giftVariants = await loadGiftVariantOptions(admin, rules.giftVariantIds);

  return {
    rules,
    setupSteps,
    giftVariants,
    shop: session.shop,
    links: buildStorefrontLinks(session.shop),
  };
};

export const homeAction = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get('intent') || FORM_INTENT.save);

  if (intent === FORM_INTENT.setup) {
    try {
      const setup = await ensureShopSetup(admin, session.shop);
      return { intent: FORM_INTENT.setup, setup } as const;
    } catch (error) {
      return {
        intent: FORM_INTENT.setup,
        setup: {
          ok: false,
          steps: [],
          error: error instanceof Error ? error.message : 'Setup failed',
        },
      } as const;
    }
  }

  const data = {
    threshold: Number(formData.get('threshold')),
    percentOff: Number(formData.get('percentOff')),
    giftThreshold: Number(formData.get('giftThreshold')),
    b2bMinOrder: Number(formData.get('b2bMinOrder')),
    giftVariantIds: String(formData.get('giftVariantIds') || '[]'),
    active: formData.get('active') === 'on',
  };

  if (
    [data.threshold, data.percentOff, data.giftThreshold, data.b2bMinOrder].some(
      (value) => !isNonNegativeNumber(value),
    )
  ) {
    return {
      intent: FORM_INTENT.save,
      ok: false as const,
      error: 'All amounts must be valid numbers ≥ 0',
    };
  }

  if (data.percentOff > 100) {
    return {
      intent: FORM_INTENT.save,
      ok: false as const,
      error: 'Percent off must be between 0 and 100',
    };
  }

  try {
    const parsed = parseJsonStringArray(data.giftVariantIds);
    const raw: unknown = JSON.parse(data.giftVariantIds);
    if (!Array.isArray(raw) || raw.some((id) => typeof id !== 'string')) {
      return {
        intent: FORM_INTENT.save,
        ok: false as const,
        error: 'Gift variants must be a list of variant IDs',
      };
    }
    const allowed = await filterOutGiftCardVariantIds(admin, parsed);
    if (allowed.length !== parsed.length) {
      data.giftVariantIds = JSON.stringify(allowed);
    }
  } catch {
    return {
      intent: FORM_INTENT.save,
      ok: false as const,
      error: 'Gift variants selection is invalid',
    };
  }

  try {
    const rules = await saveAndSyncRules(admin, session.shop, data);
    return { intent: FORM_INTENT.save, ok: true as const, rules };
  } catch (error) {
    return {
      intent: FORM_INTENT.save,
      ok: false as const,
      error: error instanceof Error ? error.message : 'Failed to save rules',
    };
  }
};

export type HomeLoaderData = Awaited<ReturnType<typeof homeLoader>>;
export type HomeActionData = Awaited<ReturnType<typeof homeAction>>;
