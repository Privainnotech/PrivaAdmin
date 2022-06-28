const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../../config');

const { bahttext } = require('bahttext')
const fs = require('fs');
const pdfMake = require('pdfmake');

const fonts = {
    Roboto: {
        normal: 'assets/fonts/roboto/Roboto-Regular.ttf',
        bold: 'assets/fonts/roboto/Roboto-Medium.ttf',
        italics: 'assets/fonts/roboto/Roboto-Italic.ttf',
        bolditalics: 'assets/fonts/roboto/Roboto-MediumItalic.ttf'
    },
    Centaur: {
        normal: 'assets/fonts/CENTAUR.ttf'
    },
    THSarabunNew: {
        normal: 'assets/fonts/THSarabunNew/THSarabunNew.ttf',
        bold: 'assets/fonts/THSarabunNew/THSarabunNew-Bold.ttf',
        italics: 'assets/fonts/THSarabunNew/THSarabunNew-Italic.ttf',
        bolditalics: 'assets/fonts/THSarabunNew/THSarabunNew-BoldItalic.ttf'
    },
    Tahoma: {
        normal: 'assets/fonts/tahoma/tahoma.ttf',
        bold: 'assets/fonts/tahoma/tahomabd.ttf',
        italics: 'assets/fonts/tahoma/tahomait.ttf',
        bolditalics: 'assets/fonts/tahoma/tahomabfi.ttf'
    }
};

moneyFormat = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
            e.EmployeeFname,
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


        console.log('check init')
        let pdfCreator = new pdfMake(fonts);
        console.log('check inited')

        // head
        let head = [
            {
                width: '*',
                text: "528/2 Soi Ramkhamhang 39 (Theplila 1)\nWangthonglang, Wangthonglang, Bangkok 10310\nTel : 098-655-3926, 02-539-3766\nEmail : sale@privainnotech.com",
                fontSize: 7,
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

        let quotationHead = [
            {
                width: '*',
                columns: [{
                    width: '15%',
                    stack: [
                        { text: "To:" },
                        { text: "Email:" },
                        { text: "Company:" },
                        { text: "Address:" }
                    ],
                    alignment: 'right',
                    style: 'bitext',
                    color: "#808080"
                },{
                    margin: [3,0,50,0],
                    width: '*',
                    stack: [{ text: `${quotation.CustomerName}`, decoration: 'underline' },
                        { text: `${quotation.CustomerEmail}`, decoration: 'underline' },
                        { text: `${quotation.CompanyName}` },
                        { text: `${quotation.CompanyAddress}` }
                    ], style: 'blacktext',
                }]
            },
            {
                width: '25%',
                columns: [{
                    width: '*',
                    stack: [{ text: "Date:" },
                        { text: "Quotation no." }
                    ], fontSize: 8
                }, {
                    width: '*',
                    stack: [{ text: `${quotation.QuotationDate}` },
                        { text: `${quotation.QuotationNo_Revised}` }
                    ],
                    fontSize: 8,
                    alignment: 'right'
                }
                ]
            }]

        // subject
        let subject = [
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
                    style: 'blacktext',
                    // color: "#808080"
                }],
                // color: "#808080"
            },
            {
                width: '30%',
                text: ""
            }]

        console.log(bahttext(quotation.QuotationNetVat.toFixed(2)))
        // price
        let price = [
            {
                width: '*',
                margin: [5,5,0,0],
                text: `[THAI BAHT] :  ${bahttext(quotation.QuotationNetVat.toFixed(2))}`,
                style: 'bahttext'
            },
            {
                width: '40%',
                columns: [{
                    width: '*',
                    stack: [
                        { text: "Sub Total for the above:" },
                        { text: "Discount:" },
                        { text: "Price after discount:" },
                        { text: "VAT Including 7%:" },
                        { text: "Net Total:" }
                    ],
                    alignment: 'right',
                    style: 'bitext',
                    color: "#808080"
                },{
                    margin: [3,0,0,0],
                    width: '40%',
                    layout: 'lightHorizontalLines',
                    table: {
                        headerRows: 0,
                        widths: ['*'],
                        body: [
                            [{ text: `${moneyFormat(quotation.QuotationTotalPrice.toFixed(2))}`,alignment: 'right', style: 'blacktext', border: [false, false, false, false]}],
                            [{ text: `${moneyFormat(quotation.QuotationDiscount.toFixed(2))}`,alignment: 'right', style: 'blacktext', border: [false, false, false, false]}],
                            [{ text: `${moneyFormat(quotation.QuotationNet.toFixed(2))}`,alignment: 'right', style: 'blacktext'}],
                            [{ text: `${moneyFormat(quotation.QuotationVat.toFixed(2))}`,alignment: 'right', style: 'blacktext'}],
                            [{ text: `${moneyFormat(quotation.QuotationNetVat.toFixed(2))}`,alignment: 'right', style: 'blacktext'}]
                        ]
                    },
                    // stack: [
                    //     { text: `${moneyFormat(quotation.QuotationTotalPrice.toFixed(2))}` },
                    //     { text: `${moneyFormat(quotation.QuotationDiscount.toFixed(2))}` },
                    //     { text: `${moneyFormat(quotation.QuotationNet.toFixed(2))}` },
                    //     { text: `${moneyFormat(quotation.QuotationVat.toFixed(2))}` },
                    //     { text: `${moneyFormat(quotation.QuotationNetVat.toFixed(2))}` }
                    // ],
                    // alignment: 'right',
                    // style: 'blacktext',
                }]
            }
        ]

        // condition
        let validityDate = quotation.QuotationValidityDate ? quotation.QuotationValidityDate : '-';
        let payTerm = quotation.QuotationPayTerm ? quotation.QuotationPayTerm : '-';
        let delivery = quotation.QuotationDelivery ? quotation.QuotationDelivery : '-';
        let remark = quotation.QuotationRemark ? quotation.QuotationRemark : '-'

        let condition = [
            {
                margin: [25,0,0,0],
                width: '50%',
                columns: [{
                    width: '40%',
                    stack: [
                        { text: "CONDITION:", style: 'condition', margin: [-22,0,0,0]},
                        { text: "Validity:", style: 'conditiontext'},
                        { text: "Term of payment:", style: 'conditiontext' },
                        { text: "Delivery:", style: 'conditiontext' },
                        { text: "Remark:", style: 'conditiontext' },
                        { text: "\n\nBest Regards,", style: 'text', margin: [-18,0,0,0] },
                    ],
                },{
                    margin: [3,0,0,0],
                    width: '*',
                    stack: [
                        { text: "\n", style: 'condition'},
                        { text: `${validityDate}`, style: 'conditiontext'},
                        { text: `${payTerm}`, style: 'conditiontext'},
                        { text: `${delivery}`, style: 'conditiontext'},
                        { text: `${remark}`, style: 'conditiontext'},
                    ]
                }]
            },
            {
                width: '*',
                text: ""
            }

        ]

        // sign
        let signature = [
            { 
                width: '*',
                margin: [6,0,0,0],
                stack: [{
                    margin: [-190,0,0,0],
                    text: `         ${quotation.EmployeeFname}.          `,
                    style: 'sign'
                }, {
                    text: `${quotation.EmployeeName}`,
                    style: 'text'
                }, {
                    text: `${quotation.EmployeePosition}`,
                    style: 'text'
                }] 
            }, {
                width: 'auto', 
                stack: [{
                    margin: [4,0,0,0],
                    text: "For customer :\nTo accept this quotation, sign here and\nreturn by Email : Kittanan.w@privainnotech.com",
                }, {
                    text: "\n\n\n______________________________________",
                    bold: true,
                    color: "#000000"
                }, {
                    text: "COMPANY CHOP & AUTHORIZED SIGNATURE",
                    alignment: 'center'
                }],
                style: 'text'
            }
        ]

        // item table
        let itemtable = {
            headerRows: 1,
            widths: ['10%','*','10%','10%','15%'],
            style: 'text',
            body: [
                [
                    { text: 'Item', style: 'thead', border: [true, true, true, true] },
                    { text: 'Description', style: 'thead', border: [true, true, true, true] },
                    { text: 'Unit Price', style: 'thead', border: [true, true, true, true] },
                    { text: 'Qty', style: 'thead', border: [true, true, true, true] },
                    { text: 'Line Total', style: 'thead', border: [true, true, true, true] }
                ],
            ]
        }

        // get item

        let i = 1;
        const Items = await pool.request().query(`SELECT * FROM QuotationItem WHERE QuotationId = ${QuotationId}`)
        for(let Item of Items.recordset) {
            let { ItemName, ItemPrice, ItemQty } = Item
            if (ItemPrice == 'null') ItemPrice = 0;
            if (ItemQty == 'null') ItemQty = 0
            let LineTotal = ItemPrice * ItemQty
            itemtable['body'].push([
                {text: `${i}`, style: 'btext', alignment: 'center', border: [true, false, true, false]},
                {text: `${ItemName}`, style: 'btext', border: [true, false, true, false]},
                {text: `${moneyFormat(ItemPrice.toFixed(2))}`, style: 'blacktext', alignment: 'right', border: [true, false, true, false]},
                {text: `${moneyFormat(ItemQty.toFixed(2))}`, style: 'blacktext', alignment: 'center', border: [true, false, true, false]},
                {text: `${moneyFormat(LineTotal.toFixed(2))}`, style: 'blacktext', alignment: 'right', border: [true, false, true, false]}
            ])
            const SubItems = await pool.request().query(`SELECT * FROM [QuotationSubItem] a
            LEFT JOIN [MasterProduct] b ON a.ProductId = b.ProductId
            WHERE ItemId = ${Item.ItemId}`)
            let j = 1;
            for(let SubItem of SubItems.recordset) {
                let {SubItemQty, SubItemUnit, ProductName} = SubItem
                if (SubItemQty == 'null'){
                    SubItemQty = "";
                    SubItemUnit = "";
                } 
                itemtable['body'].push([
                    {text:"", border: [true, false, true, false]},
                    {text: `${j}) ${ProductName}  ${SubItemQty} ${SubItemUnit}`, style: 'blacktext', border: [true, false, true, false]},
                    {text:"", border: [true, false, true, false]},
                    {text:"", border: [true, false, true, false]},
                    {text:"", border: [true, false, true, false]}
                ])
                j++;
            }
            i++;
        }
        itemtable['body'].push([
            {text:"", border: [true, false, true, true]},
            {text:" ", border: [true, false, true, true]},
            {text:"", border: [true, false, true, true]},
            {text:"", border: [true, false, true, true]},
            {text:"", border: [true, false, true, true]}
        ])

        let doc = {
            pageMargins: [60, 100, 60, 54],
            pageSize: 'LETTER',
            header: {
                stack: [{
                    alignment: 'left',
                    image: 'assets/logo.png',
                    margin: [60, 54, 0, 54],
                    height: 42,
                    width: 130
                }]
                
            },
            content: [],
            styles: {
                text: { color: '#808080'},
                blacktext: { color: '#000000'},
                btext: { bold: true},
                bitext: { bold: true, italics: true},
                condition: { fontSize: 10, bold: true, italics: true, decoration: 'underline', color: '#808080', alignment: 'left'},
                conditiontext: { bold: true, color: '#808080', alignment: 'left'},
                bahttext: { bold: true, color: '#808080', alignment: 'left'},
                thead: { bold: true, italics: true, alignment: 'center'},
                sign: {  fontSize: 10, decoration: 'underline', alignment: 'center'},
            },
            defaultStyle: {
                font: "Tahoma",
                fontSize: 8
            }
        }

        doc['content'].push(
            { columns: head },
            { text: "\n\n"},
            { columns: quotationHead },
            { text: "\n" },
            { columns: subject },
            { text: "\n" }, 
            { table: itemtable },
            { columns: price },
            { columns: condition },
            { text: "\n\n"},
            { columns: signature }
        )

        console.log('check creating')
        let pdfDoc = pdfCreator.createPdfKitDocument(doc);
        console.log('check created')
        pdfDoc.pipe(fs.createWriteStream('public/report/quotation/test.pdf'));
        pdfDoc.end();

        res.status(200).send({message: 'Successfully create quotation report'});
    } catch(err){
        res.status(500).send({message: err});
    }
})

module.exports = router