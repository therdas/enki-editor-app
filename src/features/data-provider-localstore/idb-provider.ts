import type { PageDataNode, PageState } from "@/lib/store/page";
import type { PageNode, Projects } from "@/lib/store/pageTree";
import { openDB } from 'idb';

interface InternalPage {
    page: string,
    path: string,
}

const isInternalPage = (obj: any): obj is InternalPage => (obj !== undefined) && (obj as InternalPage).path !== undefined && (obj as InternalPage).page !== undefined;

export async function WithIDBStorage() {
    
    const db = await openDB('enki', 1, {
        upgrade: (db, oldVersion, newVersion) => {
            if(newVersion == 1) {
                db.createObjectStore('documents');
                db.createObjectStore('indices');
                db.createObjectStore('data');
                db.createObjectStore('trash');
                db.createObjectStore('tags');
                db.createObjectStore('todos');
            } else {
                // We fail here. This is TRULY an exception.
                throw Error(`Failed to initialize IDB when migrating from v${oldVersion} to v${newVersion}. Does this browser support IndexedDB?`);
            } 
        }
    })

    const getPage = async (path: string) => {
        const v = await db.transaction('documents', 'readonly').store.get(path) as PageDataNode;
        return v;
    };
    const sendPageToTrash = async (hash: string) => {
        let tr = db.transaction(['documents', 'trash'], 'readwrite');
        let docs = tr.objectStore('documents');
        let trash = tr.objectStore('trash');

        let doc = await docs.get(hash);
        let trashStore = {
            ...doc,
            trashed_on: new Date().toLocaleString(),
        }
        trash.put(trashStore, hash);
        docs.delete(hash);
    };
    const addMetadataToTrash = async (obj: PageNode, path: string) => {
        let os = db.transaction('trash', 'readwrite').store;
        os.put({...obj, trashed_on: new Date().toLocaleString()}, 'meta-deleted-page::' + path);

    }
    const setPage = async (path:string, page: PageDataNode) => await db.transaction('documents', 'readwrite').store.put(page, path);
    const deletePageWithHash = async (hash: string) => await db.transaction('documents', 'readwrite').store.delete(hash);
    const getProjects = async() => await db.transaction('indices','readonly').store.get('projects') as PageNode[];
    const setProjects = async(projects: Projects) => await db.transaction('indices', 'readwrite').store.put(projects, 'projects');
    const updateTagIndex = async(hash: string, tags: string[]) => await db.transaction('tags', 'readwrite').store.put(tags, hash);       
    const updateTodoIndex = async(hash: string, todos: [string, boolean, number][]) => await db.transaction('todos', 'readwrite').store.put(todos, hash);
    
    const setKey = async(key: string, value: any) => db.transaction('indices', 'readwrite').store.put(value, key);
    const getKey = async(key: string) => db.transaction('indices', 'readonly').store.get(key);
    return {
        getPage,
        setPage,
        getProjects,
        setProjects,
        deletePageWithHash,
        sendPageToTrash,
        addMetadataToTrash,
        updateTagIndex,
        updateTodoIndex,
        setKey,
        getKey,
    }
}