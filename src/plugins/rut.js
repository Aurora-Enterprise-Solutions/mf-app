import Vue from 'vue'
import { formatRut } from 'rutlib'

function keypress(evt) {

    if (!/^[0-9kK]$/.test(evt.key) )
        evt.preventDefault()

}

function parse(value) {

    return formatRut(value)

}

Vue.prototype.$rut = {
    keypress,
    parse,
}
