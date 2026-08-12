import type { GiftProductGroup, GiftVariantOption } from '@/features/gift-products/model/types';

type GiftProductsPickerProps = {
  giftGroups: GiftProductGroup[];
  giftVariantsCount: number;
  onOpenPicker: () => void;
  onRemoveGift: (id: string) => void;
  onRemoveProductGifts: (productId: string) => void;
};

export const GiftProductsPicker = ({
  giftGroups,
  giftVariantsCount,
  onOpenPicker,
  onRemoveGift,
  onRemoveProductGifts,
}: GiftProductsPickerProps) => {
  return (
    <s-stack gap='small-200'>
      <s-text type='strong'>Gift products</s-text>
      <s-text color='subdued'>
        Pick regular products (not Shopify Gift Cards), then choose which variants customers can
        receive free.
      </s-text>
      {giftGroups.length === 0 ? (
        <s-text color='subdued'>No gift products selected</s-text>
      ) : (
        <s-stack gap='base'>
          {giftGroups.map((group) => (
            <GiftProductGroupCard
              key={group.productId || group.productTitle}
              group={group}
              onRemoveGift={onRemoveGift}
              onRemoveProductGifts={onRemoveProductGifts}
            />
          ))}
        </s-stack>
      )}
      <s-button type='button' variant='secondary' icon='product' onClick={onOpenPicker}>
        {giftVariantsCount ? 'Edit gift products' : 'Select gift products'}
      </s-button>
    </s-stack>
  );
};

type GiftProductGroupCardProps = {
  group: GiftProductGroup;
  onRemoveGift: (id: string) => void;
  onRemoveProductGifts: (productId: string) => void;
};

const GiftProductGroupCard = ({
  group,
  onRemoveGift,
  onRemoveProductGifts,
}: GiftProductGroupCardProps) => {
  return (
    <s-box padding='base' border='base' borderRadius='base' background='subdued'>
      <s-stack gap='small-200'>
        <s-stack
          direction='inline'
          gap='small-200'
          alignItems='center'
          justifyContent='space-between'
        >
          <s-stack direction='inline' gap='small-200' alignItems='center'>
            {group.imageUrl ? (
              <s-thumbnail src={group.imageUrl} alt={group.productTitle} size='small' />
            ) : (
              <s-thumbnail alt={group.productTitle} size='small' />
            )}
            <s-text type='strong'>{group.productTitle}</s-text>
          </s-stack>
          <s-button
            type='button'
            variant='tertiary'
            tone='critical'
            icon='x'
            accessibilityLabel={`Remove ${group.productTitle}`}
            onClick={() => onRemoveProductGifts(group.productId)}
          />
        </s-stack>
        <s-stack gap='small-100'>
          {group.variants.map((variant) => (
            <GiftVariantRow key={variant.id} variant={variant} onRemoveGift={onRemoveGift} />
          ))}
        </s-stack>
      </s-stack>
    </s-box>
  );
};

type GiftVariantRowProps = {
  variant: GiftVariantOption;
  onRemoveGift: (id: string) => void;
};

const GiftVariantRow = ({ variant, onRemoveGift }: GiftVariantRowProps) => {
  return (
    <s-stack direction='inline' gap='small-200' alignItems='center' justifyContent='space-between'>
      <s-stack direction='inline' gap='small-200' alignItems='center'>
        {variant.imageUrl ? (
          <s-thumbnail src={variant.imageUrl} alt={variant.label} size='small-200' />
        ) : (
          <s-thumbnail alt={variant.label} size='small-200' />
        )}
        <s-text color='subdued'>{variant.label}</s-text>
      </s-stack>
      <s-button
        type='button'
        variant='tertiary'
        icon='x'
        accessibilityLabel={`Remove ${variant.label}`}
        onClick={() => onRemoveGift(variant.id)}
      />
    </s-stack>
  );
};
