import { WithIDBStorage } from "@/lib/database/idb-provider";
import { useAppSelector } from "@/lib/store";
import { getCurrentProject, getDirTree, queryDirTree } from "@/lib/store/pageTree";
import { useEffect, useMemo, useState } from "react"
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";

export function TagLoader(args: LoaderFunctionArgs) {
    if('tagname' in args.params){
        return args.params['tagname']
    }
}

export default function MainPage() {
    let [tags, setTags] = useState<[string, string[]][]>();
    let dirTree = useAppSelector(getDirTree);
    let tagName = useLoaderData();
    let projectIdx = useAppSelector(getCurrentProject);

    const pageDataNodeArray = useMemo(
        () => {
            const set: {icon: string, title: string, hash: string}[] = [];
            if(tagName == undefined || tags == undefined || dirTree == undefined || projectIdx == undefined) return [];
            for(let page of tags) {
                const hash = page[0];
                const data = page[1];
                const idx = data.findIndex(e => e == tagName);

                if(idx == -1) continue;

                // We process this page
                let meta = queryDirTree(dirTree[projectIdx], hash);

                if(meta == undefined) continue;

                // We now have all the data:
                set.push({
                    icon: meta.icon,
                    title: meta.name,
                    hash: page[0],
                })
            }
            return set;
        },
        [tagName, tags],
    )

    const elems = pageDataNodeArray.map(e => <Link to={`/page/${e.hash}`} id={e.hash}>
        <span className={e.icon === 'empty' ? "material-icon" : ""}>{e.icon}</span><span>{e.title}</span>
    </Link>)

    useEffect(() => {
        WithIDBStorage().then(async (db) =>  {
            let res = await db.getTags();
            setTags(res);
        });
    }, [])



    return <>
        <section id="tags-page">
            <h1><span>Pages mentioning </span>#{tagName}</h1>
            {elems}
        </section>
    </>
}