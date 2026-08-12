import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { GiftUi } from "./components/GiftUi";

// Static target: shows under order summary without Apps → Add block
export default async () => {
  render(<GiftUi />, document.body);
};
