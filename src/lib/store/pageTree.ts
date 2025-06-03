import { WithIDBStorage } from "@/features/data-provider-localstore/idb-provider";
import { createAsyncThunk, createSlice, current, type PayloadAction } from "@reduxjs/toolkit"
import { Children } from "react";
import { visit } from "unist-util-visit";
import { getUUID } from "../unique-id";
import { data } from "react-router";

export type Projects = PageNode[]

export interface TreeState {
    currentProject: number | null,
    projects: PageNode[],
    status: 'idle' | 'loaded' | 'pending' | 'failed',
    error: string | null,
    tags: [string, string[]][],                         // Name of all tags, we handle todos differently...
}

export enum PageType {
    DATA,
    TABLE,
    TAG,
    SEARCH,
    NONE
}

export interface PageNode {
    icon: string,
    name: string,
    type: PageType,
    children: PageNode[],
    pageHash: string,
    collapsed: boolean,
}

export const populateProjects = createAsyncThunk(
    'tree/fetchtree',
    async () => {
        const response = await (await WithIDBStorage()).getProjects();
        if(!response) {
            await (await WithIDBStorage()).setProjects([]);
            return [];
        }
        return response ?? [];
    }
)

export const getTags = createAsyncThunk(
    'tree/fetchtags',
    async () => {
        const tags = await (await WithIDBStorage()).getKey('tags');
        if(!tags) {
            (await WithIDBStorage()).setKey('tags', []);            // format: [project-name, []]
            (await WithIDBStorage()).setKey('tag-index', []);       // format: [project-name, tag, [used pages]]
        }
        return tags ?? [];
    }
)

const initialState: TreeState = {
    currentProject: null,
    projects: [],
    status: 'idle',
    error: null,
    tags: [],
}

export const TreeSlice = createSlice({
    name: 'dir',
    initialState: initialState,
    reducers: {
        setTree: (state, action: PayloadAction<TreeState>) => {
            state = action.payload;
        },

        setProject: (state, action: PayloadAction<number>) => {
            state.currentProject = action.payload;
        },

        setProjectByName: (state, action: PayloadAction<string>) => {
            let name = action.payload;
            let idx = state.projects.findIndex((val) => val.name === name);
            if(idx !== -1)
                state.currentProject = idx;
        },

        setProjects: (state, action: PayloadAction<Projects>) => {
            state.projects = action.payload;
        },

        togglePathCollapseState: (state, action: PayloadAction<string>) => {
            if(state.currentProject == null)return;
            
            let path = action.payload;

            const segments = path.split('/').filter(str => str.length !== 0).slice(1);
            let node = state.projects[state.currentProject];
            for(let segment of segments) {
                let idx = indexOf(node.children, segment);
                if(idx == -1) return;
                node = node.children[idx];
            }

            node.collapsed = !node.collapsed;
        },

        addPath: (state, action: PayloadAction<{
            path: string,
            page: PageNode,
            new: boolean,
        }>) => {
            if (state.currentProject == null)
                return;

            const data = action.payload;
            const path = data.path.split('/').filter((str) => str.length !== 0);
            const pathToCur = [];

            
            let currentNode = state.projects[state.currentProject];

            pathToCur.push(state.projects[state.currentProject].name);
            for (let segment of path.slice(1)) {

                pathToCur.push(segment);

                let index = indexOf(currentNode.children, segment);

                if (index !== -1) {
                    currentNode = currentNode.children[index];
                } else {
                    currentNode.children.push({
                        name: segment,
                        icon: 'empty',
                        type: PageType.DATA,
                        children: [],
                        pageHash: getUUID(),
                        collapsed: false,
                    })
                }
            }

            if(action.payload.new) {
                let base = "New Page";
                let idx = 0;
                while(indexOf(currentNode.children, base + (idx == 0 ? "" : ` ${idx}`)) !== -1) idx++;

                currentNode.children.push({
                    name: base + (idx == 0 ? "" : ` ${idx}`),
                    icon: 'empty',
                    type: PageType.DATA,
                    children: [],
                    pageHash: getUUID(),
                    collapsed: false,
                })
            }
        },
        removePath: (state, action: PayloadAction<string>) => {
            if (state.currentProject == null)
                return;

            const data = action.payload;
            const path = data.split('/').filter((str) => str.length !== 0);

            
            let currentNode = state.projects[state.currentProject];
            for (let segment of path.slice(1, -1)) {
                let index = indexOf(currentNode.children, segment);

                if( index == -1 ) return;

                currentNode = currentNode.children[index];
            }

            // We are at a valid path, hopefully...
            let index = indexOf(currentNode.children, path[path.length - 1]);
            if(index !== -1)
                currentNode.children = [...currentNode.children.slice(0, index), ...currentNode.children.slice(index + 1)];
        },
        modifyPath(state, action: PayloadAction<[string, [string, string]]>) {
            if(state.currentProject == null)
                return;

            let [hash, newData] = action.payload;
            let [newIcon, newName] = newData;

            // Find old node:
            let root = state.projects[state.currentProject];
            let node = queryDirTree(root, hash);
            
            if(node == undefined) return;

            // We now have the node, modify it.
            node.name = newName;
            node.icon = newIcon;
        },
        reparentPath: (state, action: PayloadAction<{from: string, to: string, direction: 'up' | 'down'}>) => {

            //fix recursion
            // If to is "", we have to move the element to the front of everythin' else.
            if(state.currentProject == null) return;
            const {from, to} = action.payload;
            const {direction} = action.payload;

            const fromPath = from.split('/').filter((e) => e.length > 0).slice(1);
            const toPath = to.split('/').filter((e) => e.length > 0).slice(1);
            
            if(pathIsChildOf(fromPath,toPath)) {
                return;
            }

            // Navigate and get fromPath's parent
            let node = state.projects[state.currentProject];
            let parent;
            let idx = -1;
            for(let segment of fromPath) {
                idx = indexOf(node.children, segment);
                if(idx == -1) return;
                parent = node;
                node = node.children[idx];
            }


            // Navigate and get toPath's parent
            let nodeto = state.projects[state.currentProject];
            let parentto;

            let idy = -1;
            for(let segment of toPath) {
                idy = indexOf(nodeto.children, segment);
                if(idy == -1) return;
                parentto = nodeto;
                nodeto = nodeto.children[idy];
            }



            // Move nodeTo to node's childrens, insert after position idx

            if(parentto !== undefined) {

                if(direction == 'up') {
                    parentto.children = [...parentto.children.slice(0, idy), node, ...parentto.children.slice(idy)];

                    // If they are in the same parent, adjust idx for insert operation.
                    if(parentto == parent && parent !== undefined && idx > idy) ++idx;
                    
                    if(parent)
                        parent.children = [...parent.children.slice(0,idx), ...parent.children.slice(idx + 1)]
                } else {

                    parentto.children = [...parentto.children.slice(0, idy + 1), node, ...parentto.children.slice(idy + 1)];

                    // If they are in the same parent, adjust idx for insert operation.
                    if(parentto == parent && parent !== undefined && idx > idy + 1) ++idx;
                    
                    if(parent)
                        parent.children = [...parent.children.slice(0,idx), ...parent.children.slice(idx + 1)]
                }
            }
        },
        addProject: (state, action: PayloadAction<[string, string]>) => {
            if (!(action.payload[1] in state.projects)) {
                state.projects.push({
                    name: action.payload[1],
                    icon: action.payload[0],
                    type: PageType.DATA,
                    children: [],
                    pageHash: getUUID(),
                    collapsed: false,
                })
            }

            if (state.projects.length == 1) {
                state.currentProject = 0;
            }
        },
        removeProject: (state, action: PayloadAction<number>) => {
            if (action.payload in state.projects) {
                delete state.projects[action.payload];
            }
        },
    },
    selectors: {
        getDirTree: state => state.projects,
        getDirStatus: state => state.status,
        getCurrentProject: state => state.currentProject,
    },
    extraReducers: builder => {
        builder
            .addCase(populateProjects.pending, (state, action) => {
                state.status = 'pending';
            })
            .addCase(populateProjects.fulfilled, (state, action) => {
                state.status = 'loaded';
                state.projects = action.payload;
            })
            .addCase(populateProjects.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message ?? "Unknown error :(";
            })
            .addCase(getTags.fulfilled, (state, action) => {
                state.tags = action.payload;
            })
    }
})

export function indexOf(pages: PageNode[], name: string): number {
    for(let i = 0; i < pages.length; ++i) {
        if(pages[i].name == name)
            return i;
    }
    return -1;
}

export const { addPath, modifyPath, removePath, reparentPath, togglePathCollapseState,  addProject, setProjects, removeProject, setProject } = TreeSlice.actions;
export const { getDirTree, getDirStatus, getCurrentProject } = TreeSlice.selectors;
export type DirState = ReturnType<typeof TreeSlice.getInitialState>;
export default TreeSlice.reducer;

export function queryDirTree(dirTree: PageNode, hash: string) {
    if(dirTree == undefined) return;
    let stack: PageNode[] = [];
    stack.push(dirTree);

    while(stack.length !== 0) {
        let node = stack.pop()!;
        if(node.pageHash == hash) return node;
        let idx = node.children.findIndex( c => c.pageHash == hash);
        if(idx !== -1) return node.children[idx];
        stack.push(...node.children);
    }

    return undefined;
}

function findNodeByIndexBuilder(node: PageNode, index: number): [PageNode, PageNode | undefined] | undefined {
    let at = index;

    function findNodeByIndex(node: PageNode, parent: PageNode | undefined, index: number): [PageNode, PageNode | undefined] | undefined {
        // Visit node
        if(at == 0) {
            return [node, parent];
        } 

        // Visit Children
        for(let child of node.children) {
            const res = findNodeByIndex(child, node, --at);
            if(res !== undefined) return res;
        }

        return undefined;
    };

    return findNodeByIndex(node, undefined, index);
}

function pathIsChildOf(pathA: string[], pathB: string[]) {
    // Return if PathB is a child of PathA
    if(pathB.length < pathA.length) {
        return false;
    }

    for(let i = 0; i < pathA.length; ++i) {
        if(pathA[i] !== pathB[i]) return false;
    }

    return true;
}