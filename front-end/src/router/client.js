const client = [
    {
        path: "/",
        redirect: "/",
        component: () => import("../layouts/client.vue"),
        children: [
            {
                path: "",
                name: 'home',
                component: () => import("../pages/client/Home.vue"),
            },
            {
                path: "books",
                name: 'booksPage',
                component: () => import("../pages/client/Book.vue"),
            },
            {
                path: "/books/:publisherId",
                name: 'books-filter-nxb',
                component: () => import("../pages/client/FilterNxb.vue"),
                props: true ,
            },
            {
                path: "/books/detail/:id",
                name: 'books-detail',
                component: () => import("../pages/client/Detail.vue"),
            },
            {
                path: "cart",
                name: 'cart',
                component: () => import("../pages/client/Cart.vue"),
            },
            {
                path: "checkout",
                name: 'checkout',
                component: () => import("../pages/client/CheckOut.vue"),
            },
            {
                path: "profile",
                name: 'profile',
                component: () => import("../layouts/profile.vue"),
                redirect: { name: 'profile-infoUser' },
                children: [
                    {
                        path: "userInfo",
                        name: 'profile-infoUser',
                        component: () => import("../components/client/profile/infoUser.vue"),
                    },
                    {
                        path: "address",
                        name: 'profile-address',
                        component: () => import("../components/client/profile/address.vue"),
                    },
                    {
                        path: "loanApplication",
                        name: 'profile-loanApplication',
                        component: () => import("../components/client/profile/borrowBook.vue"),
                    },
                ]
            },
        ],
    },
];

export default client;
