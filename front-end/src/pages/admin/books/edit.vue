<template>
    <a-card class="mt-4" title="Cập Nhật Sách" style="width: 100%">
        <div class="row">
            <form class="row" enctype="multipart/form-data" id="UpdateBookForm" @submit.prevent="updateBook()">
                <div class="row">
                    <div class="col-4 ms-3">
                        <div class="row">
                            <img class="img-fluid" v-if="editedBook.book_image"
                                :src="`http://localhost:3000/${editedBook.book_image}`" alt="">
                            <input type="file" name="book_image" id="book_image" class="form-cotrol-file my-3"
                                @change="handleImageChange">
                        </div>
                    </div>
                    <div class="col-6 ms-3">
                        <div class="form-group">
                            <label for="book_name" class="form-label fw-bold">Tên Sách:</label>
                            <input v-model="editedBook.book_name" type="text"
                                class="form-control border border-dark rounded" name="book_name" id="book_name">
                        </div>
                        <div class="form-group">
                            <label for="publisher_id" class="form-label fw-bold">Chọn Thể Loại</label>
                            <select v-model="editedBook.publisher_id" class="form-select border border-dark rounded"
                                aria-label="Default select example" id="publisher_id" name="publisher_id">
                                <option :value="publisher._id" v-for="publisher in publishers" :key="publisher._id">{{
                                    publisher.publisher_name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="book_number" class="form-label fw-bold">Số Lượng:</label>
                            <input v-model="editedBook.book_number" type="text"
                                class="form-control border border-dark rounded" name="book_number" id="book_number">
                        </div>
                        <div class="form-group">
                            <label for="book_price" class="form-label fw-bold">Giá:</label>
                            <input v-model="editedBook.book_price" type="text"
                                class="form-control border border-dark rounded" name="book_price" id="book_price">
                        </div>
                        <div class="form-group">
                            <label for="publisher_year" class="form-label fw-bold">Năm Xuất Bản:</label>
                            <input v-model="editedBook.publisher_year" type="text"
                                class="form-control border border-dark rounded" name="publisher_year"
                                id="publisher_year">
                        </div>
                    </div>
                </div>
                <div class="form-group mx-2">
                    <label for="book_description" class="form-label fw-bold">Mô Tả:</label>
                    <textarea v-model="editedBook.book_description" class="mytextarea form-control"
                        name="book_description" id="book_description" rows="3" value="">
                    </textarea>
                </div>
                <div class="d-flex justify-content-center mt-3 mb-5">
                    <button type="submit" class="btn btn-primary" name="update" id="update">Cập Nhập</button>
                    <router-link :to="{ name: 'admin-books' }" class="btn btn-danger ms-2">Trở Lại</router-link>
                </div>
            </form>

        </div>
    </a-card>
</template>
<script>
import { ref, onMounted } from "vue";
import { useMenu } from "../../../store/use-menu.js";
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import Cookies from "js-cookie";

export default {
    setup() {
        const route = useRoute();
        const bookId = ref(route.params.id);
        const editedBook = ref({
            imageFile: [],
        });

        const store = useMenu();
        store.onSelectedKeys(['admin-books']);

        const publishers = ref([]);
        const getPublishers = () => {
            axios
                .get("http://127.0.0.1:3000/api/publishers")
                .then((response) => {
                    publishers.value = response.data;
                })
                .catch((error) => {
                    console.log(error);
                })
        };

        const getBookDetails = async () => {
            await axios.get(`http://127.0.0.1:3000/api/books/${bookId.value}`)
                .then((response) => {
                    editedBook.value = response.data;
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy thông tin sách:', error);
                });
        }

        const updateBook = async () => {
            let formData = new FormData();
            Object.entries(editedBook.value).map(([key, value]) => {
                if (value && key !== 'imageFile') {
                    formData.append(key, value);
                } else if (value && key === 'imageFile') {
                    formData.append('book_image', value);
                }
            });
            const token = Cookies.get('accessToken');
            await axios.put(`http://127.0.0.1:3000/api/books/${bookId.value}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Accept: 'multipart/form-data',
                    'Authorization': 'Bearer ' + token
                },
            })
                .then((response) => {
                    if (response.status == 200) {
                        console.log(response);
                        Swal.fire({
                            title: 'Thành công!',
                            text: 'Dữ liệu đã cập nhật thành công.',
                            icon: 'success',
                            timer: 1500, // Thời gian hiển thị thông báo (ms) 
                            showConfirmButton: false, // Không hiển thị nút "Xác nhận" 
                        });
                        getBookDetails();
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        title: 'Thất bại',
                        text: 'Dữ liệu đã chưa được cập nhật.',
                        icon: 'error',
                        timer: 1500, 
                        showConfirmButton: false,
                    });
                    if (error.response && error.response.status === 403) {
                        Swal.fire({
                            title: 'Bạn chưa đăng nhập',
                            text: 'Vui lòng đăng nhập để tiếp tục',
                            icon: 'warning',
                            timer: 1500,
                            showConfirmButton: true,
                        });
                    } else if (error.response && error.response.status === 401) {
                        Swal.fire({
                            title: 'Phiên xử lý hết hạn',
                            text: 'Vui lòng đăng nhập để tiếp tục',
                            icon: 'warning',
                            timer: 1500,
                            showConfirmButton: true,
                        });
                    }
                });
        };

        const handleImageChange = (event) => {
            const selectedFile = event.target.files[0];
            if (selectedFile) {
                editedBook.value.imageFile = selectedFile;
            }
        }

        onMounted(() => {
            getPublishers();
            getBookDetails();
        });

        return {
            handleImageChange,
            getBookDetails,
            getPublishers,
            updateBook,
            editedBook,
            publishers,
        };
    },
};
</script>
