<template>
    <a-card class="mt-4" title="Mượn Sách" style="width: 100%">
        <div class="row">
            <div class="col-12">
                <div class="table-responsive">
                    <DataTable id="mytable" :columns="columns" :data="borrows"
                        :options="{ response: true, autoWidth: false, dom: 'Bfrtip' }"
                        class=" display table table-striped table-bordered" :scroll="{ x: 576 }">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Khách Hàng</th>
                                <th>Địa Chỉ</th>
                                <th>Số Lượng</th>
                                <th>Đã Trả</th>
                                <th>Tổng Giá</th>
                                <th>Ngày Mượn</th>
                                <th>Ngày Trả</th>
                                <th>Thời Hạn</th>
                                <th>Trạng Thái</th>
                                <th>Chi Tiết</th>
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
        store.onSelectedKeys(['admin-borrows']);

        const columns = [
            { data: null, render: (data, type, row, meta) => { return meta.row + 1; } },
            {
                data: null,
                render: (data, type, row, meta) => {
                    if (row && row.user) {
                        return `<div>${row.user.user_name || ''}</div> <div>(${row.user.user_phone || ''})</div>`;
                    } else {
                        return '';
                    }
                }
            },
            { data: 'user.user_address' },
            { data: 'totalQuantity' },
            {
                data: 'totalReturnNumber',
                render: (data, type, row, meta) => {
                    const remainingQuantity = row.totalQuantity - data;
                    return `<div>(Đã trả: ${data}/${row.totalQuantity})</div> 
                            <div class="fw-bold">(Còn lại: ${remainingQuantity})</div>`;
                }
            },
            { 
                data: 'totalPrice',
                render: (data)=> {
                    return `<div>${formattedPrice(data)}</div>`;
                }    
            },
            { data: 'borrow_date', },
            { data: 'return_date' },
            { data: 'duration' },
            {
                // cập nhật trạng thái đơn mượn
                data: '_id',
                render: (data, type, row, meta) => {
                    if (row.status == 'Đang mượn') {
                        // Đang mượn
                        return `
                        <button id="" data-id="${data}" class="btn btn-warning" >
                            ${row.status}
                        </button>`
                    } else if (row.status == 'Đã trả') {
                        // Đã trả
                        return `
                        <button id="" data-id="${data}" class="btn btn-success" >
                            ${row.status}
                        </button>`;
                    } else if (row.status == 'Yêu cầu hủy') {
                        // yêu cầu hủy
                        return `
                        <div class="dropdown">
                            <button class="btn btn-danger dropdown-toggle" type="button" id="dropdownMenuButton${data}" data-bs-toggle="dropdown" aria-expanded="false">
                                ${row.status}
                            </button>
                            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${data}">
                                <li><a class="dropdown-item" href="#" id="cancel" data-id="${data}" data-action="cancel">Hủy</a></li>
                            </ul>
                        </div>`;
                    } else if (row.status == 'Đã hủy') {
                        return `
                        <button id="" data-id="${data}" class="btn btn-primary" >
                            ${row.status}
                        </button>
                        `;
                    } else {
                        // mặc định là chờ xác nhân
                        return `
                        <button id="confirmStatus" data-id="${data}" class="btn btn-info" >
                            ${row.status}
                        </button>
                    `;
                    }
                },
            },
            {
                // Xem chi tiết và cập nhật số lượng trả
                data: '_id',
                render: (data, type, row, meta) => {
                    return `
                        <button id="editborrow" data-id="${data}" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#DetailModal${data}">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        ${createModal(data, type, row, meta)}
                    `;
                },
            },
            {
                // Xóa đơn mượn
                data: '_id',
                render: (data, type, row, meta) => {
                    return `
                        <button id="deleteborrow" data-id="${data}" class="btn btn-danger">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                        
                    `;
                },
            },
        ]

        const borrows = ref([]);
        const getBorrows = async () => {
            await axios
                .get("http://127.0.0.1:3000/api/borrows")
                .then((response) => {
                    borrows.value = response.data;
                    console.log(response.data);
                })
                .catch((error) => {
                    console.log(error);
                })
        };

        const borrow = ref({});
        const getOneBorrow = async (borrowId) => {
            await axios
                .get(`http://127.0.0.1:3000/api/borrows/borrow/${borrowId}`)
                .then((response) => {
                    borrow.value = response.data;
                })
                .catch((error) => {
                    console.log(error);
                })
        };

        const deleteborrow = async (borrowId) => {
            const token = Cookies.get('accessToken');
            await axios.delete(`http://127.0.0.1:3000/api/borrows/${borrowId}`, {
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
                        getBorrows();
                    }
                })
                .catch((error) => {
                    if (error.response && error.response.status === 400) {
                        Swal.fire({
                            title: 'Thất bại!',
                            text: 'Không thể xóa khi sách đang được mượn',
                            icon: 'error',
                            timer: 1500,
                            showConfirmButton: true,
                        });
                    } else if (error.response && error.response.status === 403) {
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

        $(document).on('click', '#deleteborrow', (event) => {
            const borrowId = $(event.currentTarget).data('id');
            Swal.fire({
                title: 'Bạn chắc chắn chứ?',
                text: 'Đơn mượn này sẽ bị xóa vĩnh viễn!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Xóa ngay',
                cancelButtonText: 'Hủy bỏ',
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteborrow(borrowId);
                }
            });
        });

        $(document).on('click', '#confirmStatus', (event) => {
            let borrowId = $(event.currentTarget).data('id');
            Swal.fire({
                title: 'Bạn chắc chắn muốn cập nhật trạng thái?',
                text: "Hành động này sẽ cập nhật trạng thái!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Cập nhật'
            }).then((result) => {
                if (result.isConfirmed) {
                    updateStatusBorrrow(borrowId, 'Đang mượn');
                }
            });
        });

        $(document).on('click', '#cancel', (event) => {
            let borrowId = $(event.currentTarget).data('id');
            updateStatusBorrrow(borrowId, 'Đã hủy');
        });

        const updateStatusBorrrow = async (borrowId, status) => {
            const token = Cookies.get('accessToken');
            if (status == 'Đang mượn') {
                await getOneBorrow(borrowId);
                const data = [...borrow.value.books]
                const res = await axios.post('http://127.0.0.1:3000/api/books/checkNumber', data);
                if (res.status == 200) {
                    await axios.put(`http://127.0.0.1:3000/api/borrows/update/${borrowId}`, { status: status }, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    })
                        .then((response) => {
                            if (response.status == 200) {
                                getBorrows();
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                } else {
                    Swal.fire({
                        title: 'Vui lòng kiểm tra lại số lượng sách đã cho mượn',
                        text: "Hành động này sẽ cập nhật trạng thái!",
                        icon: 'warning',
                        confirmButtonColor: false,
                    })
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
                }
            } else if (status == 'Đã hủy') {
                await axios.put(`http://127.0.0.1:3000/api/borrows/update/${borrowId}`, { status: status }, {
                    headers: { 'Authorization': 'Bearer ' + token }
                })
                    .then((response) => {
                        if (response.status == 200) {
                            getBorrows();
                        }
                    })
                    .catch((error) => {
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
                    })
            }
        }

        function createModal(data, type, row, meta) {
            return `
                <div class="modal fade" id="DetailModal${data}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="exampleModalLabel">Chi tiết mượn</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="form-group">
                                    <label for="">Thông tin khách hàng</label>
                                    <input type="text" readonly class="form-control" value="${row.user.user_name} - ${row.user.user_phone}">
                                </div>
                                ${showBooksDetail(row.books, data)}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" id="updateReturnNumberBook_${data}" class="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function showBooksDetail(books, borrowId) {
            let html = '';
            books.forEach(book => {
                html += `
                    <div class="row my-3">
                        <div class="col-4">
                            <img class="img-fluid" style="height: 150px; width: 150px" src="http://127.0.0.1:3000/${book.book_image}" alt="">
                        </div>
                        <div class="col-8">
                            <div class="col-12 fw-bold">${book.book_name}</div>
                            <div class="col-12 ">
                                <span class="fw-bold mt-1">Đơn Giá:</span>
                                <span class="price text-danger fw-bold"></span>
                                <span class="text-danger fw-bold">${formattedPrice(book.book_price)}</span>
                            </div>
                            <div class="col-12">
                                <span class="fw-bold col-4 mt-1">Số Lượng:</span>
                                <div class="row">
                                    <div class="col-12">
                                        <input type="text" readonly class="ms-0 col-3 text-center mt-1" value="${book.quantity}"> 
                                        <span class="col-1">=</span>
                                        <span class="text-danger fw-bold col">${formattedPrice(book.quantity * book.book_price)}</span>
                                    </div>
                                </div>
                                <div class="row">
                                    <span class="fw-bold mt-1 col-4">Còn Lại:</span>
                                    <input type="text" readonly class="col-3 text-center mt-1" value="${book.book_number - book.book_borrowedNumber}">
                                </div>
                                <div class="fw-bold mt-1 row">
                                    <span class="col-4">Đã Trả:</span>
                                    <input type="number" class="col-3 text-center" data-borrow-id="${borrowId}" data-book-id="${book._id}" min="0" max="${book.quantity}" value="${book.return_number}">
                                </div>
                            </div>
                        </div>
                    </div>
                `
            })
            return html;
        }

        $(document).on('click', '[id^="updateReturnNumberBook_"]', function () {
            let borrowId = $(this).attr('id').split('_')[1];
            updateReturnNumberBook(borrowId);
        });

        const updateReturnNumberBook = async (borrowId) => {
            const token = Cookies.get('accessToken');
            const updatedBooks = [];
            $(`#DetailModal${borrowId} [data-book-id]`).each(function () {
                const bookId = $(this).data('book-id');
                const returnNumber = $(this).val();
                updatedBooks.push({ book_id: bookId, return_number: returnNumber });
            });

            axios.put(`http://127.0.0.1:3000/api/borrows/updateReturnNumber/${borrowId}`, { books: updatedBooks }, {
                headers: { 'Authorization': 'Bearer ' + token }
            })
                .then(async response => {
                    if (response.status === 200) {
                        await Swal.fire({
                            title: 'Cập nhật thành công',
                            text: 'Số lượng trả đã được cập nhật thành công',
                            icon: 'success'
                        });
                        window.location.reload();
                    }
                })
                .catch(error => {
                    Swal.fire({
                        title: 'Cập nhật thất bại',
                        text: 'Đã xảy ra lỗi trong quá trình cập nhật số lượng trả',
                        icon: 'error'
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
        }

        const formattedPrice = (price) => {
            return formatPrice(price)
        }

        onMounted(() => {
            getBorrows();
        });

        return {
            getBorrows,
            columns,
            borrows,
            borrow,
            createModal,
            showBooksDetail,
            updateStatusBorrrow,
            getOneBorrow,
            updateReturnNumberBook,
            deleteborrow,
            formattedPrice
        }
    }
}
</script>

<style>
@import 'datatables.net-bs5';
</style>