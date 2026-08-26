import { ConversationList as ConversationListRoot } from "./ConversationList";
import { ConversationListItem } from "./ConversationListItem";
import { ConversationStoryRow } from "./ConversationStoryRow";
import { ConversationSearchBar } from "./ConversationSearchBar";
import { ConversationFilterTabs } from "./ConversationFilterTabs";

/**
 * `<ConversationList>` as a compound namespace — the chat-list screen's
 * pieces:
 *
 * ```tsx
 * <ChatKeyboardView>
 *   <ConversationList.StoryRow items={pinned} onPressAdd={openNewChat} />
 *   <ConversationList.SearchBar value={query} onChangeText={setQuery} />
 *   <ConversationList.FilterTabs tabs={tabs} activeKey={filter} onChange={setFilter} />
 *   <ConversationList conversations={filtered} onPressConversation={openConversation} />
 * </ChatKeyboardView>
 * ```
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
