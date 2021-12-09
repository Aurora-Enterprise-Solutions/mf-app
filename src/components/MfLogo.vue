<template>
    <v-container class="mf-component mf-component-logo">
        <v-row justify="center">
            <v-col
                cols="5"
                sm="3"
                lg="2"
            >
                <img
                    :src="require('./../assets/images/logo.svg')"
                    class="logo"
                >
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: 'MfLogo',
}
</script>
