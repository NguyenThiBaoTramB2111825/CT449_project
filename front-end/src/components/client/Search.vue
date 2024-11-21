<template>
    <div class="col-sm-5">
        <div class="input-group my-4 w-100 border border-dark rounded-2">
            <input name="search_key" v-model="search_key" @input="searchBook" type="text" class="form-control border-0"
                placeholder="Nhập để tìm kiếm">
            <button type="button" @click="searchBook" class="rounded-end border px-2">
                <i class="fa-solid fa-magnifying-glass"></i>
            </button>
        </div>
        <div class="position-relative">
            <ul v-if="books.length > 0" class="list-group position-absolute w-100 border border-dark" style="z-index: 99;">
                <li v-for="book in books" :key="book._id" class="list-group-item">
                    <router-link @click="clickResetSearch" class="row text-decoration-none text-dark"
                        :to="{ name: 'books-detail', params: { id: book._id } }">
                        <img class="col-2 img-fluid" :src="`http://localhost:3000/${book.book_image}`">
                        <div class="col-9">
                            <h4 class="row">{{ book.book_name }}</h4>
                            <div class="row">Còn lại ({{ book.book_number - book.book_borrowedNumber }})</div>
                        </div>
                    </router-link>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ApiService from '@/service/ApiService';
export default {
    setup() {
        const search_key = ref('');
        const books = ref([]);
        const router = useRouter();
        // const isListVisible = ref(true);
        const apiService = new ApiService();

        const searchBook = async () => {
            try {
                const response = await apiService.get(`books/search?book_name=${search_key.value}`);
                if (response.status === 200) {
                    books.value = response.data;
                }
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };

        const clickResetSearch = () => {
            search_key.value = '';
            // isListVisible.value = false;
        }

        return {
            search_key,
            books,
            // isListVisible,
            searchBook,
            clickResetSearch
        };
    }
};
</script>