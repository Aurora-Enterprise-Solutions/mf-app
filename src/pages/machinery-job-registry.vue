<template>
    <v-container class="mf-page mf-page-machinery-job-registry">

        <v-form ref="form">

            <v-stepper v-model="step"
                       vertical
            >

                <!--STEP 1-->

                <v-stepper-step step="1">
                    Datos Generales
                </v-stepper-step>

                <v-stepper-content step="1">
                    <mf-date-picker v-model="formData.date"
                                    label="Fecha"
                                    :attrs="{
                                        max: now,
                                    }"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <v-select v-if="$auth.user.role.name === 'operator'"
                              v-model="formData.equipment"
                              :items="equipments"
                              label="Maquinaria"
                              item-value="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'La maquinaria es requerida' ]"
                              @change="setMachineryType"
                    >

                        <template #item="{ item }">
                            {{ item.code }} | {{ item.patent }} | {{ item.name }}
                        </template>

                        <template #selection="{ item }">
                            {{ item.code }} | {{ item.patent }} | {{ item.name }}
                        </template>

                    </v-select>

                    <v-select v-if="$auth.user.role.name === 'construction_manager'"
                              v-model="formData.equipment"
                              :items="equipments"
                              label="Maquinaria"
                              item-value="_id"
                              item-text="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'La maquinaria es requerida' ]"
                              @change="setMachineryType"
                    />

                    <v-btn color="primary" @click="step++">
                        Continuar
                    </v-btn>

                </v-stepper-content>


                <!--STEP 2-->
                <v-stepper-step step="2">
                    Ingreso de Uso
                </v-stepper-step>

                <v-stepper-content step="2">
                    <!-- MACHINERY -->

                    <v-text-field v-if="isMachinery"
                                  :value="formData.startHourmeter"
                                  label="Horómetro Inicial"
                                  type="number"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El horómetro inicial es requerido' ]"
                                  @input="formData.startHourmeter = parseFloat($event)"
                                  @change="calculateTotalHours"
                    />

                    <v-text-field v-if="isMachinery"
                                  :value="formData.endHourmeter"
                                  label="Horómetro Final"
                                  type="number"
                                  :disabled="loading"
                                  :rules="[
                                      v => !!v || 'El horómetro final es requerido',
                                      v => v > formData.startHourmeter || 'El horómetro final debe ser mayor al horómetro inicial'
                                  ]"
                                  @input="formData.endHourmeter = parseFloat($event)"
                                  @change="calculateTotalHours"
                    />

                    <v-text-field v-if="isMachinery"
                                  :value="formData.totalHours"
                                  label="Total de Horas"
                                  type="number"
                                  :disabled="true"
                                  @input="formData.totalHours = parseFloat($event)"
                    />


                    <!-- TRUCKS -->

                    <v-select v-if="isTruck"
                              v-model="formData.client"
                              :items="clients"
                              label="Cliente"
                              item-text="name"
                              item-value="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El cliente es requerido' ]"
                    >

                        <template #item="{ item }">
                            {{ item.billing.rut }} | {{ item.name }}
                        </template>

                        <template #selection="{ item }">
                            {{ item.billing.rut }} | {{ item.name }}
                        </template>

                    </v-select>

                    <v-select v-if="isTruck"
                              v-model="formData.building"
                              :items="buildings"
                              label="Obra"
                              item-text="building"
                              item-value="building"
                              :disabled="loading"
                              :loading="$apollo.queries.buildings.loading"
                              :rules="[ v => !!v || 'La obra es requerida' ]"
                    />


                    <!--BOTH CASE-->
                    <v-select v-if="isTruck && isByBoth"
                              v-model="formData.workCondition"
                              :items="TruckWorkConditions"
                              label="Condición de Trabajo"
                              item-text="label"
                              item-value="value"
                              :disabled="loading"
                              :rules="[ v => !!v || 'La condición de trabajo es requerida' ]"
                    />


                    <!--BY TRAVEL-->

                    <v-select v-if="isTruck && isByTravel"
                              v-model="formData.load"
                              :items="loads"
                              label="Tipo de Carga"
                              item-text="type"
                              item-value="type"
                              :disabled="loading"
                              :loading="$apollo.queries.loads.loading"
                              :rules="[ v => !!v || 'El tipo de carga es requerido' ]"
                    />

                    <v-text-field v-if="isTruck && isByTravel"
                                  :value="formData.totalTravels"
                                  label="Total de Viajes"
                                  type="number"
                                  :disabled="loading"
                                  @input="formData.totalTravels = Math.ceil(parseFloat($event))"
                    />


                    <!--BY DAY-->
                    <v-select v-if="isTruck && isByDay"
                              v-model="formData.workingDayType"
                              :items="workingDayTypes"
                              label="Tipo de Jornada"
                              item-text="label"
                              item-value="value"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El tipo de jornada es requerido' ]"
                    />

                    <v-select v-if="isTruck && isByDay"
                              v-model="formData.load"
                              :items="loads"
                              label="Tipo de Carga"
                              item-text="type"
                              item-value="type"
                              :disabled="loading"
                              :loading="$apollo.queries.loads.loading"
                              :rules="[ v => !!v || 'El tipo de carga es requerido' ]"
                    />


                    <v-btn color="primary" @click="step++">
                        Continuar
                    </v-btn>

                    <v-btn text @click="step--">
                        Volver
                    </v-btn>

                </v-stepper-content>


                <!--STEP 3-->
                <v-stepper-step step="3">
                    Observaciones y Firma
                </v-stepper-step>

                <v-stepper-content step="3">

                    <v-textarea v-model="formData.observations"
                                label="Observaciones"
                                outlined
                                :disabled="loading"
                    />

                    <mf-signature-pad ref="signaturePad"
                                      :label="$auth.user.role.name === 'operator' ? 'Firma Jefe de Obra' : 'Firma Operador'"
                                      :image.sync="formData.signature"
                                      :disabled="loading"
                    />

                    <v-btn color="primary" @click="submit">
                        Registrar
                    </v-btn>

                    <v-btn text @click="step--">
                        Volver
                    </v-btn>

                </v-stepper-content>

            </v-stepper>

        </v-form>

    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'
import { Error } from './../static/errors'
import { Message } from './../static/messages'
import { MachineryTypes } from './../components/MfEquipmentFormDialog'
import { TruckWorkConditions, TruckWorkConditionsTypes } from './../components/MfBookingFormDialog'
import { GraphqlTypename } from './../static/errors/graphql_typename'

export const WorkingDayTypes = [
    { label: 'COMPLETA', value: 'FULL' },
    { label: 'MEDIA', value: 'HALF' },
]

const defaultFormData = {
    machineryType  : MachineryTypes[0].value,
    date           : moment().format('YYYY-MM-DD'),
    startHourmeter : 0,
    endHourmeter   : 0,
    totalHours     : 0,
    client         : null,
    building       : null,
    load           : null,
}

export default {
    apollo: {
        clients: {
            query: gql`query {
                getAllClients {
                    _id,
                    name,
                    billing {
                        rut
                    }
                }
            }`,
            update: (data) => data.getAllClients,
        },

        buildings: {
            query: gql`query getBuildingsByClientAndDate($client: String!, $date: String!, $equipment: String!) {
                getBuildingsByClientAndDate(client: $client, date: $date, equipment: $equipment) {
                    building,
                }
            }`,
            update: (data) => data.getBuildingsByClientAndDate,
            variables() {

                return {
                    client    : this.formData.client,
                    date      : this.formData.date,
                    equipment : this.formData.equipment,
                }

            },

            fetchPolicy: 'network-only',
        },

        equipments: {
            query: gql`query getAllEquipmentsByBuilding($user: String!, $date: String!) {
                getAllEquipmentsByBuilding(user: $user, date: $date) {
                    __typename,
                    ...on EquipmentsByBooking {
                        equipments {
                            _id,
                            type,
                            name,
                            code,
                            patent,
                            workCondition,
                        }
                    }
                    ...on ExternalEquipmentsByBooking {
                        externalEquipments: equipments {
                            _id,
                            type,
                            minHours,
                            workCondition,
                        }
                    }
                }
            }`,

            update( { getAllEquipmentsByBuilding } ) {

                const isOperator = getAllEquipmentsByBuilding.__typename === 'EquipmentsByBooking'
                const equipments = isOperator
                    ? getAllEquipmentsByBuilding.equipments
                    : getAllEquipmentsByBuilding.externalEquipments

                this.formData.equipment = equipments.length > 0
                    ? equipments[0]._id
                    : null

                this.formData.machineryType = equipments.length > 0 ? equipments[0].type : null
                this.currentWorkCondition = equipments.length > 0 ? equipments[0].workCondition : null

                return equipments

            },

            variables() {

                return {
                    user : this.$auth.user._id,
                    date : this.formData.date,
                }

            },

            fetchPolicy: 'network-only',
        },

        loads: {
            query: gql`query getClient($client: String!) {
                getClient(client: $client) {
                    billing {
                        loads {
                            type,
                        }
                    }
                }
            }`,
            update: (data) => data.getClient.billing.loads,
            variables() {

                return {
                    client: this.formData.client,
                }

            },

            fetchPolicy: 'network-only',
        },

    },

    data() {

        return {
            loading  : false,
            step     : 1,
            formData : {
                ...defaultFormData,
            },

            MachineryTypes       : MachineryTypes.filter( (type) => type.value !== 'PICKUP'),
            TruckWorkConditions  : TruckWorkConditions.filter( (condition) => condition.value !== TruckWorkConditionsTypes.BOTH),
            workingDayTypes      : WorkingDayTypes,
            currentWorkCondition : null,
        }

    },

    computed: {

        now() {

            return moment().toISOString()

        },

        isTruck() {

            return this.formData.machineryType === 'TRUCK'

        },

        isMachinery() {

            return this.formData.machineryType === 'OTHER'

        },

        isByTravel() {

            if (!this.currentWorkCondition)
                return false

            if (this.currentWorkCondition === TruckWorkConditionsTypes.TRAVEL)
                return true
            else if (this.currentWorkCondition === TruckWorkConditionsTypes.BOTH && this.formData.workCondition === TruckWorkConditionsTypes.TRAVEL)
                return true

            return false

        },

        isByBoth() {

            return this.currentWorkCondition && this.currentWorkCondition === TruckWorkConditionsTypes.BOTH

        },

        isByDay() {

            if (!this.currentWorkCondition)
                return false

            if (this.currentWorkCondition === TruckWorkConditionsTypes.DAY)
                return true
            else if (this.currentWorkCondition === TruckWorkConditionsTypes.BOTH && this.formData.workCondition === TruckWorkConditionsTypes.DAY)
                return true

            return false

        },

    },

    methods: {
        calculateTotalHours() {

            this.formData.totalHours = this.formData.endHourmeter - this.formData.startHourmeter

        },

        setMachineryType(equipmentId) {

            this.formData.machineryType = this.equipments.find( (equipment) => equipment._id === equipmentId).type
            this.currentWorkCondition = this.equipments.find( (equipment) => equipment._id === equipmentId).workCondition

            this.$apollo.queries.buildings.refetch()

        },

        submit() {

            if (this.$refs.form.validate() ) {

                this.loading = true

                this.$apollo.mutate( {
                    mutation: gql`mutation ($form: MachineryJobRegistryInput!) {
                    createMachineryJobRegistry(form: $form) {
                        __typename
                    }
                }`,

                    variables: {
                        form: {
                            ...this.formData,
                            signature: this.$refs.signaturePad.getValue(),
                        },
                    },
                } )
                    .then( ( { data: { createMachineryJobRegistry } } ) => {

                        this.responseParser(createMachineryJobRegistry.__typename)

                        this.formData = {
                            ...defaultFormData,
                        }
                        this.currentWorkCondition = null
                        this.$refs.signaturePad.reset()
                        this.step = 1

                        this.loading = false

                    } )
                    .catch( () => {

                        this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                        this.loading = false

                    } )

            }
            else {

                this.$alert(Error.COMPLETE_FIELDS, 'error')

            }

        },

        responseParser(typename) {

            switch (typename) {

                case GraphqlTypename.OK:
                    this.$alert(Message.MACHINERY_JOB_REGISTRY_CREATED)

                    break

                default:
                    this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')

                    break

            }

        },
    },
}
</script>
