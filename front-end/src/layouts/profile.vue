<template>
    <div>
        <div class="container-fluid px-5 py-4">
            <div class="row my-4">
                <div class="col-4 border">
                    <sideBar />
                </div>
                <div class="col-8 border">
                    <router-view> </router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import sideBar from '../components/client/profile/sideBar.vue'
import infoUser from '../components/client/profile/infoUser.vue'
export default {
    components: {
        sideBar,
        infoUser
    },
}
</script>