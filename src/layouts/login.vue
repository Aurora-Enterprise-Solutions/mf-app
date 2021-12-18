<template>
    <v-app class="mf-layout mf-layout-login">
        <v-main class="blue-grey lighten-5">
            <Nuxt />
        </v-main>

        <v-footer class="blue-grey lighten-5">
            <v-spacer />
            <span>Todos los derechos reservados &copy; {{ new Date().getFullYear() }}</span>
            <v-spacer />
        </v-footer>
    </v-app>
</template>
