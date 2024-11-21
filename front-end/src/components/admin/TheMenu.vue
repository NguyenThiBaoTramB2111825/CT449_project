<template>
    <a-menu v-model:openKeys="openKeys" v-model:selectedKeys="selectedKeys" mode="inline">
        <a-menu-item key="admin-books">
            <router-link :to="{ name: 'admin-books' }" class="text-decoration-none">
                <i class="fa-solid fa-book fa-xl me-2"></i>
                <span>Sách</span>
            </router-link>
        </a-menu-item>
        <a-menu-item key="admin-users">
            <router-link :to="{ name: 'admin-users' }" class="text-decoration-none">
                <i class="fa-solid fa-user fa-xl me-2"></i>
                <span>Người Dùng</span>
            </router-link>
        </a-menu-item>
        <a-menu-item key="admin-nxbs">
            <router-link :to="{ name: 'admin-nxbs' }" class="text-decoration-none">
                <i class="fa-solid fa-list me-2"></i>
                <span>Nhà Xuất Bản</span>
            </router-link>
        </a-menu-item>
        <a-menu-item key="admin-borrows">
            <router-link :to="{ name: 'admin-borrows' }" class="text-decoration-none">
                <i class="fas fa-hand-holding-usd me-2"></i>
                <span>Mượn Sách</span>
            </router-link>
        </a-menu-item>
        <a-menu-item>
            <a @click="logout" class="text-decoration-none">
                <i class="fa-solid fa-power-off me-2"></i>
                <span>Đăng xuất</span>
            </a>
        </a-menu-item>
    </a-menu>
</template>
<script>
import { defineComponent } from "vue";
import { storeToRefs } from "pinia";
import { useMenu } from "../../store/use-menu.js";
export default defineComponent({
    setup() {
        const store = useMenu();
        const logout = () => {
            document.cookie = 'accessToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
            document.cookie = 'user_name=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
            delete axios.defaults.headers.common['Authorization'];
            window.location.href = "/admin";
        }
        const { selectedKeys, openKeys } = store;
        return {
            logout,
            ...storeToRefs(store)
        }
    },

});
</script>