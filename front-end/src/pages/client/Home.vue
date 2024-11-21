<template>
    <Carousel />
    <div class="container my-3">
        <div class="row">
            <div class="col-4 text-center">
                <img src="../../assets/images/img1.jpg" class="w-75" alt="">
            </div>
            <div class="col-4 text-center">
                <img src="../../assets/images/img2.jpeg" class="w-75" alt="">
            </div>
            <div class="col-4 text-center">
                <img src="../../assets/images/img3.jpg" class="w-75" alt="">
            </div>
        </div>
    </div>

    <div class="container my-3">
        <div class="row border mx-auto p-2">
            <div class="col-sm-4 col-md-4">
                <div class="row align-items-center my-2">
                    <div class="col-3 text-end"><i class="fa-solid fa-lock fs-4 text-dark"></i></div>
                    <div class="col-9">
                        <h4>Thanh toán an toàn</h4>
                        <small>100% thanh toán an toàn</small>
                    </div>
                </div>
            </div>
            <div class="col-sm-4 col-md-4">
                <div class="row align-items-center my-2">
                    <div class="col-3 text-end"><i class="fa-solid fa-rotate-left fs-4 text-dark"></i></div>
                    <div class="col-9">
                        <h4>Thời hạn mượn</h4>
                        <small>14 ngày</small>
                    </div>
                </div>
            </div>
            <div class="col-sm-4 col-md-4">
                <div class="row align-items-center my-2">
                    <div class="col-3 text-end"><i class="fa-solid fa-headset fs-4 text-dark"></i></div>
                    <div class="col-9">
                        <h4>Hỗ trợ 24/7</h4>
                        <small>Gọi cho chúng tôi bất cứ lúc nào <span class="fw-bold">0384804407</span> </small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container my-5">
        <h3 class="text-center my-5">Các Sách Mới</h3>
        <div class="row row-cols-1 row-cols-md-4 mx-auto">
            <ListBook namePage="homePage" />
            <router-link :to="{ name: 'booksPage' }" class="btn btn-primary mt-4 mx-auto">Xem Thêm</router-link>
        </div>
    </div>
    <!-- Button trigger modal -->
    <button style="position: fixed; bottom: 20px; left: 20px" type="button" class="btn btn-warning"
        data-bs-toggle="modal" data-bs-target="#warningModal">
        Chú ý
    </button>

    <!-- Modal -->
    <div class="modal fade" id="warningModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">NHG BookStore trân trọng thông báo</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul class="list-group">
                        <li class="list-group-item active" aria-current="true">Các quy định của chúng tôi:</li>
                        <li class="list-group-item">Thời hạn mượn là 14 ngày kể từ ngày duyệt đơn</li>
                        <li class="list-group-item">Vui lòng trả đủ số lượng sách đã mượn</li>
                        <li class="list-group-item">Vui lòng trả đúng thời hạn</li>
                        <li class="list-group-item active bg-danger">Nếu không trả đúng thời hạn</li>
                        <li class="list-group-item">Chúng tôi sẽ tính mỗi quyển mượn là 10k/ngày tính cho tất cả sách trong đơn mượn của bạn</li>
                        <li class="list-group-item">Nếu có gì thắc mắc vui lòng liên hệ hotline của chúng tôi</li>
                    </ul>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>

import Carousel from '../../components/client/Carousel.vue';
import Footer from '../../components/client/Footer.vue';
import { ref, onMounted } from 'vue';
import ListBook from '../../components/client/books/ListBook.vue'
import ApiService from '@/service/ApiService';

export default {
    components: {
        Carousel,
        Footer,
        ListBook
    },
    setup() {
        const books = ref([]);
        const apiService = new ApiService();
        const getBooks = async () => {
            const response = await apiService.get('books/productsHome');
            if (response.status === 200) {
                books.value = response.data;
            }
        }

        onMounted(() => {
            getBooks();
        })

        return {
            getBooks,
            books,
        }
    }
}
</script>