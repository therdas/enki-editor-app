import { Editor } from "@/components/editor"
import { EmojiPicker } from "@/components/emoji-picker"
import { useAppDispatch } from "@/lib/store"
import { getPage, getPageStatus, populatePage } from "@/lib/store/page"
import { getCurrentProject, getDirTree, modifyPath, queryDirTree } from "@/lib/store/pageTree"
import type { Emoji } from "frimousse"
import React, { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router"

export function PageLoader(args: LoaderFunctionArgs) {
    if('*' in args.params){
        return args.params['*'];
    }
}

export default function EditorPage() {
    const hash = useLoaderData();

    const dispatch = useAppDispatch();
    const page = useSelector(getPage);
    const status = useSelector(getPageStatus);

    const dir = useSelector(getDirTree);
    const projectIdx = useSelector(getCurrentProject);
    const thisPage = queryDirTree(dir[projectIdx ?? 0], hash);

    const pageName = useRef<HTMLInputElement>(null);
    const errorName = useRef<HTMLDivElement>(null);
    const [showEmoji, setEmoji] = useState(false);

    let children = thisPage?.children.map( 
    node => <Link to={`/page/${node.pageHash}`}>
        <span className={node.icon == "empty" ? "material-icon" : ""}>
            {node.icon == "empty" ? "docs" : node.icon}
        </span>
        <span>
            {node.name}
        </span>
    </Link>) ?? false;

    useEffect(() => {
        dispatch(populatePage(hash));
        return () => {}
    }, [hash]);

    const changeTitle: React.KeyboardEventHandler= (e) => {
        if(e.key == 'Enter' && pageName.current) {
            let newName = pageName.current.value;
            if(errorName.current) errorName.current.classList.remove('show');
            dispatch(modifyPath([hash, [thisPage?.icon ?? "📄", newName, thisPage?.favourite ?? false]]));
        }
    }  

    const updateEmojis = (emoji: Emoji) => {
        if(!thisPage) return;
        dispatch(modifyPath([hash, [emoji.emoji, thisPage.name, thisPage?.favourite ?? false]]))
    }

    if(projectIdx == null) {
        return <>
            <h1> Please select a project first!</h1>
        </>
    }


    if(status == 'pending' ) {
        return <>
            <h1>loading...</h1>
        </>
    } else if (status && status == 'loaded') {
        return <>
            <div id="page">
                <div id="page-hero">
                    <span className={(thisPage?.icon == "empty" ? "material-icon " : ""  ) +  "emoji-preview"} onClick={() => setEmoji(!showEmoji)}>
                        {thisPage?.icon == "empty" ? "docs" : thisPage?.icon}
                    </span>
                    <div className={(showEmoji ? "show " : "hide ") + "emoji-container"}>
                        <EmojiPicker show={showEmoji} onPick={updateEmojis}/>
                        <div className="shadow" onClick={() => setEmoji(false)}></div>
                    </div>
                    <input id="page-name" placeholder={thisPage?.name} onKeyDown={changeTitle} ref={pageName}></input>
                    <div className="error" ref={errorName}></div>
                </div>
                <Editor page={page} hash={hash}/>
                {children}
            </div>
        </>
    } else {
        return <h1>The page {hash} does not exist</h1>
    }
}