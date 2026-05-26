import * as React from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import type { Kanban, Card } from 'portable-kanban-core';
import { KanbanList } from './components/KanbanList';
import { CardDetail } from './components/CardDetail';
import { TextInput } from './components/TextInput';

// ---------------------------------------------------------------------------
// Keymaps
// ---------------------------------------------------------------------------

export type Keymaps = {
  quit: string;
  list_prev: string;
  list_next: string;
  list_add: string;
  card_up: string;
  card_down: string;
  card_add: string;
  card_edit: string;
  card_delete: string;
  card_move_left: string;
  card_move_right: string;
  task_add: string;
  help: string;
};

const DEFAULT_KEYMAPS: Keymaps = {
  quit: 'q',
  list_prev: 'h',
  list_next: 'l',
  list_add: 'A',
  card_up: 'k',
  card_down: 'j',
  card_add: 'a',
  card_edit: 'e',
  card_delete: 'd',
  card_move_left: 'H',
  card_move_right: 'L',
  task_add: 'T',
  help: '?',
};

function loadKeymaps(): Keymaps {
  const raw = process.env.PORTABLE_KANBAN_KEYMAPS;
  if (!raw) return DEFAULT_KEYMAPS;
  try {
    return { ...DEFAULT_KEYMAPS, ...(JSON.parse(raw) as Partial<Keymaps>) };
  } catch {
    return DEFAULT_KEYMAPS;
  }
}

// ---------------------------------------------------------------------------
// Mode
// ---------------------------------------------------------------------------

type Mode =
  | { type: 'board' }
  | { type: 'help' }
  | { type: 'detail'; listIndex: number; cardIndex: number }
  | { type: 'add_list' }
  | { type: 'add'; listIndex: number }
  | { type: 'edit_title'; listIndex: number; cardIndex: number; returnToDetail: boolean }
  | { type: 'edit_desc'; listIndex: number; cardIndex: number }
  | { type: 'edit_due'; listIndex: number; cardIndex: number }
  | { type: 'add_task'; listIndex: number; cardIndex: number }
  | { type: 'add_comment'; listIndex: number; cardIndex: number }
  | { type: 'confirm_delete'; listIndex: number; cardIndex: number };

type Props = {
  kanban: Kanban;
  title: string;
  onSave: (kanban: Kanban) => void;
  onQuit: () => void;
};

export const App = ({ kanban: initialKanban, title, onSave, onQuit }: Props) => {
  const km = React.useMemo(() => loadKeymaps(), []);
  const { stdout } = useStdout();
  const termWidth = stdout?.columns ?? 120;
  // Distribute available width evenly across lists (min 28, max 40)
  const listWidth = Math.max(28, Math.min(40, Math.floor((termWidth - 4) / Math.max(1, initialKanban.lists.length)) - 2));

  const [kanban, setKanban] = React.useState(initialKanban);
  const [selectedList, setSelectedList] = React.useState(0);
  const [selectedCard, setSelectedCard] = React.useState(0);
  const [mode, setMode] = React.useState<Mode>({ type: 'board' });
  const [statusMsg, setStatusMsg] = React.useState('');

  const save = (updated: Kanban) => {
    setKanban(updated);
    onSave(updated);
    setStatusMsg('Saved');
    setTimeout(() => setStatusMsg(''), 1500);
  };

  const currentList = kanban.lists[selectedList];
  const currentCard = currentList?.cards[selectedCard];

  const clampCard = (k: Kanban, li: number, ci: number) => {
    const len = k.lists[li]?.cards.length ?? 0;
    return len === 0 ? 0 : Math.min(ci, len - 1);
  };

  useInput((input, key) => {
    // TextInput components handle their own input
    if (
      mode.type === 'add_list' ||
      mode.type === 'add' ||
      mode.type === 'edit_title' ||
      mode.type === 'edit_desc' ||
      mode.type === 'edit_due' ||
      mode.type === 'add_task' ||
      mode.type === 'add_comment'
    ) return;

    // Detail mode — km.quit/Esc go back; Q or ctrl+c quits
    if (mode.type === 'detail') {
      const { listIndex, cardIndex } = mode;
      const card = kanban.lists[listIndex]?.cards[cardIndex];
      if (!card) {
        setMode({ type: 'board' });
        return;
      }

      if (key.escape || input === km.quit) {
        setMode({ type: 'board' });
        return;
      }
      if (input === 'Q' || (key.ctrl && input === 'c')) {
        onQuit();
        return;
      }
      if (input === km.card_edit) {
        setMode({ type: 'edit_title', listIndex, cardIndex, returnToDetail: true });
        return;
      }
      if (input === 'd') {
        setMode({ type: 'edit_desc', listIndex, cardIndex });
        return;
      }
      if (input === 'D') {
        setMode({ type: 'edit_due', listIndex, cardIndex });
        return;
      }
      if (input === 't') {
        setMode({ type: 'add_task', listIndex, cardIndex });
        return;
      }
      if (input === 'c') {
        setMode({ type: 'add_comment', listIndex, cardIndex });
        return;
      }
      // Toggle checkbox with number keys 1-9
      if (/^\d$/.test(input)) {
        const idx = parseInt(input, 10) - 1;
        if (idx >= 0 && idx < card.checkboxes.length) {
          const updated = {
            ...kanban,
            lists: kanban.lists.map((l, li) =>
              li !== listIndex
                ? l
                : {
                    ...l,
                    cards: l.cards.map((c, ci) =>
                      ci !== cardIndex
                        ? c
                        : {
                            ...c,
                            checkboxes: c.checkboxes.map((cb, cbi) =>
                              cbi === idx ? { ...cb, checked: !cb.checked } : cb,
                            ),
                          },
                    ),
                  },
            ),
          };
          save(updated);
        }
      }
      return;
    }

    // Help mode
    if (mode.type === 'help') {
      setMode({ type: 'board' });
      return;
    }

    // Delete confirmation mode
    if (mode.type === 'confirm_delete') {
      const { listIndex, cardIndex } = mode;
      if (input === 'y' || input === 'Y') {
        const updated = {
          ...kanban,
          lists: kanban.lists.map((l, li) =>
            li !== listIndex
              ? l
              : { ...l, cards: l.cards.filter((_, ci) => ci !== cardIndex) },
          ),
        };
        setSelectedCard(clampCard(updated, listIndex, cardIndex));
        setMode({ type: 'board' });
        save(updated);
      } else {
        setMode({ type: 'board' });
      }
      return;
    }

    // Board mode navigation
    if (key.leftArrow || input === km.list_prev) {
      const newList = Math.max(0, selectedList - 1);
      setSelectedList(newList);
      setSelectedCard(clampCard(kanban, newList, selectedCard));
      return;
    }
    if (key.rightArrow || input === km.list_next) {
      const newList = Math.min(kanban.lists.length - 1, selectedList + 1);
      setSelectedList(newList);
      setSelectedCard(clampCard(kanban, newList, selectedCard));
      return;
    }
    if (key.upArrow || input === km.card_up) {
      setSelectedCard((c) => Math.max(0, c - 1));
      return;
    }
    if (key.downArrow || input === km.card_down) {
      setSelectedCard((c) => Math.min((currentList?.cards.length ?? 1) - 1, c + 1));
      return;
    }

    // Enter → open card detail
    if (key.return && currentCard) {
      setMode({ type: 'detail', listIndex: selectedList, cardIndex: selectedCard });
      return;
    }

    if (input === km.list_add) {
      setMode({ type: 'add_list' });
      return;
    }

    if (input === km.card_add) {
      setMode({ type: 'add', listIndex: selectedList });
      return;
    }

    if (input === km.task_add && currentCard) {
      setMode({ type: 'add_task', listIndex: selectedList, cardIndex: selectedCard });
      return;
    }

    if (input === km.card_edit && currentCard) {
      setMode({ type: 'edit_title', listIndex: selectedList, cardIndex: selectedCard, returnToDetail: false });
      return;
    }

    if (input === km.card_delete && currentCard) {
      setMode({ type: 'confirm_delete', listIndex: selectedList, cardIndex: selectedCard });
      return;
    }

    if (input === km.card_move_left && currentCard && selectedList > 0) {
      const targetList = selectedList - 1;
      const updated = {
        ...kanban,
        lists: kanban.lists.map((l, li) => {
          if (li === selectedList) return { ...l, cards: l.cards.filter((_, ci) => ci !== selectedCard) };
          if (li === targetList) return { ...l, cards: [...l.cards, { ...currentCard, listId: kanban.lists[targetList].id }] };
          return l;
        }),
      };
      setSelectedList(targetList);
      setSelectedCard(updated.lists[targetList].cards.length - 1);
      save(updated);
      return;
    }

    if (input === km.card_move_right && currentCard && selectedList < kanban.lists.length - 1) {
      const targetList = selectedList + 1;
      const updated = {
        ...kanban,
        lists: kanban.lists.map((l, li) => {
          if (li === selectedList) return { ...l, cards: l.cards.filter((_, ci) => ci !== selectedCard) };
          if (li === targetList) return { ...l, cards: [...l.cards, { ...currentCard, listId: kanban.lists[targetList].id }] };
          return l;
        }),
      };
      setSelectedList(targetList);
      setSelectedCard(updated.lists[targetList].cards.length - 1);
      save(updated);
      return;
    }

    if (input === km.help) {
      setMode({ type: 'help' });
      return;
    }

    // Quit
    if (input === km.quit || (key.ctrl && input === 'c')) {
      onQuit();
    }
  });

  const handleAddList = (newTitle: string) => {
    if (mode.type !== 'add_list') return;
    if (!newTitle.trim()) {
      setMode({ type: 'board' });
      return;
    }
    const newList = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      cards: [],
    };
    const updated = { ...kanban, lists: [...kanban.lists, newList] };
    setSelectedList(updated.lists.length - 1);
    setSelectedCard(0);
    setMode({ type: 'board' });
    save(updated);
  };

  const handleAddCard = (newTitle: string) => {
    if (mode.type !== 'add') return;
    const { listIndex } = mode;
    if (!newTitle.trim()) {
      setMode({ type: 'board' });
      return;
    }
    const newCard: Card = {
      id: crypto.randomUUID(),
      listId: kanban.lists[listIndex]?.id ?? '',
      title: newTitle.trim(),
      description: '',
      dueDate: undefined,
      labels: [],
      checkboxes: [],
      comments: [],
    };
    const updated = {
      ...kanban,
      lists: kanban.lists.map((l, li) =>
        li !== listIndex ? l : { ...l, cards: [...l.cards, newCard] },
      ),
    };
    setSelectedCard(updated.lists[listIndex].cards.length - 1);
    setMode({ type: 'board' });
    save(updated);
  };

  const handleEditTitle = (newTitle: string) => {
    if (mode.type !== 'edit_title') return;
    const { listIndex, cardIndex, returnToDetail } = mode;
    const nextMode: Mode = returnToDetail
      ? { type: 'detail', listIndex, cardIndex }
      : { type: 'board' };
    if (!newTitle.trim()) {
      setMode(nextMode);
      return;
    }
    const updated = {
      ...kanban,
      lists: kanban.lists.map((l, li) =>
        li !== listIndex
          ? l
          : { ...l, cards: l.cards.map((c, ci) => (ci !== cardIndex ? c : { ...c, title: newTitle.trim() })) },
      ),
    };
    setMode(nextMode);
    save(updated);
  };

  const handleEditDesc = (newDesc: string) => {
    if (mode.type !== 'edit_desc') return;
    const { listIndex, cardIndex } = mode;
    const updated = {
      ...kanban,
      lists: kanban.lists.map((l, li) =>
        li !== listIndex
          ? l
          : { ...l, cards: l.cards.map((c, ci) => (ci !== cardIndex ? c : { ...c, description: newDesc })) },
      ),
    };
    setMode({ type: 'detail', listIndex, cardIndex });
    save(updated);
  };

  const handleEditDue = (raw: string) => {
    if (mode.type !== 'edit_due') return;
    const { listIndex, cardIndex } = mode;
    const trimmed = raw.trim();
    // Accept YYYY-MM-DD or clear with empty string
    const dueDate = trimmed === '' ? undefined : new Date(trimmed);
    const updated = {
      ...kanban,
      lists: kanban.lists.map((l, li) =>
        li !== listIndex
          ? l
          : { ...l, cards: l.cards.map((c, ci) => (ci !== cardIndex ? c : { ...c, dueDate })) },
      ),
    };
    setMode({ type: 'detail', listIndex, cardIndex });
    save(updated);
  };

  const handleAddTask = (taskTitle: string) => {
    if (mode.type !== 'add_task') return;
    const { listIndex, cardIndex } = mode;
    if (!taskTitle.trim()) {
      setMode({ type: 'detail', listIndex, cardIndex });
      return;
    }
    const updated = {
      ...kanban,
      lists: kanban.lists.map((l, li) =>
        li !== listIndex
          ? l
          : {
              ...l,
              cards: l.cards.map((c, ci) =>
                ci !== cardIndex
                  ? c
                  : {
                      ...c,
                      checkboxes: [
                        ...c.checkboxes,
                        { id: crypto.randomUUID(), title: taskTitle.trim(), checked: false },
                      ],
                    },
              ),
            },
      ),
    };
    setMode({ type: 'detail', listIndex, cardIndex });
    save(updated);
  };

  const handleAddComment = (comment: string) => {
    if (mode.type !== 'add_comment') return;
    const { listIndex, cardIndex } = mode;
    if (!comment.trim()) {
      setMode({ type: 'detail', listIndex, cardIndex });
      return;
    }
    const updated = {
      ...kanban,
      lists: kanban.lists.map((l, li) =>
        li !== listIndex
          ? l
          : {
              ...l,
              cards: l.cards.map((c, ci) =>
                ci !== cardIndex
                  ? c
                  : {
                      ...c,
                      comments: [
                        ...c.comments,
                        { id: crypto.randomUUID(), comment: comment.trim() },
                      ],
                    },
              ),
            },
      ),
    };
    setMode({ type: 'detail', listIndex, cardIndex });
    save(updated);
  };

  // Add list screen
  if (mode.type === 'add_list') {
    return (
      <Box flexDirection="column" padding={1}>
        <Header title={title} subtitle="Add list" />
        <Box marginTop={1}>
          <TextInput
            prompt="List name: "
            onSubmit={handleAddList}
            onCancel={() => setMode({ type: 'board' })}
          />
        </Box>
      </Box>
    );
  }

  // Add card screen
  if (mode.type === 'add') {
    return (
      <Box flexDirection="column" padding={1}>
        <Header title={title} subtitle={`Add card → [${kanban.lists[mode.listIndex]?.title}]`} />
        <Box marginTop={1}>
          <TextInput
            prompt="Title: "
            onSubmit={handleAddCard}
            onCancel={() => setMode({ type: 'board' })}
          />
        </Box>
      </Box>
    );
  }

  // Edit title screen
  if (mode.type === 'edit_title') {
    const card = kanban.lists[mode.listIndex]?.cards[mode.cardIndex];
    return (
      <Box flexDirection="column" padding={1}>
        <Header title={title} subtitle="Edit title" />
        <Box marginTop={1}>
          <TextInput
            prompt="Title: "
            initialValue={card?.title ?? ''}
            onSubmit={handleEditTitle}
            onCancel={() =>
              setMode(
                mode.returnToDetail
                  ? { type: 'detail', listIndex: mode.listIndex, cardIndex: mode.cardIndex }
                  : { type: 'board' },
              )
            }
          />
        </Box>
      </Box>
    );
  }

  // Edit description screen
  if (mode.type === 'edit_desc') {
    const card = kanban.lists[mode.listIndex]?.cards[mode.cardIndex];
    return (
      <Box flexDirection="column" padding={1}>
        <Header title={title} subtitle="Edit description" />
        <Box marginTop={1}>
          <TextInput
            prompt="Description: "
            initialValue={card?.description ?? ''}
            onSubmit={handleEditDesc}
            onCancel={() => setMode({ type: 'detail', listIndex: mode.listIndex, cardIndex: mode.cardIndex })}
          />
        </Box>
      </Box>
    );
  }

  // Edit due date screen
  if (mode.type === 'edit_due') {
    const card = kanban.lists[mode.listIndex]?.cards[mode.cardIndex];
    return (
      <Box flexDirection="column" padding={1}>
        <Header title={title} subtitle="Edit due date" />
        <Box marginTop={1} flexDirection="column">
          <TextInput
            prompt="Due date (YYYY-MM-DD, empty to clear): "
            initialValue={card?.dueDate instanceof Date ? card.dueDate.toISOString().split('T')[0] : ''}
            onSubmit={handleEditDue}
            onCancel={() => setMode({ type: 'detail', listIndex: mode.listIndex, cardIndex: mode.cardIndex })}
          />
        </Box>
      </Box>
    );
  }

  // Add task screen
  if (mode.type === 'add_task') {
    return (
      <Box flexDirection="column" padding={1}>
        <Header title={title} subtitle="Add task" />
        <Box marginTop={1}>
          <TextInput
            prompt="Task: "
            onSubmit={handleAddTask}
            onCancel={() => setMode({ type: 'detail', listIndex: mode.listIndex, cardIndex: mode.cardIndex })}
          />
        </Box>
      </Box>
    );
  }

  // Add comment screen
  if (mode.type === 'add_comment') {
    return (
      <Box flexDirection="column" padding={1}>
        <Header title={title} subtitle="Add comment" />
        <Box marginTop={1}>
          <TextInput
            prompt="Comment: "
            onSubmit={handleAddComment}
            onCancel={() => setMode({ type: 'detail', listIndex: mode.listIndex, cardIndex: mode.cardIndex })}
          />
        </Box>
      </Box>
    );
  }

  // Help screen
  if (mode.type === 'help') {
    return (
      <Box flexDirection="column" padding={1}>
        <Header title={title} subtitle="Keybindings" />
        <Box flexDirection="row" gap={4}>
          <Box flexDirection="column" borderStyle="single" borderColor="cyan" paddingX={1}>
            <Text bold color="cyan">Board</Text>
            <Text color="gray">──────────────────────</Text>
            <Text><Text color="cyan">{km.list_prev}</Text><Text color="gray">/←  </Text>Previous list</Text>
            <Text><Text color="cyan">{km.list_next}</Text><Text color="gray">/→  </Text>Next list</Text>
            <Text><Text color="cyan">{km.list_add}      </Text>Add list</Text>
            <Text><Text color="cyan">{km.card_up}</Text><Text color="gray">/↑  </Text>Card up</Text>
            <Text><Text color="cyan">{km.card_down}</Text><Text color="gray">/↓  </Text>Card down</Text>
            <Text><Text color="cyan">Enter  </Text>Open card detail</Text>
            <Text><Text color="cyan">{km.card_add}      </Text>Add card</Text>
            <Text><Text color="cyan">{km.card_edit}      </Text>Edit title</Text>
            <Text><Text color="cyan">{km.card_delete}      </Text>Delete card</Text>
            <Text><Text color="cyan">{km.card_move_left}      </Text>Move card left</Text>
            <Text><Text color="cyan">{km.card_move_right}      </Text>Move card right</Text>
            <Text><Text color="cyan">{km.task_add}      </Text>Add task to card</Text>
            <Text><Text color="cyan">{km.quit}      </Text>Quit</Text>
          </Box>
          <Box flexDirection="column" borderStyle="single" borderColor="cyan" paddingX={1}>
            <Text bold color="cyan">Detail</Text>
            <Text color="gray">──────────────────────</Text>
            <Text><Text color="cyan">{km.quit}</Text><Text color="gray">/Esc  </Text>Back to board</Text>
            <Text><Text color="cyan">{km.card_edit}       </Text>Edit title</Text>
            <Text><Text color="cyan">d       </Text>Edit description</Text>
            <Text><Text color="cyan">D       </Text>Edit due date</Text>
            <Text><Text color="cyan">t       </Text>Add task</Text>
            <Text><Text color="cyan">c       </Text>Add comment</Text>
            <Text><Text color="cyan">1-9     </Text>Toggle task</Text>
            <Text><Text color="cyan">Q       </Text>Quit</Text>
          </Box>
        </Box>
        <Box marginTop={1}>
          <Text color="gray" dimColor>Press any key to close</Text>
        </Box>
      </Box>
    );
  }

  // When in detail mode but the card no longer exists, reset to board in an effect.
  const detailCardMissing =
    mode.type === 'detail' &&
    !kanban.lists[mode.listIndex]?.cards[mode.cardIndex];

  React.useEffect(() => {
    if (detailCardMissing) {
      setMode({ type: 'board' });
    }
  }, [detailCardMissing]);

  // Card detail screen
  if (mode.type === 'detail') {
    const { listIndex, cardIndex } = mode;
    const card = kanban.lists[listIndex]?.cards[cardIndex];
    if (card) {
      return (
        <CardDetail
          card={card}
          listTitle={kanban.lists[listIndex].title}
          boardTitle={title}
          onBack={() => setMode({ type: 'board' })}
        />
      );
    }
    // Card not found — fallback while the effect above resets the mode.
    return null;
  }

  // Delete confirmation overlay
  const confirmDelete =
    mode.type === 'confirm_delete' ? kanban.lists[mode.listIndex]?.cards[mode.cardIndex] : null;

  const totalCards = kanban.lists.reduce((n, l) => n + l.cards.length, 0);
  const posHint = currentList
    ? `List ${selectedList + 1}/${kanban.lists.length}  Card ${currentList.cards.length === 0 ? '0' : selectedCard + 1}/${currentList.cards.length}`
    : '';

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header: title + status or hint */}
      <Box marginBottom={1} justifyContent="space-between">
        <Box>
          <Text bold color="cyan">{title}</Text>
          {statusMsg
            ? <Text color="green"> ✓ {statusMsg}</Text>
            : <Text color="gray"> — {km.help}: help  {km.quit}: quit</Text>
          }
        </Box>
        <Text color="gray" dimColor>{posHint}</Text>
      </Box>

      {confirmDelete && (
        <Box borderStyle="round" borderColor="red" paddingX={2} marginBottom={1}>
          <Text color="red">Delete </Text>
          <Text bold>"{confirmDelete.title}"</Text>
          <Text color="red">? </Text>
          <Text color="yellow">[y/N]</Text>
        </Box>
      )}

      <Box flexDirection="row" alignItems="flex-start">
        {kanban.lists.map((list, i) => (
          <KanbanList
            key={list.id}
            list={list}
            isSelected={i === selectedList}
            selectedCardIndex={i === selectedList ? selectedCard : -1}
            width={listWidth}
          />
        ))}
      </Box>

      {/* Status bar */}
      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text color="gray" dimColor>
          {`←/→:list  ↑/↓:card  Enter:open  ${km.list_add}:new-list  ${km.card_add}:add  ${km.card_edit}:edit  ${km.card_delete}:del  ${km.task_add}:task  ${km.card_move_left}/${km.card_move_right}:move  ${km.help}:help  ${km.quit}:quit`}
          {'   '}
          <Text color={totalCards === 0 ? 'gray' : 'white'}>{totalCards} cards</Text>
          {kanban.archive.cards.length > 0 && <Text color="gray">  {kanban.archive.cards.length} archived</Text>}
        </Text>
      </Box>
    </Box>
  );
};

type HeaderProps = { title: string; subtitle?: string; subtitleColor?: string };
const Header = ({ title, subtitle, subtitleColor = 'gray' }: HeaderProps) => (
  <Box marginBottom={1}>
    <Text bold color="cyan">
      {title}
    </Text>
    {subtitle && (
      <Text color={subtitleColor as Parameters<typeof Text>[0]['color']}> — {subtitle}</Text>
    )}
  </Box>
);

