DROP TABLE QuotationSubItem
DROP TABLE QuotationItem
DROP TABLE QuotationSetting
DROP TABLE Quotation
DROP TABLE QuotationNo
DROP TABLE MasterProduct
DROP TABLE MasterEmployee
DROP TABLE MasterStatus
DROP TABLE MasterCustomer
DROP TABLE MasterCompany

CREATE Table [MasterCompany]
(
	CompanyId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	CompanyName NVARCHAR(50) NOT NULL UNIQUE,
	CompanyAddress NVARCHAR(255) NOT NULL,
	CompanyEmail NVARCHAR(50) NULL,
	CompanyTel NVARCHAR(20) NULL,
	CompanyActive int NOT NULL DEFAULT 1
)

CREATE Table [MasterCustomer]
(
	CustomerId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	CompanyId bigint NOT NULL,
	CustomerName NVARCHAR(50) NOT NULL,
	CustomerEmail NVARCHAR(50) NOT NULL,
	CustomerTel NVARCHAR(20) NULL,
	CustomerActive int NOT NULL DEFAULT 1
		CONSTRAINT FK_customer_company FOREIGN KEY (CompanyId) REFERENCES MasterCompany(CompanyId)
)

CREATE Table [MasterStatus]
(
	StatusId int PRIMARY KEY CLUSTERED NOT NULL,
	StatusName NVARCHAR(20) NOT NULL UNIQUE
)

INSERT INTO MasterStatus
	(StatusId, StatusName)
VALUES(1, N'Pre-Quotation'),
	(2, N'Quotation'),
	(3, N'Booking'),
	(4, N'Loss'),
	(5, N'Cancel')

CREATE Table [MasterEmployee]
(
	EmployeeId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	EmployeeTitle NVARCHAR(10) NULL,
	EmployeeFname NVARCHAR(50) NOT NULL,
	EmployeeLname NVARCHAR(50) NULL,
	EmployeeEmail NVARCHAR(50) NOT NULL,
	EmployeeTel NVARCHAR(20) NULL,
	EmployeePosition NVARCHAR(50) NULL,
	Password NVARCHAR(max) NOT NULL,
	Authority int NOT NULL DEFAULT 0,
	EmployeeActive int NOT NULL DEFAULT 1,
	Approver int NOT NULL DEFAULT 0
)

CREATE Table [MasterProduct]
(
	ProductId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	ProductCode NVARCHAR(20) NOT NULL UNIQUE,
	ProductName NVARCHAR(255) NOT NULL UNIQUE,
	ProductPrice money NULL,
	ProductType NVARCHAR(10) NULL,
)

CREATE Table [QuotationNo]
(
	QuotationNoId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	QuotationNo NVARCHAR(20) NOT NULL UNIQUE,
	CustomerId bigint NULL
)

CREATE Table [Quotation]
(
	QuotationId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	QuotationNoId bigint NOT NULL FOREIGN KEY (QuotationNoId) REFERENCES QuotationNo(QuotationNoId),
	CustomerId bigint NULL FOREIGN KEY (CustomerId) REFERENCES privanet.MasterCustomer(CustomerId),
	QuotationRevised int NOT NULL DEFAULT 0,
	QuotationSubject NVARCHAR(255) NOT NULL,
	EndCustomer NVARCHAR(255) NOT NULL DEFAULT N'-',
	QuotationDate date NULL,
	QuotationUpdatedDate datetime NULL,
	QuotationStatus int NOT NULL DEFAULT 1 FOREIGN KEY (QuotationStatus) REFERENCES MasterStatus(StatusId),
	QuotationTotalPrice money NULL DEFAULT 0,
	QuotationDiscount money NULL DEFAULT 0,
	QuotationNet AS QuotationTotalPrice - QuotationDiscount,
	QuotationVat AS (QuotationTotalPrice - QuotationDiscount) * 0.07 ,
	QuotationNetVat AS (QuotationTotalPrice - QuotationDiscount) * 1.07,
	QuotationValidityDate NVARCHAR(255) NULL DEFAULT N'-',
	QuotationPayTerm NVARCHAR(MAX) NULL DEFAULT N'-',
	QuotationDelivery NVARCHAR(255) NULL DEFAULT N'-',
	QuotationRemark NVARCHAR(MAX) NULL DEFAULT N'-',
	QuotationDetail NVARCHAR(MAX) NULL,
	QuotationDetail1 NVARCHAR(MAX) NULL,
	QuotationDetail2 NVARCHAR(MAX) NULL,
	QuotationApproval int NOT NULL DEFAULT 0,
	EmployeeApproveId bigint NULL FOREIGN KEY (EmployeeApproveId) REFERENCES MasterEmployee(EmployeeId),
	EmployeeEditId bigint NULL
)

CREATE TABLE [QuotationPayTerm]
(
	QuotationId bigint NOT NULL,
	IndexPayTerm int NOT NULL,
	PayTerm NVARCHAR(255) NULL,
	PayPercent float NULL,
	PayForecast date NULL
)
ALTER TABLE [QuotationPayTerm]
ADD PayInvoiced int NOT NULL DEFAULT 0

CREATE Table [QuotationSetting]
(
	QuotationSetId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	QuotationId bigint NOT NULL,
	TableShow int NOT NULL DEFAULT 3,
	TablePrice int NOT NULL DEFAULT 1,
	TableQty int NOT NULL DEFAULT 1,
	TableTotal int NOT NULL DEFAULT 1,
	PayInvoiced int NOT NULL DEFAULT 0
	FOREIGN KEY (QuotationId) REFERENCES Quotation(QuotationId)
)

CREATE Table [QuotationItem]
(
	ItemId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	QuotationId bigint NOT NULL,
	ItemName NVARCHAR(255) NOT NULL,
	ItemPrice money NULL,
	ItemQty int NULL
		FOREIGN KEY (QuotationId) REFERENCES Quotation(QuotationId)
)

CREATE Table [QuotationSubItem]
(
	SubItemId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	ItemId bigint NOT NULL,
	ProductId bigint NULL,
	SubItemName NVARCHAR(255) NOT NULL,
	SubItemPrice money NULL,
	SubItemQty int NULL,
	SubItemUnit NVARCHAR(10) NULL
		FOREIGN KEY (ItemId) REFERENCES QuotationItem(ItemId),
	FOREIGN KEY (ProductId) REFERENCES MasterProduct(ProductId)
)


