# Free gift checkout UI

Checkout UI for selecting a free gift once the cart subtotal meets `giftThreshold`. Targets `purchase.checkout.block.render` and `purchase.checkout.cart-line-list.render-after`. Reads shop `$app.tier_rules` and writes the `gift_variant_id` cart attribute.
