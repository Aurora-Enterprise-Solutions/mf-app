<template>
    <v-navigation-drawer :value="value"
                         absolute
                         temporary
                         class="mf-component mf-component-navbar"
                         @input="$emit('input', $event)"
    >
        <v-list>
            <v-list-item link>
                <v-list-item-content>
                    <v-list-item-title class="text-h6">
                        {{ user.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle class="text-overline">
                        {{ user.role ? user.role.label : '' }}
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-list>

        <v-divider />

        <v-list nav dense>
            <mf-navbar-item-group v-model="selectedItem" :items="items" />
        </v-list>

        <template #append>
            <div class="pa-2">
                <v-btn block color="primary" @click="logout">
                    Cerrar Sesión
                </v-btn>
            </div>
        </template>

        <v-dialog v-model="logoutConfirmation" width="auto">
            <v-card elevation="4">
                <v-card-title>Cerrar Sesión</v-card-title>

                <v-card-text>
                    <p>¿Está seguro que desea cerrar sesión?</p>

                    <v-btn color="primary" outlined @click="logoutConfirmation = false">
                        Cancelar
                    </v-btn>

                    <v-btn color="primary" @click="confirmLogout">
                        Confirmar
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-navigation-drawer>
</template>

<script>
export default {
    name: 'MfNavbar',

    props: {
        value: {
            type    : Boolean,
            default : false,
        },
    },

    data() {

        return {
            selectedItem       : '',
            logoutConfirmation : false,
        }

    },

    computed: {
        items() {

            return this.$auth.user.views

        },

        user() {

            return this.$auth.user

        },
    },

    mounted() {

        this.selectedItem = this.$store.state.navbar.name

    },

    methods: {
        logout() {

            this.logoutConfirmation = true

        },

        async confirmLogout() {

            this.logoutConfirmation = false
            await this.$auth.logout()
            this.$router.push('/login')

        },
    },
}
</script>
