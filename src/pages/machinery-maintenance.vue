<template>
    <v-container fluid class="mf-page mf-page-machinery-maintenance">
        <v-data-iterator :items="_maintenances"
                         disable-pagination
                         disable-sort
                         hide-default-footer
        >
            <template #header>
                <v-toolbar rounded>
                    <v-text-field append-icon="mdi-magnify"
                                  label="Buscar"
                                  single-line
                                  hide-details
                    />
                </v-toolbar>
            </template>


            <template #default="props">
                <v-row style="padding: 16px 0;">
                    <v-col v-for="item in props.items"
                           :key="item._id"
                           cols="12"
                           sm="6"
                           md="4"
                           lg="3"
                    >
                        <v-card elevation="4" class="maintenance-card" :loading="loading[item._id]">
                            <v-card-title>
                                <div>
                                    <div class="subtitle-1 font-weight-bold">
                                        {{ item.code }}
                                    </div>

                                    <div class="subtitle-2 font-weight-regular">
                                        {{ item.name }} - {{ item.patent }}
                                    </div>
                                </div>

                                <v-spacer />

                                <div>
                                    <v-chip v-if="getGlobalStatus(item.maintenances)" class="green darken-2" text-color="white">
                                        Completado
                                    </v-chip>

                                    <v-chip v-else class="yellow darken-2" text-color="white">
                                        Incompleto
                                    </v-chip>
                                </div>
                            </v-card-title>

                            <v-divider />

                            <!-- <v-card-text v-if="loading[item._id]">
                                <v-skeleton-loader type="list-item-avatar@4" />
                            </v-card-text> -->

                            <v-card-text>

                                <v-timeline dense clipped>

                                    <v-slide-x-transition group>

                                        <v-timeline-item v-for="event in item.maintenances"
                                                         :key="event._id"
                                                         :color="event.status === 'DONE' ? 'green' : 'grey'"
                                                         :icon="event.status === 'DONE' ? 'mdi-check' : 'mdi-clock-outline'"
                                                         fill-dot
                                                         small
                                        >
                                            <v-row justify="start" align="center">
                                                <v-col class="flex-grow-1" v-text="`Mantención de ${event.step}km (horómetro ${event.kmsOfMachinery}km)`" />

                                                <v-col class="flex-grow-0">
                                                    <v-btn text color="primary" small @click="changeStatus(item._id, event._id)">
                                                        {{ event.status === 'DONE' ? 'Pendiente' : 'Completar' }}
                                                    </v-btn>
                                                </v-col>
                                            </v-row>
                                        </v-timeline-item>

                                    </v-slide-x-transition>

                                </v-timeline>

                                <v-btn text
                                       block
                                       color="primary"
                                       small
                                       style="margin-top: 15px"
                                       @click="loadMore(item._id, item.maintenances)"
                                >
                                    cargar más
                                </v-btn>

                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </template>
        </v-data-iterator>
    </v-container>
</template>

<script>
import gql from 'graphql-tag'

export default {
    apollo: {
        initialMaintenances: {
            query: gql`
                    query getAllLastMaintenance {
                        getAllLastMaintenance {
                            _id,
                            uid,
                            step,
                            equipment {
                                _id,
                                name,
                                code,
                                patent,
                            },
                            status,
                            kmsOfMachinery,
                        }
                    }
                `,

            update( { getAllLastMaintenance } ) {

                this.maintenances = getAllLastMaintenance

                return getAllLastMaintenance

            },

            subscribeToMore: [
                {
                    document: gql`subscription {
                        maintenanceAdded {
                            _id,
                            uid,
                            step,
                            equipment {
                                _id,
                                name,
                                code,
                                patent,
                            },
                            status,
                            kmsOfMachinery,
                        }
                    }`,

                    updateQuery( { getAllLastMaintenance }, { subscriptionData: { data: { maintenanceAdded } } } ) {

                        this.maintenances.push(maintenanceAdded)

                        return { getAllLastMaintenance: this.maintenances }

                    },
                },

                {
                    document: gql`subscription {
                        maintenanceStatusUpdated {
                            _id,
                            status,
                        }
                    }`,

                    updateQuery( { getAllLastMaintenance }, { subscriptionData: { data: { maintenanceStatusUpdated } } } ) {

                        const maintenance = this.maintenances.find( (maintenance) => maintenance._id === maintenanceStatusUpdated._id)
                        maintenance.status = maintenanceStatusUpdated.status

                        return { getAllLastMaintenance: this.maintenances }

                    },
                },
            ],
        },
    },

    data() {

        return {
            loading      : {},
            maintenances : [],
        }

    },

    computed: {
        _maintenances() {

            return this.groupAndOrderMaintenances(this.maintenances)

        },
    },

    methods: {
        getGlobalStatus(maintenances) {

            return maintenances.every( (maintenance) => maintenance.status === 'DONE')

        },

        changeStatus(equipmentId, id) {

            this.$set(this.loading, equipmentId, true)

            this.$apollo.mutate( {
                mutation: gql`mutation changeMaintenanceStatus($id: String!) {
                    changeMaintenanceStatus(id: $id) {
                        _id,
                        status,
                    }
                }`,

                variables: {
                    id,
                },
            } )
                .then( ( { data: { changeMaintenanceStatus } } ) => {

                    this.$set(this.loading, equipmentId, false)

                } )
                .catch( () => {

                    this.$set(this.loading, equipmentId, false)

                } )

        },

        loadMore(equipmentId, maintenances) {

            this.$set(this.loading, equipmentId, true)

            this.$apollo.query( {
                query: gql`query getMaintenancePage($equipment: String!, $lastUid: Float!) {
                        getMaintenancePage(equipment: $equipment, lastUid: $lastUid) {
                            _id,
                            uid,
                            step,
                            status,
                            kmsOfMachinery,
                            equipment {
                                _id,
                                name,
                                code,
                                patent,
                            },
                        }
                    }`,

                variables: {
                    equipment : equipmentId,
                    lastUid   : maintenances[maintenances.length - 1].uid,
                },
            } )
                .then( ( { data: { getMaintenancePage } } ) => {

                    this.maintenances = [
                        ...this.maintenances,
                        ...getMaintenancePage,
                    ]

                    this.$set(this.loading, equipmentId, false)

                } )
                .catch( () => {

                    this.$set(this.loading, equipmentId, false)

                } )

        },

        groupAndOrderMaintenances(maintenances) {

            const groupedMaintenancesByEquipment = {}

            maintenances.forEach( (maintenance) => {

                if (!groupedMaintenancesByEquipment[maintenance.equipment._id] ) {

                    groupedMaintenancesByEquipment[maintenance.equipment._id] = {
                        ...maintenance.equipment,
                        maintenances: [],
                    }

                }

                groupedMaintenancesByEquipment[maintenance.equipment._id].maintenances.push(maintenance)

            } )

            // sort maintenances for all equipments by uid in descending order
            Object.values(groupedMaintenancesByEquipment).forEach( (equipment) => {

                equipment.maintenances.sort( (a, b) => b.uid - a.uid)

            } )

            return Object.values(groupedMaintenancesByEquipment)

        },
    },
}
</script>
