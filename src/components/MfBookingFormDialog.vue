<template>
    <v-dialog :value="value"
              fullscreen
              hide-overlay
              scrollable
              transition="dialog-bottom-transition"
              class="mf-component mf-component-booking-form-dialog"
              @input="$emit('input', $event)"
    >

        <v-card class="mf-component-booking-form-dialog-card" :loading="loading">

            <!-- Header -->
            <v-card-title>

                <v-toolbar dark color="primary">

                    <v-btn icon dark :disabled="loading" @click="$emit('input', false)">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>

                    <v-toolbar-title>{{ isNew ? 'Nuevo Arriendo' : 'Editar Arriendo' }}</v-toolbar-title>
                    <v-spacer />

                    <v-toolbar-items>
                        <v-btn dark text :disabled="loading" @click="onSave">
                            Guardar
                        </v-btn>
                    </v-toolbar-items>

                </v-toolbar>

            </v-card-title>


            <!-- Body -->
            <v-card-text>

                <v-form v-model="validForm">

                    <div class="text-overline sub-title">
                        Datos del arriendo
                    </div>
                    <v-divider />

                    <v-select v-model="formData.type"
                              :items="types"
                              label="Tipo de Arriendo"
                              item-text="label"
                              item-value="value"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El tipo de arriendo es requerido' ]"
                              @change="onTypeChange"
                    />
                    <p>
                        Tipos de Arriendos:<br>
                        Interna: maquinaria de la empresa.<br>
                        Externa: maquinaria de terceros.
                    </p>

                    <v-select v-if="isExternal"
                              v-model="formData.constructionManager"
                              :items="constructionManagers"
                              label="Jefe de Obra"
                              item-text="name"
                              item-value="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El jefe de obra es requerido' ]"
                              @change="addConstructionManagerEmailAddress"
                    >

                        <template #item="{ item }">
                            {{ item.rut }} | {{ item.name }}
                        </template>

                    </v-select>

                    <v-select v-model="formData.client"
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

                    </v-select>

                    <v-select v-if="isExternal"
                              v-model="formData.machineryType"
                              :items="MachineryTypes"
                              label="Tipo de Maquinaria"
                              item-text="label"
                              item-value="value"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El tipo de maquinaria es requerido' ]"
                              @change="onChangeEquipmentType"
                    />


                    <!-- MACHINERY -->

                    <v-select v-if="isInternal"
                              v-model="formData.equipment"
                              :items="equipments"
                              label="Maquinaria"
                              item-text="name"
                              item-value="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'La maquinaria es requerida' ]"
                              @change="onChangeEquipment"
                    >

                        <template #item="{ item }">
                            {{ item.code }} | {{ item.name }}
                        </template>

                    </v-select>

                    <v-text-field v-if="isExternal"
                                  v-model="formData.equipment"
                                  label="Maquinaria"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'La maquinaria es requerida' ]"
                    />


                    <!-- OPERATOR -->

                    <v-select v-if="isInternal"
                              v-model="formData.operator"
                              :items="operators"
                              label="Operador"
                              item-text="name"
                              item-value="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El operador es requerido' ]"
                              @change="addOperatorEmailAddress"
                    >

                        <template #item="{ item }">
                            {{ item.rut }} | {{ item.name }}
                        </template>

                    </v-select>

                    <v-text-field v-if="isExternal"
                                  v-model="formData.operator"
                                  label="Operador"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El operador es requerido' ]"
                    />


                    <v-text-field v-if="isOther"
                                  :value="formData.minHours"
                                  label="Horas Mínimas"
                                  type="number"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'Las horas mínimas son requeridas' ]"
                                  @input="formData.minHours = parseFloat($event)"
                    />

                    <v-text-field v-if="isOther"
                                  :value="formData.amountPerHour"
                                  label="Monto por Hora"
                                  type="number"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El monto por hora es requerido' ]"
                                  @input="formData.amountPerHour = parseFloat($event)"
                    />

                    <v-select v-if="isTruck || isPickup"
                              v-model="formData.workCondition"
                              :items="workContidions"
                              label="Condición de Trabajo"
                              item-text="label"
                              item-value="value"
                              :disabled="loading"
                              :rules="[ v => !!v || 'La condición de trabajo es requerida' ]"
                    />


                    <div class="text-overline sub-title">
                        Datos de la obra
                    </div>
                    <v-divider />

                    <v-text-field v-if="isExternal"
                                  v-model="formData.company"
                                  label="Compañía Externa"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'La compañía es requerida' ]"
                    />

                    <v-text-field v-model="formData.building"
                                  label="Obra"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'La obra es requerida' ]"
                    />

                    <mf-date-picker v-model="formData.startDate"
                                    label="Fecha Inicio"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <mf-date-picker v-model="formData.endDate"
                                    label="Fecha Término"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <v-text-field v-model="formData.address"
                                  label="Dirección"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'La dirección es requerida' ]"
                    />

                    <v-expansion-panels :disabled="loading">
                        <v-expansion-panel>
                            <v-expansion-panel-header>
                                <v-row align="center">
                                    <v-col cols="auto">
                                        Receptores
                                    </v-col>

                                    <v-spacer />

                                    <v-col cols="auto">
                                        <v-btn color="primary" small :disabled="loading" @click.stop="onAddReceiver">
                                            Agregar
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-expansion-panel-header>

                            <v-expansion-panel-content>

                                <v-row v-for="(receiver, index) of formData.receivers" :key="index" class="receiver-row">
                                    <v-col>
                                        <v-text-field :value="formData.receivers[index].email"
                                                      label="Correo Electrónico"
                                                      :disabled="!formData.receivers[index].editable || loading"
                                                      :rules="emailRules"
                                                      @input="$set(formData.receivers, index, { editable: true, email: $event})"
                                        />
                                    </v-col>

                                    <v-col cols="auto">
                                        <v-btn v-if="formData.receivers[index].editable"
                                               icon
                                               color="error"
                                               :disabled="loading"
                                               @click="onDeleteReceiver(index)"
                                        >
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>

                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>

                </v-form>

            </v-card-text>
        </v-card>

    </v-dialog>
</template>

<script>
import gql from 'graphql-tag'
import { Error } from '../static/errors'
import { GraphqlTypename } from '../static/errors/graphql_typename'
import { emailRules } from '../static/rules/email'
import { MachineryTypes } from './MfEquipmentFormDialog'

export const BookingTypes = [
    { label: 'Interna', value: 'INTERNAL' },
    { label: 'Externa', value: 'EXTERNAL' },
]

export default {
    name: 'MfBookingFormDialog',

    props: {
        value: {
            require : true,
            type    : Boolean,
        },

        data: {
            require : true,
            type    : Object,
            default : () => ( {} ),
        },

        clients: {
            require : true,
            type    : Array,
            default : () => ( [] ),
        },

        equipments: {
            require : true,
            type    : Array,
            default : () => ( [] ),
        },

        operators: {
            require : true,
            type    : Array,
            default : () => ( [] ),
        },

        constructionManagers: {
            require : true,
            type    : Array,
            default : () => ( [] ),
        },

        isNew: {
            require : true,
            type    : Boolean,
        },
    },

    data() {

        return {
            validForm : false,
            formData  : {},
            loading   : false,

            emailRules,

            types: BookingTypes,

            MachineryTypes,

            workContidions: [
                { label: 'Por Viaje', value: 'TRAVEL' },
                { label: 'Por Jornada', value: 'DAY' },
                { label: 'Ambos', value: 'BOTH' },
            ],
        }

    },

    computed: {

        isInternal() {

            return this.formData.type === 'INTERNAL'

        },

        isExternal() {

            return this.formData.type === 'EXTERNAL'

        },

        isTravel() {

            return this.formData.workCondition === 'TRAVEL'

        },

        isDay() {

            return this.formData.workCondition === 'DAY'

        },

        isBoth() {

            return this.formData.workCondition === 'BOTH'

        },

        isTruck() {

            return this.formData.machineryType === 'TRUCK'

        },

        isPickup() {

            return this.formData.machineryType === 'PICKUP'

        },

        isOther() {

            return this.formData.machineryType === 'OTHER'

        },

    },

    watch: {
        data(newValue) {

            this.formData = JSON.parse(JSON.stringify(newValue) )

        },
    },

    methods: {
        onSave() {

            if (this.validForm) {

                if (this.isNew)
                    this.create()
                else
                    this.update()

            }

        },

        create() {

            this.loading = true

            this.$apollo.mutate( {
                mutation: gql`mutation ($form: BookingInput!) {
                    createBooking(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: this.formData,
                },
            } )
                .then( ( { data: { createBooking } } ) => {

                    this.responseParser(createBooking.__typename)
                    this.loading = false

                } )
                .catch( () => {

                    this.$emit('save', Error.DEFAULT_ERROR_MESSAGE)
                    this.loading = false

                } )

        },

        update() {

            this.loading = true

            this.$apollo.mutate( {
                mutation: gql`mutation ($form: UpdateBookingInput!) {
                    updateBooking(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: this.formData,
                },
            } )
                .then( ( { data: { updateBooking } } ) => {

                    this.responseParser(updateBooking.__typename)
                    this.loading = false

                } )
                .catch( () => {

                    this.$emit('save', Error.DEFAULT_ERROR_MESSAGE)
                    this.loading = false

                } )

        },

        responseParser(typename) {

            switch (typename) {

                case GraphqlTypename.OK:
                    this.$emit('save')
                    this.$emit('input', false)

                    break

                case GraphqlTypename.BOOKING_NOT_FOUND:
                    this.$emit('save', Error.UNKNOWN_BOOKING)

                    break

                default:
                    this.$emit('save', Error.DEFAULT_ERROR_MESSAGE)

                    break

            }

        },

        onAddReceiver() {

            this.formData.receivers.push( {
                editable : true,
                email    : '',
            } )

        },

        onDeleteReceiver(index) {

            this.formData.receivers.splice(index, 1)

        },

        onChangeEquipment(id) {

            const equipment = this.equipments.find( (e) => e._id === id)
            this.formData.machineryType = equipment.type

        },

        onChangeEquipmentType(type) {

            this.formData = {
                ...this.formData,
                machineryType: type,
            }

        },

        addOperatorEmailAddress(id) {

            this.removeNonEditableReceivers()

            const operator = this.operators.find( (e) => e._id === id)
            this.formData.receivers.unshift( {
                editable : false,
                email    : operator.email,
            } )

        },

        addConstructionManagerEmailAddress(id) {

            this.removeNonEditableReceivers()

            const constructionManager = this.constructionManagers.find( (e) => e._id === id)
            this.formData.receivers.unshift( {
                editable : false,
                email    : constructionManager.email,
            } )

        },

        removeNonEditableReceivers() {

            this.formData.receivers = this.formData.receivers ? this.formData.receivers.filter( (receiver) => receiver.editable) : []

        },

        onTypeChange() {

            this.formData.machineryType = undefined
            this.formData.operator = undefined
            this.formData.constructionManager = undefined
            this.removeNonEditableReceivers()

        },
    },
}
</script>
