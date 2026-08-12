import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { OrderBlock } from "./components/OrderBlock";

export default async () => {
  render(<OrderBlock />, document.body);
};
