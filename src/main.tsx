import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import Home from "@/app/home";
import SearchPage from './app/search-page';

import Root from "@/app/root";
import TagPage from "@/app/tagpage";

import { store } from './lib/store';
import { createBrowserRouter, RouterProvider} from "react-router-dom"
import ErrorPage from './app/error-page';
import EditorPage, { PageLoader } from './app/page';
import { TagLoader } from './app/tagpage';
import AboutPage from './app/about-page';
import FavouritePage from './app/favourites-page';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root/>,
    
    children: [
      {
        path: "page/*",
        element: <EditorPage/>,
        errorElement: <ErrorPage/>,
        loader: PageLoader,
      },
      {
        path: "home/*",
        element: <Home/>,
        errorElement: <ErrorPage/>
      },
      {
        path: "tags/:tagname",
        element: <TagPage/>,
        errorElement: <ErrorPage/>,
        loader: TagLoader,
      },
      {
        path: "search/*",
        element: <SearchPage/>,
        errorElement: <ErrorPage/>
      },
      {
        path: "about",
        element: <AboutPage/>,
        errorElement: <AboutPage/>
      },
      {
        path: 'favourites',
        element: <FavouritePage/>,
        errorElement: <ErrorPage/>
      }
    ]
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)
