import {remark} from 'remark';
import taggablePlugin from 'remark-taggable';
import remarkGFM from 'remark-gfm';
import { visit } from 'unist-util-visit';
import type { ListItem } from 'mdast';
import type { Node } from 'unist'
import {toMarkdown} from 'mdast-util-to-markdown'; 
import {toMarkdown as taggableToMarkdown} from 'mdast-util-taggable'

import type { InlineTaggableNode } from 'mdast-util-taggable';
function isInlineTaggableNode(node: Node): node is InlineTaggableNode {
    return (node as InlineTaggableNode).type == 'taggable';
}

export async function getTagsAndTodos(text: string) {
    const file = await remark()
        .use(taggablePlugin)
        .use(remarkGFM)
        .parse(text);

    const tags = new Set<string>();    //format: tag[]
    const todos: [string, boolean, number][] = [];   //format: [todo, isChecked, line]

    visit(file, isInlineTaggableNode, (node) => {tags.add(node.value)})

    visit(file, 'listItem', (node: ListItem) => {
        if(node.checked !== null)
            todos.push([
                toMarkdown(
                    node.children[0],
                    {
                        extensions: [taggableToMarkdown()],
                    }
                ), node.checked ?? false, 
                node.position?.start.line ?? -1
            ])
    })
    return {
        tags: [...tags.keys()],
        todos
    }
}