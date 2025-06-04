import { createListenerMiddleware } from '@reduxjs/toolkit'

import { WithIDBStorage } from '@/lib/database/idb-provider';
import type { RootState } from '../store';
import { type PageDataNode } from '../store/page';
import { removePath } from '../store/pageTree';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({

    predicate: (action) => {
        if (
            
            action.type.startsWith('dir/add')           || 
            action.type.startsWith('dir/modify')        || 
            action.type.startsWith('dir/set')           || 
            action.type.startsWith('dir/reparent')      || 
            action.type.startsWith('dir/toggle')

        ) {
            return true;
        } else {
            return false;
        }
    },
    effect: async (action, listenerAPI) => {
        let newState = listenerAPI.getState() as RootState;

        (await WithIDBStorage()).setProjects(newState.dir.projects);

        if (action.type == 'dir/addPath') {
            let payload = action.payload as { path: string, page: PageDataNode, new: boolean };
            if (payload.new && newState.dir.currentProject !== null) {

                let node = newState.dir.projects[newState.dir.currentProject];
                let path = payload.path.split('/').filter((elem) => elem.length !== 0);

                for (let segment of path.slice(1)) {
                    let i = node.children.findIndex((page) => page.name == segment);
                    if (i == -1)
                        return;
                    node = node.children[i];
                }

                let page = node.children[node.children.length -1 ];

                (await WithIDBStorage()).setPage(page.pageHash, {
                    created: (new Date()).toLocaleString(),
                    modified: (new Date()).toLocaleString(),
                    author: '',
                    text: payload.page.text,
                });
            }
        }
    }
})

listenerMiddleware.startListening({
    actionCreator: removePath,
    effect: (action, listenerAPI) => {
        let newState = listenerAPI.getState() as RootState;
        WithIDBStorage().then( db => db.setProjects(newState.dir.projects));

        let oldState = listenerAPI.getOriginalState() as RootState;
        let path = action.payload as string;
        let segments = path.split('/').filter( e => e.length !== 0).slice(1);


        if(oldState.dir.currentProject == null) return;


        let node = oldState.dir.projects[oldState.dir.currentProject];
        for(let segment of segments) {
            let idx = node.children.findIndex( e => e.name == segment);
            if(idx == -1)
                return;
            node = node.children[idx];
        }

        let stack = [];
        stack.push(...node.children);
        while(stack.length !== 0) {
            let n = stack.pop();
            if(n == undefined) continue;
            stack.push(...n.children);

            WithIDBStorage().then((db) => {
                db.sendPageToTrash(n.pageHash);
            })
        }

        WithIDBStorage().then((db) => {
            db.addMetadataToTrash(node, path);
        })

        WithIDBStorage().then((db) => {
            db.sendPageToTrash(node.pageHash);
        })
    }
}) 