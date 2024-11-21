<template>
    <div>
        <div class="row fw-bold fs-4 mx-auto">Địa chỉ của tôi</div>
        <div class="row mx-auto mb-3">Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
        <hr>

        <div class="row mx-auto">
            <button class="btn btn-primary col-3" data-bs-toggle="modal" data-bs-target="#updateAddress">
                {{ userInfo_address.user_address ? 'Chỉnh sửa địa chỉ' : 'Thêm mới địa chỉ' }}
            </button>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="updateAddress" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="staticBackdropLabel">
                            {{ userInfo_address.user_address ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới' }}
                        </h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="user_address" class="fw-bold">Địa chỉ:</label>
                            <textarea name="user_address" id="user_address" class="form-control" rows="4"
                                placeholder="ví dụ: Hẻm 1, đường 3/2, Ninh Kiều, Cần thơ">{{ userInfo_address.user_address }}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="updateAddress">
                            {{ userInfo_address.user_address ? 'Save Changes' : 'Add' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-3 fs-5">
            <div>
                Địa chỉ: {{ userInfo_address.user_address }}
            </div>
        </div>
    </div>
</template>
<script>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import ApiService from '@/service/ApiService';
export default {
    setup() {
        const userInfo_address = ref({});
        const apiService = new ApiService();

        const getOneAddress = async () => {
            const token = Cookies.get('accessToken');
            if (token) {
                const response = await apiService.get(`users/${token}`);
                if (response.status === 200) {
                    userInfo_address.value = response.data
                }
            }
        }

        const updateAddress = async () => {
            const token = Cookies.get('accessToken');
            if (token) {
                try {
                    const textareaValue = document.getElementById('user_address').value;
                    const response = await apiService.put(`users/${token}`, { user_address: textareaValue });
                    if (response.status == 200) {
                        await Swal.fire({
                            title: 'Cập nhật địa chỉ thành công',
                            text: 'Bạn đã cập nhật thành công địa chỉ mới',
                            icon: 'success',
                            confirmButtonText: 'Đồng ý',
                            timer: 1500,
                        });
                        $('#updateAddress').modal('hide');
                        getOneAddress();
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }

        onMounted(() => {
            getOneAddress();
        })

        return {
            userInfo_address,
            updateAddress,
            getOneAddress,
        }
    }
}
</script>