CREATE Table [Priva].[dbo].[Users](
	UserId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	AvatarPath NVARCHAR(255) NOT NULL DEFAULT N'./images/avatar/0.png',
	Username NVARCHAR(50) NOT NULL,
	Password NVARCHAR(255) NOT NULL,
	Role NVARCHAR(255) NULL
)

CREATE Table [Priva].[dbo].[MasterCompany](
    CompanyId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    CompanyName NVARCHAR(50) NOT NULL UNIQUE,
    CompanyAddress NVARCHAR(255) NOT NULL,
	CompanyEmail NVARCHAR(50) NULL,
	CompanyTel NVARCHAR(20) NULL,
	CompanyActive int NOT NULL DEFAULT 1
)

CREATE Table [Priva].[dbo].[MasterCustomer](
    CustomerId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	CompanyId bigint NOT NULL,
    CustomerTitle NVARCHAR(10) NULL,
	CustomerFname NVARCHAR(50) NOT NULL,
	CustomerLname NVARCHAR(50) NULL,
    CustomerEmail NVARCHAR(50) NOT NULL,
	CustomerTel NVARCHAR(20) NULL,
	CustomerActive int NOT NULL DEFAULT 1
	CONSTRAINT FK_customer_company FOREIGN KEY (CompanyId) REFERENCES MasterCompany(CompanyId)
)

CREATE Table [Priva].[dbo].[MasterStatus](
    StatusId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	StatusName NVARCHAR(20) NOT NULL UNIQUE
)

CREATE Table [Priva].[dbo].[MasterEmployee](
	EmployeeId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	EmployeeTitle NVARCHAR(10) NULL,
	EmployeeFname NVARCHAR(50) NOT NULL,
	EmployeeLname NVARCHAR(50) NULL,
	EmployeeEmail NVARCHAR(50) NULL,
	EmployeeTel NVARCHAR(20) NULL,
	EmployeePosition NVARCHAR(50) NULL
)

CREATE Table [Priva].[dbo].[MasterProduct](
	ProductId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	ProductCode NVARCHAR(20) NOT NULL UNIQUE,
	ProductName NVARCHAR(255) NOT NULL UNIQUE,
    ProductPrice money NULL,
	ProductType NVARCHAR(10) NULL,
)

CREATE Table [Priva].[dbo].[QuotationNo](
    QuotationNoId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    QuotationNo NVARCHAR(20) NOT NULL UNIQUE,
	CustomerId bigint NOT NULL
	FOREIGN KEY (CustomerId) REFERENCES MasterCustomer(CustomerId)
)

CREATE Table [Priva].[dbo].[Quotation](
    QuotationId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    QuotationNoId bigint NOT NULL,
	QuotationRevised int NOT NULL DEFAULT 0,
	QuotationSubject NVARCHAR(255) NOT NULL,
	EndCustomer NVARCHAR(255) NOT NULL DEFAULT N'-',
	QuotationDate NVARCHAR(10) NULL DEFAULT N'-',
	QuotationUpdatedDate NVARCHAR(10) NULL DEFAULT N'-',
	QuotationStatus bigint NOT NULL DEFAULT 1,
	QuotationTotalPrice money NULL DEFAULT 0,
	QuotationDiscount money NULL DEFAULT 0,
	QuotationNet AS QuotationTotalPrice - QuotationDiscount,
	QuotationVat AS (QuotationTotalPrice - QuotationDiscount) * 0.07 ,
	QuotationNetVat AS (QuotationTotalPrice - QuotationDiscount) * 1.07,
	QuotationValidityDate int NULL DEFAULT N'-',
	QuotationPayTerm NVARCHAR(MAX) NULL DEFAULT N'-',
	QuotationDelivery NVARCHAR(255) NULL DEFAULT N'-',
	QuotationRemark NVARCHAR(MAX) NULL DEFAULT N'-',
	QuotationDetail NVARCHAR(MAX) NULL,
	QuotationDetail1 NVARCHAR(MAX) NULL,
	QuotationDetail2 NVARCHAR(MAX) NULL,
	EmployeeApproveId bigint NULL,
	UserId bigint NULL
	FOREIGN KEY (QuotationNoId) REFERENCES QuotationNo(QuotationNoId),
	FOREIGN KEY (QuotationStatus) REFERENCES MasterStatus(StatusId),
	FOREIGN KEY (EmployeeApproveId) REFERENCES MasterEmployee(EmployeeId),
	FOREIGN KEY (UserId) REFERENCES Users(UserId)
)

CREATE Table [Priva].[dbo].[QuotationSetting](
	QuotationSetId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	QuotationId bigint NOT NULL,
	TableShow int NOT NULL DEFAULT 3,
	TablePrice int NOT NULL DEFAULT 1,
	TableQty int NOT NULL DEFAULT 1,
	TableTotal int NOT NULL DEFAULT 1,
	CustomDetail int NOT NULL DEFAULT 1,
	DetailShow int NOT NULL DEFAULT 3,
	DetailQty int NOT NULL DEFAULT 2,
	DetailTotal int NOT NULL DEFAULT 0,
	FOREIGN KEY (QuotationId) REFERENCES Quotation(QuotationId)
)

CREATE Table [Priva].[dbo].[QuotationItem](
	ItemId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    QuotationId bigint NOT NULL,
	ItemName NVARCHAR(255) NOT NULL,
    ItemPrice money NULL,
	ItemQty int NULL,
	ItemDescription NVARCHAR(MAX) NULL
	FOREIGN KEY (QuotationId) REFERENCES Quotation(QuotationId)
)

CREATE Table [Priva].[dbo].[QuotationSubItem](
	SubItemId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    ItemId bigint NOT NULL,
	ProductId bigint NULL,
	SubItemQty int NULL,
	SubItemUnit NVARCHAR(10) NULL
	FOREIGN KEY (ItemId) REFERENCES QuotationItem(ItemId),
	FOREIGN KEY (ProductId) REFERENCES MasterProduct(ProductId)
)

