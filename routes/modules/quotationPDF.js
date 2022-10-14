const sql = require("mssql");
const { dbconfig } = require("../../config");

const { bahttext } = require("bahttext");
const { moneyFormat } = require("../../libs/utils");

const fonts = {
  Roboto: {
    normal: "assets/fonts/roboto/Roboto-Regular.ttf",
    bold: "assets/fonts/roboto/Roboto-Medium.ttf",
    italics: "assets/fonts/roboto/Roboto-Italic.ttf",
    bolditalics: "assets/fonts/roboto/Roboto-MediumItalic.ttf",
  },
  Centaur: {
    normal: "assets/fonts/CENTAUR.ttf",
  },
  THSarabunNew: {
    normal: "assets/fonts/THSarabunNew/THSarabunNew.ttf",
    bold: "assets/fonts/THSarabunNew/THSarabunNew-Bold.ttf",
    italics: "assets/fonts/THSarabunNew/THSarabunNew-Italic.ttf",
    bolditalics: "assets/fonts/THSarabunNew/THSarabunNew-BoldItalic.ttf",
  },
  Tahoma: {
    normal: "assets/fonts/tahoma/tahoma.ttf",
    bold: "assets/fonts/tahoma/tahoma-bd.ttf",
    italics: "assets/fonts/tahoma/tahoma-it.ttf",
    bolditalics: "assets/fonts/tahoma/tahoma-bfi.ttf",
  },
};

let customLayouts = {
  priceLayout: {
    hLineWidth: function (i, node) {
      if (i < node.table.body.length - 2) {
        return 0;
      }
      return i === node.table.body.length ? 2 : 1;
    },
    vLineWidth: function (i) {
      return 0;
    },
    hLineColor: function (i) {
      return "#808080";
    },
    paddingLeft: function (i) {
      return 0;
    },
    paddingRight: function (i) {
      return 0;
    },
    paddingTop: function (i) {
      return 1;
    },
    paddingBottom: function (i) {
      return 1;
    },
  },
  itemLayout: {
    hLineWidth: function (i, node) {
      if (i <= node.table.headerRows || i === node.table.body.length) {
        return 1;
      }
      return 0;
    },
    vLineWidth: function (i) {
      return 1;
    },
    hLineColor: function (i) {
      return "#000";
    },
    paddingLeft: function (i) {
      return 1;
    },
    paddingTop: function (i) {
      return 1;
    },
    paddingBottom: function (i) {
      return 1;
    },
  },
};

const applySpacing = (name) => {
  let spacebar = "";
  for (let i = 0; i < name.length / 2; i++) {
    spacebar = spacebar + " ";
  }
  return spacebar;
};

const createPdf = async (QuotationId, quotationNo, quotation, setting) => {
  let { CustomerName, CustomerEmail, CompanyName, CompanyAddress } = quotation;
  let { EndCustomer, QuotationSubject, QuotationDate } = quotation;
  let { QuotationTotalPrice, QuotationDiscount, QuotationNet } = quotation;
  let { QuotationVat, QuotationNetVat, QuotationValidityDate } = quotation;
  let { QuotationPayTerm, QuotationDelivery, QuotationRemark } = quotation;
  let { QuotationDetail, EmployeeName, EmployeeFname } = quotation;
  let { EmployeeLname, EmployeePosition, QuotationApproval } = quotation;
  let { TableShow, TablePrice, TableQty, TableTotal } = setting;
  // head
  let head = [
    {
      width: "*",
      text: "528/2 Soi Ramkhamhang 39 (Theplila 1)\nWangthonglang, Wangthonglang, Bangkok 10310\nTel : 098-655-3926, 02-539-3766\nEmail : sale@privainnotech.com",
      fontSize: 5,
      color: "#808080",
    },
    {
      width: "*",
      text: "QUOTATION",
      font: "Centaur",
      // bold: true,
      alignment: "right",
      fontSize: 24,
      color: "#A6A6A6",
    },
  ];

  let quotationHead = [
    {
      width: "*",
      columns: [
        {
          width: "15%",
          stack: [
            { text: "To:" },
            { text: "Email:" },
            { text: "Company:" },
            { text: "Address:" },
          ],
          alignment: "right",
          style: "bitext",
          color: "#808080",
        },
        {
          margin: [3, 0, 50, 0],
          width: "*",
          stack: [
            { text: `${CustomerName}` },
            { text: `${CustomerEmail}` },
            { text: `${CompanyName}` },
            { text: `${CompanyAddress}` },
          ],
          style: "blacktext",
        },
      ],
    },
    {
      width: "25%",
      columns: [
        {
          width: "*",
          stack: [{ text: "Date:" }, { text: "Quotation no." }],
        },
        {
          width: "*",
          stack: [
            { text: `${QuotationDate || "-"}` },
            { text: `${quotationNo}` },
          ],
          alignment: "right",
        },
      ],
    },
  ];

  // subject
  let subject = [
    {
      width: "*",
      columns: [
        {
          width: "15%",
          stack: [{ text: "Subject:" }, { text: "End customer:" }],
          alignment: "right",
          style: "bitext",
          color: "#808080",
        },
        {
          margin: [3, 0, 0, 0],
          width: "*",
          stack: [{ text: `${QuotationSubject}` }, { text: `${EndCustomer}` }],
          style: "blacktext",
          // color: "#808080"
        },
      ],
      // color: "#808080"
    },
    {
      width: "25%",
      text: "",
    },
  ];

  // console.log(bahttext(QuotationNetVat.toFixed(2)))
  // price
  let discount = "";
  if (QuotationDiscount == 0) discount = "-";
  else discount = moneyFormat(QuotationDiscount.toFixed(2));
  let price = [
    {
      width: "*",
      margin: [5, 5, 0, 0],
      text: `[THAI BAHT] :  ${bahttext(QuotationNetVat.toFixed(2))}`,
      style: "bahttext",
    },
    {
      width: "40%",
      layout: "priceLayout",
      table: {
        headerRows: 0,
        widths: ["*", "40%"],
        heights: 1,
        body: [
          [
            {
              text: "Sub Total for the above:",
              style: "pricetext",
              color: "#808080",
            },
            {
              text: `${moneyFormat(QuotationTotalPrice.toFixed(2))}`,
              style: "price",
            },
          ],
          [
            { text: "Discount:", style: "pricetext", color: "#808080" },
            { text: `${discount}`, style: "price" },
          ],
          [
            {
              text: "Price after discount:",
              style: "pricetext",
              color: "#808080",
              border: [false, false, false, false],
            },
            { text: `${moneyFormat(QuotationNet.toFixed(2))}`, style: "price" },
          ],
          [
            {
              text: "VAT Including 7%:",
              style: "pricetext",
              color: "#808080",
              border: [false, false, false, false],
            },
            { text: `${moneyFormat(QuotationVat.toFixed(2))}`, style: "price" },
          ],
          [
            {
              text: "Net Total:",
              style: "pricetext",
              color: "#808080",
              border: [false, false, false, false],
            },
            {
              text: `${moneyFormat(QuotationNetVat.toFixed(2))}`,
              style: "price",
            },
          ],
        ],
      },
    },
  ];

  // condition
  let getPayTerm = (QuotationPayTerm) => {
    if (
      typeof QuotationPayTerm == "object" ||
      !QuotationPayTerm.includes("QuotationPayTerm")
    ) {
      return "-";
    } else {
      QuotationPayTerm = JSON.parse(QuotationPayTerm);
      let payTerms = Object.values(QuotationPayTerm);
      let payTerm = "";
      let i = 1;
      // console.log(payTerms)
      payTerms.map((term) => {
        // console.log(term)
        if (i == 1 && term == "") term = "-";
        payTerm = payTerm + term + "\n";
        i++;
      });
      return payTerm;
    }
  };
  let payTerm = getPayTerm(QuotationPayTerm);
  let condition = [
    {
      margin: [25, 0, 0, 0],
      width: "90%",
      columns: [
        {
          width: "20%",
          stack: [
            { text: "CONDITION:", style: "condition", margin: [-22, 0, 0, 0] },
            { text: "Validity:", style: "conditiontext" },
            { text: "Term of payment:\n\n\n", style: "conditiontext" },
            { text: "Delivery:", style: "conditiontext" },
            { text: "Remark:", style: "conditiontext" },
            {
              text: "\n\nBest Regards,",
              style: "text",
              margin: [-18, 0, 0, 0],
            },
          ],
        },
        {
          margin: [3, 0, 0, 0],
          width: "*",
          stack: [
            { text: "\n", style: "condition" },
            { text: `${QuotationValidityDate || "-"}`, style: "conditiontext" },
            { text: `${payTerm}`, style: "conditiontext" },
            { text: `${QuotationDelivery || "-"}`, style: "conditiontext" },
            { text: `${QuotationRemark || "-"}`, style: "conditiontext" },
          ],
        },
      ],
    },
    {
      width: "*",
      text: "",
    },
  ];

  // sign
  let space = applySpacing(EmployeeFname + EmployeeLname);
  let sign = "";
  QuotationApproval == 2
    ? (sign = `${space}${EmployeeFname}.${space}`)
    : (sign = `${space}${space}${space}`);
  let signature = [
    {
      width: "auto",
      margin: [10, 0, 0, 0],
      stack: [
        {
          text: `${sign}`,
          style: "sign",
        },
        {
          text: `${EmployeeName || ""}`,
          style: "text",
        },
        {
          text: `${EmployeePosition || ""}`,
          style: "text",
        },
      ],
    },
    {
      width: "*",
      text: "",
    },
  ];

  // item table
  let itemtable = {
    headerRows: 1,
    widths: ["10%", "*", "10%", "10%", "15%"],
    style: "text",
    body: [
      [
        { text: "Item", style: "thead" },
        { text: "Description", style: "thead" },
        { text: "Unit Price", style: "thead" },
        { text: "Qty", style: "thead" },
        { text: "Line Total", style: "thead" },
      ],
    ],
  };

  // get item
  let i = 1;
  let line = 0;
  let pool = await sql.connect(dbconfig);
  const Items = await pool
    .request()
    .query(`SELECT * FROM QuotationItem WHERE QuotationId = ${QuotationId}`);
  if (Items.recordset.length) {
    for (let Item of Items.recordset) {
      let { ItemName, ItemPrice, ItemQty } = Item;
      if (ItemPrice == "undefined" || typeof ItemPrice == "object")
        ItemPrice = 0;
      if (ItemQty == "undefined" || typeof ItemQty == "object") ItemQty = 0;
      let LineTotal = ItemPrice * ItemQty;
      if (LineTotal === 0) {
        ItemPrice = "";
        ItemQty = "";
        LineTotal = "";
      } else {
        ItemPrice = moneyFormat(ItemPrice.toFixed(2));
        LineTotal = moneyFormat(LineTotal.toFixed(2));
      }

      let IPrice, IQty, ITotal;
      if (TableShow === 1 || TableShow === 3) {
        TablePrice === 1 || TablePrice === 3
          ? (IPrice = ItemPrice)
          : (IPrice = "");
        TableQty === 1 || TableQty === 3 ? (IQty = ItemQty) : (IQty = "");
        TableTotal === 1 || TableTotal === 3
          ? (ITotal = LineTotal)
          : (ITotal = "");

        itemtable["body"].push([
          { text: `${i}`, style: "btext", alignment: "center" },
          { text: `${ItemName}`, style: "btext" },
          { text: `${IPrice}`, style: "blacktext", alignment: "right" },
          { text: `${IQty}`, style: "blacktext", alignment: "center" },
          { text: `${ITotal}`, style: "blacktext", alignment: "right" },
        ]);
        line++;
      }
      let j = 1;
      const SubItems = await pool.request()
        .query(`SELECT * FROM [QuotationSubItem] a
              LEFT JOIN [MasterProduct] b ON a.ProductId = b.ProductId
              WHERE ItemId = ${Item.ItemId}`);
      if (SubItems.recordset.length) {
        for (let SubItem of SubItems.recordset) {
          let { SubItemQty, SubItemUnit, ProductName, SubItemPrice } = SubItem;
          if (SubItemPrice == "undefined" || typeof SubItemPrice == "object")
            SubItemPrice = 0;
          if (SubItemQty == "undefined" || typeof SubItemQty == "object")
            SubItemQty = 0;
          let SubTotal = SubItemPrice * SubItemQty;
          if (SubTotal === 0) {
            SubItemPrice = "";
            SubItemQty = "";
            SubItemUnit = "";
            SubTotal = "";
          } else {
            SubItemPrice = moneyFormat(SubItemPrice.toFixed(2));
            SubTotal = moneyFormat(SubTotal.toFixed(2));
          }
          if (SubItemQty == 0 || SubItemUnit == "" || SubItemUnit == "null") {
            SubItemQty = "";
            SubItemUnit = "";
          }

          let SPrice, SQty, STotal;
          if (TableShow === 2 || TableShow === 3) {
            TablePrice === 2 || TablePrice === 3
              ? (SPrice = SubItemPrice)
              : (SPrice = "");
            TableQty === 2 || TableQty === 3
              ? (SQty = `${SubItemQty} ${SubItemUnit}`)
              : (SQty = "");
            TableTotal === 2 || TableTotal === 3
              ? (STotal = SubTotal)
              : (STotal = "");

            if (SPrice === "" || SQty === "") {
              itemtable["body"].push([
                "",
                {
                  text: `${j}) ${ProductName}  ${SubItemQty} ${SubItemUnit}`,
                  style: "blacktext",
                },
                "",
                "",
                "",
              ]);
            } else {
              itemtable["body"].push([
                { text: "", style: "btext", alignment: "center" },
                { text: `${j}) ${ProductName}`, style: "btext" },
                { text: `${SPrice}`, style: "blacktext", alignment: "right" },
                { text: `${SQty}`, style: "blacktext", alignment: "center" },
                { text: `${STotal}`, style: "blacktext", alignment: "right" },
              ]);
            }
            line++;
          }
          j++;
        }
      }
      i++;
    }
  }
  let maxline = 25;
  if (line < maxline)
    for (; line < maxline; line++)
      itemtable["body"].push(["", " ", "", "", ""]);

  let doc = {
    info: {
      title: `No. ${quotationNo}`,
      subject: `${quotationNo}`,
      creator: "PRIVA INNOTECH CO., LTD",
    },
    pageMargins: [60, 95, 60, 54],
    pageSize: "LETTER",
    header: {
      stack: [
        {
          alignment: "left",
          image: "assets/logo.png",
          margin: [60, 54, 0, 54],
          height: 35,
          width: 108,
        },
      ],
    },
    footer: {
      columns: [
        {
          width: "*",
          text: "",
        },
        {
          width: "auto",
          margin: [0, -100, 60, 0],
          stack: [
            {
              margin: [4, 0, 0, 0],
              text: "For customer :\nTo accept this quotation, sign here and\nreturn by Email : Kittanan.w@privainnotech.com,",
            },
            {
              margin: [30, 0, 0, 0],
              text: "Email : Parichart.m@privainnotech.com",
            },
            {
              text: "\n\n\n______________________________________",
              bold: true,
              color: "#000000",
            },
            {
              text: "COMPANY CHOP & AUTHORIZED SIGNATURE",
              alignment: "center",
            },
          ],
          style: "text",
        },
      ],
    },
    content: [
      { columns: head },
      { text: "\n\n" },
      { columns: quotationHead },
      { text: "\n" },
      { columns: subject },
      { text: "\n" },
      {
        layout: "itemLayout",
        table: itemtable,
      },
      { columns: price },
      { columns: condition },
      { text: "\n\n" },
      { columns: signature },
    ],
    styles: {
      text: { color: "#808080" },
      price: { color: "#000000", alignment: "right", lineHeight: 1.2 },
      pricetext: {
        bold: true,
        italics: true,
        alignment: "right",
        lineHeight: 1.2,
      },
      btext: { bold: true },
      bitext: { bold: true, italics: true },
      condition: {
        fontSize: 8,
        bold: true,
        italics: true,
        decoration: "underline",
        color: "#808080",
        alignment: "left",
        lineHeight: 1.3,
      },
      conditiontext: {
        bold: true,
        color: "#808080",
        alignment: "left",
        lineHeight: 1.3,
      },
      bahttext: { bold: true, color: "#808080", alignment: "left" },
      thead: { bold: true, italics: true, alignment: "center" },
      sign: {
        fontSize: 8,
        decoration: "underline",
        alignment: "center",
        lineHeight: 1.4,
      },
    },
    defaultStyle: {
      font: "Tahoma",
      fontSize: 6,
      lineHeight: 1.1,
    },
  };

  // Detail
  let pageBreak = () => {
    return {
      text: "",
      pageBreak: "before",
    };
  };
  let detailHeader = () => {
    return {
      columns: [
        {
          width: "*",
          text: `\n\nQuotation Detail :\n\n`,
          style: "btext",
          fontSize: 8,
        },
        {
          width: "50%",
          margin: [0, -15, 0, 0],
          text: `Quotation No. : ${quotationNo}`,
          alignment: "right",
          fontSize: 8,
        },
      ],
    };
  };
  let detailTable = () => {
    return {
      headerRows: 0,
      widths: ["*", "10%", "10%"],
      style: "text",
      body: [],
    };
  };
  if (JSON.parse(QuotationDetail) !== null) {
    let detailTable1 = detailTable();
    let detailTable2 = detailTable();
    let detailTable3 = detailTable();
    let detail1 = {
      margin: [15, 0, 50, 0],
      layout: "noBorders",
      table: detailTable1,
    };
    let detail2 = {
      margin: [15, 0, 50, 0],
      layout: "noBorders",
      table: detailTable2,
    };
    let detail3 = {
      margin: [15, 0, 50, 0],
      layout: "noBorders",
      table: detailTable3,
    };
    let Details = JSON.parse(QuotationDetail).blocks;
    let i = 0;
    Details.forEach((Detail) => {
      let isBold,
        text = Detail.data.text;
      if (text.includes("ตัวอย่างการพิมพ์")) {
        throw new Error("Please delete detail example");
      }
      text.includes("<b>") ? (isBold = "btext") : (isBold = "blacktext");
      text = text.replace(/<b>|<\/b>|&nbsp;/g, " ");
      text = text.split("; ");
      if (i < 40) {
        if (i === 0) {
          doc["content"].push(pageBreak(), detailHeader(), detail1);
        }
        detailTable1["body"].push([
          { text: text[0], style: isBold },
          { text: text[1] ? text[1] : "", style: isBold },
          { text: text[2] ? text[2] : "", style: isBold },
        ]);
      } else if (i < 80) {
        if (i === 40) {
          doc["content"].push(pageBreak(), detailHeader(), detail2);
        }
        detailTable2["body"].push([
          { text: text[0], style: isBold },
          { text: text[1] ? text[1] : "", style: isBold },
          { text: text[2] ? text[2] : "", style: isBold },
        ]);
      } else {
        if (i === 80) {
          doc["content"].push(pageBreak(), detailHeader(), detail3);
        }
        detailTable3["body"].push([
          { text: text[0], style: isBold },
          { text: text[1] ? text[1] : "", style: isBold },
          { text: text[2] ? text[2] : "", style: isBold },
        ]);
      }
      i++;
    });
  }
  return doc;
};

module.exports = { fonts, customLayouts, createPdf };
