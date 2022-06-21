CREATE Table [PrivaAdmin].[dbo].[MasterCompany](
    CompanyId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    CompanyName NVARCHAR(50) NOT NULL UNIQUE,
    CompanyAddress NVARCHAR(255) NOT NULL,
	CompanyEmail NVARCHAR(50) NULL,
	CompanyTel NVARCHAR(20) NULL,
	CompanyActive int NOT NULL DEFAULT 1
)

CREATE Table [PrivaAdmin].[dbo].[MasterCustomer](
    CustomerId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	CompanyId bigint NOT NULL,
    CustomerTitle NVARCHAR(10) NULL,
	CustomerFname NVARCHAR(50) NOT NULL,
	CustomerLname NVARCHAR(50) NULL,
    CustomerEmail NVARCHAR(50) NOT NULL,
	CustomerTel NVARCHAR(20) NULL,
	CustomerActive int NOT NULL DEFAULT 1
	CONSTRAINT FK_customer_company FOREIGN KEY (CompanyId)
	REFERENCES MasterCompany(CompanyId)
)

CREATE Table [PrivaAdmin].[dbo].[MasterStatus](
    StatusId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	StatusName NVARCHAR(20) NOT NULL UNIQUE
)

CREATE Table [PrivaAdmin].[dbo].[MasterEmployee](
	EmployeeId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	EmployeeTitle NVARCHAR(10) NULL,
	EmployeeFname NVARCHAR(50) NOT NULL,
	EmployeeLname NVARCHAR(50) NULL,
	EmployeeEmail NVARCHAR(50) NULL,
	EmployeeTel NVARCHAR(20) NULL,
	EmployeePosition NVARCHAR(50) NULL
)

CREATE Table [PrivaAdmin].[dbo].[QuotationNo](
    QuotationNoId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    QuotationNo NVARCHAR(20) NOT NULL UNIQUE,
	CustomerId bigint NOT NULL,
	QuotationDate NVARCHAR(10) NOT NULL DEFAULT CONVERT(VARCHAR(10), getdate(), 105),
	CONSTRAINT FK_quotationno_customer FOREIGN KEY (CustomerId)
	REFERENCES MasterCustomer(CustomerId)
)

CREATE Table [PrivaAdmin].[dbo].[Quotation](
    QuotationId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    QuotationNoId bigint NOT NULL,
	QuotationRevised int NOT NULL,
	QuotationSubject NVARCHAR(255) NOT NULL,
	QuotationStatus bigint NOT NULL DEFAULT 1,
	QuotationTotalPrice money NULL,
	QuotationDiscount money NULL,
	QuotationNet money NULL,
	QuotationVat money NULL,
	QuotationNetVat money NULL,
	QuotationValidityDate int NULL,
	QuotationPayTerm NVARCHAR(MAX) NULL,
	QuotationDelivery NVARCHAR(255) NULL,
	QuotationRemark NVARCHAR(MAX) NULL,
	EmployeeApproveId int NULL
	FOREIGN KEY (QuotationNoId) REFERENCES QuotationNo(QuotationNoId),
	FOREIGN KEY (QuotationStatus) REFERENCES MasterStatus(StatusId)
)

CREATE Table [PrivaAdmin].[dbo].[QuotationItem](
	ItemId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    QuotationId bigint NOT NULL,
	ItemName NVARCHAR(50) NOT NULL,
    ItemPrice money NULL,
	ItemQty NVARCHAR(20) NULL,
	ItemTotalPrice money NULL
	CONSTRAINT FK_qitem_quotation FOREIGN KEY (QuotationId)
	REFERENCES Quotation(QuotationId)
)

CREATE Table [PrivaAdmin].[dbo].[Users](
	UserId int IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	AvatarPath NVARCHAR(255) NOT NULL DEFAULT N'./images/avatar/0.png',
	Username NVARCHAR(50) NOT NULL,
	Password NVARCHAR(255) NOT NULL,
	Role NVARCHAR(255) NULL
)


