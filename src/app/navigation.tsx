import { NavItem } from "@/components/nav-item";
import ProjectChooser from "@/components/project-chooser";
import { WithIDBStorage } from "@/features/data-provider-localstore/idb-provider";
import { useAppDispatch } from "@/lib/store";
import { addPath, getCurrentProject, getDirStatus, getDirTree, getTags, PageType, populateProjects, reparentPath, type DirState, type Projects, type TreeState } from "@/lib/store/pageTree";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import ReactDragListView from "react-drag-listview";

export function Navigation() {
    const dispatch = useAppDispatch()
    const dirTree = useSelector(getDirTree);
    const dirTreeStatus = useSelector(getDirStatus);
    const currentProject = useSelector(getCurrentProject);
    const linksContainerElement = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(dirTreeStatus == 'idle') {
            dispatch(populateProjects());
            dispatch(getTags());
        }
    }, [dirTree, dirTreeStatus])

    function addPage() {
        if(currentProject == null) return;
        // Create navItem
        dispatch(addPath({
            path: dirTree[currentProject].name,
            page: {
                icon: "📄",
                name: "Empty Page",
                type: PageType.DATA,
                children: [],
                pageHash: 'generate',
                collapsed: false,
            },
            new: true
        }));
    }

    const onDragProps = {
        onDragEnd(fromIndex: number, toIndex: number) {
            if(linksContainerElement.current == null) return;
            const children = Array(...linksContainerElement.current.childNodes[0].childNodes);
            dispatch(reparentPath({
                from: (children[fromIndex] as HTMLAnchorElement).dataset['path'] ?? "",
                to: (children[toIndex] as HTMLAnchorElement).dataset['path'] ?? "" ,
                direction: (fromIndex < toIndex ? 'down' : 'up')
            }))
        },
        nodeSelector: 'a',
        handleSelector: 'a'
    }

    let index = 0;

    if(dirTreeStatus == "pending") {
        return <h1> Loading... </h1>
    } else if(dirTreeStatus == "loaded") {
        let elems = currentProject == null ? null : dirTree[currentProject].children.map(page => <NavItem tree={page} pathToParent={dirTree[currentProject].name} indent={0} key={page.pageHash}/>)
        return (
            <nav>
                <ProjectChooser projects={dirTree} current={currentProject}/>
                <div id="nav-tree" ref={linksContainerElement}>
                    { currentProject !== null ? 
                            (
                                <>
                                    <ReactDragListView {...onDragProps}>
                                        {elems}
                                        
                                    </ReactDragListView>
                                    <a onClick={addPage}>
                                            <span className="material-icon emoji">add</span>
                                            <span>Add Page…</span>
                                    </a>
                                </>
                            )
                        : (
                            <><div>Please choose or create a project first!</div></>
                        )
                    }
                </div>

                <div id="setup-panel">
                    <span className="material-icon">home</span>
                    <span className="material-icon">attach_file</span>
                    <span className="material-icon">favorite</span>
                    <span className="material-icon">menu</span>
                </div>
            </nav>
        )
    } else {
        return (
            <h1>Something went wrong</h1>
        )
    }
}