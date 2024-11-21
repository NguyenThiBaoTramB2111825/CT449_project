<template>
    <a-card class="mt-4" title="Nhà Xuất Bản" style="width: 100%">
        <div class="row">
            <div class="col-12">
                <div class="table-responsive">
                    <DataTable id="mytable" :columns="columns" :data="users"
                        :options="{ response: true, autoWidth: false, dom: 'Bfrtip' }"
                        class=" display table table-striped table-bordered" :scroll="{ x: 576 }">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mã Người Dùng</th>
                                <th>Tên</th>
                                <th>Giới Tính</th>
                                <th>Số Điện Thoại</th>
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
        store.onSelectedKeys(['admin-users']);
        const columns = [
            { data: null, render: (data, type, row, meta) => { return meta.row + 1; } },
            { data: '_id' },
            { data: 'user_name' },
            { data: 'user_gender' },
            { data: 'user_phone' },
            {
                data: '_id',
                render: (data, type, row, meta) => {
                    return `
                        <button id="deletuser" data-id="${data}" class="btn btn-danger" >
                            <i class="fa-solid fa-trash"></i> Xóa
                        </button>
                    `;
                },
            },
        ]
        const users = ref([]);

        const getUsers = async () => {
            await axios
                .get("http://127.0.0.1:3000/api/users")
                .then((response) => {
                    users.value = response.data;
                })
                .catch((error) => {
                    console.log(error);
                })
        };

        const deletuser = async (userId) => {
            const token = Cookies.get('accessToken');
            await axios.delete(`http://127.0.0.1:3000/api/users/${userId}`, {
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
                        getUsers();
                    }
                })
                .catch((error) => {
                    if (error.response && error.response.status === 400) {
                        Swal.fire({
                            title: 'Thất bại',
                            text: 'Người dùng này đang mượn sách, không thể xóa',
                            icon: 'error',
                            timer: 1500,
                            showConfirmButton: false,
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

        $(document).on('click', '#deletuser', async (event) => {
            const userId = $(event.currentTarget).data('id');
            await Swal.fire({
                title: 'Bạn chắc chắn chứ?',
                text: 'Người dùng này sẽ bị xóa !',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Xóa ngay',
                cancelButtonText: 'Hủy bỏ',
            }).then((result) => {
                if (result.isConfirmed) {
                    deletuser(userId);
                }
            });
        });

        onMounted(() => {
            getUsers();
        });

        return {
            getUsers,
            deletuser,
            columns,
            users,
        }
    }
}
</script>
<style>
@import 'datatables.net-bs5';
</style>