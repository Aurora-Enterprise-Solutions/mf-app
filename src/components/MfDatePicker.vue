<template>
    <v-dialog v-model="modal"
              persistent
              width="290px"
    >
        <template #activator="{ on, attrs }">
            <v-text-field :value="value"
                          :label="label"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          :rules="rules"
                          v-on="on"
            />
        </template>

        <v-date-picker :value="value"
                       scrollable
                       @change="$emit('input', $event)"
        >
            <v-spacer />
            <v-btn text color="primary" @click="modal = false">
                Cancel
            </v-btn>
            <v-btn text color="primary" @click="modal = false">
                OK
            </v-btn>
        </v-date-picker>
    </v-dialog>
</template>

<script>
export default {
    name: 'MfDatePicker',

    props: {
        value: {
            type    : String,
            default : null,
        },

        label: {
            type    : String,
            default : '',
        },

        rules: {
            type    : Array,
            default : () => [],
        },
    },

    data() {

        return {
            modal: false,
        }

    },
}
</script>
