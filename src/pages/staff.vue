<template>
    <v-container class="mf-page mf-page-staff">
        <v-data-table :headers="headers"
                      :loading="$apollo.queries.users.loading || deleteLoading"
                      :search="search"
                      :items="users"
        >

            <template #top>
                <v-toolbar flat>
                    <v-toolbar-title>{{ title }}</v-toolbar-title>

                    <v-spacer />

                    <v-btn v-if="!$apollo.queries.users.loading && !deleteLoading" color="primary" @click.stop="onNew">
                        Nuevo
                    </v-btn>
                </v-toolbar>

                <v-toolbar flat>
                    <v-text-field v-model="search"
                                  append-icon="mdi-magnify"
                                  label="Search"
                                  single-line
                                  hide-details
                    />
                </v-toolbar>
            </template>

            <template #[`item.role`]="{ item }">
                {{ getRoleLabelById(item.role) }}
            </template>

            <template #[`item.actions`]="{ item }">
                <v-btn icon color="primary" @click="onEdit(item)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>

                <v-btn icon color="error" @click="onDelete(item)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </template>

        </v-data-table>


        <!--DIALOGS-->
        <mf-user-form-dialog v-model="showUserForm"
                             :roles="roles"
                             :is-new="isNew"
                             :data="formData"
                             @save="onSave"
        />

    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import { mapGetters } from 'vuex'
import { Error } from './../static/errors'
import { Message } from './../static/messages'
import { GraphqlTypename } from './../static/errors/graphql_typename'

export default {
    apollo: {
        users: {
            query: gql`query {
                getAllUsers {
                    _id,
                    rut,
                    email,
                    name,
                    role,
                    signature,
                }
            }`,
            update: (data) => data.getAllUsers,
        },

        roles: {
            query: gql`query {
                getAllRoles {
                    _id,
                    name,
                    label,
                }
            }`,
            update: (data) => data.getAllRoles,
        },
    },

    data() {

        return {
            search       : '',
            showUserForm : false,
            isNew        : true,
            alert        : {
                show    : false,
                color   : '',
                message : '',
            },

            deleteLoading: false,

            formData: {},

            headers: [
                {
                    text       : 'RUT',
                    value      : 'rut',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Nombre',
                    value      : 'name',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Correo Electrónico',
                    value      : 'email',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Rol',
                    value      : 'role',
                    sortable   : true,
                    filterable : true,
                    groupable  : true,
                },
                {
                    text       : 'Acciones',
                    value      : 'actions',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                },
            ],

            roles: [],
        }

    },

    computed: {
        ...mapGetters( {
            title: 'navbar/getTitle',
        } ),
    },

    methods: {
        onNew() {

            this.isNew = true
            this.formData = {}
            this.showUserForm = true

        },

        onEdit(item) {

            this.isNew = false
            this.formData = JSON.parse(JSON.stringify(item) )
            this.showUserForm = true

        },

        onDelete(item) {

            this.deleteLoading = true

            this.$apollo.mutate( {
                mutation: gql`mutation ($form: DeleteUserInput!) {
                    deleteUser(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: {
                        _id: item._id,
                    },
                },
            } )
                .then( ( { data: { deleteUser } } ) => {

                    if (deleteUser.__typename === GraphqlTypename.OK) {

                        this.alert.color = 'success'
                        this.alert.message = Message.USER_DELETED
                        this.alert.show = true

                        this.$apollo.queries.users.refetch()

                    }

                    if (deleteUser.__typename === GraphqlTypename.USER_NOT_FOUND) {

                        this.alert.color = 'error'
                        this.alert.message = Error.UNKNOWN_USER
                        this.alert.show = true

                    }

                    if (deleteUser.__typename === GraphqlTypename.IMMUTABLE_USER) {

                        this.alert.color = 'error'
                        this.alert.message = Error.IMMUTABLE_USER
                        this.alert.show = true

                    }

                    this.deleteLoading = false

                } )
                .catch( () => {

                    this.alert.color = 'error'
                    this.alert.message = Error.DEFAULT_ERROR_MESSAGE
                    this.alert.show = true
                    this.deleteLoading = false

                } )

        },

        onSave(error) {

            if (error) {

                this.$alert(error, 'error')

            }
            else {

                if (this.isNew)
                    this.$alert(Message.USER_CREATED)
                else
                    this.$alert(Message.USER_UPDATED)

                this.$apollo.queries.users.refetch()

            }

        },

        getRoleLabelById(id) {

            const role = this.roles.find( (role) => role._id === id)

            return role ? role.label : ''

        },
    },
}
</script>
