import { useAppDispatch, useAppSelector } from "@/lib/store";
import { getCurrentProject, getDirStatus, getDirTree, populateProjects, type PageNode } from "@/lib/store/pageTree";
import { useEffect, useMemo } from "react";
import { Link } from "react-router";

export default function FavouritePage () {
    let dirTree = useAppSelector(getDirTree);
    let currentProject = useAppSelector(getCurrentProject);
    let dirStatus = useAppSelector(getDirStatus);
    const dispatch = useAppDispatch();

    useEffect(() =>  {
        if(dirTree == null)
            dispatch(populateProjects());
    }, [dirTree, dirStatus]);
    
    let favourite = useMemo(() => {
        if(dirTree == undefined || currentProject == undefined) return [];
        return extractNodes(dirTree[currentProject]);
    }, [dirTree, currentProject]);

    let mapped = favourite.map(e => <Link to={`/page/${e.pageHash}`} key={e.pageHash}>
        <span className={e.icon == "empty" ? "material-icon" : ""}>{e.icon == "empty" ? "docs" : e.icon}</span>
        <span>{e.name}</span>
    </Link> )

    return <section>
        <h1>
            Your Favourites
        </h1>
        <div>
            {mapped}
        </div>
        
    </section>
}

function extractNodes(tree: PageNode): PageNode[] {
    let stack: PageNode[] = [];
    let ret: PageNode[] = [];

    for(const child of tree.children) {
        stack.push(child);
    }

    while(stack.length !== 0) {
        const child = stack.pop();
        if(child == undefined) continue;

        if(child.favourite == true) ret.push(child);

        for(const subchild of child.children) stack.push(subchild);
    }

    return ret;
}