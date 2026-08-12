import type { StorefrontLinks } from '@/shared/lib/storefrontLinks';

type StorefrontAsideProps = {
  links: StorefrontLinks;
};

export const StorefrontAside = ({ links }: StorefrontAsideProps) => {
  return (
    <div
      slot='aside'
      style={{
        position: 'sticky',
        top: '1rem',
        alignSelf: 'start',
      }}
    >
      <s-section heading='Add to storefront'>
        <s-paragraph color='subdued'>
          One-time placement in Shopify editors. Backend features activate on the left.
        </s-paragraph>
        <s-stack gap='base'>
          <s-box padding='base' border='base' borderRadius='base' background='subdued'>
            <s-stack gap='small-200'>
              <s-text type='strong'>Theme · Tier progress</s-text>
              <s-text color='subdued'>
                Opens the cart template with the block ready to preview.
              </s-text>
              <s-button href={links.themeBlockUrl} target='_blank' variant='primary' icon='theme'>
                Open theme editor
              </s-button>
            </s-stack>
          </s-box>
          <s-box padding='base' border='base' borderRadius='base' background='subdued'>
            <s-stack gap='small-200'>
              <s-text type='strong'>Checkout · Free gift</s-text>
              <s-text color='subdued'>
                Open the checkout editor and add the Free gift app block so customers can choose a
                gift (Shopify Plus / Plus-dev). Won’t apply when the cart is Gift Cards only.
              </s-text>
              <s-button
                href={links.checkoutEditorUrl}
                target='_blank'
                variant='secondary'
                icon='cart'
              >
                Add gift in checkout editor
              </s-button>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>
    </div>
  );
};
