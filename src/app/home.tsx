import { WithIDBStorage } from "@/lib/database/idb-provider";
import { useAppSelector } from "@/lib/store";
import { getCurrentProject, getDirTree, queryDirTree } from "@/lib/store/pageTree";
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router";
import type { PageDataNode } from "@/lib/store/page";

export default function MainPage() {
    let [tags, setTags] = useState<[string, string[]][]>();
    let [todos, setTodos] = useState<[string, [string, boolean, number][]][]>();
    let dirTree = useAppSelector(getDirTree);
    const [lastThreePages, setLastThree] = useState<[string, PageDataNode][]>();
    let projectIdx = useAppSelector(getCurrentProject);

    const tagsArray = useMemo(
        () => {
            const set = new Set<string>();
            if(tags == undefined) return [];
            for(let page of tags) {
                for(let tag of page[1]) {
                    set.add(tag);
                }
            }
            return [...set.values()];
        },
        [tags],
    )

    const tagElements = tagsArray?.map(e => <Link to={`/tags/${e}` } key={e}>{e}</Link>);
    const todoElements = todos?.map(e => {
        if(dirTree == undefined || projectIdx == undefined)
            return;

        let currentProject = dirTree[projectIdx];
        let page = queryDirTree(currentProject, e[0]);
        if(page == undefined)
            return null;

        let elems = [];
        for(let todo of e[1]) {
            elems.push(
                <li key={'parent-' + page.pageHash + '-' + todo[2]}>
                    <input type="checkbox" checked={todo[1]} disabled />
                    <Link to={'/page/'+ page.pageHash}>
                        {todo[0]}
                    </Link>
                </li>
            )
        }
        return <li key={page.pageHash}>
                <Link to={`/page/${page.pageHash}`}>{page.name}</Link>
                <ul>
                    {elems}
                </ul>
            </li>
    })
    const ltpElements = lastThreePages?.map(e => {
        return <li key={'lvp-' + e[0]}><Link to={`/page/${e[0]}`} key={`page-${e[0]}`}>{e[0]}</Link> <span>{e[1].modified}</span></li>
    }) 

    useEffect(() => {
        WithIDBStorage().then(async (db) =>  {
            let res = await db.getTags();
            setTags(res);
        });
        WithIDBStorage().then(async (db) => {
            let res = await db.getTodos();
            setTodos(res);
        })
        WithIDBStorage().then(async (db) => {
            let res = await db.getLastNPages(3);
            setLastThree(res);
        })
    }, [])



    return <>
        <section id="main-page">
            <h1>
                Welcome to <span>your</span> notes
            </h1>
            <h2>Jump back in: </h2>
            <ul>
                {ltpElements}
            </ul>
            <h2>Browse by Tags: </h2>
            <ul>
                {tagElements}
            </ul>
            <h2>Your Tasks: </h2>
            <ul>
                {todoElements}
            </ul>
        </section>
    </>
}