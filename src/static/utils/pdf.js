import moment from 'moment'
import { MachineryType } from './../../components/MfEquipmentFormDialog.vue'
import { TruckWorkConditionsTypes, TruckWorkConditions } from './../../components/MfBookingFormDialog.vue'
import { WorkingDayTypes } from './../../pages/machinery-job-registry.vue'

export const pageConfig = {
    pageSize    : 'LETTER',
    pageMargins : [ 100, 60, 100, 60 ],
}

const color = '#003249'

export const mfStyles = {
    headerCompanyInfo: {
        fontSize   : 9,
        bold       : false,
        italics    : false,
        alignment  : 'left',
        lineHeight : 1.2,
        color,
    },

    headerDate: {
        fontSize   : 9,
        bold       : true,
        italics    : false,
        alignment  : 'center',
        lineHeight : 1,
        color,
    },

    headerDateInfo: {
        fontSize   : 9,
        bold       : false,
        italics    : false,
        alignment  : 'center',
        lineHeight : 1,
        color,
    },

    headerFolio: {
        fontSize   : 9,
        bold       : true,
        italics    : false,
        alignment  : 'center',
        lineHeight : 1.2,
        color,
    },

    bodyTitle: {
        fontSize   : 9,
        bold       : false,
        italics    : false,
        alignment  : 'left',
        lineHeight : 1.5,
        color,
    },

    bodyTableHeader: {
        fontSize   : 9,
        bold       : true,
        italics    : false,
        alignment  : 'left',
        lineHeight : 1.4,
        color,
    },

    bodyTableData: {
        fontSize   : 9,
        bold       : false,
        italics    : false,
        alignment  : 'left',
        lineHeight : 1.4,
        color,
    },

    headerObservationTable: {
        fontSize   : 9,
        bold       : true,
        italics    : false,
        alignment  : 'left',
        lineHeight : 1,
        color,
    },

    dataObservationTable: {
        fontSize   : 9,
        bold       : false,
        italics    : false,
        alignment  : 'justify',
        lineHeight : 1,
        color,
    },

    headerSignature: {
        fontSize   : 9,
        bold       : true,
        italics    : false,
        alignment  : 'center',
        lineHeight : 1.3,
        color,
    },
}

export const mfTableLayouts = {
    mfBorderedLayout: {
        hLineWidth(i, node) {

            if (i === 0 || i === node.table.body.length)
                return 0.25

            return (i === node.table.headerRows) ? 0 : 0.25

        },

        vLineWidth(i) {

            return 0.25

        },

        hLineColor(i) {

            return color

        },

        paddingLeft(i) {

            return 4

        },

        paddingRight(i, node) {

            return 4

        },
    },

    mfBodyLayout: {
        hLineWidth(i, node) {

            if (i !== 0 && i <= node.table.body.length)
                return 0.25

            return 0

        },

        vLineWidth(i) {

            return 0

        },

        hLineColor(i) {

            return color

        },

        paddingLeft(i) {

            return 4

        },

        paddingRight(i, node) {

            return 4

        },

        paddingTop() {

            return 6

        },

        paddingBottom() {

            return -2

        },
    },

    mfBodyHeaderLayout: {
        hLineWidth(i, node) {

            return 0

        },

        vLineWidth(i) {

            return 0

        },

        hLineColor(i) {

            return color

        },

        paddingLeft(i) {

            return 4

        },

        paddingRight(i, node) {

            return 4

        },

        paddingTop() {

            return 6

        },

        paddingBottom() {

            return -1.5

        },
    },
}

export function generateMachineryJobRegistryPdf( { title, data } ) {

    if (process.browser) {

        const pdfMake = require('pdfmake/build/pdfmake.js')
        const pdfFonts = require('pdfmake/build/vfs_fonts.js')
        pdfMake.vfs = pdfFonts.pdfMake.vfs

        pdfMake.tableLayouts = mfTableLayouts

        const doc = {
            info: {
                title,
            },

            ...pageConfig,

            styles: {
                ...mfStyles,

                headerSubTitle: {
                    fontSize  : 11,
                    bold      : false,
                    italics   : false,
                    alignment : 'center',
                },

                headerDescription: {
                    fontSize  : 8,
                    bold      : false,
                    italics   : false,
                    alignment : 'justify',
                    margin    : [ 0, 0, 0, 20 ],
                },

                headerNumber: {
                    fontSize  : 9,
                    bold      : true,
                    italics   : false,
                    alignment : 'center',
                },

                tableHeader: {
                    fontSize  : 11,
                    bold      : true,
                    italics   : false,
                    alignment : 'left',
                },

                tableValue: {
                    fontSize  : 10,
                    bold      : false,
                    italics   : false,
                    alignment : 'left',
                },

                notesTitle: {
                    fontSize  : 11,
                    bold      : true,
                    italics   : false,
                    alignment : 'left',
                },

                notesValue: {
                    fontSize  : 10,
                    bold      : false,
                    italics   : false,
                    alignment : 'left',
                    margin    : [ 0, 0, 0, 20 ],
                },

                agent: {
                    fontSize  : 10,
                    bold      : false,
                    italics   : false,
                    alignment : 'center',
                },

                information: {
                    fontSize  : 8,
                    bold      : true,
                    italics   : false,
                    alignment : 'justify',
                    margin    : [ 0, -10, 0, 5 ],
                },

                informationBaseline: {
                    margin: [ 0, 0, 0, 20 ],
                },

                table: {
                    margin: [ 0, 0, 0, 30 ],
                },

                center: {
                    alignment: 'center',
                },

                justify: {
                    alignment: 'justify',
                },

                right: {
                    alignment: 'right',
                },

                bold: {
                    bold: true,
                },
            },

            content: [],
        }

        setMachineryJobRegistryPdfHeader(doc, data)
        setMachineryJobRegistryPdfBody(doc, data)

        pdfMake.createPdf(doc).open()

    }

}

function setMachineryJobRegistryPdfHeader(doc, data) {

    const day = moment.utc(data.date).format('DD')
    const month = moment.utc(data.date).format('MM')
    const year = moment.utc(data.date).format('YYYY')

    doc.content.push( {
        columns: [
            {
                image : process.env.NUXT_ENV_LOGO_BASE64,
                width : 75,
            },
            {
                width : '*',
                text  : [
                    { text: `${process.env.NUXT_ENV_RAZON_SOCIAL  }\n`, style: 'headerCompanyInfo' },
                    { text: `${process.env.NUXT_ENV_GIRO  }\n`, style: 'headerCompanyInfo' },
                    { text: `${process.env.NUXT_ENV_DIRECCION  }\n`, style: 'headerCompanyInfo' },
                    { text: `RUT: ${process.env.NUXT_ENV_RUT}\n`, style: 'headerCompanyInfo' },
                    { text: `Fono: ${process.env.NUXT_ENV_FONO} - Email: ${process.env.NUXT_ENV_CONTACTO_EMAIL}`, style: 'headerCompanyInfo' },
                ],
            },
        ],

        columnGap: 20,
    } )

    doc.content.push( { text: '\n' } )

    doc.content.push( {
        columns: [
            {
                width : '*',
                text  : [],
            },
            {
                width  : 'auto',
                layout : 'mfBorderedLayout',
                table  : {
                    headerRows : 1,
                    widths     : [ 50, 50, 50 ],

                    body: [
                        [{ text: 'DIA', style: 'headerDate' }, { text: 'MES', style: 'headerDate' }, { text: 'AÑO', style: 'headerDate' }],
                        [{ text: day, style: 'headerDateInfo' }, { text: month, style: 'headerDateInfo' }, { text: year, style: 'headerDateInfo' }],
                    ],

                    alignment: 'center',
                },
            },
        ],
    } )

    doc.content.push( { text: '\n', lineHeight: 0.5 } )

    doc.content.push( {
        columns: [
            {
                width : '*',
                text  : [],
            },
            {
                width : 175,
                style : 'headerFolio',
                text  : [ 'Nro Folio: ', data.folio ],
            },
        ],
    } )

    doc.content.push( { text: '\n' } )

}

function setMachineryJobRegistryPdfBody(doc, data) {

    // data parser
    const equipment = data.equipment.__typename === 'ExternalEquipment' ? data.equipment.name : `${data.equipment.code} | ${data.equipment.name}`
    const operator = data.operator.__typename === 'ExternalOperator' ? data.operator.name : `${data.operator.rut} | ${data.operator.name}`

    const headersByMachineryType = []
    const bodyByMachineryType = []

    switch (data.machineryType) {

        case MachineryType.TRUCK: {

            const workCondition = !data.workCondition ? data.bookingWorkCondition : data.workCondition

            if (workCondition === TruckWorkConditionsTypes.DAY) {

                const workingDayTypeLabel = WorkingDayTypes.find( (wdt) => wdt.value === data.workingDayType).label

                headersByMachineryType.push( [{ text: 'Tipo de Jornada:', style: 'bodyTableHeader' }] )
                bodyByMachineryType.push( [{ text: workingDayTypeLabel, style: 'bodyTableData' }] )

            }

            if (workCondition === TruckWorkConditionsTypes.TRAVEL) {

                const volume = data.equipment.__typename === 'ExternalEquipment' ? 0 : data.equipment.volume

                headersByMachineryType.push( [{ text: 'Nro. de Viajes:', style: 'bodyTableHeader' }] )
                headersByMachineryType.push( [{ text: 'Volumen:', style: 'bodyTableHeader' }] )

                bodyByMachineryType.push( [{ text: data.totalTravels, style: 'bodyTableData' }] )
                bodyByMachineryType.push( [{ text: volume, style: 'bodyTableData' }] )

            }

            break

        }

        case MachineryType.OTHER: {

            headersByMachineryType.push( [{ text: 'Horómetro Inicial:', style: 'bodyTableHeader' }] )
            headersByMachineryType.push( [{ text: 'Horómetro Final:', style: 'bodyTableHeader' }] )
            headersByMachineryType.push( [{ text: 'Total Horas:', style: 'bodyTableHeader' }] )

            bodyByMachineryType.push( [{ text: data.startHourmeter, style: 'bodyTableData' }] )
            bodyByMachineryType.push( [{ text: data.endHourmeter, style: 'bodyTableData' }] )
            bodyByMachineryType.push( [{ text: data.totalHours, style: 'bodyTableData' }] )

            break

        }

    }

    // doc body

    doc.content.push( {
        width : '*',
        text  : [
            { text: 'REPORTE DIARIO\n\n', style: 'bodyTitle' },
        ],
    } )

    doc.content.push( {
        columns: [
            {
                width  : 'auto',
                layout : 'mfBodyHeaderLayout',
                table  : {
                    headerRows : 0,
                    widths     : [ 'auto' ],

                    body: [
                        [{ text: 'Cliente:', style: 'bodyTableHeader' }],
                        [{ text: 'Equipo:', style: 'bodyTableHeader' }],
                        [{ text: 'Operador:', style: 'bodyTableHeader' }],
                        [{ text: 'Obra:', style: 'bodyTableHeader' }],
                        [{ text: 'Ubicación:', style: 'bodyTableHeader' }],
                        ...headersByMachineryType,
                    ],
                },
            },
            {
                width  : '*',
                layout : 'mfBodyLayout',
                table  : {
                    headerRows : 0,
                    widths     : [ '*' ],

                    body: [
                        [{ text: `${data.client.billing.rut} | ${data.client.name}`, style: 'bodyTableData' }],
                        [{ text: equipment, style: 'bodyTableData' }],
                        [{ text: operator, style: 'bodyTableData' }],
                        [{ text: `${data.building}`, style: 'bodyTableData' }],
                        [{ text: `${data.address}`, style: 'bodyTableData' }],
                        ...bodyByMachineryType,
                    ],
                },
            },
        ],

        columnGap: 10,
    } )

    doc.content.push( { text: '\n' } )

    doc.content.push( {
        width  : '*',
        layout : 'mfBorderedLayout',
        table  : {
            headerRows : 1,
            widths     : [ '*' ],

            body: [
                [{ text: 'Observaciones', style: 'headerObservationTable' }],
                [{ text: data.observations, style: 'dataObservationTable' }],
            ],
        },
    } )

    doc.content.push( { text: '\n\n\n' } )


    // signature

    const blankImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

    const firstSignature = data.executor.signature
    const firstSignatureLabel = data.operator.__typename === 'ExternalExecutor' ? 'FIRMA JEFE DE OBRA' : 'FIRMA OPERADOR'

    const secondSignature = data.signature ? data.signature : blankImage
    const secondSignatureLabel = data.operator.__typename === 'ExternalExecutor' ? 'FIRMA OPERADOR' : 'FIRMA JEFE DE OBRA'

    doc.content.push( {
        columns: [
            {
                width  : '*',
                layout : 'noBorders',
                table  : {
                    headerRows : 0,
                    widths     : [ '*' ],

                    body: [
                        [{ image: firstSignature, width: 170, height: 80 }],
                        [{ text: firstSignatureLabel, style: 'headerSignature' }],
                    ],
                },

                alignment: 'center',
            },
            {
                width  : '*',
                layout : 'noBorders',
                table  : {
                    headerRows : 0,
                    widths     : [ '*' ],

                    body: [
                        [{ image: secondSignature, width: 170, height: 80 }],
                        [{ text: secondSignatureLabel, style: 'headerSignature' }],
                    ],
                },

                alignment: 'center',
            },
        ],
    } )

}
