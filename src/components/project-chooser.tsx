import { addProject, setProject, setProjects, type Projects } from "@/lib/store/pageTree";
import React, { useEffect, useRef, useState } from "react"
import { EmojiPicker } from "./emoji-picker";
import type { Emoji } from "frimousse";
import { useAppDispatch } from "@/lib/store";
import ReactDragListView from "react-drag-listview";

export default function ProjectChooser({projects, current}: {projects: Projects, current: number | null}) {
    let dispatch = useAppDispatch();
    let project_elems = [];
    let [emoji, setEmoji] = useState('📄');
    let [showDropdown, setShowDropdown] = useState(false);
    let [showAdder, setShowAdder] = useState(false);
    let [showEmoji, setShowEmoji] = useState(false);
    let inputRef = useRef<HTMLInputElement>(null);


    function setNewEmoji(emoji: Emoji) {
        setEmoji(emoji.emoji);
    }

    useEffect(() => {
        if(current == null){
            if(projects.length > 0) {
                dispatch(setProject(0));
            }
        }
    }, [projects, current])

    function createProject() {
        if (
            inputRef.current == null ||
            inputRef.current.value.trim().length == 0
        ) return;

        dispatch(addProject([emoji, inputRef.current.value.trim()]))
    }

    for(let i = 0; i < projects.length; ++i) {
        project_elems.push(
            <li 
                key={projects[i].name} 
                id={`project-selector-${projects[i].name}`}
                onClick={() => dispatch(setProject(i))}
            >
                <span className="material-icon" draggable>drag_indicator</span>
                <span>{projects[i].icon}</span>
                <span>{projects[i].name}</span>
            </li>
        )
    }

    const dragProps = {
        onDragEnd(fromIndex: number, toIndex: number) {
            const data = [...projects];
            const item = data.splice(fromIndex, 1)[0];
            data.splice(toIndex, 0, item);
            dispatch(setProjects(data));
        },
        nodeSelector: 'li',
        handleSelector: 'span:first-child'
    }

    return (
        <>
            <div id="project-chooser" className={showDropdown ? "active" : "inactive"} onClick={() => setShowDropdown(!showDropdown)}>
                <span className={current ? "icon":"icon material-icon"}>{current == null ? 'select' : projects[current].icon}</span>
                <span className="name">{current == null ? "Select Project" : projects[current].name}</span>
                <span className="material-icon">arrow_drop_down</span>
            </div>
            <div id="project-dropdown" className={showDropdown ? "show" : "hide"}>
                <ReactDragListView {...dragProps}>
                    {project_elems}
                </ReactDragListView>
                <div id="adder-container">
                    <div id="add-project-button" onClick={() => setShowAdder(true)} className={showAdder ? "hide" : "show"}>
                        <span className="material-icon">add</span>
                        <span>Create Project...</span>
                    </div>

                    <div id="project-adder" className={showAdder ? "show" : "hide"}>
                        <span className="button icon" onClick={() => setShowEmoji(!showEmoji)}>{emoji}</span>
                        <input ref={inputRef} placeholder="Project Name"></input>
                        <span className="button material-icon" onClick={() => {setShowAdder(false); createProject()}}>check</span>
                        <span className="button material-icon" onClick={() => {setShowAdder(false)}}>close</span>
                        <EmojiPicker onPick={setNewEmoji} show={showEmoji}/>
                    </div>
                </div>
                
            </div>
        </>
    )
}