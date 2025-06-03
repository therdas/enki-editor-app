import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';

import Root from "@/app/root";

import { store } from './lib/store';
import { createBrowserRouter, RouterProvider} from "react-router-dom"
import ErrorPage from './app/error-page';
import EditorPage, { PageLoader } from './app/page';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root/>,
    errorElement: <ErrorPage/>,
    
    children: [
      {
        path: "page/*",
        element: <EditorPage/>,
        loader: PageLoader,
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
