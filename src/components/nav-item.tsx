import { useAppDispatch } from "@/lib/store";
import { addPath, PageType, removePath, togglePathCollapseState, type PageNode } from "@/lib/store/pageTree";
import type { MouseEventHandler } from "react";
import { Link } from "react-router";

export function NavItem( { tree, pathToParent, indent }:{ tree: PageNode, pathToParent: string, indent: number }) {
    let projectName = tree.name;
    let childrenArray =  tree.children.map((child) => <NavItem tree={child} indent={indent + 1} pathToParent={`${pathToParent}/${tree.name}`} key={child.pageHash}/>)
    let dispatch = useAppDispatch();

    let path = `${pathToParent}/${tree.name}`

    const addPageHandler: MouseEventHandler = (e) => {
        dispatch(addPath({
            path: path,
            page: {
                icon: "empty",
                name: "New Page",
                type: PageType.DATA,
                children: [],
                pageHash: 'generate',
                collapsed: false,
            },
            new: true
        }));
    }

    const deletePageHandler: MouseEventHandler = (e) => {
        dispatch(removePath(path));
        e.preventDefault();
        e.stopPropagation();
    }    
    const collapseHandler: MouseEventHandler = e => {
        dispatch(togglePathCollapseState(path));
        e.preventDefault();
        e.stopPropagation();
    }

    return ( 
        <>  
            <Link 
                to={ `/page/${tree.pageHash}` }
                style={{
                    marginLeft: `${indent*20}px`
                }} 
                key= {tree.pageHash}
                data-path={path}
                className={tree.collapsed ? "collapsed" : "open"}
            >
                <span className={(tree.collapsed ? "collapsed" : "open") + " button hider material-icon"} onClick={collapseHandler}>
                    {tree.collapsed ? 'arrow_right' : 'arrow_drop_down'}
                </span>
                <span className={tree.icon == "empty" ? "material-icon emoji" : "emoji "}>
                    {tree.icon == "empty" ? "docs" : tree.icon}
                </span>
                <span className="name">{tree.name}</span>
                <span className="material-icon button" onClick={addPageHandler}>add</span>
                <span className="material-icon button" onClick={deletePageHandler}>more_vert</span>
            </Link>
            
            {!tree.collapsed && childrenArray}
            
            {
                childrenArray.length!== 0  && 
                <Link 
                    to={`/page/${tree.pageHash}`} 
                    style={{
                        marginLeft: `${indent*20}px`
                    }}
                    className="nav-drop-ahead" 
                    key={tree.pageHash + '-drop-target'}
                    data-path={path}
                >
                    DropHere
                </Link> 
            }
        </>
    )
}
