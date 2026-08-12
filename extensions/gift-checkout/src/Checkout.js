import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { GiftUi } from "./components/GiftUi";

export default async () => {
  render(<GiftUi />, document.body);
};
