<template>
    <v-container class="mf-page mf-page-clients">
        <v-data-table :headers="clientHeaders"
                      :loading="$apollo.queries.clients.loading"
                      :search="search"
                      :items="clients"
                      single-expand
                      show-expand
        >

            <template #top>
                <v-toolbar flat>
                    <v-toolbar-title>{{ title }}</v-toolbar-title>

                    <v-spacer />

                    <v-btn v-if="!$apollo.queries.clients.loading" color="primary" @click.stop="onNew">
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

            <template #[`item.actions`]="{ item }">
                <v-btn icon color="primary" @click="onEdit(item)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>

                <v-btn icon color="error" @click="onDelete(item)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </template>

            <template #expanded-item="{ isMobile, item }">
                <td :colspan="clientHeaders.length"
                    :class="{
                        'mf-inner-table': true,
                        'v-data-table__mobile-row': isMobile,
                    }"
                >

                    <!-- INNER TABLE -->
                    <v-data-table :headers="clientBillingHeaders"
                                  :items="[item.billing]"
                                  dense
                                  hide-default-footer
                                  :items-per-page="-1"
                    />
                </td>
            </template>

        </v-data-table>


        <!--DIALOGS-->
        <mf-client-form-dialog v-model="showUserForm"
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
        clients: {
            query: gql`query {
                getAllClients {
                    _id,
                    name,
                    paymentCondition,
                    receivers,
                    billing {
                        name,
                        rut,
                        category,
                        address,
                        phone,
                        loads {
                            type,
                            amount
                        }
                    },
                }
            }`,
            update: (data) => data.getAllClients,
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

            formData: {
                billing: {

                },
            },

            clientHeaders: [
                {
                    text       : 'Nombre',
                    value      : 'name',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Condición de pago',
                    value      : 'paymentCondition',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Acciones',
                    value      : 'actions',
                    width      : '110px',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                },
                { text: '', value: 'data-table-expand' },
            ],

            clientBillingHeaders: [
                {
                    text       : 'RUT',
                    value      : 'rut',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                },
                {
                    text       : 'Nombre',
                    value      : 'name',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                },
                {
                    text       : 'Giro',
                    value      : 'category',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                },
                {
                    text       : 'Dirección',
                    value      : 'address',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                },
                {
                    text       : 'Teléfono',
                    value      : 'phone',
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
            this.formData = {
                receivers : [],
                billing   : {
                    loads: [],
                },
            }
            this.showUserForm = true

        },

        onEdit(item) {

            this.isNew = false
            this.formData = JSON.parse(JSON.stringify(item) )
            this.showUserForm = true

        },

        onDelete(item) {

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

                        this.$apollo.queries.clients.refetch()

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

                this.$apollo.queries.clients.refetch()

            }

        },

        getRoleLabelById(id) {

            const role = this.roles.find( (role) => role._id === id)

            return role ? role.label : ''

        },
    },
}
</script>
