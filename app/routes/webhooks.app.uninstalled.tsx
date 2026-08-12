import type { ActionFunctionArgs } from 'react-router';

import db from '@/db.server';
import { cleanupShopOnShopify } from '@/entities/shop-setup';
import { authenticate } from '@/shopify.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic, admin } = await authenticate.webhook(request);

  // eslint-disable-next-line no-console -- webhook diagnostics
  console.log(`Received ${topic} webhook for ${shop}`);

  // Cleanup while offline token is still valid; keep DiscountRule for reinstall.
  if (admin) {
    try {
      await cleanupShopOnShopify(admin);
    } catch (error) {
      console.error('cleanupShopOnShopify failed', error);
    }
  }

  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  return new Response();
};
