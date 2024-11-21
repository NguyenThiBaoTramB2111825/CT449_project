const admin = [
  {
    path: "/admin",
    component: () => import("../layouts/admin.vue"),
    children: [
      {
        path: "users",
        name: "admin-users",
        component: () => import("../pages/admin/users/index.vue"),
      },
      {
        path: "",
        name: "admin-books",
        component: () => import("../pages/admin/books/index.vue"),
      },
      {
        path: "books",
        name: "admin-books-create",
        component: () => import("../pages/admin/books/create.vue"),
      },
      {
        path: "books/:id",
        name: "admin-books-edit",
        component: () => import("../pages/admin/books/edit.vue"),
      },
      {
        path: "nxbs",
        name: "admin-nxbs",
        component: () => import("../pages/admin/nxbs/index.vue"),
      },
      {
        path: "borrows",
        name: "admin-borrows",
        component: () => import("../pages/admin/borrows/index.vue"),
      },
    ],
  },
];

export default admin;
