# Enki Editor
An example app build on top of Enki Editor and React/Redux to show how well Prosemirror, react and Indexeddb worked together!
For more information on the editor itself, see [Enki Editor](https://github.com/therdas/enki-editor), which will be converted into a library soon!
Give it a whirl! [enki](therdas.dev/projects/enki)

## Building
Run the following commands:
- `git clone https://github.com/therdas/enki-editor.git`
- `npm i`
- `npm run dev`

To export a production build, run:
- `npm run dev`

## Developing
The HMR Dev server from Vite should reflect all changes instantaneously without state being lost. Keep in mind that the entire project is fully, _completely_ typed, so any type errors will cause errors.

## Security
The project itself is not vulnerable to XSS attacks. However, since pasting _can_ introduce links, we recommend either using a sanitization library and linking it to any paste events, or exercising caution while using this project

## Is this editor ready? Can I deploy it in production? Can I replace my Notion/Evernote/Obsidian with it?
No, it is in beta; No, we do not recommend it; and maybe - I really appreciate your support, but as this was an exploratory project with a lot of rough edges, I do not recommend solely relying on it.

## License
See [LICENSE](LICENSE)

## Contributing
I appreciate and welcome contributions! To contribute:
- Fork the repo
- Create a branch on it with your changes
- Send it over for review
Please _note_ that any PRs with failed builds will be rejected. This also applies to lint warnings. 