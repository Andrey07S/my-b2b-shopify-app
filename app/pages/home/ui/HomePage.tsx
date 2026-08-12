import { useEffect, useMemo, useState } from 'react';
import { Form, useNavigation } from 'react-router';

import { useAppBridge } from '@shopify/app-bridge-react';

import { ActivationPanel } from '@/features/activate-shop/ui/ActivationPanel';
import {
  filterOutGiftCardVariantIdsClient,
  type GiftVariantOption,
  groupGiftsByProduct,
} from '@/features/gift-products';
import {
  areFormsEqual,
  type RulesFormState,
  rulesToForm,
} from '@/features/shop-rules/lib/rulesForm';
import { RulesFormFields } from '@/features/shop-rules/ui/RulesFormFields';
import type { HomeActionData, HomeLoaderData } from '@/pages/home/api/home.server';
import { FORM_INTENT } from '@/shared/config/constants';
import { parseJsonStringArray } from '@/shared/lib/json';
import { StorefrontAside } from '@/widgets/storefront-aside/ui/StorefrontAside';

type HomePageProps = {
  loaderData: HomeLoaderData;
  actionData: HomeActionData | undefined;
};

const getSetupPayload = (actionData: HomeActionData | undefined) => {
  if (!actionData || actionData.intent !== FORM_INTENT.setup) return null;
  return actionData.setup;
};

const getSavePayload = (actionData: HomeActionData | undefined) => {
  if (!actionData || actionData.intent !== FORM_INTENT.save) return null;
  return actionData;
};

export const HomePage = ({ loaderData, actionData }: HomePageProps) => {
  const { rules, setupSteps, giftVariants: initialGifts, links } = loaderData;
  const navigation = useNavigation();
  const shopify = useAppBridge();

  const [form, setForm] = useState(() => rulesToForm(rules));
  const [savedForm, setSavedForm] = useState(() => rulesToForm(rules));
  const [giftVariants, setGiftVariants] = useState<GiftVariantOption[]>(initialGifts);

  const isSaving =
    navigation.state === 'submitting' && navigation.formData?.get('intent') !== FORM_INTENT.setup;
  const isActivating =
    navigation.state === 'submitting' && navigation.formData?.get('intent') === FORM_INTENT.setup;

  const setupPayload = getSetupPayload(actionData);
  const savePayload = getSavePayload(actionData);

  const displayedSteps =
    setupPayload && setupPayload.steps.length > 0 ? [...setupPayload.steps] : setupSteps;

  const isSetupOk = setupPayload ? setupPayload.ok : displayedSteps.every((step) => step.ok);

  const isSetupAttempted = setupPayload !== null;
  const isSetupFailed = Boolean(isSetupAttempted && !isSetupOk);
  const setupErrorMessage =
    setupPayload && 'error' in setupPayload && typeof setupPayload.error === 'string'
      ? setupPayload.error
      : null;

  const isDirty = useMemo(() => !areFormsEqual(form, savedForm), [form, savedForm]);

  useEffect(() => {
    const nextForm = rulesToForm(rules);
    setForm(nextForm);
    setSavedForm(nextForm);
    setGiftVariants(initialGifts);
  }, [rules, initialGifts]);

  useEffect(() => {
    if (savePayload?.ok) {
      shopify.toast.show('Rules saved');
      if (savePayload.rules) {
        const nextForm = rulesToForm(savePayload.rules);
        setForm(nextForm);
        setSavedForm(nextForm);
        const ids = parseJsonStringArray(nextForm.giftVariantIds);
        setGiftVariants((previous: GiftVariantOption[]) =>
          ids.map(
            (id: string) =>
              previous.find((gift) => gift.id === id) || {
                id,
                label: id,
                productId: '',
                productTitle: 'Product',
              },
          ),
        );
      }
    }
    if (setupPayload?.ok) {
      shopify.toast.show('Shop activated');
    }
  }, [actionData, shopify, savePayload, setupPayload]);

  const updateField = (key: keyof RulesFormState, value: string | boolean) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const giftGroups = useMemo(() => groupGiftsByProduct(giftVariants), [giftVariants]);

  const setGiftSelection = (next: GiftVariantOption[]) => {
    setGiftVariants(next);
    updateField('giftVariantIds', JSON.stringify(next.map((variant) => variant.id)));
  };

  const openGiftPicker = async () => {
    const selectionIds = groupGiftsByProduct(giftVariants)
      .filter((group) => group.productId)
      .map((group) => ({
        id: group.productId,
        variants: group.variants.map((variant) => ({ id: variant.id })),
      }));

    const selected = await shopify.resourcePicker({
      type: 'product',
      multiple: true,
      action: 'select',
      filter: {
        variants: true,
        draft: false,
        archived: false,
        query: 'gift_card:false',
      },
      selectionIds,
    });

    if (!selected) return;

    const next: GiftVariantOption[] = [];
    for (const product of selected) {
      const productTitle = product.title || 'Product';
      const productImage = product.images?.[0]?.originalSrc;
      for (const variant of product.variants ?? []) {
        if (!variant.id) continue;
        next.push({
          id: variant.id,
          label: variant.title || 'Default',
          productId: product.id,
          productTitle,
          imageUrl: variant.image?.originalSrc || productImage,
        });
      }
    }

    const allowedIds = new Set(
      await filterOutGiftCardVariantIdsClient(next.map((gift) => gift.id)),
    );
    const filtered = next.filter((gift) => allowedIds.has(gift.id));
    if (filtered.length < next.length) {
      shopify.toast.show('Shopify Gift Cards can’t be free gifts — skipped', {
        isError: true,
      });
    }

    setGiftSelection(filtered);
  };

  const removeGift = (id: string) => {
    setGiftSelection(giftVariants.filter((variant) => variant.id !== id));
  };

  const removeProductGifts = (productId: string) => {
    setGiftSelection(giftVariants.filter((variant) => variant.productId !== productId));
  };

  return (
    <s-page heading='B2B Tier & Gift' inlineSize='base'>
      {isSetupOk ? (
        <s-button
          slot='primary-action'
          type='button'
          variant='primary'
          icon='check-circle'
          {...(isSaving ? { loading: true } : {})}
          {...(!isDirty && !isSaving ? { disabled: true } : {})}
          onClick={() => {
            const formElement = document.getElementById('rules-form') as HTMLFormElement | null;
            formElement?.requestSubmit();
          }}
        >
          Save rules
        </s-button>
      ) : (
        <s-button
          slot='primary-action'
          type='button'
          variant='primary'
          icon={isSetupFailed ? 'refresh' : 'play'}
          {...(isActivating ? { loading: true } : {})}
          onClick={() => {
            const formElement = document.getElementById('activate-form') as HTMLFormElement | null;
            formElement?.requestSubmit();
          }}
        >
          {isSetupFailed ? 'Try again' : 'Activate'}
        </s-button>
      )}

      <StorefrontAside links={links} />

      <ActivationPanel
        steps={displayedSteps}
        isSetupOk={isSetupOk}
        isSetupFailed={isSetupFailed}
        isActivating={isActivating}
        setupErrorMessage={setupErrorMessage}
      />

      <Form method='post' id='rules-form'>
        <input type='hidden' name='intent' value={FORM_INTENT.save} />

        <s-section heading='Rules'>
          <s-paragraph color='subdued'>
            Thresholds sync to the shop metafield used by Functions, theme block, and checkout UI.
          </s-paragraph>

          <s-box padding='base' border='base' borderRadius='base' background='base'>
            <RulesFormFields
              form={form}
              giftGroups={giftGroups}
              giftVariantsCount={giftVariants.length}
              onFieldChange={updateField}
              onOpenGiftPicker={() => {
                void openGiftPicker();
              }}
              onRemoveGift={removeGift}
              onRemoveProductGifts={removeProductGifts}
            />
          </s-box>

          <s-box paddingBlockStart='base'>
            <s-stack direction='inline' gap='base' alignItems='center'>
              <s-button
                type='submit'
                variant='primary'
                icon='check-circle'
                {...(isSaving ? { loading: true } : {})}
                {...(!isDirty && !isSaving ? { disabled: true } : {})}
              >
                Save rules
              </s-button>
              {!isDirty ? (
                <s-text color='subdued'>No unsaved changes</s-text>
              ) : (
                <s-text type='strong'>Unsaved changes</s-text>
              )}
            </s-stack>
          </s-box>
        </s-section>
      </Form>

      {savePayload && !savePayload.ok && savePayload.error ? (
        <s-banner tone='critical' heading='Could not save'>
          {savePayload.error}
        </s-banner>
      ) : null}
    </s-page>
  );
};
