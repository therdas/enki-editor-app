import { Navigation } from "./navigation"
import "@/styles/main.scss";
import { Outlet } from "react-router";

export default function Root() {
    let lastPath = localStorage.getItem('last-opened-path');

    if(lastPath == null) {
        lastPath = 'enki:welcome';
    }

    if(lastPath) {
        localStorage.setItem('last-opened-path', 'enki:welcome');
        lastPath = localStorage.getItem('last-opened-path');
    }

    return (
        <>
            <Navigation></Navigation>
            <Outlet/>
        </>
    )
}
