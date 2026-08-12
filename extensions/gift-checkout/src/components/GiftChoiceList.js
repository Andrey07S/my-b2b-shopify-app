import { shortGiftLabel } from "../shared/merchandise";

/**
 * @param {{
 *   giftIds: string[],
 *   labels: Record<string, string>,
 *   selected: string,
 *   isSaving: boolean,
 *   canUpdateAttributes: boolean,
 *   onSelect: (variantId: string) => void,
 * }} props
 */
export const GiftChoiceList = ({
  giftIds,
  labels,
  selected,
  isSaving,
  canUpdateAttributes,
  onSelect,
}) => {
  return (
    <s-choice-list
      name="gift-variant"
      values={selected ? [selected] : []}
      onChange={(event) => {
        const target =
          /** @type {EventTarget & { values?: string[] }} */ (
            event.currentTarget
          );
        const next = target.values?.[0];
        if (next) onSelect(next);
      }}
    >
      {giftIds.map((id) => (
        <s-choice
          key={id}
          value={id}
          selected={selected === id}
          disabled={isSaving || !canUpdateAttributes}
        >
          {labels[id] || shortGiftLabel(id)}
        </s-choice>
      ))}
    </s-choice-list>
  );
};
