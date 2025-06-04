import { EnkiEditor } from '@enki/enki-editor';
import { useRef, useEffect } from 'react';
import { debounce, throttle } from 'lodash';
import { WithIDBStorage } from '@/lib/database/idb-provider';
import type { PageDataNode } from '@/lib/store/page';
import { getTagsAndTodos } from './parser';


export function Editor ({page, hash}: {page: PageDataNode, hash: string}) {
    const editorRef = useRef<HTMLDivElement>(null);
    const etor = useRef<EnkiEditor>(null);

    function savePage() {
        if(etor.current == null) return;
        const text = etor.current.serialize();
        const newPage = {...page};
        newPage.text = text;

        WithIDBStorage().then((db) => {
            db.setPage(hash, newPage);
        })

        // Parse and store todos and tags
        getTagsAndTodos(newPage.text).then(({tags, todos}) => {
            WithIDBStorage().then((db) => {
                console.log("@TAGS" , tags);
                db.updateTagIndex(hash, tags);
                db.updateTodoIndex(hash, todos);
            })
        });
    }

    const saver = throttle(() => {
        debounce(() => {
            savePage();
        })();
    }, 1000)

    useEffect(() => {
        if(etor.current == null) {
            const _editor = new EnkiEditor(editorRef.current!, page.text);
            etor.current = _editor;
            editorRef.current?.addEventListener('keydown', saver);
        }

        return () => {
            if(etor.current !== null) {
                savePage();

                etor.current.destroy();
                etor.current = null;

                editorRef.current?.removeEventListener('keydown', saver);
            }
        }
    }, [page])

    return (
        <div id="editor-frame">
            <div id="editor" ref={editorRef}>
            </div>
        </div>
    )
}
