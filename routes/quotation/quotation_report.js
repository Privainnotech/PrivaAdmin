const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../config');

const { bahttext } = require('bahttext')
const path = require('path');
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
        bold: 'assets/fonts/tahoma/tahoma-bd.ttf',
        italics: 'assets/fonts/tahoma/tahoma-it.ttf',
        bolditalics: 'assets/fonts/tahoma/tahoma-bfi.ttf'
    }
};

let customLayouts = {
    priceLayout: {
        hLineWidth: function (i, node) {
            if (i < node.table.body.length-2) { return 0; }
            return (i === node.table.body.length) ? 2 : 1;
        },
        vLineWidth: function (i) { return 0; },
        hLineColor: function (i) { return '#808080'; },
        paddingLeft: function (i) { return 0; },
        paddingRight: function (i) { return 0; },
        paddingTop: function(i) { return 1; },
		paddingBottom: function(i) { return 1; },
    },
    itemLayout: {
        hLineWidth: function (i, node) {
            if (i <= node.table.headerRows || i === node.table.body.length) { return 1; }
            return 0;
        },
        vLineWidth: function (i) { return 1; },
        hLineColor: function (i) { return '#000'; },
        paddingLeft: function(i) { return 1; },
        paddingTop: function(i) { return 1; },
		paddingBottom: function(i) { return 1; },
    }
}

const moneyFormat = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const applySpacing = (name) => {
    let spacebar = ""
    for(let i=0;i<name.length+name.length/2;i++){
        spacebar = spacebar + " "
    }
    return spacebar;
}

const createPdf = async (QuotationId, quotationNo, quotation, setting, Author) => {

    let {
        CustomerName, CustomerEmail, CompanyName, CompanyAddress, EndCustomer,
        QuotationSubject, QuotationDate,
        QuotationTotalPrice, QuotationDiscount, QuotationNet, QuotationVat, QuotationNetVat,
        QuotationValidityDate, QuotationPayTerm, QuotationDelivery, QuotationRemark, QuotationDetail,
        EmployeeName, EmployeeFname, EmployeeLname, EmployeePosition
    } = quotation
    let {
        TableShow, TablePrice, TableQty, TableTotal,
        CustomDetail, DetailShow, DetailQty, DetailTotal
    } = setting
    // head
    let head = [
        {
            width: '*',
            text: "528/2 Soi Ramkhamhang 39 (Theplila 1)\nWangthonglang, Wangthonglang, Bangkok 10310\nTel : 098-655-3926, 02-539-3766\nEmail : sale@privainnotech.com",
            fontSize: 5,
            color: '#808080'
        },
        {
            width: '*',
            text: "QUOTATION",
            font: 'Centaur',
            // bold: true,
            alignment: 'right',
            fontSize: 24,
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
                stack: [{ text: `${CustomerName}` },
                    { text: `${CustomerEmail}` },
                    { text: `${CompanyName}` },
                    { text: `${CompanyAddress}` }
                ], style: 'blacktext',
            }]
        },
        {
            width: '25%',
            columns: [{
                width: '*',
                stack: [{ text: "Date:" },
                    { text: "Quotation no." }
                ]
            }, {
                width: '*',
                stack: [{ text: `${QuotationDate}` },
                    { text: `${quotationNo}` }
                ],
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
                stack: [{ text: "Subject:", },
                    { text: "End customer:", }
                ],
                alignment: 'right',
                style: 'bitext',
                color: "#808080"
            },{
                margin: [3,0,0,0],
                width: '*',
                stack: [{ text: `${QuotationSubject}`, },
                    { text: `${EndCustomer}`, }
                ],
                style: 'blacktext',
                // color: "#808080"
            }],
            // color: "#808080"
        },
        {
            width: '25%',
            text: ""
        }]

    // console.log(bahttext(QuotationNetVat.toFixed(2)))
    // price
    let discount = ""
    if (QuotationDiscount == 0) discount = "-"
    else discount = moneyFormat(QuotationDiscount.toFixed(2))
    let price = [
        {
            width: '*',
            margin: [5,5,0,0],
            text: `[THAI BAHT] :  ${bahttext(QuotationNetVat.toFixed(2))}`,
            style: 'bahttext'
        },
        {
            width: '40%',
            layout: 'priceLayout',
            table: {
                headerRows: 0,
                widths: ['*','40%'],
                heights: 1,
                body: [
                    [
                        { text: "Sub Total for the above:", style: 'pricetext',color: "#808080" },
                        { text: `${moneyFormat(QuotationTotalPrice.toFixed(2))}`, style: 'price'}
                    ],
                    [
                        { text: "Discount:", style: 'pricetext',color: "#808080" },
                        { text: `${discount}`, style: 'price'}
                    ],
                    [
                        { text: "Price after discount:", style: 'pricetext',color: "#808080", border: [false, false, false, false] },
                        { text: `${moneyFormat(QuotationNet.toFixed(2))}`, style: 'price'}
                    ],
                    [
                        { text: "VAT Including 7%:", style: 'pricetext',color: "#808080", border: [false, false, false, false] },
                        { text: `${moneyFormat(QuotationVat.toFixed(2))}`, style: 'price'}
                    ],
                    [
                        { text: "Net Total:", style: 'pricetext',color: "#808080", border: [false, false, false, false] },
                        { text: `${moneyFormat(QuotationNetVat.toFixed(2))}`, style: 'price'}
                    ]
                ]
            },
        }
    ]

    // condition
    let getPayTerm = (QuotationPayTerm) => {
        if (typeof QuotationPayTerm == 'object' || !QuotationPayTerm.includes("QuotationPayTerm")) {
            return "-";
        } else {
            QuotationPayTerm = JSON.parse(QuotationPayTerm)
            let payTerms = Object.values(QuotationPayTerm)
            let payTerm = "";
            let i = 1;
            // console.log(payTerms)
            payTerms.map(term => {
                // console.log(term)
                if (i==1 && term=='') term = "-"
                payTerm = payTerm + term + "\n"
                i++;
            })
            return payTerm
        }
    }
    let payTerm = getPayTerm(QuotationPayTerm);
    let validityDate = QuotationValidityDate ? QuotationValidityDate : '-';
    let delivery = QuotationDelivery ? QuotationDelivery : '-';
    let remark = QuotationRemark ? QuotationRemark : '-'
    let condition = [
        {
            margin: [25,0,0,0],
            width: '50%',
            columns: [{
                width: '40%',
                stack: [
                    { text: "CONDITION:", style: 'condition', margin: [-22,0,0,0]},
                    { text: "Validity:", style: 'conditiontext'},
                    { text: "Term of payment:\n\n\n", style: 'conditiontext' },
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
    let space = applySpacing(EmployeeFname+EmployeeLname)
    let signature = [
        { 
            width: 'auto',
            margin: [10,0,0,0],
            stack: [{
                text: `${space}`,
                style: 'sign'
            }, {
                text: `${EmployeeName}`,
                style: 'text'
            }, {
                text: `${EmployeePosition}`,
                style: 'text'
            }] 
        }, {
            width: '*',
            text: "",
            pageBreak: 'after'
        }
    ]

    // item table
    let itemtable = {
        headerRows: 1,
        widths: ['10%','*','10%','10%','15%'],
        style: 'text',
        body: [
            [
                { text: 'Item', style: 'thead'},
                { text: 'Description', style: 'thead'},
                { text: 'Unit Price', style: 'thead'},
                { text: 'Qty', style: 'thead'},
                { text: 'Line Total', style: 'thead'}
            ],
        ]
    }
    let detail = {
        headerRows: 0,
        widths: ['*', '10%', '10%'],
        style: 'text',
        // alignment: 'left',
        body: []
    }
    if (CustomDetail) {
        // console.log(JSON.parse(QuotationDetail))
        if (JSON.parse(QuotationDetail) == null) {
            detail['body'].push(
                [{ text: ``, style: 'blacktext'},"",""]
            )
        } else {
            let Details = JSON.parse(QuotationDetail).blocks
            Details.forEach(Detail => {
                let isBold, text = Detail.data.text;
                text.includes('<b>') ? isBold = 'btext' : isBold = 'blacktext'
                text = text.replace(/<b>|<\/b>|&nbsp;/g," ");
                text = text.split("; ");
                detail['body'].push([
                    { text: text[0], style: isBold},
                    { text: text[1] ? text[1] : "", style: isBold},
                    { text: text[2] ? text[2] : "", style: isBold}
                ])
            })
        }
    }

    // get item
    let i = 1;
    let line = 0;
    let pool = await sql.connect(dbconfig);
    const Items = await pool.request().query(`SELECT * FROM QuotationItem WHERE QuotationId = ${QuotationId}`)
    if (Items.recordset.length){
        for(let Item of Items.recordset) {
            let { ItemName, ItemPrice, ItemQty } = Item
            if (ItemPrice == 'undefined' || typeof ItemPrice == 'object') ItemPrice = 0;
            if (ItemQty == 'undefined' || typeof ItemQty == 'object') ItemQty = 0
            let LineTotal = ItemPrice * ItemQty

            let IPrice, IQty, ITotal;
            if (TableShow === 1 || TableShow === 3) {
                TablePrice === 1 || TablePrice === 3 ? IPrice = moneyFormat(ItemPrice.toFixed(2)) : IPrice = "";
                TableQty === 1 || TableQty === 3 ? IQty = ItemQty : IQty = "";
                TableTotal === 1 || TableTotal === 3 ? ITotal = moneyFormat(LineTotal.toFixed(2)) : ITotal = "";

                itemtable['body'].push([
                    {text: `${i}`, style: 'btext', alignment: 'center'},
                    {text: `${ItemName}`, style: 'btext'},
                    {text: `${IPrice}`, style: 'blacktext', alignment: 'right'},
                    {text: `${IQty}`, style: 'blacktext', alignment: 'center'},
                    {text: `${ITotal}`, style: 'blacktext', alignment: 'right'}
                ])
                line++;
            }
            if(!CustomDetail) {
                if (DetailShow === 1 || DetailShow === 3) {
                    DetailQty === 1 || DetailQty === 3 ? IQty = ItemQty : IQty = "";
                    DetailTotal === 1 || DetailTotal === 3 ? ITotal = moneyFormat(LineTotal.toFixed(2)) : ITotal = "";
    
                    detail['body'].push([
                        { text: `${i} ${ItemName}`, style: 'btext'},
                        { text: `${IQty}`, style: 'blacktext'},
                        { text: `${ITotal}`, style: 'blacktext'},
                    ])
                }
            }
            let j = 1;
            const SubItems = await pool.request().query(`SELECT * FROM [QuotationSubItem] a
            LEFT JOIN [MasterProduct] b ON a.ProductId = b.ProductId
            WHERE ItemId = ${Item.ItemId}`)
            if (SubItems.recordset.length){
                for(let SubItem of SubItems.recordset) {
                    let {SubItemQty, SubItemUnit, ProductName, ProductPrice} = SubItem
                    if (SubItemQty == 'null' || SubItemUnit == "undefined"){
                        SubItemQty = "";
                        SubItemUnit = "";
                    } 
                    let SubTotal = ProductPrice * SubItemQty
                    let SPrice, SQty, STotal;
                    if (TableShow === 2 || TableShow === 3) {
                        TablePrice === 2 || TablePrice === 3 ? SPrice = moneyFormat(ProductPrice.toFixed(2)) : SPrice = ""
                        TableQty === 2 || TableQty === 3 ? SQty = `${SubItemQty} ${SubItemUnit}` : SQty = ""
                        TableTotal === 2 || TableTotal === 3 ? STotal = moneyFormat(SubTotal.toFixed(2)) : STotal = ""
                        
                        if (SPrice === "" || SQty === "") {
                            itemtable['body'].push(["", {text: `${j}) ${ProductName}  ${SubItemQty} ${SubItemUnit}`, style: 'blacktext'},"","",""])
                        } else {
                            itemtable['body'].push([
                                {text: "", style: 'btext', alignment: 'center'},
                                {text: `${j}) ${ProductName}`, style: 'btext'},
                                {text: `${SPrice}`, style: 'blacktext', alignment: 'right'},
                                {text: `${SQty}`, style: 'blacktext', alignment: 'center'},
                                {text: `${STotal}`, style: 'blacktext', alignment: 'right'}
                            ])
                        }
                        line++;
                    }
                    if(!CustomDetail) {
                        if (DetailShow === 2 || DetailShow === 3) {
                            DetailQty === 2 || DetailQty === 3 ? SQty = `${SubItemQty} ${SubItemUnit}` : SQty = "";
                            DetailTotal === 2 || DetailTotal === 3 ? STotal = moneyFormat(SubTotal.toFixed(2)) : STotal = "";
            
                            detail['body'].push([
                                { margin: [7,0,0,0], text: `${j}) ${ProductName}`, style: 'btext'},
                                { text: `${SQty}`, style: 'blacktext'},
                                { text: `${STotal}`, style: 'blacktext'},
                            ])
                        }
                    }
                    j++;
                }
            }
            i++;
        }
    } else {
        if (!CustomDetail) {
            detail['body'].push(
                [{ text: ``, style: 'btext'},"",""],
                [{ margin: [7,0,0,0], text: ``, style: 'blacktext'},"",""]
            )
        }
    }
    let maxline = 25
    if (line<maxline) for (;line<maxline;line++) itemtable['body'].push([""," ","","",""])
    let doc = {
        info: {
            title: `No. ${quotationNo}`,
            author: `${Author}`,
            subject: `${quotationNo}`,
            creator: 'PRIVA INNOTECH CO., LTD'
        },
        pageMargins: [60, 95, 60, 54],
        pageSize: 'LETTER',
        header: {
            stack: [{
                alignment: 'left',
                image: 'assets/logo.png',
                margin: [60, 54, 0, 54],
                height: 35,
                width: 108
            }]
        },
        footer: {
            columns: [{
            width: '*',
            text: ""
        }, {
            width: 'auto',
            margin: [0,-100,60,0],
            stack: [{
                margin: [4,0,0,0],
                text: "For customer :\nTo accept this quotation, sign here and\nreturn by Email : Kittanan.w@privainnotech.com,",
            }, {
                margin: [30,0,0,0],
                text: "Email : Parichart.m@privainnotech.com",
            }, {
                text: "\n\n\n______________________________________",
                bold: true,
                color: "#000000"
            }, {
                text: "COMPANY CHOP & AUTHORIZED SIGNATURE",
                alignment: 'center'
            }],
            style: 'text'
        }]
        },
        content: [{ columns: head },
            { text: "\n\n"},
            { columns: quotationHead },
            { text: "\n" },
            { columns: subject },
            { text: "\n" }, 
            {
                layout: 'itemLayout',
                table: itemtable,
            },
            { columns: price },
            { columns: condition },
            { text: "\n\n"},
            { columns: signature },
            // new page
            {
                margin: [0,-15,0,0],
                text: `Quotation No. : ${quotationNo}`,
                alignment: 'right',
                fontSize: 8
            },
            {
                text: `\n\nQuotation Detail :\n\n`,
                style: 'btext',
                fontSize: 8
            },
            {
                margin: [15,0,50,0],
                // alignment: 'left',
                layout: 'noBorders',
                // fontSize: 7,
                table: detail
            }],
        styles: {
            text: { color: '#808080'},
            price: { color: '#000000', alignment: 'right', lineHeight: 1.2},
            pricetext: { bold: true, italics: true, alignment: 'right', lineHeight: 1.2 },
            btext: { bold: true},
            bitext: { bold: true, italics: true},
            condition: { fontSize: 8, bold: true, italics: true, decoration: 'underline', color: '#808080', alignment: 'left', lineHeight: 1.3},
            conditiontext: { bold: true, color: '#808080', alignment: 'left', lineHeight: 1.3},
            bahttext: { bold: true, color: '#808080', alignment: 'left'},
            thead: { bold: true, italics: true, alignment: 'center'},
            sign: {  fontSize: 8, decoration: 'underline', alignment: 'center', lineHeight: 1.4},

        },
        defaultStyle: {
            font: "Tahoma",
            fontSize: 6,
            lineHeight: 1.1
        }
    }
    return doc;
}

router.get('/:QuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let UserId = req.session.UserId;
        let QuotationId = req.params.QuotationId
        let getQuotation = `SELECT b.QuotationNo, a.QuotationRevised, c.CustomerTitle + c.CustomerFname + ' ' + c.CustomerLname CustomerName,
            c.CustomerEmail, f.CompanyName, f.CompanyAddress, a.EndCustomer, a.QuotationSubject, a.QuotationDate,
            a.QuotationTotalPrice, a.QuotationDiscount, a.QuotationNet, a.QuotationVat, a.QuotationNetVat,
            CONVERT(nvarchar(max), a.QuotationValidityDate) AS 'QuotationValidityDate',
            CONVERT(nvarchar(max), a.QuotationPayTerm) AS 'QuotationPayTerm',
            CONVERT(nvarchar(max), a.QuotationDelivery) AS 'QuotationDelivery',
            CONVERT(nvarchar(max), a.QuotationRemark) AS 'QuotationRemark',
            CONVERT(nvarchar(max), a.QuotationDetail) AS 'QuotationDetail',
            e.EmployeeFname + ' ' + e.EmployeeLname EmployeeName,
            e.EmployeeFname, e.EmployeeLname, e.EmployeeEmail, e.EmployeePosition
            FROM [Quotation] a
            LEFT JOIN [QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
            LEFT JOIN [MasterCustomer] c ON b.CustomerId = c.CustomerId
            LEFT JOIN [MasterStatus] d ON a.QuotationStatus = d.StatusId
            LEFT JOIN [MasterEmployee] e ON a.EmployeeApproveId = e.EmployeeId
            LEFT JOIN [MasterCompany] f ON c.CompanyId = f.CompanyId
            WHERE a.QuotationId = ${QuotationId}`;
        let getSetting = `SELECT TableShow, TablePrice, TableQty, TableTotal, CustomDetail, DetailShow, DetailQty, DetailTotal
            FROM QuotationSetting
            WHERE QuotationId = ${QuotationId}`;
        let getUser = `SELECT EmployeeFname+' '+EmployeeLname as name FROM MasterEmployee WHERE EmployeeId = ${UserId}`
        let quotations = await pool.request().query(getQuotation);
        let settings = await pool.request().query(getSetting);
        let user = await pool.request().query(getUser);
        let quotation = quotations.recordset[0];
        let setting = settings.recordset[0];
        // console.log(quotation)
        let quotationNo = ""
        if (quotation.QuotationRevised < 10) quotationNo = quotation.QuotationNo+"_0"+quotation.QuotationRevised
        else  quotationNo = quotation.QuotationNo+"_"+quotation.QuotationRevised
        let quotationPdf = await createPdf(QuotationId, quotationNo, quotation, setting, user.recordset[0].name);
        
        let pdfCreator = new pdfMake(fonts);
        console.log('Creating quotation....')
        let pdfDoc = pdfCreator.createPdfKitDocument(quotationPdf, {tableLayouts: customLayouts});
        console.log('Quotation created')
        let quotationPath = path.join(process.cwd(), `/public/report/quotation/${quotationNo}.pdf`)
        console.log('file creating')
        let creating = pdfDoc.pipe(fs.createWriteStream(quotationPath));
        pdfDoc.end();
        creating.on('finish', () => {
            console.log('create file success')
            res.status(200).sendFile(quotationPath)
            // res.download(quotationPath)
            // res.status(200).send({message: 'Successfully create quotation report'});
        })
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

module.exports = router