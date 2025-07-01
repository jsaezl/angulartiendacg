import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/login/login.component";
import { authGuard } from "./core/guards/auth.guard";
import { adminGuard } from "./core/guards/admin.guard";

export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    loadComponent: () =>
      import("./pages/register/register.component").then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: "products-list",
    loadComponent: () =>
      import("./pages/products/products.component").then(
        (m) => m.ProductsComponent
      ),
  },
  {
    path: "cart",
    loadComponent: () =>
      import("./pages/cart/cart.component").then((m) => m.CartComponent),
    canActivate: [authGuard],
  },
  {
    path: "checkout",
    loadComponent: () =>
      import("./pages/checkout/checkout.component").then((m) => m.CheckoutComponent),
    canActivate: [authGuard],
  },
  {
    path: "orders",
    loadComponent: () =>
      import("./pages/orders/orders.component").then((m) => m.OrdersComponent),
    canActivate: [authGuard],
  },
  {
    path: "admin",
    canActivate: [adminGuard],
    children: [
      {
        path: "",
        loadComponent: () =>
          import(
            "./pages/admin/admin-dashboard/admin-dashboard.component"
          ).then((m) => m.AdminDashboardComponent),
      },
      {
        path: "products",
        loadComponent: () =>
          import("./pages/admin/admin-products/admin-products.component").then(
            (m) => m.AdminProductsComponent
          ),
      },
      {
        path: "orders",
        loadComponent: () =>
          import("./pages/admin/admin-orders/admin-orders.component").then(
            (m) => m.AdminOrdersComponent
          ),
      },
      {
        path: "users",
        loadComponent: () =>
          import("./pages/admin/admin-users/admin-users.component").then(
            (m) => m.AdminUsersComponent
          ),
      },
    ],
  },
  {
    path: "",
    redirectTo: "/products-list",
    pathMatch: "full",
  },
];
