<template>
    <v-container class="mf-page mf-page-pay-states-client">

        <v-card :loading="loading || $apollo.queries.payStatesFilters.loading">
            <v-card-title>{{ title }}</v-card-title>

            <v-card-text>

                <v-form ref="form">

                    <mf-date-picker v-model="formData.startDate"
                                    label="Fecha Inicio"
                                    :attrs="{
                                        max: now,
                                    }"
                                    :disabled="loading || $apollo.queries.payStatesFilters.loading"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <mf-date-picker v-model="formData.endDate"
                                    label="Fecha Fin"
                                    :attrs="{
                                        max: now,
                                    }"
                                    :disabled="loading || $apollo.queries.payStatesFilters.loading"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <v-select v-model="formData.client"
                              :items="clients"
                              label="Cliente"
                              item-text="name"
                              item-value="_id"
                              :disabled="loading || $apollo.queries.payStatesFilters.loading"
                              :rules="[ v => !!v || 'El cliente es requerido' ]"
                              @change="setBuildings"
                    >

                        <template #item="{ item }">
                            {{ item.billing.rut }} | {{ item.name }}
                        </template>

                        <template #selection="{ item }">
                            {{ item.billing.rut }} | {{ item.name }}
                        </template>

                    </v-select>

                    <v-select v-model="formData.building"
                              :items="buildings"
                              label="Obra"
                              item-text="name"
                              item-value="name"
                              clearable
                              :disabled="loading || $apollo.queries.payStatesFilters.loading"
                              @change="setEquipments"
                    />

                    <v-select v-model="formData.equipment"
                              :items="equipments"
                              label="Maquinaria"
                              item-value="_id"
                              clearable
                              :disabled="loading || $apollo.queries.payStatesFilters.loading"
                    >

                        <template #item="{ item }">
                            {{ item.__typename === 'PayStateFilterExternalMachine' ? item.name : `${item.code} | ${item.name}` }}
                        </template>

                        <template #selection="{ item }">
                            {{ item.__typename === 'PayStateFilterExternalMachine' ? item.name : `${item.code} | ${item.name}` }}
                        </template>

                    </v-select>

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
import { generateGeneralPayStatePdf } from './../static/utils/pdf'

moment.locale('es')

export default {
    apollo: {
        payStatesFilters: {
            query: gql`query getBookingsForPayStates($startDate: String!, $endDate: String!) {
                getBookingsForPayStates(startDate: $startDate, endDate: $endDate) {
                    clients {
                        _id,
                        name,
                        billing {
                            rut
                        }
                    },
                    buildings {
                        name,
                        clientId,
                    },
                    equipments {
                        __typename,
                        ...on PayStateFilterInternalMachine {
                            _id,
                            name,
                            code,
                            fromBuilding,
                            fromClient,
                        },
                        ...on PayStateFilterExternalMachine {
                            _id: name,
                            name,
                            fromBuilding,
                            fromClient,
                        },
                    },
                }
            }`,

            update( { getBookingsForPayStates } ) {

                this.formData.client = null
                this.formData.building = null
                this.formData.equipment = null
                this.clients = getBookingsForPayStates.clients

                return getBookingsForPayStates

            },

            variables() {

                return {
                    startDate : this.formData.startDate,
                    endDate   : this.formData.endDate,
                }

            },
        },
    },

    data() {

        return {
            loading  : false,
            formData : {
                startDate : moment().format('YYYY-MM-DD'),
                endDate   : moment().format('YYYY-MM-DD'),
            },

            clients    : [],
            buildings  : [],
            equipments : [],
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
                    query: gql`query getEquipmentPayState($filters: PayStatesFilter!) {
                        getEquipmentPayState(filters: $filters) {
                            intern {
                                OTHER {
                                    client {
                                        name,
                                    },
                                    date,
                                    building,
                                    operator {
                                        __typename,
                                        ...on ExternalOperator {
                                            name,
                                        },
                                        ...on InternalOperator {
                                            _id,
                                            rut,
                                            name,
                                        },
                                    },
                                    equipment {
                                        __typename,
                                        ...on InternalEquipment {
                                            code,
                                        },
                                        ...on ExternalEquipment {
                                            name,
                                        },
                                    },
                                    amountPerUse,
                                    hours,
                                    minHours,
                                    toFacture,
                                    totalAmount,
                                    folio,
                                },

                                TRUCK {
                                    client {
                                        name,
                                    },
                                    date,
                                    building,
                                    operator {
                                        __typename,
                                        ...on ExternalOperator {
                                            name,
                                        },
                                        ...on InternalOperator {
                                            _id,
                                            rut,
                                            name,
                                        },
                                    },
                                    equipment {
                                        __typename,
                                        ...on InternalEquipment {
                                            code,
                                        },
                                        ...on ExternalEquipment {
                                            name,
                                        },
                                    },
                                    volume,
                                    load,
                                    totalTravels,
                                    workingDayType,
                                    totalAmount,
                                    amountPerUse,
                                    workCondition,
                                    folio,
                                }
                            },
                            extern {
                                OTHER {
                                    client {
                                        name,
                                    },
                                    date,
                                    building,
                                    operator {
                                        __typename,
                                        ...on ExternalOperator {
                                            name,
                                        },
                                        ...on InternalOperator {
                                            _id,
                                            rut,
                                            name,
                                        },
                                    },
                                    equipment {
                                        __typename,
                                        ...on InternalEquipment {
                                            code,
                                        },
                                        ...on ExternalEquipment {
                                            name,
                                        },
                                    },
                                    amountPerUse,
                                    hours,
                                    minHours,
                                    toFacture,
                                    totalAmount,
                                    folio,
                                },

                                TRUCK {
                                    client {
                                        name,
                                    },
                                    date,
                                    building,
                                    operator {
                                        __typename,
                                        ...on ExternalOperator {
                                            name,
                                        },
                                        ...on InternalOperator {
                                            _id,
                                            rut,
                                            name,
                                        },
                                    },
                                    equipment {
                                        __typename,
                                        ...on InternalEquipment {
                                            code,
                                        },
                                        ...on ExternalEquipment {
                                            name,
                                        },
                                    },
                                    volume,
                                    load,
                                    totalTravels,
                                    workingDayType,
                                    totalAmount,
                                    amountPerUse,
                                    workCondition,
                                    folio,
                                }
                            }
                        }
                    }`,

                    variables: {
                        filters: {
                            ...this.formData,
                        },
                    },

                    fetchPolicy: 'network-only',
                } )
                    .then( ( { data: { getEquipmentPayState } } ) => {

                        const numeral = require('numeral')
                        require('numeral/locales/es')

                        numeral.locale('es')

                        const parsedeData = {
                            intern: {
                                OTHER                 : [],
                                TRUCK                 : [],
                                totalOther            : 0,
                                totalToFactureOther   : 0,
                                totalOtherIva         : 0,
                                totalIvaIncludedOther : 0,
                            },

                            extern: {
                                OTHER                 : [],
                                TRUCK                 : [],
                                totalOther            : 0,
                                totalToFactureOther   : 0,
                                totalOtherIva         : 0,
                                totalIvaIncludedOther : 0,
                            },
                        }

                        parsedeData.intern.OTHER = getEquipmentPayState.intern.OTHER.map( (item) => {

                            parsedeData.intern.totalOther += item.totalAmount
                            parsedeData.intern.totalToFactureOther += item.toFacture

                            return {
                                client       : item.client.name,
                                date         : moment.utc(item.date).format('dddd DD [de] MMMM [de] YYYY'),
                                building     : item.building,
                                operator     : item.operator.name,
                                equipment    : item.equipment.__typename === 'ExternalEquipment' ? item.equipment.name : item.equipment.code,
                                hours        : item.hours,
                                minHours     : item.minHours,
                                toFacture    : item.toFacture,
                                folio        : item.folio,
                                amountPerUse : numeral(item.amountPerUse).format('$0,0'),
                                totalAmount  : numeral(item.totalAmount).format('$0,0'),
                            }

                        } )

                        parsedeData.extern.OTHER = getEquipmentPayState.extern.OTHER.map( (item) => {

                            parsedeData.extern.totalOther += item.totalAmount
                            parsedeData.extern.totalToFactureOther += item.toFacture

                            return {
                                client       : item.client.name,
                                date         : moment.utc(item.date).format('dddd DD [de] MMMM [de] YYYY'),
                                building     : item.building,
                                operator     : item.operator.name,
                                equipment    : item.equipment.__typename === 'ExternalEquipment' ? item.equipment.name : item.equipment.code,
                                hours        : item.hours,
                                minHours     : item.minHours,
                                toFacture    : item.toFacture,
                                folio        : item.folio,
                                amountPerUse : numeral(item.amountPerUse).format('$0,0'),
                                totalAmount  : numeral(item.totalAmount).format('$0,0'),
                            }

                        } )

                        parsedeData.intern.totalIvaIncludedOther = numeral(parsedeData.intern.totalOther * 1.19).format('$0,0')
                        parsedeData.extern.totalIvaIncludedOther = numeral(parsedeData.extern.totalOther * 1.19).format('$0,0')

                        parsedeData.intern.totalOtherIva = numeral(parsedeData.intern.totalOther * 0.19).format('$0,0')
                        parsedeData.extern.totalOtherIva = numeral(parsedeData.extern.totalOther * 0.19).format('$0,0')

                        parsedeData.intern.totalOther = numeral(parsedeData.intern.totalOther).format('$0,0')
                        parsedeData.extern.totalOther = numeral(parsedeData.extern.totalOther).format('$0,0')

                        parsedeData.intern.TRUCK = getEquipmentPayState.intern.TRUCK.map( (item) => {

                            return {
                                client         : item.client.name,
                                date           : moment.utc(item.date).format('dddd DD [de] MMMM [de] YYYY'),
                                building       : item.building,
                                operator       : item.operator.name,
                                equipment      : item.equipment.__typename === 'ExternalEquipment' ? item.equipment.name : item.equipment.code,
                                toFacture      : numeral(item.totalAmount).format('$0,0'),
                                folio          : item.folio,
                                amountPerUse   : numeral(item.amountPerUse).format('$0,0'),
                                totalTravels   : item.totalTravels,
                                workingDayType : item.workingDayType,
                                workCondition  : item.workCondition,
                                load           : item.load,
                                volume         : item.volume,
                                totalAmount    : item.totalAmount,
                            }

                        } )

                        parsedeData.extern.TRUCK = getEquipmentPayState.extern.TRUCK.map( (item) => {

                            return {
                                client         : item.client.name,
                                date           : moment.utc(item.date).format('dddd DD [de] MMMM [de] YYYY'),
                                building       : item.building,
                                operator       : item.operator.name,
                                equipment      : item.equipment.__typename === 'ExternalEquipment' ? item.equipment.name : item.equipment.code,
                                toFacture      : numeral(item.totalAmount).format('$0,0'),
                                folio          : item.folio,
                                amountPerUse   : numeral(item.amountPerUse).format('$0,0'),
                                totalTravels   : item.totalTravels,
                                workingDayType : item.workingDayType,
                                workCondition  : item.workCondition,
                                load           : item.load,
                                volume         : item.volume,
                                totalAmount    : item.totalAmount,
                            }

                        } )

                        if (parsedeData.intern.OTHER.length > 0 || parsedeData.intern.TRUCK.length > 0 || parsedeData.extern.OTHER.length > 0 || parsedeData.extern.TRUCK.length > 0) {

                            generateGeneralPayStatePdf( {
                                title  : 'estado_pago',
                                data   : parsedeData,
                                client : this.payStatesFilters.clients.find( (c) => c._id === this.formData.client).name || '',
                            } )

                        }
                        else {

                            this.$alert('No hay datos para generar el archivo', 'info')

                        }

                        this.loading = false

                    } )
                    .catch( (error) => {

                        console.warn(error)
                        this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                        this.loading = false

                    } )

            }

        },

        setBuildings(clientId) {

            this.buildings = this.payStatesFilters.buildings.filter( (building) => building.clientId === clientId)
            this.setEquipments()

        },

        setEquipments() {

            this.equipments = this.payStatesFilters.equipments.filter( (equipment) => {

                const isFilteredByBuilding = this.formData.building ? equipment.fromBuilding.some( (building) => building === this.formData.building) : true
                const isFilteredByClient = this.formData.client ? equipment.fromClient.some( (client) => client === this.formData.client) : true

                return isFilteredByBuilding && isFilteredByClient

            } )

        },
    },
}
</script>
