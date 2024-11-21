<template>
    <a-card class="mt-4" title="Sách" style="width: 100%">
        <div class="row">
            <div class="col-12 mb-3 d-flex justify-content-end">
                <router-link type="button" class="btn btn-primary text-decoration-none"
                    :to="{ name: 'admin-books-create' }">
                    <i class="fa-solid fa-plus"></i> Thêm
                </router-link>
            </div>

            <div class="col-12">
                <div class="table-responsive">
                    <DataTable id="mytable" :columns="columns" :data="books"
                        :options="{ response: true, autoWidth: false, dom: 'Bfrtip' }"
                        class=" display table table-striped table-bordered" :scroll="{ x: 576 }">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mã Sách</th>
                                <th>Tên</th>
                                <th>Thể Loại</th>
                                <th>Ảnh</th>
                                <th>Đã Mượn / Số Lượng</th>
                                <th>Giá</th>
                                <th>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </DataTable>
                </div>
            </div>
        </div>
    </a-card>
</template>

<script>
import { ref, onMounted, render } from "vue";
import { useMenu } from "../../../store/use-menu.js";
import DataTable from "datatables.net-vue3";
import DataTableLib from "datatables.net-bs5";
import Buttons from 'datatables.net-buttons-bs5';
import ButtonsHtml5 from 'datatables.net-buttons/js/buttons.html5';
import print from 'datatables.net-buttons/js/buttons.print';
import pdfmake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfmake.vfs = pdfFonts.pdfMake.vfs;
import 'datatables.net-responsive-bs5';
import JsZip from 'jszip';
import { useRouter } from 'vue-router';
window.JsZip = JsZip;
DataTable.use(DataTableLib);
DataTable.use(pdfmake);
DataTable.use(ButtonsHtml5);
import $ from 'jquery';
import Swal from 'sweetalert2';
import Cookies from "js-cookie";
import { formatPrice } from "@/utils/utils.js";

export default {
    components: {
        DataTable,
    },
    setup() {
        const router = useRouter();
        const store = useMenu();
        store.onSelectedKeys(['admin-books']);
        const columns = [
            { data: null, render: (data, type, row, meta) => { return meta.row + 1; } },
            { data: '_id' },
            { data: 'book_name' },
            { data: 'publisherInfo.publisher_name' },
            {
                data: 'book_image',
                render: (data) => {
                    return `
                        <img src="http://localhost:3000/${data}"  style="width: 70px; height: 70px;"/>
                    `;
                },
            },
            {
                data: null,
                render: (row, data) => {
                    if (row.book_borrowedNumber == row.book_number) {
                        return `
                        <div class="fw-bold">${row.book_borrowedNumber} / ${row.book_number}</div>
                        <div>(Đã được mượn hết sách)</div>
                    `;
                    }
                    return `
                        <div>${row.book_borrowedNumber} / ${row.book_number}</div>
                    `;
                }

            },
            {
                data: 'book_price',
                render: (data) => {
                    return `<div>${formattedPrice(data)}</div>`;
                }
            },
            {
                data: '_id',
                render: (data, type, row, meta) => {
                    return `
                        <button id="editbook" data-id="${data}" class="btn btn-warning" >
                        <i class="fa-solid fa-pencil"></i> Sửa
                        </button>
                        <button id="deletebook" data-id="${data}" class="btn btn-danger" >
                            <i class="fa-solid fa-trash"></i> Xóa
                        </button>
                    `;
                },
            },
        ]
        const books = ref([]);
        const getBooks = async () => {
            await axios
                .get("http://127.0.0.1:3000/api/books")
                .then((response) => {
                    books.value = response.data;
                })
                .catch((error) => {
                    console.log(error);
                })
        };

        $(document).on('click', '#editbook', (event) => {
            let bookId = $(event.currentTarget).data('id');
            console.log(bookId);
            router.push({ name: 'admin-books-edit', params: { id: bookId } })
        });

        const deleteBook = async (bookId) => {
            const token = Cookies.get('accessToken');
            await axios.delete(`http://127.0.0.1:3000/api/books/${bookId}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            })
                .then((response) => {
                    if (response.status === 200) {
                        Swal.fire({
                            title: 'Thành công!',
                            text: 'Dữ liệu đã được xóa thành công.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        getBooks();
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        title: 'Thất bại!',
                        text: 'Dữ liệu chưa được xóa.',
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

        $(document).on('click', '#deletebook', (event) => {
            const bookId = $(event.currentTarget).data('id');
            Swal.fire({
                title: 'Bạn chắc chắn chứ?',
                text: 'Người dùng này sẽ bị xóa vĩnh viễn!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Xóa ngay',
                cancelButtonText: 'Hủy bỏ',
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteBook(bookId);
                }
            });
        });

        const formattedPrice = (price) => {
            return formatPrice(price);
        }

        onMounted(() => {
            getBooks();
        });

        return {
            getBooks,
            columns,
            books,
            deleteBook,
            formattedPrice
        }
    }
}
</script>

<style>
@import 'datatables.net-bs5';
</style>