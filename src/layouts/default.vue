<template>
    <v-app class="mf-layout mf-layout-default">
        <v-main class="blue-grey lighten-5">
            <mf-app-bar :navbar.sync="navbar" />

            <v-container class="d-flex flex-column">
                <Nuxt />
            </v-container>
        </v-main>

        <v-footer class="blue-grey lighten-5">
            <v-spacer />
            <span>Todos los derechos reservados &copy; {{ new Date().getFullYear() }}</span>
            <v-spacer />
        </v-footer>

        <mf-navbar v-model="navbar" />
    </v-app>
</template>

<script>
import MfAppBar from '../components/MfAppBar.vue'

export default {
    components: { MfAppBar },
    data() {

        return {
            navbar: false,
        }

    },
}
</script>
