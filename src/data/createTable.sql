CREATE Table company(
    companyId int IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    companyName NVARCHAR(50) NOT NULL UNIQUE,
    companyAddress NVARCHAR(255) NOT NULL,
	companyTel NVARCHAR(20) NULL,
	companyEmail NVARCHAR(20) NULL
)

CREATE Table customer(
    customerId int IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    customerTitle NVARCHAR(50) NULL,
	customerFname NVARCHAR(50) NOT NULL UNIQUE,
	customerLname NVARCHAR(50) NULL,
    CustomerEmail NVARCHAR(50) NOT NULL UNIQUE,
	companyId int NOT NULL
	CONSTRAINT FK_customer_company FOREIGN KEY (companyId)
	REFERENCES company(companyId)
)

CREATE Table quotation(
    quotationId int IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    quotationNo NVARCHAR(20) NOT NULL UNIQUE,
	customerId int NOT NULL,
	quotationSubject NVARCHAR(255) NOT NULL,
	createdDate NVARCHAR(10) NOT NULL DEFAULT CONVERT(VARCHAR(10), getdate(), 105),
	total_price money NULL,
	discount money NULL,
	netprice money NULL,
	vat money NULL,
	netprice_vat money NULL,
	thaiBaht NVARCHAR(50) NULL,
	validityDate int NULL,
	payTerm NVARCHAR(MAX) NULL,
	delivery NVARCHAR(255) NULL,
	remark NVARCHAR(MAX) NULL
	CONSTRAINT FK_quotation_customer FOREIGN KEY (customerId)
	REFERENCES customer(customerId)
)

CREATE Table quotation_item(
	itemId int IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    quotationId int NOT NULL,
	itemName NVARCHAR(50) NOT NULL,
    itemPrice money NULL,
	itemQty NVARCHAR(20) NULL,
	totalPrice money NULL
	CONSTRAINT FK_qitem_quotation FOREIGN KEY (quotationId)
	REFERENCES quotation(quotationId)
)

CREATE Table quotation_subitem(
	subitemId int IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    itemId int NOT NULL,
	subItemName NVARCHAR(50) NOT NULL,
    subitemPrice money NULL,
	subitemQty NVARCHAR(20) NULL,
	totalPrice money NULL,
	detail NVARCHAR(MAX) NULL
	CONSTRAINT FK_qsubitem_qitem FOREIGN KEY (itemId)
	REFERENCES quotation_item(itemId)
)


