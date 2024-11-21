<template>
    <div class="row fw-bold fs-4 mx-auto">Đơn mượn của tôi</div>
    <div class="row mx-auto mb-3">Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
    <hr>
    <div class="row my-3">
        <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                <button class="nav-link active" id="nav-cxn-tab" data-bs-toggle="tab" data-bs-target="#nav-cxn-pane"
                    type="button" role="tab" aria-controls="nav-cxn" aria-selected="true">Chờ xác nhận
                    (<strong>{{ cxnCount }}</strong>)</button>

                <button class="nav-link" id="nav-dm-tab" data-bs-toggle="tab" data-bs-target="#nav-dm-pane"
                    type="button" role="tab" aria-controls="nav-dm" aria-selected="false">Đang mượn
                    (<strong>{{ dmCount }}</strong>)</button>

                <button class="nav-link" id="nav-ych-tab" data-bs-toggle="tab" data-bs-target="#nav-ych-pane"
                    type="button" role="tab" aria-controls="nav-ych" aria-selected="false">Yêu cầu hủy
                    (<strong>{{ ychCount }}</strong>)</button>

                <button class="nav-link" id="nav-dt-tab" data-bs-toggle="tab" data-bs-target="#nav-dt-pane"
                    type="button" role="tab" aria-controls="nav-dt" aria-selected="false">Đã trả
                    (<strong>{{ dtCount }}</strong>)</button>

                <button class="nav-link" id="nav-dh-tab" data-bs-toggle="tab" data-bs-target="#nav-dh-pane"
                    type="button" role="tab" aria-controls="nav-dh" aria-selected="false">Đã hủy
                    (<strong>{{ dhCount }}</strong>)</button>

            </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
            <!-- Chờ xác nhận -->
            <div class="tab-pane fade show active border" id="nav-cxn-pane" role="tabpanel"
                aria-labelledby="nav-cxn-tab">
                <div class="row mx-2 my-2" v-for="borrow in userWithBorrows" :key="borrow._id">
                    <div class="card" v-if="borrow.status === 'Đang chờ xác nhận'">
                        <div class="row card-header">
                            <div>
                                <a class="btn btn-danger float-end" @click="cancelBorrow(borrow._id, $event)"
                                    href="">HỦY</a>
                            </div>
                        </div>
                        <div class="card-body">
                            <div v-if="borrow.status === 'Đang chờ xác nhận'" v-for="book in borrow.books"
                                :key="book._id" class="row">
                                <div class="col-3">
                                    <a href="">
                                        <img class="img-fluid"
                                            :src="'http://localhost:3000/' + book.book_info.book_image" alt="">
                                    </a>
                                </div>
                                <div class="col-9">
                                    <div class="row fs-4 fw-bold mb-2">
                                        <div class="col-12">
                                            <a class="text-decoration-none" href="">
                                                {{ book.book_info.book_name }}
                                            </a>
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12">
                                            SỐ LƯỢNG: {{ book.quantity }}
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12">ĐƠN GIÁ:
                                            <span class="price text-danger"> {{ formattedPrice(book.book_info.book_price)
                                                }}</span>
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12"> TỔNG GIÁ:
                                            <span class="price text-danger">{{ formattedPrice(book.total_price) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Chờ xác nhận -->

            <!-- Đang mượn -->
            <div class="tab-pane fade show border" id="nav-dm-pane" role="tabpanel" aria-labelledby="nav-dm-tab">
                <div class="row mx-2 my-2" v-for="borrow in userWithBorrows" :key="borrow._id">
                    <div class="card" v-if="borrow.status === 'Đang mượn'">
                        <div class="card-body">
                            <div v-for="book in borrow.books" :key="book._id" class="row">
                                <div class="col-3">
                                    <a href="">
                                        <img class="img-fluid"
                                            :src="'http://localhost:3000/' + book.book_info.book_image" alt="">
                                    </a>
                                </div>
                                <div class="col-9">
                                    <div class="row fs-4 fw-bold mb-2">
                                        <div class="col-12">
                                            <a class="text-decoration-none" href="">
                                                {{ book.book_info.book_name }}
                                            </a>
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12">
                                            SỐ LƯỢNG: {{ book.quantity }}
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12">ĐƠN GIÁ:
                                            <span class="price text-danger"> {{ formattedPrice(book.book_info.book_price)
                                                }}</span>
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12"> TỔNG GIÁ:
                                            <span class="price text-danger">{{ formattedPrice(book.total_price) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row card-footer">
                            <div class="row mt-2">
                                <span class="fw-bold col-3">Thời hạn</span>
                                <span class="col">
                                    {{ borrow.borrow_date }} - {{ borrow.duration }}
                                </span>
                                <div class="mt-2 fw-bold fs-5">Lưu ý phải trả sách theo <span
                                        class="text-decoration-underline">thời hạn</span> </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Đang mượn -->

            <!-- Yêu cầu hủy -->
            <div class="tab-pane fade show border" id="nav-ych-pane" role="tabpanel" aria-labelledby="nav-ych-tab">
                <div class="row mx-2 my-2" v-for="borrow in userWithBorrows" :key="borrow._id">
                    <div class="card" v-if="borrow.status === 'Yêu cầu hủy'">
                        <div class="card-body">
                            <div v-for="book in borrow.books" :key="book._id" class="row">
                                <div class="col-3">
                                    <a href="">
                                        <img class="img-fluid"
                                            :src="'http://localhost:3000/' + book.book_info.book_image" alt="">
                                    </a>
                                </div>
                                <div class="col-9">
                                    <div class="row fs-4 fw-bold mb-2">
                                        <div class="col-12">
                                            <a class="text-decoration-none" href="">
                                                {{ book.book_info.book_name }}
                                            </a>
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12">
                                            SỐ LƯỢNG: {{ book.quantity }}
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12">ĐƠN GIÁ:
                                            <span class="price text-danger"> {{ formattedPrice(book.book_info.book_price)
                                                }}</span>
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12"> TỔNG GIÁ:
                                            <span class="price text-danger">{{ formattedPrice(book.total_price) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Yêu cầu hủy -->

            <!-- Đã trả -->
            <div class="tab-pane fade show border" id="nav-dt-pane" role="tabpanel" aria-labelledby="nav-dt-tab">
                <div class="row mx-2 my-2" v-for="borrow in userWithBorrows" :key="borrow._id">
                    <div class="card" v-if="borrow.status === 'Đã trả'">
                        <div class="card-body">
                            <div v-for="book in borrow.books" :key="book._id" class="row">
                                <div class="col-3">
                                    <a href="">
                                        <img class="img-fluid"
                                            :src="'http://localhost:3000/' + book.book_info.book_image" alt="">
                                    </a>
                                </div>
                                <div class="col-9">
                                    <div class="row fs-4 fw-bold mb-2">
                                        <div class="col-12">
                                            <a class="text-decoration-none" href="">
                                                {{ book.book_info.book_name }}
                                            </a>
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12">
                                            SỐ LƯỢNG: {{ book.quantity }}
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12">ĐƠN GIÁ:
                                            <span class="price text-danger"> {{ formattedPrice(book.book_info.book_price)
                                                }}</span>
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12"> TỔNG GIÁ:
                                            <span class="price text-danger">{{ formattedPrice(book.total_price) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Đã trả -->

            <!-- Đã hủy -->
            <div class="tab-pane fade show border" id="nav-dh-pane" role="tabpanel" aria-labelledby="nav-dh-tab">
                <div class="row mx-2 my-2" v-for="borrow in userWithBorrows" :key="borrow._id">
                    <div class="card" v-if="borrow.status === 'Đã hủy'">
                        <div class="card-body">
                            <div v-for="book in borrow.books" :key="book._id" class="row">
                                <div class="col-3">
                                    <a href="">
                                        <img class="img-fluid"
                                            :src="'http://localhost:3000/' + book.book_info.book_image" alt="">
                                    </a>
                                </div>
                                <div class="col-9">
                                    <div class="row fs-4 fw-bold mb-2">
                                        <div class="col-12">
                                            <a class="text-decoration-none" href="">
                                                {{ book.book_info.book_name }}
                                            </a>
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12">
                                            SỐ LƯỢNG: {{ book.quantity }}
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12">ĐƠN GIÁ:
                                            <span class="price text-danger"> {{ formattedPrice(book.book_info.book_price)
                                                }}</span>
                                        </div>
                                    </div>
                                    <div class="row fw-bold mb-2">
                                        <div class="col-12"> TỔNG GIÁ:
                                            <span class="price text-danger">{{ formattedPrice(book.total_price) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Đã hủy -->
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { formatPrice } from '@/utils/utils';
import ApiService from '@/service/ApiService';
export default {
    setup() {
        const userWithBorrows = ref([]);
        const cxnCount = ref(0);
        const dmCount = ref(0);
        const ychCount = ref(0);
        const dtCount = ref(0);
        const dhCount = ref(0);
        const apiService = new ApiService();
        const getBorrowWithId = async () => {
            const token = Cookies.get('accessToken');
            if (token) {
                const response = await apiService.get(`borrows/${token}`)
                if (response.status == 200) {
                    userWithBorrows.value = response.data;
                    countBorrows();
                }
            }
        }

        const countBorrows = () => {
            cxnCount.value = userWithBorrows.value.filter(borrow => borrow.status === 'Đang chờ xác nhận').length;
            dmCount.value = userWithBorrows.value.filter(borrow => borrow.status === 'Đang mượn').length;
            ychCount.value = userWithBorrows.value.filter(borrow => borrow.status === 'Yêu cầu hủy').length;
            dtCount.value = userWithBorrows.value.filter(borrow => borrow.status === 'Đã trả').length;
            dhCount.value = userWithBorrows.value.filter(borrow => borrow.status === 'Đã hủy').length;
        }

        const cancelBorrow = async (borrowId, e) => {
            e.preventDefault();
            const token = Cookies.get('accessToken');
            if (token) {
                try {
                    const response = await apiService.put(`borrows/${borrowId}`, { status: 'Yêu cầu hủy' }, token)
                    if (response.status == 200) {
                        await Swal.fire({
                            title: 'Yêu cầu hủy đã được gửi đi',
                            text: 'Vui lòng chờ phản hồi',
                            icon: 'success',
                            confirmButtonText: 'Đồng ý',
                            timer: 1500,
                        });
                        getBorrowWithId();
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }

        const formattedPrice = (price) => {
            return formatPrice(price);
        }

        onMounted(() => {
            getBorrowWithId()
        })

        return {
            userWithBorrows,
            cxnCount,
            dmCount,
            ychCount,
            dtCount,
            dhCount,
            getBorrowWithId,
            cancelBorrow,
            formattedPrice
        }
    }
}
</script>