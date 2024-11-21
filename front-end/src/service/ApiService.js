import axios from 'axios';
import Swal from 'sweetalert2';

class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api/';
    }

    async get(endpoint, token) {
        const url = this.baseUrl + endpoint;
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            }
            return await axios.get(url, { headers });
        } catch (error) {
            this.handleErrorResponse(error);
        }
    }

    async post(endpoint, data, token) {
        const url = this.baseUrl + endpoint;
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token != null) {
                headers['Authorization'] = 'Bearer ' + token;
            }
            return await axios.post(url, data, { headers });
        } catch (error) {
            this.handleErrorResponse(error);
        }
    }

    async put(endpoint, data, token) {
        const url = this.baseUrl + endpoint;
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token != null) {
                headers['Authorization'] = 'Bearer ' + token;
            }
            return await axios.put(url, data, { headers });
        } catch (error) {
            this.handleErrorResponse(error);
        }
    }

    async delete(endpoint, token) {
        const url = this.baseUrl + endpoint;
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            }
            return await axios.delete(url, { headers });
        } catch (error) {
            this.handleErrorResponse(error);
        }
    }

    handleErrorResponse(error) {
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
        } else if (error.response && error.response.status === 402) {
            Swal.fire({
                title: 'Lỗi',
                text: error.response.data.message,
                icon: 'error',
                timer: 1500,
                showConfirmButton: false,
            });
        } else if (error.response && error.response.status === 404) {
            Swal.fire({
                title: 'Lỗi',
                text: error.response.data.message,
                icon: 'error',
                timer: 1500,
                showConfirmButton: false,
            });
        } else if (error.response && error.response.status === 400) {
            Swal.fire({
                title: 'Lỗi',
                text: error.response.data.message,
                icon: 'error',
                timer: 1500,
                showConfirmButton: false,
            });
        } else {
            console.log(error);
        }
    }
}

export default ApiService;
