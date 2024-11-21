<template>
    <div>
        <Header />
        <Navbar />
        <div class="container">
            <router-view></router-view>
        </div>
        <Footer />
    </div>
</template>
<script>
import Header from '../components/client/Header.vue';
import Navbar from '../components/client/Navbar.vue';
import Footer from '../components/client/Footer.vue';

export default {
    components: {
        Navbar,
        Header,
        Footer,
    },
    setup() {
        
    },
};
</script>