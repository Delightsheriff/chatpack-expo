import { ConversationList as ConversationListRoot } from "./ConversationList";
import { ConversationListItem } from "./ConversationListItem";
import { ConversationStoryRow } from "./ConversationStoryRow";
import { ConversationSearchBar } from "./ConversationSearchBar";
import { ConversationFilterTabs } from "./ConversationFilterTabs";

/**
 * `<ConversationList>` compound namespace for chat-list screens.
 */
export const ConversationList = Object.assign(ConversationListRoot, {
  Item: ConversationListItem,
  StoryRow: ConversationStoryRow,
  SearchBar: ConversationSearchBar,
  FilterTabs: ConversationFilterTabs,
});

export { ConversationListItem } from "./ConversationListItem";
export type { ConversationListItemProps } from "./ConversationListItem";
export { ConversationStoryRow } from "./ConversationStoryRow";
export type { ConversationStoryRowProps, ConversationStoryItem } from "./ConversationStoryRow";
export { ConversationSearchBar } from "./ConversationSearchBar";
export type { ConversationSearchBarProps } from "./ConversationSearchBar";
export { ConversationFilterTabs } from "./ConversationFilterTabs";
export type { ConversationFilterTabsProps, ConversationFilterTab } from "./ConversationFilterTabs";
export type { ConversationListProps, ConversationListRowProps } from "./ConversationList";
