### openai-prototype
> [!NOTE] Notes
> * Conversation should be a functional loop
> * Message history should be Vec\<Message\>
> * API key as .env
> * **Crates**: openai_api_rust && dotenv

**TODO**: figure out personality context management. Convo should be per-thread, personality should be constant throughout application.
### wiktapi-prototype
> [!NOTE] Notes
> * No API key required, just build URL
> * Rate Limiting will not be an issue

### xstate-pixijs-prototype
>[!NOTE] Notes
>* Assets go in public (sprite sheets). Recommended was to put all sprites as one file, but I may choose to keep them separated by state (like done in prototype)
>* Store state machines in their own file. mascotMachine.ts demos this
>* **Packages**: pixi.js && xstate - NOT pixijs, is depreciated!
****
**Initialization**:
```shell
npm create vite@latest mascot-demo -- --template vanilla-ts
cd mascot-demo

npm install
npm install pixi.js xstate

npm run dev
```
### vertical-slice
> [!NOTE] Notes
> * Backend is in src-tauri, frontend in src
> * After adding tauri sql, change tauri-plugin-sql to support SQLite (see below)
> * All above notes apply to final build

**Initialization:**
```shell
npm create tauri-app@latest

cd capstone-slice
npm install

npm install pixi.js xstate
npm run tauri add shell
npm run tauri add sql
```

**Change in Cargo.toml:**
`tauri-plugin-sql = { version = "2", features = ["sqlite"] }
