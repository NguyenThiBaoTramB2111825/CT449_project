<template>
    <div>
        <div class="row mt-2">
            <div class="col-1 fs-3"><i class="fa-solid fa-user"></i></div>
            <div class="col my-auto">Tài khoản của tôi</div>
        </div>
        <div class="row mt-auto">
            <div class="col-1"></div>
            <div class="col">
                <router-link :to="{ name: 'profile-infoUser' }" class="text-decoration-none text-dark"
                    :class="{ 'active-sidebar': currentTab === 'profile-infoUser' }">Hồ sơ</router-link>
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-1"></div>
            <div class="col">
                <router-link :to="{ name: 'profile-address' }" class="text-decoration-none text-dark"
                    :class="{ 'active-sidebar': currentTab === 'profile-address' }">Địa chỉ</router-link>
            </div>
        </div>
        <div class="row my-4">
            <div class="col-1 fs-3"></div>
            <div class="col my-auto">
                <router-link :to="{ name: 'profile-loanApplication' }" class="text-decoration-none text-dark"
                    :class="{ 'active-sidebar': currentTab === 'profile-loanApplication' }">Đơn mượn</router-link>
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
export default {
    setup() {
        const route = useRoute();
        const currentTab = computed(() => route.name);
        
        return {
            currentTab
        };
    }
};
</script>

<style>
.active-sidebar {
    border-bottom: 2px solid #000;
}
</style>