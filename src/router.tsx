import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardPage from "./pages/DashboardPage";
import PostsPage from "./pages/PostsPage";
import MasterOrderPage from "./pages/MasterOrderPage";
import PurchaseOrderPage from "./pages/PurchaseOrderPage";
import MasterOrderDetailPage from "./pages/MasterOrderDetailPage";
import PurchaseOrderDetailPage from "./pages/PurchaseOrderDetailPage";
import PurchaseOrderCreatePage from "./pages/PurchaseOrderCreatePage";
import MasterOrderCreatePage from "./pages/MasterOrderCreatePage";
import ProductsPage from "./pages/ProductsPage";
import SuppliersPage from "./pages/SuppliersPage";
import SupplierDetailPage from "./pages/SupplierDetailPage";
import SupplierCreatePage from "./pages/SupplierCreatePage";
import SalesOrderLinePage from "./pages/SalesOrderLinePage";
import SalesOrderLinePageDetails from "./pages/SalesOrderLinePageDetails";
import SalesOrderCreatePage from "./pages/SalesOrderCreatePage";

export const router = createBrowserRouter([
    {
        path: '/', Component: App, children: [
            { path: 'dashboard', Component: DashboardPage },
            { path: 'posts', Component: PostsPage },
            { path: 'master-orders', Component: MasterOrderPage },
            { path: 'master-orders/:id', Component: MasterOrderDetailPage },
            { path: 'master-orders/create', Component: MasterOrderCreatePage },
            { path: 'purchase-orders', Component: PurchaseOrderPage },
            { path: 'purchase-orders/:id', Component: PurchaseOrderDetailPage },
            { path: 'purchase-orders/create', Component: PurchaseOrderCreatePage },
            { path: 'products', Component: ProductsPage },
            { path: 'suppliers', Component: SuppliersPage },
            { path: 'suppliers/:id', Component: SupplierDetailPage },
            { path: 'suppliers/create', Component: SupplierCreatePage },
            { path: 'sales', Component: SalesOrderLinePage },
            { path: 'sales/:id', Component: SalesOrderLinePageDetails },
            { path: 'sales/create', Component: SalesOrderCreatePage },
            { path: '*', Component: NotFoundPage },
        ]
    },
    { path: '*', Component: NotFoundPage }

])