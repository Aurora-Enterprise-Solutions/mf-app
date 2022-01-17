<template>
    <v-container class="mf-page mf-page-pay-states-daily">

        <v-card :loading="loading">
            <v-card-title>{{ title }}</v-card-title>

            <v-card-text>

                <v-form ref="form">

                    <mf-date-picker v-model="formData.date"
                                    label="Fecha"
                                    :attrs="{
                                        max: now,
                                    }"
                                    :disabled="loading"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <v-btn block color="primary" :disabled="loading" @click="submit">
                        Descargar
                    </v-btn>

                </v-form>

            </v-card-text>
        </v-card>

    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { Error } from './../static/errors'

export default {
    data() {

        return {
            loading  : false,
            formData : {
                date: moment().format('YYYY-MM-DD'),
            },
        }

    },

    computed: {
        ...mapGetters( {
            title: 'navbar/getTitle',
        } ),

        now() {

            return moment().toISOString()

        },
    },

    methods: {
        submit() {

            if (this.$refs.form.validate() ) {

                this.loading = true

                this.$apollo.query( {
                    query: gql`query getDailyPayState($date: String!) {
                        getDailyPayState(date: $date) {
                            intern {
                                machinery {
                                    equipment,
                                    building,
                                    operator,
                                    address,
                                    startHourmeter,
                                    endHourmeter,
                                    totalHours,
                                    observations,
                                },

                                trucks {
                                    equipment,
                                    operator,
                                    volume,
                                    building,
                                    address,
                                    load,
                                    totalTravels,
                                    workingDayType,
                                    observations,
                                },
                            },

                            extern {
                                machinery {
                                    equipment,
                                    building,
                                    operator,
                                    address,
                                    startHourmeter,
                                    endHourmeter,
                                    totalHours,
                                    observations,
                                },

                                trucks {
                                    equipment,
                                    operator,
                                    volume,
                                    building,
                                    address,
                                    load,
                                    totalTravels,
                                    workingDayType,
                                    observations,
                                },
                            }
                        }
                    }`,

                    variables: {
                        ...this.formData,
                    },

                    fetchPolicy: 'network-only',
                } )
                    .then( ( { data: { getDailyResume } } ) => {

                        this.generateExcelFile(getDailyResume)
                        this.loading = false

                    } )
                    .catch( (error) => {

                        console.warn(error)
                        this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                        this.loading = false

                    } )

            }

        },
    },
}
</script>
