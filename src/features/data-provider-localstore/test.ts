import { data } from "@enki/data/sampledoc";
import { IDBRunner } from "./provider";
import { Path } from "@/features/data-provider/path";
import { parsePage } from "@/features/data-provider/interface";

export function storeTestData() {


}

export function retrieveTestData() {
    IDBRunner.get().then((db) => {
        db.getPage(Path.parse('test:test page/test pager')!).then((res) => {
            parsePage(res.text);
        })
    })

    IDBRunner.get().then((db) => {
        db.getDirListing();
    })
}