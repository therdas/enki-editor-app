import type { PathTree } from "./page";
import { Path } from "./path";
import type { Root } from "mdast";
import { SKIP, visit } from "unist-util-visit";
import json2toml from "json2toml";
import { trimFrontMatter } from "./frontmatter-parser";
import toml from "toml";
import YAML from "yaml";
import type { PageState } from "@/lib/store/page";

export enum PathStat {
    exists,
    does_not_exist,
    path_invalid,
}

export abstract class DataProvider {

    static get(): Promise<DataProvider> | (() => boolean) {
        throw Error("not implemented");
    }

    getPage(_: Path): Promise<PageState> {
        throw Error("not implemented");
    }

    setPage(_: Path, __: PageState): Promise<boolean> {
        throw Error("not implemented");
    }

    getPathStatus(_: Path): Promise<PathStat> {
        throw Error("not implemented");
    }

    getTags(_: Partial<Path>): string[] {
        throw Error("not implemented");
    }

    getDirListing(): Promise<PathTree> {
        throw Error("not implemented");
    }

    buildMetadataCache() {
        throw Error("not implemented");
    }

    // The provider is to remember the last document it is asked for. 
    // This can be stored to a temp file/cookie/etc.
    getLastOpened(): Path | undefined {
        throw Error("not implemented");
    }
}

export function parsePage(text: string): PageState {
    let [frontmatter, pageText, type] = trimFrontMatter(text)
    let parsedFrontmatter
    try {
        if (type === 'toml') {
            parsedFrontmatter = toml.parse(frontmatter);
        } else {
            parsedFrontmatter = YAML.parse(frontmatter);
        }
    } catch (err) {
        parsedFrontmatter = [];
    }

    let ret = {
        title: parsedFrontmatter['title'] ?? "",
        created: parsedFrontmatter['created'] ?? "",
        modified: parsedFrontmatter['modified'] ?? "",
        author: parsedFrontmatter['author'] ?? "",
        text: pageText,
        info: parsedFrontmatter['info'] ?? [],
        path: Path.parse('placeholder:placeholder')!,
    };

    return ret;
}

type Todo = {
    // Offsets into the document
    start: number,
    end: number,

    // Metadata
    tags: string[],                 //all tags within start and end, incl. children
    checked: boolean[],             // c[0] = status of elem, c[1...-1] = status of children
}

type Tag = {
    name: string,
    start: number,
    end: number,
}

async function getTags(ast: Root, text: string): Promise<Tag[]> {
    return new Promise((resolve, reject) => {
        let tags: Tag[] = [];
        visit(ast, (node, index, parent) => {
            if (node.type == "taggable") {
                tags.push({
                    name: node.value,
                    start: parent?.position?.start.offset ?? 0,
                    end: parent?.position?.end.offset ?? 0,
                })
            }
        })
        resolve(tags);
    })
}

async function getTodos(ast: Root, text: string): Promise<Todo[]> {
    return new Promise((resolve, reject) => {
        let todos: Todo[] = [];
        visit(ast, (node, index, parent) => {
            if (node.type == "listItem" && node.checked !== null && node.checked !== undefined) {
                let todo: Todo = {
                    start: node.position?.start.offset ?? 0,
                    end: node.position?.end.offset ?? 0,
                    tags: [],
                    checked: [],
                }
                todo.checked.push(node.checked);

                // we visit the children in here.
                for (let child of node.children)
                    visit(child, (child, index, parent) => {
                        if (child.type == "listItem") {
                            if (child.checked !== null && child.checked !== undefined)
                                todo.checked.push(child.checked);
                        } else if (child.type == "taggable") {
                            todo.tags.push(child.value);
                        }
                    })

                return SKIP;
            }
        })

        resolve(todos);
    })
}

export function dummyize(text: string): PageState {
    return {
        title: "",
        created: "",
        modified: "",
        author: "",
        text: text,
        info: [],
        path: Path.parse("placeholder:placeholder")!,
    }
}

export function addFrontmatter(page: PageState) {
    return `---
title: ${page.title}
created: ${page.created}
modified: ${page.modified}
author: ${page.author}
${json2toml(page.info)}
---
${page.text}
`
}