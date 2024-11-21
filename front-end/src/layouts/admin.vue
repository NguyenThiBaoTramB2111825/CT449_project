<template>
    <div v-if="!token">
        <Login />
    </div>
    <div v-else>
        <TheHeader />
        <div class="container-fluid">
            <div class="row">
                <div class="col-sm-2 d-none d-sm-flex mt-4">
                    <a-list size="small" bordered style="width: 100%;">
                        <TheMenu />
                        <template #header>
                            <div>Bảng Điều Khiển</div>
                        </template>
                    </a-list>
                </div>
                <div class="col-12 col-sm-10">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import TheHeader from '../components/admin/TheHeader.vue';
import TheMenu from '../components/admin/TheMenu.vue';
import Login from '../components/admin/Login.vue';
import Cookies from 'js-cookie';

export default {
    components: {
        TheHeader,
        TheMenu,
        Login,
    },
    setup() {
        const token = Cookies.get('accessToken');

        return {
            token
        }
    }
}
</script>