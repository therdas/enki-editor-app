export function trimFrontMatter(text: string): [string, string, string]  {
    let lines = text.split('\n');
    let type = 'none';
    
    if(lines[0] != '+++' && lines[0] !== '---')
        return ['', text, type];      

    if(lines[0] === '+++')
        type = 'toml';
    else
        type = 'yaml';

    let i = 1;
    let end = 0;
    while(i < lines.length) {
        if(lines[i] == '+++' || lines[i] == '---')  {
            end = i;
            break;
        }
        ++i;
    }

    if(end == 0) {
        return ['', text, 'none'];
    } else {
        return [lines.slice(1, end - 1).join('\n'), lines.slice(end+1).join('\n'), type];
    }
}