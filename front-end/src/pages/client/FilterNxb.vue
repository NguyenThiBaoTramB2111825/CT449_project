<template>
    <ListBook :publisherId="publisherId" namePage="filterBooksPage"/>
</template>

<script>
import { useRoute } from 'vue-router';
import ListBook from '../../components/client/books/ListBook.vue';

export default {
    components: {
        ListBook
    },
    setup() {
        const route = useRoute();
        const publisherId = route.params.publisherId;
        return {
            publisherId,
        }
    }
}
</script>