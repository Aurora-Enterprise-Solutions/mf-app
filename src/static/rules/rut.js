import { validateRut } from 'rutlib'

export const rutRules = [
    (v) => !!v || 'RUT es requerido',

    (v) => validateRut(v) || 'Rut inválido',
]
