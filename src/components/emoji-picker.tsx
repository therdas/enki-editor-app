import { EmojiPicker as EP, type Emoji } from "frimousse";

export function EmojiPicker({ onPick, show }: { onPick: (emoji: Emoji) => void, show: boolean }) {
  return (
    <EP.Root className={(show ? "show " : "hide ") + "project-emoji-picker emoji-picker"} onEmojiSelect={onPick}>
      <div>
        <EP.Search />
      </div>
      <div>
        <EP.Viewport>
          <EP.Loading>Loading…</EP.Loading>
          <EP.Empty>No emoji found.</EP.Empty>
          <EP.List />
        </EP.Viewport>
      </div>
    </EP.Root>
  );
}