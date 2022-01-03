<template>
    <v-dialog v-model="modal"
              persistent
              width="290px"
    >
        <template #activator="{ on, attrs: actAttrs }">
            <v-text-field :value="value"
                          :label="label"
                          readonly
                          v-bind="actAttrs"
                          :rules="rules"
                          :disabled="disabled"
                          v-on="on"
            />
        </template>

        <v-date-picker :value="value"
                       scrollable
                       v-bind="attrs"
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

        attrs: {
            type    : Object,
            default : () => ( {} ),
        },

        disabled: {
            type    : Boolean,
            default : false,
        },
    },

    data() {

        return {
            modal: false,
        }

    },
}
</script>
