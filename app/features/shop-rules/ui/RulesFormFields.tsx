import type { GiftProductGroup } from '@/features/gift-products';
import { GiftProductsPicker } from '@/features/gift-products';
import type { RulesFormState } from '@/features/shop-rules/lib/rulesForm';

type RulesFormFieldsProps = {
  form: RulesFormState;
  giftGroups: GiftProductGroup[];
  giftVariantsCount: number;
  onFieldChange: (key: keyof RulesFormState, value: string | boolean) => void;
  onOpenGiftPicker: () => void;
  onRemoveGift: (id: string) => void;
  onRemoveProductGifts: (productId: string) => void;
};

export const RulesFormFields = ({
  form,
  giftGroups,
  giftVariantsCount,
  onFieldChange,
  onOpenGiftPicker,
  onRemoveGift,
  onRemoveProductGifts,
}: RulesFormFieldsProps) => {
  return (
    <s-stack gap='large'>
      <s-stack gap='small-200'>
        <s-heading>Discount</s-heading>
        <s-grid gridTemplateColumns='1fr 1fr' gap='base'>
          <s-number-field
            name='threshold'
            label='Cart threshold'
            details='Subtotal required for the percent discount'
            value={form.threshold}
            min={0}
            step={1}
            onInput={(event: Event) =>
              onFieldChange('threshold', (event.currentTarget as HTMLInputElement).value)
            }
          />
          <s-number-field
            name='percentOff'
            label='Percent off'
            details='0–100'
            value={form.percentOff}
            min={0}
            max={100}
            step={1}
            onInput={(event: Event) =>
              onFieldChange('percentOff', (event.currentTarget as HTMLInputElement).value)
            }
          />
        </s-grid>
      </s-stack>

      <s-divider />

      <s-stack gap='small-200'>
        <s-heading>Free gift</s-heading>
        <s-banner tone='info' heading='Gift Card limits'>
          Shopify Gift Cards can’t be offered as the free gift ($0 gift cards aren’t allowed). If
          the cart only has Gift Cards, the free gift won’t attach — customers need at least one
          regular product in the cart. Gift Cards can still count toward the gift threshold.
        </s-banner>
        <s-number-field
          name='giftThreshold'
          label='Gift threshold'
          details='Subtotal required to unlock a free gift'
          value={form.giftThreshold}
          min={0}
          step={1}
          onInput={(event: Event) =>
            onFieldChange('giftThreshold', (event.currentTarget as HTMLInputElement).value)
          }
        />
        <input type='hidden' name='giftVariantIds' value={form.giftVariantIds} />
        <GiftProductsPicker
          giftGroups={giftGroups}
          giftVariantsCount={giftVariantsCount}
          onOpenPicker={onOpenGiftPicker}
          onRemoveGift={onRemoveGift}
          onRemoveProductGifts={onRemoveProductGifts}
        />
      </s-stack>

      <s-divider />

      <s-stack gap='small-200'>
        <s-heading>B2B</s-heading>
        <s-number-field
          name='b2bMinOrder'
          label='Minimum order'
          details='Minimum subtotal for customers tagged b2b'
          value={form.b2bMinOrder}
          min={0}
          step={1}
          onInput={(event: Event) =>
            onFieldChange('b2bMinOrder', (event.currentTarget as HTMLInputElement).value)
          }
        />
        <s-checkbox
          name='active'
          label='Rules active'
          checked={form.isActive}
          onChange={(event: Event) =>
            onFieldChange('isActive', (event.currentTarget as HTMLInputElement).checked)
          }
        />
      </s-stack>
    </s-stack>
  );
};
