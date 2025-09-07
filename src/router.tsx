import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardPage from "./pages/DashboardPage";
import PostsPage from "./pages/PostsPage";
import MasterOrderPage from "./pages/MasterOrderPage";

export const router = createBrowserRouter([
    { path: '/', Component: App, children: [
        {path: 'dashboard', Component: DashboardPage},
        {path: 'posts', Component: PostsPage},
        {path:'master-orders', Component: MasterOrderPage },
        {path:'*', Component: NotFoundPage },
    ] },
    {path:'*', Component: NotFoundPage }

])