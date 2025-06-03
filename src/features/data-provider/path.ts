export interface Path {
    readonly filename: string, 
    readonly namespace: string, 
    readonly path: string[]
}

export class Path {

    /*
        A path is of the following type:
        path: string
        where the string is constructed as follows:

        ```bnf
            <path> ::= <project_name> ":" <pathstring>
            <pathstring> ::= <filename> | <alphanumeric_string> "/" <pathstring>
            <filename> ::= <alphanumeric_string>
            <project_name> ::= <alphanumeric_string>
        ```

        where <alphanumeric_string> contains unicode characters in the following classes:
        - L, N, P, S, O
        except for the following characters:
        - *Excluded*: `<`, `>`, `:`, `"`, '/', '\', '|', '?', '*', '.'
        When these characters are encountered, they will be replaced with 
        - *Replaced*: `[lt]`, `[gt]`, `[col]`, `[qot]`, `[slh]`, `[bsl]`, `[pip]`, `[qmk]`, `[ast]`, `[dot]`

        For example:
        "projects:enki/implementation-tasks/implement\"me"
        should be:
        "projects:enki/implementation-tasks/implement[quot]me"

        All files end in the extension '.md'

        All segments in the path are <=250 characters in name. Any larger will cause the part to be truncated at 256 characters.
        The entire path must be 32000 characters or lower in length. This is *not* checked for and needs to be checked by the 
        application. Should not be an issue?
    */
    public static parse(pathString: string): Path | undefined {
        // Because the projectstring must be atleast len == 1, so pathString[0]
        if(pathString.indexOf(':') < 1) return;

        let project = pathString.slice(0, pathString.indexOf(':'))
        let path: string[] = pathString.slice(pathString.indexOf(':') + 1)
            .split('/')
            .filter((str) => str.length > 0)
            .map((str) => trimLen(escape(str)));

        return {
            namespace: project,
            filename:  path.slice(-1)[0],
            path: path.slice(0, -1)
        } as Path
    }

    public static toString(path: Path) {
        return path.namespace + ':' + path.path.join('/') + (path.path.join('/').length > 0 ? '/' : "") + path.filename;
    }
}

const ESCAPED_CHARS = new Map<string, string> ([
    ['<', 'lt'],
    ['>', 'gt'],
    [':', 'col'],
    ['"', 'qot'],
    ['/', 'sls'],
    ['\\', 'bsl'],
    ['|', 'pip'],
    ['?', 'qmk'],
    ['\\*', 'ast'],
    ['.', 'dot'],
])

function escape(str: string, replaceTable = ESCAPED_CHARS) {
    let regstr = '';
    for(let [key, _] of replaceTable)
        regstr += '|' + key;
    regstr = '['+regstr.slice(0, -1)+']';

    const re = new RegExp(regstr, "gi");
    str = str.replace(re, (match) => replaceTable.get(match)!);
    
    return str;
}

function trimLen(str: string, len = 250) {
    return str.slice(0, len);
}