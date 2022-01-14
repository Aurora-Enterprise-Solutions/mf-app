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


            // // 1: sort by date
            // const sortedData = data.sort( (a, b) => new Date(a.date) - new Date(b.date) )

            // // 2: filter by OTHER
            // const machineryData = sortedData.filter( (item) => item.machineryType === 'OTHER')

            // // 3: add worksheet

            // if (machineryData.length > 0) {

            //     const worksheet = addWorksheet(workbook, 'Operador')
            //     setExcelHeader(workbook, worksheet)

            //     addExcelRow(workbook, worksheet, [ `Operador: ${machineryData[0].executor.rut} | ${machineryData[0].executor.name}` ], { isHeader: true, bordered: false } )

            //     const headers = [ 'Fecha', 'Horómetro Inicial', 'Horómetro Final', 'Horas Máquina', 'Total Horas', 'Semanas Corridas' ]
            //     addExcelRow(workbook, worksheet, headers, { isHeader: true } )

            //     let currentWeek = 0
            //     let sumHours = 0
            //     let sumDays = 0

            //     let totalHours = 0
            //     let totalDays = 0

            //     for (const [ index, item ] of machineryData.entries() ) {

            //         currentWeek = moment.utc(item.date).week()

            //         const isSaturday = moment.utc(item.date).day() === 6
            //         const isLastDayOfWeek = machineryData[index + 1] && moment.utc(machineryData[index + 1].date).week() !== currentWeek ? true : false

            //         sumDays++
            //         totalDays++
            //         sumHours += isSaturday ? item.totalHours * 2 : item.totalHours
            //         totalHours += isSaturday ? item.totalHours * 2 : item.totalHours

            //         const newRow = [
            //             moment.utc(item.date).format('dddd DD [de] MMMM [de] YYYY'),
            //             item.startHourmeter,
            //             item.endHourmeter,
            //             item.totalHours,
            //             isSaturday ? item.totalHours * 2 : item.totalHours,
            //             isLastDayOfWeek || index === (machineryData.length - 1) ? (Math.round( (sumHours / sumDays) * 10) / 10) : 0,
            //         ]

            //         const { row } = addExcelRow(workbook, worksheet, newRow)

            //         row.eachCell( (cell, colNumber) => {

            //             cell.alignment = { horizontal: 'center' }

            //         } )

            //         sumHours = isLastDayOfWeek ? 0 : sumHours
            //         sumDays = isLastDayOfWeek ? 0 : sumDays

            //     }

            //     // add total
            //     let firstCol = 0
            //     const { row } = addExcelRow(workbook, worksheet, [ '', '', '', 'Total horas: ', totalHours, (Math.round( (totalHours / totalDays) * 10) / 10) ], { bordered: false } )
            //     row.eachCell( (cell, colNumber) => {

            //         if (firstCol === 0 && cell.value)
            //             firstCol = colNumber

            //         cell.border = {
            //             top    : firstCol > 0 && colNumber >= firstCol ? { style: 'thin', color: { argb: mainColor } } : undefined,
            //             left   : colNumber === firstCol ? { style: 'thin', color: { argb: mainColor } } : undefined,
            //             bottom : firstCol > 0 && colNumber >= firstCol ? { style: 'thin', color: { argb: mainColor } } : undefined,
            //             right  : colNumber === row.cellCount ? { style: 'thin', color: { argb: mainColor } } : undefined,
            //         }

            //         cell.font = {
            //             bold  : false,
            //             color : { argb: mainColor },
            //         }

            //         cell.alignment = { horizontal: 'center' }

            //     } )

            //     saveExcelFile(workbook, 'horas_trabajadas')

            // }
            // else {

            //     this.$alert('No hay datos para generar el archivo', 'info')

            // }

        },
    },
}
</script>
