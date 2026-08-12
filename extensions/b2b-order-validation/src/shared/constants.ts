export const CHECKOUT_INTERACTION = "CHECKOUT_INTERACTION";
export const CHECKOUT_COMPLETION = "CHECKOUT_COMPLETION";

export const b2bMinimumOrderMessage = (
  minOrder: number,
  subtotal: number,
): string => {
  return `B2B minimum order is ${minOrder}. Current subtotal: ${subtotal}.`;
};
