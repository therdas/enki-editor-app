import { WithIDBStorage } from "@/lib/database/idb-provider"
import { useEffect, useMemo, useState, type ChangeEventHandler } from "react"
import lunr from 'lunr';
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { getCurrentProject, getDirStatus, getDirTree, populateProjects, queryDirTree } from "@/lib/store/pageTree";
import type { PageDataNode } from "@/lib/store/page";

export interface Index {
    modified: string,
    index: string,
}

interface IndexedPageType {
    hash: string,
    name: string,
    text: string,
}

export default function SearchPage() {
    const [searchField, setSearch] = useState("");
    let [index, setIndex] = useState<lunr.Index>();
    let dirTree = useAppSelector(getDirTree);
    let currentProject = useAppSelector(getCurrentProject);
    let dirTreeStatus = useAppSelector(getDirStatus);
    let dispatch = useAppDispatch();


    const buildIndex = async () => {
        if(
            dirTree == null
        ) {
            dispatch(populateProjects());
            return;
        }

        if(currentProject == null) {
            return;
        }


        let indexData: IndexedPageType[] = [];
        let proj = dirTree[currentProject];

        let os = (await WithIDBStorage()).getRawDB().transaction('documents').store;
        let cur = await os.openCursor();

        if(cur == null) return;

        for await(const i of cur) {
            let key = i.primaryKey.toString();
            let val = i.value as PageDataNode;

            let meta = queryDirTree(proj, key);
            if(meta == undefined) continue;

            console.log(val.text);

            indexData.push({
                hash: key,
                name: meta.name,
                text: val.text
            })
        }

        //Build index
        let idx = lunr(function() {
            this.ref('hash');

            this.field('text');

            this.field('name');

            this.pipeline.remove(lunr.stopWordFilter);

            for(const doc of indexData)
                this.add(doc);
        });

        (await WithIDBStorage()).setKey('search_index', {
            index: JSON.stringify(idx),
            modified: new Date().toLocaleString(),
        }).then(() => setIndex(idx));

        console.log("built index", idx);
    }

    useEffect(() => {

        WithIDBStorage().then( async (db) => {
            // Get the two params on why we wanna build an index. 
            // One, get the index from IDBStorage. Then get the latest
            // document from storage (n=1) and compare the modified timestamps.
            // If the timestamps are different we'll recompute our index.
            let oldidx = await db.getKey('search_index') as Index;

            if(index == undefined && oldidx == undefined) {
                buildIndex();
            } else if(index == undefined && oldidx !== undefined ){
                setIndex(lunr.Index.load(JSON.parse(oldidx.index)))
            } else if(index !== undefined && oldidx == undefined) {
            } else if(index !== undefined && oldidx !== undefined) {
                console.log("pls");

                let lastModifiedPage = (await db.getLastNPages(1))?.[0][1] ?? undefined;
                
                if(lastModifiedPage == undefined) return;

                let indexDate = new Date(oldidx.modified);
                let modifiedDate = new Date(lastModifiedPage.modified);

                if(indexDate < modifiedDate) 
                    buildIndex(); 
                else
                    setIndex(lunr.Index.load(JSON.parse(oldidx.index)));
                // If the index exists and is AOK or the index is current, 
                // we simply set our internal index to it.
            }
        })

    }, [dirTreeStatus]);

    

    const results = useMemo(() => {

        if(index) {
            return index.search(searchField+'*') 
        } else return undefined;
    }, [searchField, index]);


    let elem = results?.map( e => {
        if(dirTree == undefined || currentProject == undefined) return false;
        const proj = dirTree[currentProject];
        const meta = queryDirTree(proj, e.ref); 
        if(meta == undefined) return false;

        return <div key={e.ref}>
            <span className={meta.icon == "empty" ? "material-icon": ""}>{meta.icon == "empty" ? "docs" : meta.icon}</span>
            <span>{meta.name}</span>
        </div>
    })

    const handleChange: ChangeEventHandler = (e) => {
        setSearch((e.target as HTMLInputElement).value);
    }

    return <>
        {currentProject !== null && <section id="search-page">
            <div>
                <span className="material-icon">search</span>
                <input type="search" onChange={handleChange} placeholder="What do you want to search for?"/>
                </div>
            <div id="results">
                {elem}
            </div>
        </section>}
        {currentProject == null && <section  id="search-page">
            <div>
                <span className="material-icon">error</span>
                <input type="search" disabled placeholder="You need to choose a project first..."></input>
            </div>
        </section>}
    </>
}