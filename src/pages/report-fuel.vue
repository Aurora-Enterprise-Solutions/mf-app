<template>
    <v-container class="mf-page mf-page-report-fuel">

        <v-card :loading="loading">
            <v-card-title>{{ title }}</v-card-title>

            <v-card-text>

                <v-form ref="form">

                    <mf-date-picker v-model="formData.startDate"
                                    label="Fecha Inicio"
                                    :attrs="{
                                        max: now,
                                    }"
                                    :disabled="loading"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <mf-date-picker v-model="formData.endDate"
                                    label="Fecha Término"
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
import { newEmptyWorkbook, addWorksheet, setExcelHeader, addExcelRow, saveExcelFile, mainColor } from './../static/utils/excel'
import { FuelTypes } from './machinery-fuel-registry.vue'

moment.locale('es')

export default {
    data() {

        return {
            loading  : false,
            formData : {
                startDate : moment().format('YYYY-MM-DD'),
                endDate   : moment().format('YYYY-MM-DD'),
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
                    query: gql`query getAllFuelRegistries($startDate: String!, $endDate: String!) {
                        getAllFuelRegistries(startDate: $startDate, endDate: $endDate) {
                            _id,
                            count,
                            hourmeter,
                            operator {
                                __typename,
                                ...on InternalOperator {
                                    _id,
                                    name,
                                    rut,
                                },
                                ...on ExternalOperator {
                                    name,
                                },
                            },
                            equipment {
                                __typename,
                                ...on InternalEquipment {
                                    _id,
                                    name,
                                    code,
                                    patent,
                                },
                                ...on ExternalEquipment {
                                    name,
                                },
                            },
                            type,
                            date,
                            guia,
                            previousRegistry,
                            time,
                        }
                    }`,

                    variables: {
                        ...this.formData,
                    },

                    fetchPolicy: 'network-only',
                } )
                    .then( ( { data: { getAllFuelRegistries } } ) => {

                        this.generateExcelFile(getAllFuelRegistries)
                        this.loading = false

                    } )
                    .catch( (error) => {

                        console.warn(error)
                        this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                        this.loading = false

                    } )

            }

        },

        async generateExcelFile(data) {

            if (data.length === 0) {

                this.$alert('No hay datos para generar el archivo', 'info')

                return

            }

            const workbook = newEmptyWorkbook()
            const worksheet = addWorksheet(workbook, 'Registro de Combustible')
            setExcelHeader(workbook, worksheet)

            const headers = [ 'Fecha', 'Operación', 'Equipo', 'Litros', 'Horómetro Anterior', 'Horómetro', 'Total', 'Consumo L/hr', 'Hora', 'Guía', 'Operador' ]
            const { row } = addExcelRow(workbook, worksheet, headers, { isHeader: true } )

            row.eachCell( (cell, colNumber) => {

                cell.alignment = { horizontal: 'center' }

            } )


            const { data: { getAllPreviousFuelRegistries } } = await this.$apollo.query( {
                query: gql`query getAllPreviousFuelRegistries($equipments: [String!]!) {
                    getAllPreviousFuelRegistries(equipments: $equipments) {
                        _id,
                        count,
                        hourmeter,
                        operator {
                            __typename,
                            ...on InternalOperator {
                                _id,
                                name,
                                rut,
                            },
                            ...on ExternalOperator {
                                name,
                            },
                        },
                        equipment {
                            __typename,
                            ...on InternalEquipment {
                                _id,
                                name,
                                code,
                                patent,
                            },
                            ...on ExternalEquipment {
                                name,
                            },
                        },
                        type,
                        date,
                        guia,
                        previousRegistry,
                    }
                }`,

                variables: {
                    equipments: data.reduce( (acc, item) => {

                        if (item.equipment.__typename === 'InternalEquipment' && item.previousRegistry)
                            acc.push(item.previousRegistry)


                        return acc

                    }, [] ),

                    date: this.formData.startDate,
                },

                fetchPolicy: 'network-only',
            } )


            data.forEach( (item) => {

                const previous = item.previousRegistry ? getAllPreviousFuelRegistries.find( (previous) => previous._id === item.previousRegistry).hourmeter : 0
                const type = FuelTypes.find( (type) => type.value === item.type).text


                const newRow = [
                    moment.utc(item.date).format('DD-MM-YYYY'),
                    type,
                    item.equipment.__typename === 'InternalEquipment' ? `${item.equipment.code} | ${item.equipment.name}` : item.equipment.name,
                    item.count,
                    previous,
                    item.hourmeter,
                    item.hourmeter - previous,
                    item.hourmeter ? (item.count / item.hourmeter).toFixed(2) : '-',
                    item.time,
                    item.guia ? item.guia : '',
                    item.operator.__typename === 'InternalOperator' ? `${item.operator.rut} | ${item.operator.name}` : item.operator.name,
                ]

                const { row } = addExcelRow(workbook, worksheet, newRow)

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )

            } )

            saveExcelFile(workbook, 'combustible')

        },
    },
}
</script>
