import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export const mainColor = '003249'

export const firstRow = 7

export function newWorkbook( { name } ) {

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(name, { views: [{ showGridLines: false }] } )

    return {
        workbook,
        worksheet,
    }

}

export function setExcelHeader(workbook, worksheet) {

    const logo = workbook.addImage( {
        base64    : process.env.NUXT_ENV_LOGO_BASE64,
        extension : 'png',
    } )

    worksheet.addImage(logo, 'B2:C6')

    worksheet.addTable( {
        name      : 'Header',
        ref       : 'D2',
        headerRow : false,
        totalsRow : false,

        columns: [
            {
                name         : 'Data',
                filterButton : false,
                style        : {
                    font: {
                        bold  : true,
                        color : { argb: mainColor },
                    },
                },
            },
        ],

        rows: [
            [ process.env.NUXT_ENV_RAZON_SOCIAL ],
            [ process.env.NUXT_ENV_GIRO ],
            [ process.env.NUXT_ENV_DIRECCION ],
            [ `RUT: ${process.env.NUXT_ENV_RUT}` ],
            [ `Fono: ${process.env.NUXT_ENV_FONO} - E-mail: ${process.env.NUXT_ENV_CONTACTO_EMAIL}` ],
        ],

        style: {
            theme          : null,
            showRowStripes : false,
        },
    } )

}

export function addExcelRow(workbook, worksheet, rowData, { isHeader = false } = {} ) {

    const lastRow = worksheet.lastRow
    const lastRowNumber = lastRow.number > firstRow ? lastRow.number : firstRow

    let row

    if (isHeader)
        row = worksheet.insertRow(lastRowNumber + 2, getParsedRow(rowData) )
    else
        row = worksheet.addRow(getParsedRow(rowData) )

    // Styling

    row.eachCell( (cell, colNumber) => {

        const borderStyle = isHeader ? 'medium' : 'thin'

        cell.border = {
            top    : { style: borderStyle, color: { argb: mainColor } },
            left   : colNumber === 2 ? { style: borderStyle, color: { argb: mainColor } } : undefined,
            bottom : { style: borderStyle, color: { argb: mainColor } },
            right  : colNumber === row.cellCount ? { style: borderStyle, color: { argb: mainColor } } : undefined,
        }

        cell.font = {
            bold  : isHeader,
            color : { argb: mainColor },
        }

    } )

    if (isHeader)
        worksheet.getRow(lastRowNumber + 1).height = 6

}

export function saveExcelFile(workbook, fileName) {

    workbook.xlsx.writeBuffer().then(function(data) {

        const blob = new Blob( [ data ], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } )
        saveAs(blob, `${fileName}_${new Date().toISOString()}.xlsx`)

    } )

}

function getParsedRow(rowData) {

    const rowValues = []

    let rowIndex = 2
    for (const value of rowData) {

        rowValues[rowIndex] = value
        rowIndex++

    }

    return rowValues

}
