<template>
    <v-container class="mf-page mf-page-login d-flex flex-column">
        <v-container>
            <v-row justify="center">
                <v-col
                    cols="5"
                    sm="3"
                    lg="2"
                >
                    <img
                        :src="require('./../assets/images/logo.svg')"
                        class="logo"
                    >
                </v-col>
            </v-row>
        </v-container>

        <v-container>
            <v-row justify="center">
                <v-col
                    cols="12"
                    sm="9"
                    md="7"
                    lg="5"
                >
                    <v-alert
                        v-model="showAlert"
                        color="red"
                        dismissible
                        outlined
                        text
                        type="error"
                    >
                        {{ alertMessage }}
                    </v-alert>
                </v-col>
            </v-row>
        </v-container>

        <v-container>
            <v-row justify="center">
                <v-col
                    cols="12"
                    sm="9"
                    md="7"
                    lg="5"
                >
                    <v-card elevation="4">
                        <v-card-title>Inicio de Sesión</v-card-title>

                        <v-card-text>
                            <v-form v-model="validForm">
                                <v-text-field
                                    v-model="formData.rut"
                                    :rules="rutRules"
                                    label="RUT"
                                    autofocus
                                    @input="parseRut"
                                    @keypress="rutKeypress"
                                />

                                <v-text-field
                                    v-model="formData.password"
                                    :rules="[v => !!v || 'Contraseña es requerida']"
                                    type="password"
                                    label="Contraseña"
                                    class="input-password"
                                />

                                <v-row>
                                    <v-col>
                                        <v-btn
                                            class="btn-login"
                                            color="primary"
                                            block
                                            :disabled="!validForm"
                                            @click="submit"
                                        >
                                            Ingresar
                                        </v-btn>
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col>
                                        <v-btn
                                            class="btn-recover-password"
                                            color="primary"
                                            plain
                                            block
                                        >
                                            Recuperar contraseña
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </v-container>
</template>

<script>
import { rutRules } from './../static/rules/rut'
import { Error } from './../static/errors'
import { formatRut } from 'rutlib'

export default {
    layout: 'login',

    data() {

        return {
            loading   : false,
            validForm : false,
            formData  : {
                rut      : '',
                password : '',
            },

            showAlert    : false,
            alertMessage : '',

            rutRules,
        }

    },

    methods: {

        async submit() {

            if (this.validForm) {

                this.loading = true

                try {

                    await this.$auth.login( { data: this.formData } )
                    this.$router.push('/home')

                }
                catch (error) {

                    if (error.response) {

                        switch (error.response.status) {

                            case this.$httpStatus.NOT_FOUND: {

                                this.alertMessage = Error.UNKNOWN_USER
                                this.showAlert = true

                                break

                            }

                            case this.$httpStatus.FORBIDDEN: {

                                this.alertMessage = Error.INACTIVE_USER
                                this.showAlert = true

                                break

                            }

                            case this.$httpStatus.UNAUTHORIZED: {

                                this.alertMessage = Error.WRONG_PASSWORD
                                this.showAlert = true

                                break

                            }

                            default: {

                                this.alertMessage = Error.DEFAULT_ERROR_MESSAGE
                                this.showAlert = true

                            }

                        }

                    }
                    else {

                        this.alertMessage = Error.DEFAULT_ERROR_MESSAGE
                        this.showAlert = true

                    }

                    this.loading = false

                }

                this.loading = false

            }

        },

        rutKeypress(evt) {

            if (!/^[0-9kK]$/.test(evt.key) )
                evt.preventDefault()

        },

        parseRut(value) {

            this.formData.rut = formatRut(value)

        },
    },
}
</script>
