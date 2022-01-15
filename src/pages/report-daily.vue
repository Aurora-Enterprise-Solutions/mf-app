<template>
    <v-container class="mf-page mf-page-report-daily">

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
import { newEmptyWorkbook, addWorksheet, setExcelHeader, addExcelRow, saveExcelFile, mainColor, autoWidth } from './../static/utils/excel'

moment.locale('es')

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
                    query: gql`query getDailyResume($date: String!) {
                        getDailyResume(date: $date) {
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

        generateExcelFile(data) {

            const workbook = newEmptyWorkbook()
            const worksheet = addWorksheet(workbook, 'Reporte Diario')
            setExcelHeader(workbook, worksheet)

            addExcelRow(workbook, worksheet, [ `Fecha: ${moment(this.formData.date).format('DD-MM-YYYY')}` ], { isHeader: true, bordered: false } )
            addExcelRow(workbook, worksheet, [ 'EQUIPOS INTERNOS' ], { isHeader: true, bordered: false } )


            const machineryHeaders = [ 'Equipo', 'Obra', 'Operador', 'Ubicación', '', 'Horómetro Inicial', 'Horómetro Final', 'Total Horas', 'Observaciones' ]
            let addedRow = addExcelRow(workbook, worksheet, machineryHeaders, { isHeader: true } )

            addedRow.row.eachCell( (cell, colNumber) => {

                cell.alignment = { horizontal: 'center' }

            } )
            worksheet.mergeCells(addedRow.lastRowNumber, 7, addedRow.lastRowNumber, 8)

            data.intern.machinery.forEach( (item) => {

                const { row, lastRowNumber } = addExcelRow(workbook, worksheet, [
                    item.equipment,
                    item.building,
                    item.operator,
                    item.address,
                    '',
                    item.startHourmeter,
                    item.endHourmeter,
                    item.totalHours,
                    item.observations,
                ] )

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )
                worksheet.mergeCells(lastRowNumber, 7, lastRowNumber, 8)

            } )


            const truckHeaders = [ 'Camión', 'Operador', 'Volumen m3', 'Obra', 'Ubicación', 'Tipo de Carga', 'Nro. Viajes', 'Jornada', 'Observaciones' ]
            addedRow = addExcelRow(workbook, worksheet, truckHeaders, { isHeader: true } )

            addedRow.row.eachCell( (cell, colNumber) => {

                cell.alignment = { horizontal: 'center' }

            } )

            data.intern.trucks.forEach( (item) => {

                const { row, lastRowNumber } = addExcelRow(workbook, worksheet, [
                    item.equipment,
                    item.operator,
                    item.volume,
                    item.building,
                    item.address,
                    item.load,
                    item.totalTravels,
                    item.workingDayType,
                    item.observations,
                ] )

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )

            } )


            addExcelRow(workbook, worksheet, [ 'EQUIPOS EXTERNOS' ], { isHeader: true, bordered: false } )


            addedRow = addExcelRow(workbook, worksheet, machineryHeaders, { isHeader: true } )

            addedRow.row.eachCell( (cell, colNumber) => {

                cell.alignment = { horizontal: 'center' }

            } )
            worksheet.mergeCells(addedRow.lastRowNumber, 7, addedRow.lastRowNumber, 8)

            data.extern.machinery.forEach( (item) => {

                const { row, lastRowNumber } = addExcelRow(workbook, worksheet, [
                    item.equipment,
                    item.building,
                    item.operator,
                    item.address,
                    '',
                    item.startHourmeter,
                    item.endHourmeter,
                    item.totalHours,
                    item.observations,
                ] )

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )
                worksheet.mergeCells(lastRowNumber, 7, lastRowNumber, 8)

            } )


            addedRow = addExcelRow(workbook, worksheet, truckHeaders, { isHeader: true } )

            addedRow.row.eachCell( (cell, colNumber) => {

                cell.alignment = { horizontal: 'center' }

            } )

            data.extern.trucks.forEach( (item) => {

                const { row, lastRowNumber } = addExcelRow(workbook, worksheet, [
                    item.equipment,
                    item.operator,
                    item.volume,
                    item.building,
                    item.address,
                    item.load,
                    item.totalTravels,
                    item.workingDayType,
                    item.observations,
                ] )

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )

            } )

            autoWidth(worksheet)
            saveExcelFile(workbook, 'reporte_diario')

        },
    },
}
</script>
