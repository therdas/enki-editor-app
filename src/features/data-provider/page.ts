import { Path } from "./path"

export interface PathTree {
    nodeName: string,
    path: string,
    type: string,
    children: Map<string, PathTree> 
}

// export function isPage(obj: any): obj is Page {
//     return (obj as Page).title !== undefined &&
//         (obj as Page).created !== undefined &&
//         (obj as Page).lastModified !== undefined &&
//         (obj as Page).created_by !== undefined &&
//         (obj as Page).tags !== undefined &&
//         (obj as Page).text !== undefined &&
//         (obj as Page).info !== undefined
// }