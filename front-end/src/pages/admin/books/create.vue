<template>
    <a-card class="mt-4" title="Thêm Sách" style="width: 100%">
        <div class="row">
            <div class="col-12 mb-3 d-flex justify-content-end">
                <form @submit.prevent="addBook()" enctype="multipart/form-data" class="row" id="AddBookForm">
                    <div class="form-group mb-3">
                        <label for="book_name" class="form-label fw-bold">Tên Sách</label>
                        <input v-model="newBook.book_name" type="text" class="form-control" name="book_name"
                            id="book_name" placeholder="Nhập Tên Sách:">
                    </div>
                    <div class="form-group mb-3">
                        <label for="book_description" class="form-label fw-bold">Mô Tả</label>
                        <textarea v-model="newBook.book_description" type="text" rows="3"
                            class="form-control mytextarea" name="book_description" id="book_description"
                            placeholder="Mổ tả sách:">
                        </textarea>
                    </div>
                    <div class="form-group mb-3">
                        <label for="book_image" class="form-label fw-bold">Hình</label>
                        <input @change="handleImageChange" type="file" class="form-control" name="book_image"
                            id="book_image">
                    </div>
                    <div class="form-group mb-3">
                        <label for="publisher_id" class="form-label fw-bold">Chọn Thể Loại</label>
                        <select v-model="newBook.publisher_id" class="form-select" aria-label="Default select example"
                            id="publisher_id" name="publisher_id">
                            <option value="">Chọn thể loại</option>
                            <option :value="publisher._id" v-for="publisher in publishers" :key="publisher._id">{{
                                publisher.publisher_name }}</option>
                        </select>
                    </div>
                    <div class="mb-3 form-group">
                        <label for="book_number" class="form-label fw-bold">Số Lượng</label>
                        <input v-model="newBook.book_number" type="text" class="form-control" name="book_number"
                            id="book_number" placeholder="Nhập Số Lượng Sách:">
                    </div>
                    <div class="mb-3 form-group">
                        <label for="book_price" class="form-label fw-bold">Giá</label>
                        <input v-model="newBook.book_price" type="text" class="form-control" name="book_price"
                            id="book_price" placeholder="Nhập Giá Sách:">
                    </div>
                    <div class="mb-3 form-group">
                        <label for="publisher_year" class="form-label fw-bold">Năm Xuất Bản</label>
                        <input v-model="newBook.publisher_year" type="number" class="form-control" name="publisher_year"
                            id="publisher_year" placeholder="Nhập năm xuất bản:">
                    </div>
                    <div class="d-flex justify-content-center mt-3 mb-5">
                        <button type="submit" class="btn btn-primary" id="addBook" name="themsach">Lưu</button>
                        <router-link :to="{ name: 'admin-books' }" class="btn btn-danger ms-2">Trở Lại</router-link>
                    </div>
                </form>
            </div>
        </div>
    </a-card>
</template>
<script>
import { ref, onMounted } from "vue";
import { useMenu } from "../../../store/use-menu.js";
import Swal from 'sweetalert2';
import Cookies from "js-cookie";
export default {
    setup() {
        const store = useMenu();
        store.onSelectedKeys(['admin-books']);
        const newBook = ref({
            book_name: '',
            book_description: '',
            book_number: '',
            book_price: '',
            imageFile: '',
            publisher_id: '',
            publisher_year: '',
        });

        const addBook = async () => {
            let formData = new FormData();
            Object.entries(newBook.value).map(([key, value]) => {
                formData.append(key, value);
            })
            const token = Cookies.get('accessToken');
            await axios.post("http://127.0.0.1:3000/api/books", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'multipart/form-data',
                    'Authorization': 'Bearer ' + token,
                },
            })
                .then((response) => {
                    if (response.status == 200) {
                        Swal.fire({
                            title: 'Thành công!',
                            text: 'Dữ liệu đã được thêm mới thành công.',
                            icon: 'success',
                            timer: 1500, // Thời gian hiển thị thông báo (ms)
                            showConfirmButton: false, // Không hiển thị nút "Xác nhận"
                        });
                        newBook.value = {
                            book_name: '',
                            book_description: '',
                            book_number: '',
                            book_price: '',
                            imageFile: '',
                            publiser_year: '',
                            publisher_id: '',
                        }
                        document.getElementById('book_image').value = null;
                    }
                })
                .catch((error) => {
                    if (error.response.status == 400) {
                        Swal.fire({
                            title: 'Thất bại',
                            text: 'Vui lòng kiểm tra lại các trường',
                            icon: 'error',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    }
                    else if (error.response && error.response.status === 403) {
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

        const publishers = ref([]);
        const getPublishers = async () => {
            await axios.get('http://127.0.0.1:3000/api/publishers')
                .then((response) => {
                    if (response.status == 200) {
                        publishers.value = response.data;
                    }
                })
                .catch((error) => {
                    console.log(error);
                })
        }

        getPublishers();

        const handleImageChange = (event) => {
            newBook.value.imageFile = event.target.files[0];
        };

        return {
            newBook,
            publishers,
            addBook,
            getPublishers,
            handleImageChange,
        };
    },
};
</script>
