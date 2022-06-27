const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../../config');

const fs = require('fs');
const Pdfmake = require('pdfmake');

const fonts = {
    Roboto: {
        normal: 'assets/fonts/roboto/Roboto-Regular.ttf',
        bold: 'assets/fonts/roboto/Roboto-Medium.ttf',
        italics: 'assets/fonts/roboto/Roboto-Italic.ttf',
        bolditalics: 'assets/fonts/roboto/Roboto-MediumItalic.ttf'
    },
    Centaur: {
        normal: 'assets/fonts/CENTAUR.ttf',
        bold: 'assets/fonts/centaur-bold.otf'
    }
};

Pdfmake.fonts = {

}

router.get('/:QuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let QuotationId = req.params.QuotationId
        let getRevise = await pool.request().query(`SELECT QuotationRevised FROM Quotation WHERE QuotationId = ${QuotationId}`)
        let Revised = '';
        if (getRevise.recordset[0].QuotationRevised<10){
            Revised = '0'+getRevise.recordset[0].QuotationRevised.toString()
        } else {
            Revised = getRevise.recordset[0].QuotationRevised.toString()
        }
        let getQuotation = `SELECT
            b.QuotationNoId,
            b.QuotationNo,
            a.QuotationRevised,
            b.QuotationNo + '_${Revised}' QuotationNo_Revised,
            a.QuotationStatus,
            d.StatusName,
            c.CustomerTitle + c.CustomerFname + ' ' + c.CustomerLname CustomerName,
            c.CustomerTitle,
            c.CustomerFname,
            c.CustomerLname,
            c.CustomerEmail,
            f.CompanyName,
            f.CompanyAddress,
            a.QuotationId,
            a.QuotationSubject,
            a.QuotationDate,
            a.QuotationUpdatedDate,
            a.QuotationTotalPrice,
            a.QuotationDiscount,
            a.QuotationNet,
            a.QuotationVat,
            a.QuotationNetVat,
            a.QuotationValidityDate,
            a.QuotationPayTerm,
            a.QuotationDelivery,
            CONVERT(nvarchar(max), a.QuotationRemark) AS 'QuotationRemark',
            a.EmployeeApproveId,
            e.EmployeeFname + ' ' + e.EmployeeLname EmployeeName,
            e.EmployeeEmail,
            e.EmployeePosition
            FROM [Quotation] a
            LEFT JOIN [QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
            LEFT JOIN [MasterCustomer] c ON b.CustomerId = c.CustomerId
            LEFT JOIN [MasterStatus] d ON a.QuotationStatus = d.StatusId
            LEFT JOIN [MasterEmployee] e ON a.EmployeeApproveId = e.EmployeeId
            LEFT JOIN [MasterCompany] f ON c.CompanyId = f.CompanyId
            WHERE a.QuotationId = ${QuotationId}`;
        let quotations = await pool.request().query(getQuotation);
        let quotation = quotations.recordset[0];

        let pdfmake = new Pdfmake(fonts);

        let table = {
            headerRows: 1,
            widths: [] 
        }

        let topic = {
            columns: [
                {
                    width: '*',
                    text: "528/2 Soi Ramkhamhang 39 (Theplila 1)\nWangthonglang, Wangthonglang, Bangkok 10310\nTel : 098-655-3926, 02-539-3766\nEmail : sale@privainnotech.com",
                    fontSize: 8,
                    color: '#808080'
                },
                {
                    width: '*',
                    text: "QUOTATION",
                    font: 'Centaur',
                    // bold: true,
                    alignment: 'right',
                    fontSize: 28,
                    color: '#A6A6A6'
                },
            ]
        }, {
            text: "\n\n", style: 'text'
        }, {
            columns: [
            {
                width: '*',
                columns: [{
                    width: '15%',
                    stack: [{
                        text: "To:",
                    },{
                        text: "Email:"
                    },{
                        text: "Company:"
                    },{
                        text: "Address:"
                    }],
                    alignment: 'right',
                    style: 'bitext',
                    color: "#808080"
                },{
                    margin: [3,0,0,0],
                    width: '*',
                    stack: [{
                        text: `${quotation.CustomerName}`,
                        decoration: 'underline'
                    },{
                        text: `${quotation.CustomerEmail}`,
                        decoration: 'underline'
                    },{
                        text: `${quotation.CompanyName}`
                    },{
                        text: `${quotation.CompanyAddress}`
                    }],
                    style: 'text',
                }]
            },
            {
                width: '30%',
                columns: [{
                    width: '*',
                    stack: [{
                        text: "Date:"
                    },{
                        text: "Quotation no."
                    }],
                    fontSize: 9
                }, {
                    width: '*',
                    stack: [{
                        text: `${quotation.QuotationDate}`
                    },{
                        text: `${quotation.QuotationNo_Revised}`
                    }],
                    fontSize: 9,
                    alignment: 'right'
                }
                ]
            }]
        }, {
            text: "\n"
        }, {
            columns: [
            {
                width: '*',
                columns: [{
                    width: '15%',
                    text: "Subject:",
                    alignment: 'right',
                    style: 'bitext',
                    color: "#808080"
                },{
                    margin: [3,0,0,0],
                    width: '*',
                    text: `${quotation.QuotationSubject}`,
                    style: 'text',
                    // color: "#808080"
                }],
                // color: "#808080"
            },
            {
                width: '30%',
                text: ""
            }]
        }

        let doc = {
            pageMargins: [68, 100, 72, 54],
            pageSize: 'LETTER',
            header: {
                alignment: 'left',
                image: 'assets/logo.png',
                margin: [68, 54, 0, 54],
                height: 42,
                width: 130
            },
            content: [, {
                text: "\n"
            }, {
                columns: [
                    { width: '*', text:'' },
                    {
                        width: 'auto', 
                        stack: [{
                            text: "  For customer :\n   To accept this quotation, sign here and\n   return by Email : Kittanan.w@privainnotech.com",
                            style: 'footer'
                        }, {
                            text: "\n\n__________________________________________________",
                            style: 'footer',
                            bold: true,
                            color: "#000000"
                        }, {
                            text: "  COMPANY CHOP & AUTHORIZED SIGNATURE",
                            style: 'footer',
                        }],
                        style: 'footer'
                    }
                ]
            } 
            ],
            styles: {
                header: {
                    margin: [0,20,0,0],
                    fontSize: 34,
                    bold: true,
                    alignment: 'left'
                },
                footer: {
                    fontSize: 9,
                    alignment: 'justify',
                    color: '#808080'
                },
                text: {
                    alignment: 'left',
                    fontSize: 9,
                },
                bitext: {
                    fontSize: 9,
                    bold: true,
                    italics: true
                }
            }
        }

        let pdfDoc = pdfmake.createPdfKitDocument(doc, {});
        pdfDoc.pipe(fs.createWriteStream('public/report/quotation/test.pdf'));
        pdfDoc.end();

        res.status(200).send({message: 'Successfully create quotation report'});
    } catch(err){
        res.status(500).send({message: err});
    }
})

module.exports = router