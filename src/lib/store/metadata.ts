import { WithIDBStorage } from "@/features/data-provider-localstore/idb-provider";
import { Path } from "@/features/data-provider/path";
import { type Action, createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface Metadata {
    pageToHash: Record<string, string>,      // <string: path, string: hash>
    hashToPage: Record<string, string>,      // inverse of ^^
}

const initialState = {
    metadata: {
        pageToHash: {},          hashToPage: {},
    } as Metadata,
    status: 'idle' as 'idle' | 'loading' | 'loaded' | 'dirty' | 'error'
}

export const getCache = createAsyncThunk(
    'metadata/getCache',
    async (hash: string): Promise<Metadata> => {
        const response = await (await WithIDBStorage()).getKey('cache') as Metadata;
        if(!response)
            await(await WithIDBStorage()).setKey('cache', {pageToHash: {}, hashToPage: {}} as Metadata);
        return response ?? {pageToHash: {}, hashToPage: {}};
    }
)

export const MetadataSlice = createSlice({
    name: 'metadata',
    initialState: initialState,
    reducers: {
        set: (state, action: PayloadAction<Metadata>) => {
            state.metadata = action.payload;
            state.status = 'loaded';
        },
    },
    selectors: {
        getMetadata: state => state.metadata,
        getMetadataStatus: state => state.status
    },
    extraReducers: builder => {
        builder
            .addCase(getCache.pending, (state, action) => {
                state.status = 'loading';
            })
            .addCase(getCache.fulfilled, (state, action) => {
                state.metadata = action.payload;
                state.status = 'loaded';
            })
            .addCase(getCache.rejected, (state, action) => {
                state.status = 'error';
            })
    }
});

export const { set: setpage } = MetadataSlice.actions;
export const { getMetadata, getMetadataStatus } = MetadataSlice.selectors;
export type PageState = ReturnType<typeof MetadataSlice.getInitialState>
export default MetadataSlice.reducer;


