<template>
    <div class="modal fade z-5" id="SignUpModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-dark">
                    <h1 class="modal-title fs-5 text-white" id="exampleModalLabel">Tạo Tài Khoản Mới</h1>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <Form :submit="SignUpUser" :validation-schema="signUpFormSchema">
                        <div class="Form-outline mb-3">
                            <label class="form-label" for="user_name">Tên Người Dùng</label>
                            <Field name="user_name" class="form-control" v-model="newUser.user_name" type="text"
                                id="user_name" />
                            <ErrorMessage name="user_name" class="text-danger" />
                        </div>
                        <div class="form-outline mb-3">
                            <label class="form-label" for="user_gender">Phái</label>
                            <div class="row mx-auto">
                                <div class="form-check col" v-for="genderOption in ['Nam', 'Nữ', 'Khác']"
                                    :key="genderOption">
                                    <Field v-model="newUser.user_gender" type="radio" name="user_gender"
                                        :value="genderOption" />
                                    <label class="form-check-label">{{ genderOption }}</label>
                                </div>
                            </div>
                            <ErrorMessage name="user_gender" class="text-danger" />
                        </div>
                        <div class="form-outline mb-3">
                            <label class="form-label" for="user_phone">Số Điện Thoại</label>
                            <Field name="user_phone" v-model="newUser.user_phone" type="text" id="user_phone"
                                class="form-control" />
                            <ErrorMessage name="user_phone" class="text-danger" />
                        </div>
                        <div class="form-outline mb-3">
                            <label class="form-label" for="user_password">Mật Khẩu</label>
                            <div class="row">
                                <div class="col-sm-11">
                                    <Field name="user_password" v-model="newUser.user_password"
                                        :type="showPassword ? 'text' : 'password'" id="user_password"
                                        class="form-control" />
                                </div>
                                <div class="col-sm-1 my-auto">
                                    <span class="toggle-password" @click="togglePasswordVisibility">
                                        <i :class="[showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash']"></i>
                                    </span>
                                </div>
                                <ErrorMessage name="user_password" class="text-danger col-sm-6" />
                            </div>
                        </div>
                        <div class="form-outline mb-3">
                            <label class="form-label" for="user_cfpassword">Mật Khẩu</label>
                            <div class="row">
                                <div class="col-sm-11">
                                    <Field name="user_cfpassword" :type="showcfPassword ? 'text' : 'password'"
                                        id="user_cfpassword" class="form-control" />
                                </div>
                                <div class="col-sm-1 my-auto">
                                    <span class="toggle-password" @click="togglecfPasswordVisibility">
                                        <i :class="[showcfPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash']"></i>
                                    </span>
                                </div>
                                <ErrorMessage name="user_cfpassword" class="text-danger" />
                            </div>
                        </div>
                        <div class="form-check d-flex justify-content-center mb-3">
                            <input v-model="isAgreed" @click="checkAgreement" class="form-check-Field me-2"
                                type="checkbox" value="" id="checkAgree" />
                            <label class="form-check-label" for="checkAgree">
                                I agree all statements in <a href="#!" class="text-body"><u>Terms of
                                        service</u></a>
                            </label>
                        </div>
                        <div class="d-flex justify-content-center">
                            <button :disabled="!isAgreed" type="submit"
                                class="btn btn-primary btn-block btn-lg gradient-custom-4 text-white">
                                Đăng Ký
                            </button>
                        </div>
                        <p class="text-center text-muted my-3">Bạn đã có tài khoản ? <a href="#!"
                                class="fw-bold text-body"><u>Đăng
                                    nhập ở đây</u></a></p>
                    </Form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";
import Swal from 'sweetalert2';

export default {
    components: {
        Form,
        Field,
        ErrorMessage,
    },
    setup() {
        const newUser = ref({
            user_name: '',
            user_password: '',
            user_gender: '',
            user_phone: '',
        });

        const showPassword = ref(false);
        const togglePasswordVisibility = () => {
            showPassword.value = !showPassword.value;
        }

        const showcfPassword = ref(false);
        const togglecfPasswordVisibility = () => {
            showcfPassword.value = !showcfPassword.value;
        }

        const isAgreed = ref(false);
        const checkAgreement = () => {
            isAgreed.value = !isAgreed.value;
        };

        const SignUpUser = async () => {
            await axios.post('http://127.0.0.1:3000/api/users', newUser.value)
                .then(async (response) => {
                    if (response.status == 200) {
                        newUser.value = {
                            user_name: '',
                            user_password: '',
                            user_gender: '',
                            user_phone: '',
                        }
                        await Swal.fire({
                            title: 'Thành công!',
                            text: 'Bạn đã tạo tài khoản thành công.',
                            icon: 'success',
                            timer: 1500, 
                            showConfirmButton: false, 
                        });
                        $('#SignUpModal').modal('hide');
                        window.location.reload();
                    }

                })
                .catch(async (error) => {
                    if (error.response && error.response.status === 400) {
                        await Swal.fire({
                            title: 'Lỗi!',
                            text: error.response.data.message,
                            icon: 'error',
                        });
                    } else {
                        console.log(error);
                    }
                })
        }

        const signUpFormSchema = yup.object().shape({
            user_name: yup
                .string()
                .required("Vui lòng nhập tên")
                .min(5, "Tên phải ít nhất 5 ký tự.")
                .max(50, "Tên có nhiều nhất 50 ký tự."),
            user_password: yup
                .string()
                .required("Vui lòng nhập mật khẩu")
                .min(8, "Mật khẩu phải ít nhất 8 ký tự."),
            user_gender: yup
                .string()
                .required("Vui lòng chọn giới tính"),
            user_phone: yup
                .string()
                .matches(
                    /((09|03|07|08|05)+([0-9]{8})\b)/g,
                    "Số điện thoại không hợp lệ."
                ),
            user_cfpassword: yup
                .string()
                .required("Vui lòng nhập mật khẩu")
                .min(8, "Mật khẩu phải ít nhất 8 ký tự.")
                .oneOf([yup.ref('user_password'), null], 'Mật khẩu không khớp'),
        });

        return {
            newUser,
            showPassword,
            showcfPassword,
            isAgreed,
            signUpFormSchema,
            checkAgreement,
            togglePasswordVisibility,
            togglecfPasswordVisibility,
            SignUpUser,
        }
    }
}
</script>