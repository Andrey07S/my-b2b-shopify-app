export type GiftVariantOption = {
  id: string;
  label: string;
  productId: string;
  productTitle: string;
  imageUrl?: string;
};

export type GiftProductGroup = {
  productId: string;
  productTitle: string;
  imageUrl?: string;
  variants: GiftVariantOption[];
};
