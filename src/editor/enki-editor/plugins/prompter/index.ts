import {EditorState, Plugin} from "prosemirror-state";
import type { EditorView } from "prosemirror-view";

export const prompterWidget = new Plugin({
    view(editorView) {return new PrompterWidgetView(editorView)}
});

class PrompterWidgetView {
    tooltip: HTMLDivElement;
    constructor(view: EditorView) {
        this.tooltip = document.createElement('div');
        this.tooltip.className = "prosemirror-prompter";
        view.dom.parentNode?.appendChild(this.tooltip);
        this.tooltip.textContent = "Write or press / for formatting types";

        this.update(view, null);
    }

    update(view: EditorView, lastState: EditorState | null) {
        let state = view.state

        let selection = view.state.selection.$anchor;
        let node = selection.node(selection.depth);

        if(node.textContent.trim().length == 0) {
            this.tooltip.style.display = 'block';
        } else {
            this.tooltip.style.display = 'none';
        }

        let pos = view.coordsAtPos(selection.pos - selection.parentOffset);
        let box = this.tooltip.offsetParent?.getBoundingClientRect();

        this.tooltip.style.left = pos.left + 'px';
        this.tooltip.style.top = pos.top + 'px';
    }
}