import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { CustomerBlock } from "./components/CustomerBlock";

export default async () => {
  render(<CustomerBlock />, document.body);
};
