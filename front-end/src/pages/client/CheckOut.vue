<template>
    <div class="mt-4">
        <div class="row mx-auto">
            <div class="d-flex mx-3 border bg-light">
                <div class="mx-2">
                    <router-link :to="{ name: 'home' }" href="">
                        <i style="color:black" class="fa-solid fa-house fs-4 my-2"></i>
                    </router-link>
                </div>
                <p class="my-2 fs-5 fw-bold">/ <router-link :to="{ name: 'cart' }"
                        class="text-decoration-none text-dark" href="">Giỏ
                        Hàng</router-link> /<router-link :to="{ name: 'checkout' }"
                        class="text-decoration-none text-dark" href=""> Thanh Toán</router-link></p>
            </div>
        </div>
        <div class="row mx-auto my-3">
            <div class="col-8 my-4 ">
                <div class="mx-4 form-group">
                    <label for="name" class="fw-bold form-label">Tên đầy đủ:</label>
                    <input type="text" class="form-control" readonly id="name" :value="userInfo.user_name">
                </div>
                <div class="mx-4 form-group">
                    <label for="sdt" class="fw-bold form-label">Số điện thoại:</label>
                    <input type="text" class="form-control" id="sdt" readonly :value="userInfo.user_phone">
                </div>
                <div class="mx-4 form-group" v-if="userInfo.user_address != '' && userInfo.user_address != null">
                    <label for="address" class="fw-bold form-label">Địa chỉ:</label>
                    <textarea rows="4" readonly cols="" class="form-control"
                        placeholder="ví dụ: hẻm 51, đường 3/2, ninh kiều, cần thơ">{{ userInfo.user_address }}</textarea>
                </div>
                <div class="mx-4 form-group mt-3" v-else>
                    <div class="alert alert-warning" role="alert">
                        Vui lòng thêm địa chỉ!
                    </div>
                    <router-link :to="{ name: 'profile-address' }">Thêm địa chỉ ở đây</router-link>
                </div>
                <div class="row mx-5">
                    <button class=" my-3 btn btn-success col-2" id="btnCheckOut" name="checkout"
                        @click="updateCheckoutInfo">Mượn</button>
                </div>
            </div>

            <div class="col-4 bg-light my-4 pt-4">
                <div class="bg-white py-4 px-4 checkout_shadow">
                    <div class="row mx-auto ">
                        <div class="col-7 fw-bold fs-4">Đơn của bạn</div>
                        <div class="col-5 fs-4 text-end">
                            <router-link :to="{ name: 'cart' }"><i
                                    class="fa-solid text-dark fa-cart-shopping"></i></router-link>
                        </div>
                    </div>
                    <hr>
                    <div class="row mx-auto fw-bold">
                        <div class="col-5">Tổng giá:</div>
                        <div class="col-7">
                            <span class="price text-danger fw-bold">
                                {{ formattedPrice(totalPrice) }}
                            </span>
                        </div>
                    </div>
                    <hr>
                    <div class="row mx-auto fw-bold mt-2">
                        <div class="col-5">Tổng cộng:</div>
                        <div class="col-7">
                            <span class="price text-danger fw-bold">
                                {{ formattedPrice(totalPrice) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { ref, onMounted, computed } from 'vue';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import ApiService from '@/service/ApiService';
import { formatPrice } from '@/utils/utils';
export default {
    setup() {
        const checkout = ref([]);
        const userInfo = ref({})
        const checkoutInfo = ref([]);
        const apiService = new ApiService();
        const getCheckOut = async () => {
            try {
                const token = Cookies.get('accessToken');
                if (token) {
                    const response = await apiService.get(`checkout/${token}`);
                    if (response.status === 200) {
                        checkout.value = response.data;
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }

        const totalPrice = computed(() => {
            let total = 0;
            const booksArray = checkout.value.selectedBooks;
            if (Array.isArray(booksArray)) {
                for (const book of booksArray) {
                    total += book.total_price;
                }
            }
            return total;
        });

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

        const updateCheckoutInfo = async () => {
            const token = Cookies.get('accessToken');
            const booksArray = checkout.value.selectedBooks;
            if (token && Array.isArray(booksArray) && userInfo.value.user_address) {
                checkoutInfo.value = booksArray.map(book => ({
                    book_id: book.book_id,
                    quantity: book.quantity,
                    total_price: book.total_price
                }));
                const checkoutInfoOfUser = checkoutInfo.value;
                try {
                    const response = await apiService.post('borrows', { checkoutInfoOfUser }, token);
                    if (response.status === 200) {
                            await Swal.fire({
                                title: 'Thành Công',
                                text: 'Bạn đã mượn sách thành công',
                                icon: 'success',
                                timer: 1500,
                            });
                            window.location.reload();
                        }
                } catch (error) { 
                    console.log(error);
                }
            } else {
                await Swal.fire({
                    title: 'Lỗi',
                    text: 'Vui lòng kiểm tra địa chỉ và giỏ sách',
                    icon: 'error',
                    timer: 1500,
                });
            }
        };

        const formattedPrice = (price) => {
            return formatPrice(price);
        }

        onMounted(() => {
            getCheckOut();
            getUser();
        })

        return {
            getCheckOut,
            getUser,
            updateCheckoutInfo,
            totalPrice,
            checkout,
            userInfo,
            checkoutInfo,
            formattedPrice,
        }
    }
}
</script>
