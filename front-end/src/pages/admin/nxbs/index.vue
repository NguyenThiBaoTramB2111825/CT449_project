<template>
    <a-card class="mt-4" title="Nhà Xuất Bản" style="width: 100%">
        <div class="row">
            <div class="col-12 mb-3 d-flex justify-content-end">
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addNxbModal">
                    <i class="fa-solid fa-plus"></i> Thêm
                </button>

                <!-- Modal -->
                <div class="modal fade" id="addNxbModal" tabindex="-1" aria-labelledby="exampleModalLabel"
                    aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="addModalLabel">Thêm Nhà Xuất Bản</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form @submit.prevent="addNxb()">
                                    <label for="publisher_name" class="form-label">Tên Nhà Xuất Bản:</label>
                                    <input v-model="newNxb.publisher_name" name="publisher_name" type="text"
                                        class="form-control" id="publisher_name">
                                    <label for="publisher_address" class="form-label">Địa Chỉ:</label>
                                    <input v-model="newNxb.publisher_address" name="publisher_address" type="text"
                                        class="form-control" id="publisher_address">
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary"
                                            data-bs-dismiss="modal">Đóng</button>
                                        <button type="submit" class="btn btn-primary">Lưu Thay Đổi</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal edit-->
                <div class="modal fade" id="editNxbModal" tabindex="-1" aria-labelledby="editModalLabel"
                    aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="editModalLabel">Sửa Nhà Xuất Bản</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form @submit.prevent="updateNxb()">
                                    <!-- Thêm các trường để chỉnh sửa thông tin người dùng -->
                                    <label for="publisher_name" class="form-label">Tên Nhà Xuất Bản:</label>
                                    <input v-model="editedNxb.publisher_name" name="publisher_name" type="text"
                                        class="form-control" id="publisher_name">
                                    <label for="publisher_address" class="form-label">Địa Chỉ:</label>
                                    <input v-model="editedNxb.publisher_address" name="publisher_address" type="text"
                                        class="form-control" id="publisher_address">
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary"
                                            data-bs-dismiss="modal">Đóng</button>
                                        <button type="submit" class="btn btn-primary">Lưu Thay
                                            Đổi</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-12">
                <div class="table-responsive">
                    <DataTable id="mytable" :columns="columns" :data="nxbs"
                        :options="{ response: true, autoWidth: false, dom: 'Bfrtip' }"
                        class=" display table table-striped table-bordered" :scroll="{ x: 576 }">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mã NXB</th>
                                <th>Tên</th>
                                <th>Địa Chỉ</th>
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
import { ref, onMounted } from "vue";
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
import Swal from 'sweetalert2';
import Cookies from "js-cookie";

export default {
    components: {
        DataTable,
    },
    setup() {
        const router = useRouter();
        const store = useMenu();
        store.onSelectedKeys(['admin-nxbs']);
        const columns = [
            { data: null, render: (data, type, row, meta) => { return meta.row + 1; } },
            { data: '_id' },
            { data: 'publisher_name' },
            { data: 'publisher_address' },
            {
                data: '_id',
                render: (data, type, row, meta) => {
                    return `
                        <button id="editnxb" data-id="${data}" class="btn btn-warning" >
                        <i class="fa-solid fa-pencil"></i> Sửa
                        </button>
                        <button id="deletenxb" data-id="${data}" class="btn btn-danger" >
                            <i class="fa-solid fa-trash"></i> Xóa
                        </button>
                    `;
                },
            },
        ]
        const nxbs = ref([]);
        const newNxb = ref({
            publisher_name: '',
            publisher_address: '',
        });
        const editedNxb = ref({});

        const getNxbs = async () => {
            await axios
                .get("http://127.0.0.1:3000/api/publishers")
                .then((response) => {
                    nxbs.value = response.data;
                })
                .catch((error) => {
                    console.log(error);
                })
        };

        const addNxb = async () => {
            const token = Cookies.get('accessToken');
            await axios
                .post("http://127.0.0.1:3000/api/publishers", newNxb.value, {
                    headers: { 'Authorization': 'Bearer ' + token }
                })
                .then((response) => {
                    if (response.status == 200) {
                        Swal.fire({
                            title: 'Thành công!',
                            text: 'Dữ liệu đã được thêm mới thành công.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        getNxbs();
                        $('#addNxbModal').modal('hide');
                        window.location.reload();
                    }
                })
                .catch((error) => {
                    console.log(error);
                    Swal.fire({
                        title: 'Thất bại',
                        text: 'Dữ liệu đã chưa được thêm mới.',
                        icon: 'error',
                        timer: 1500,
                        showConfirmButton: false,
                    });
                })
        };

        $(document).on('click', '#editnxb', (event) => {
            let nxbId = $(event.currentTarget).data('id');
            const nxbToEdit = nxbs.value.find((publisher) => publisher._id === nxbId);
            if (nxbToEdit) {
                editedNxb.value = { ...nxbToEdit };
                $('#editNxbModal').modal('show');
            }
        });

        const deletenxb = async (nxbId, bookIds) => {
            const token = Cookies.get('accessToken');
            await axios.delete(`http://127.0.0.1:3000/api/publishers/${nxbId}`, { params: { bookIds } }, {
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
                        $('#addNxbModal').modal('hide');
                        getNxbs();
                        router.push({ name: 'admin-nxbs' });
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        title: 'Thất bại',
                        text: 'Tồn tại sách với nhà xuất bản',
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

        const updateNxb = () => {
            const token = Cookies.get('accessToken');
            axios.put(`http://127.0.0.1:3000/api/publishers/${editedNxb.value._id}`, editedNxb.value, {
                headers: { 'Authorization': 'Bearer ' + token }
            })
                .then((response) => {
                    if (response.status == 200) {
                        Swal.fire({
                            title: 'Thành công!',
                            text: 'Dữ liệu đã được cập nhật thành công.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        $('#editNxbModal').modal('hide');
                        getNxbs();
                        router.push({ name: 'admin-nxbs' });
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        title: 'Thất bại',
                        text: 'Dữ liệu chưa được cập nhật.',
                        icon: 'error',
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    $('#editNxbModal').modal('hide');
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

        $(document).on('click', '#deletenxb', async (event) => {
            const nxbId = $(event.currentTarget).data('id');
            const token = Cookies.get('accessToken');
            const resultBooks = await axios.get(`http://127.0.0.1:3000/api/books/publisher/${nxbId}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const bookIds = resultBooks.data.map(book => book._id);
            if (resultBooks.data.length > 0) {
                Swal.fire({
                    title: 'Bạn chắc chắn chứ?',
                    text: 'Tồn tại sách với nhà xuất bản, nhà xuất bản và sách bị xóa !',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Xóa ngay',
                    cancelButtonText: 'Hủy bỏ',
                }).then((result) => {
                    if (result.isConfirmed) {
                        deletenxb(nxbId, bookIds);
                    }
                });
            } else {
                Swal.fire({
                    title: 'Bạn chắc chắn chứ?',
                    text: 'Nhà xuất bản sẽ bị xóa !',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Xóa ngay',
                    cancelButtonText: 'Hủy bỏ',
                }).then((result) => {
                    if (result.isConfirmed) {
                        deletenxb(nxbId, bookIds);
                    }
                });
            }
        });

        onMounted(() => {
            getNxbs();
        });

        return {
            getNxbs,
            addNxb,
            updateNxb,
            deletenxb,
            columns,
            nxbs,
            newNxb,
            editedNxb
        }
    }
}
</script>
<style>
@import 'datatables.net-bs5';
</style>