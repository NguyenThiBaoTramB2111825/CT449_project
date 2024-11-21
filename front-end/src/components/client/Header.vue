<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm-3 text-center">
                <img src="../../assets/images/logo1.png" alt="Logo" style="width: 200px; height:100px">
            </div>
            <!-- Tìm Kiếm -->
            <Search />
            <!-- End Tìm Kiếm -->

            <!-- Giỏ Hàng -->
            <div class="col-auto dropdown my-4">
                <button class="btn btn-outline-secondary dropdown-toggle position-relative" type="button"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-cart-shopping"></i> Giỏ Hàng
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {{ totalQuantityInCart }}
                        <span class="visually-hidden">unread messages</span>
                    </span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" style="width: 500px;">
                    <li v-for="book in booksInCart.books" :key="book.book_id">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <img class="ms-2" style="width: 100px; height: 100px;"
                                    :src="`http://localhost:3000/` + book.book_image" alt="">
                            </div>
                            <div class="col">
                                <div class="col-12 text-break fw-bold">{{ book.book_name }}</div>
                                <div class="col-12 fw-bold">Số Lượng: {{ book.quantity }}</div>
                            </div>
                        </div>
                        <hr>
                    </li>
                    <li class="row" v-if="userInfo.user_name">
                        <router-link :to="{ name: 'cart' }"
                            class="btn btn-warning col-sm-4 mx-auto">Giỏ Hàng</router-link>
                    </li>
                </ul>
            </div>
            <!-- End Giỏ Hàng -->

            <!-- Tài Khoản -->
            <div class="col-sm-2 dropdown">
                <div v-if="userInfo.user_name" class=" my-4 z-2">
                    <div class="dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                            aria-expanded="false">
                            <i class="fa-solid fa-user fs-3 mt-1"></i> {{ userInfo.user_name }}
                        </a>
                        <ul class="dropdown-menu">
                            <li>
                                <router-link class="dropdown-item text-decoration-none" :to="{ name: 'profile' }">Tài
                                    khoản</router-link>
                            </li>
                            <li><a class="dropdown-item" href="#">Another action</a></li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li><a class="dropdown-item" @click="logOut" href="#">Đăng xuất</a></li>
                        </ul>
                    </div>
                </div>

                <div v-else class="dropdown my-4 z-2">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <i class="fa-solid fa-user mt-auto"></i> Tài Khoản
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <a data-bs-toggle="modal" data-bs-target="#SignInModal" href="#" class="dropdown-item">
                                Đăng Nhập
                            </a>
                        </li>
                        <li>
                            <a data-bs-toggle="modal" data-bs-target="#SignUpModal" href="#" class="dropdown-item">
                                Đăng Ký
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- End Tài Khoản -->
            <SignUpModal />
            <SignInModal />
        </div>
    </div>
</template>
<script>
import SignInModal from './modals/SignInModal.vue';
import SignUpModal from './modals/SignUpModal.vue';
import Search from './Search.vue';
import { computed, onMounted, ref } from 'vue';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import ApiService from '../../service/ApiService';

export default {
    components: {
        SignInModal,
        SignUpModal,
        Search
    },
    setup() {
        const userInfo = ref({});
        const apiService = new ApiService();
        const getUser = async () => {
            try {
                const token = Cookies.get('accessToken');
                if (token) {
                    const response = await apiService.get(`users/${token}`);
                    if (response.status === 200) {
                        userInfo.value = response.data;
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }

        const logOut = () => {
            Swal.fire({
                title: 'Xác nhận đăng xuất',
                text: 'Bạn có chắc chắn muốn đăng xuất?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Đồng ý',
                cancelButtonText: 'Hủy bỏ',
            }).then((result) => {
                if (result.isConfirmed) {
                    sessionStorage.clear();
                    document.cookie = 'accessToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
                    document.cookie = 'user_name=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
                    delete axios.defaults.headers.common['Authorization'];
                    window.location.reload();
                }
            });
        }

        const booksInCart = ref([]);
        const getCarts = async () => {
            try {
                const token = Cookies.get('accessToken');
                if (token) {
                    const response = await apiService.get(`cart/${token}`);
                    if (response.status === 200) {
                        booksInCart.value = response.data;
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }

        onMounted(() => {
            getCarts();
            getUser();
        })

        const totalQuantityInCart = computed(() => {
            // Kiểm tra nếu booksInCart.value không tồn tại hoặc không phải là một object
            if (!booksInCart.value || typeof booksInCart.value !== 'object') {
                return 0;
            }
            const booksArray = booksInCart.value.books;
            if (!Array.isArray(booksArray)) {
                return 0;
            }
            return booksArray.reduce((total, book) => total + book.quantity, 0);
        });

        return {
            booksInCart,
            logOut,
            getCarts,
            totalQuantityInCart,
            getUser,
            userInfo
        };
    }

}
</script>
