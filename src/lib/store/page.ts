import { WithIDBStorage } from "@/lib/database/idb-provider";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface PageDataNode {
    created: string,
    modified: string,
    author: string,
    text: string,
    info?: [string,string][]
}

const initialState = {
    page: {
        created: "",
        modified: "",
        author: "",
        text: "",
        info: [],
        path: "placeholder:placeholder",
    } as PageDataNode,
    error: '' as string,
    status: 'pending' as 'stale' | 'loaded' | 'pending'  | 'failed'
}

export const savePage = createAsyncThunk(
    'page/savePage',
    async (hash:string, api) => {
        let page = (api.getState() as RootState).page.page;
        await (await WithIDBStorage()).setPage(hash, page);

        //Add additional sidelogic
    }
)

export const populatePage = createAsyncThunk(
    'page/fetchPage',
    async (hash: string) => {
        const response = await (await WithIDBStorage()).getPage(hash);
        return response;
    }
)

export const PageSlice = createSlice({
    name: 'page',
    initialState: initialState,
    reducers: {
        set: (state, action: PayloadAction<PageDataNode>) => {
            state.page = action.payload;
        },
    },
    selectors: {
        getPage: state => state.page,
        getPageStatus: state => state.status
    },
    extraReducers: builder => {
        builder
            .addCase(populatePage.pending, (state, _) => {
                state.status = 'pending';
            })
            .addCase(populatePage.fulfilled, (state, action) => {
                if(action.payload == undefined) {
                    console.log("Fetched", action.payload);
                    state.status = 'failed';
                    state.error = 'no such page';
                    return;
                }
                state.page = action.payload;
                state.status = 'loaded';
            })
            .addCase(populatePage.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message ?? "unknown error";
            })
    }
});



export const { set: setpage } = PageSlice.actions;
export const { getPage, getPageStatus } = PageSlice.selectors;
export type PageState = ReturnType<typeof PageSlice.getInitialState>
export default PageSlice.reducer;


