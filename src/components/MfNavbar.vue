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
                        {{ user.role.label }}
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

        const item = this.findListItem(this.$auth.user.role.initialView)
        this.selectedItem = item.name
        this.$store.commit('navbar/setProp', {
            title: item.label,
        } )

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

        findListItem(name, items = this.items) {

            for (const item of items) {

                if (item.name === name) {

                    return item

                }
                else if (item.children) {

                    const found = this.findListItem(name, item.children)

                    if (found)
                        return found

                }

            }

            return null

        },
    },
}
</script>
