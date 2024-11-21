<template>
    <div class="row">
        <div class="row fw-bold fs-4 mx-auto">Hồ sơ của tôi</div>
        <div class="row mx-auto mb-3">Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
        <hr>
        <div class="col-6 ms-4">
            <div class="my-4 form-group">
                <label for="user_name" class="fw-bold">Tên đầy đủ:</label>
                <input type="text" :value="userInfo.user_name" readonly name="user_name" class="form-control">
            </div>
            <div class="my-4 form-group">
                <label for="user_gender" class="fw-bold">Giới tính:</label>
                <input type="text" :value="userInfo.user_gender" class="form-control" readonly name="user_gender">
            </div>
            <div class="my-4 form-group">
                <label for="user_phone" class="fw-bold">Số điện thoại:</label>
                <input type="text" :value="userInfo.user_phone" class="form-control" readonly name="user_phone">
            </div>
            <div class="my-4 form-group">
                <button type="submit" class="btn btn-success" name="updateAvatar">Lưu</button>
            </div>
        </div>
    </div>
</template>
<script>
import { ref, onMounted } from 'vue';
import Cookies from 'js-cookie';
import ApiService from '@/service/ApiService';
export default {
    setup() {
        const userInfo = ref({});
        const apiService = new ApiService();
        const getUserInfo = async () => {
            const token = Cookies.get('accessToken');
            if (token) {
                try {
                    const response = await apiService.get(`users/${token}`)
                    if (response.status == 200) {
                        userInfo.value = response.data;
                    }
                } catch (error) {
                    console.log(error);
                }
            }

        }

        onMounted(() => {
            getUserInfo();
        })

        return {
            userInfo,
            getUserInfo,
        }
    }
}   
</script>