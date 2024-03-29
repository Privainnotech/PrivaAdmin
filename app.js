const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const flash = require('express-flash');
const cookieSession = require('cookie-session');
const cors = require('cors');

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'script')));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cookieSession({
    name: 'privauser',
    keys: ['priva, dashboard'],
    maxAge: 1000 * 60 * 60 * 24,
  })
);

app.use(flash());

const indexRoute = require('./routes/index');
const userRoute = require('./routes/user');

// path setting module
const employeeRoute = require('./routes/master_setting/employee_master');
const productRoute = require('./routes/master_setting/product_master');
const companyRoute = require('./routes/master_setting/company_master');
const customerRoute = require('./routes/master_setting/customer_master');

// path main module
const quotationRoute = require('./routes/quotation/quotation');
const quotationStatusRoute = require('./routes/quotation/quotation_set');
const quotationReportRoute = require('./routes/quotation/quotation_report');
const quotationApproveRoute = require('./routes/quotation/quotation_approve');
const dropdownRoute = require('./routes/main/dropdown');

// path pricing
const pricingRoute = require('./routes/pricing/pricing');
const vendorRoute = require('./routes/pricing/vendor');
const categoryRoute = require('./routes/pricing/category');

app.use('/', indexRoute);
app.use('/user', userRoute);

app.use('/company_master', companyRoute);
app.use('/customer_master', customerRoute);
app.use('/employee_master', employeeRoute);
app.use('/product_master', productRoute);

app.use('/quotation', quotationRoute);
app.use('/quotation_set', quotationStatusRoute);
app.use('/quotation_report', quotationReportRoute);
app.use('/quotation_approval', quotationApproveRoute);
app.use('/dropdown', dropdownRoute);

app.use('/pricing', pricingRoute);
app.use('/pricing_vendor', vendorRoute);
app.use('/pricing_category', categoryRoute);

// const sql = require("mssql");
// const { dbconfig } = require("./config");
// app.use("/testconnect", async (req, res, next) => {
//   try {
//     let pool = await sql.connect(dbconfig);
//     res.status(200).send({ message: "Connect SQL Server Success" });
//   } catch (err) {
//     console.log(err);
//     res.status(500).send({ message: err });
//   }
// });

module.exports = app;
