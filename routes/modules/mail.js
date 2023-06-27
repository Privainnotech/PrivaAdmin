const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const mailInfo = require("../../libs/mailInfo");
const QuotationLink = "https://dashboard.privainnotech.net/quotation";

const sendQuotationMail = async (Sender, Receiver, Quotation, Type) => {
  try {
    let { EmployeeFname, EmployeeLname } = Sender;
    let SenderName = `${EmployeeFname} ${EmployeeLname}`;
    let ApproverEmail = Receiver.EmployeeEmail;
    console.log(ApproverEmail);

    let { QuotationNo, QuotationRevised } = Quotation;
    let quotationNo = "";
    QuotationRevised < 10
      ? (quotationNo = `${QuotationNo}_0${QuotationRevised}`)
      : (quotationNo = `${QuotationNo}_${QuotationRevised}`);

    let quotationPath = path.join(
      process.cwd(),
      `/public/report/quotation/${quotationNo}.pdf`
    );

    let transporter = await nodemailer.createTransport({
      host: mailInfo.auth.host,
      port: mailInfo.auth.port,
      secure: true,
      auth: {
        user: mailInfo.auth.email,
        pass: mailInfo.auth.pass,
      },
    });
    let subject =
      Type == "approve"
        ? `Please approve quotation ${quotationNo}`
        : `Please check quotation ${quotationNo} approval`;
    let mail = {
      from: `"${SenderName}" <${mailInfo.auth.email}>`,
      to: `${ApproverEmail}`,
      subject: subject,
      html: await mailHtml(quotationNo, Quotation),
      attachments: [
        {
          filename: `${quotationNo}.pdf`,
          content: fs.createReadStream(quotationPath),
        },
      ],
    };

    let info = await transporter.sendMail(mail);
    console.log("Email sented: ", info.messageId);
  } catch (err) {
    console.log(`${err}`);
  }
};

const mailHtml = async (QuotationNo, Quotation) => {
  let { CustomerName, CustomerEmail } = Quotation;
  let { CompanyName, CompanyAddress, EndCustomer } = Quotation;
  let { QuotationSubject, QuotationDate } = Quotation;
  let { QuotationTotalPrice, QuotationDiscount, QuotationNet } = Quotation;
  let { QuotationVat, QuotationNetVat } = Quotation;
  return `
    <h1>Project No. ${QuotationNo}</h1>
    <h3>Date: ${QuotationDate || "-"}</h3>
    <hr>
    <div style="padding:10px;border: 3px solid #000;">
      <h2>Project Name: ${QuotationSubject}</h2>
      <h5>Customer: ${CustomerName}</h5>
      <h5>Email: ${CustomerEmail}</h5>
      <h5>Company: ${CompanyName}</h5>
      <h5>Address: ${CompanyAddress}</h5>
      <h5>End Customer: ${EndCustomer}</h5>
      <br>
      <h3>Price</h3>
      <h5>Sub Total: ${QuotationTotalPrice}</h5>
      <h5>Discount: ${QuotationDiscount}</h5>
      <h5>Price after discount: ${QuotationNet}</h5>
      <h5>VAT Including 7%: ${QuotationVat}</h5>
      <h5>Net Total: ${QuotationNetVat}</h5>
    </div>
    
    <a href="${QuotationLink}" style="color: #fff;text-decoration:none;">
      <div style="background-color: #1cbb8c;padding:10px;border: 3px solid #000;text-align: center;">
        <h2>Go to Quotation</h2>
      </div>
    </a>
  `;
};

module.exports = sendQuotationMail;
