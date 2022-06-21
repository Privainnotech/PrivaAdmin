CREATE Table [PrivaAdmin].[dbo].[Users](
	UserId int IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	AvatarPath NVARCHAR(255) NOT NULL DEFAULT N'./images/avatar/0.png',
	Username NVARCHAR(50) NOT NULL,
	Password NVARCHAR(255) NOT NULL,
	Role NVARCHAR(255) NULL
)

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

CREATE Table [PrivaAdmin].[dbo].[MasterProduct](
	ProductId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
	ProductCode NVARCHAR(20) NOT NULL UNIQUE,
	ProductName NVARCHAR(50) NOT NULL UNIQUE,
    ProductPrice money NULL,
)

CREATE Table [PrivaAdmin].[dbo].[QuotationNo](
    QuotationNoId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    QuotationNo NVARCHAR(20) NOT NULL UNIQUE DEFAULT N'pre_' + dbo.fnFormatDate (getdate(), N'YYYYMM00'),
	CustomerId bigint NOT NULL,
	QuotationDate NVARCHAR(10) NOT NULL DEFAULT CONVERT(VARCHAR(10), getdate(), 105)
	FOREIGN KEY (CustomerId) REFERENCES MasterCustomer(CustomerId)
)

CREATE Table [PrivaAdmin].[dbo].[Quotation](
    QuotationId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    QuotationNoId bigint NOT NULL,
	QuotationRevised int NOT NULL DEFAULT 0,
	QuotationSubject NVARCHAR(255) NOT NULL,
	QuotationStatus bigint NOT NULL DEFAULT 1,
	QuotationTotalPrice money NULL DEFAULT 0,
	QuotationDiscount money NULL DEFAULT 0,
	QuotationNet AS QuotationTotalPrice - QuotationDiscount,
	QuotationVat AS (QuotationTotalPrice - QuotationDiscount) * 0.07 ,
	QuotationNetVat AS (QuotationTotalPrice - QuotationDiscount) * 1.07,
	QuotationValidityDate int NULL,
	QuotationPayTerm NVARCHAR(MAX) NULL,
	QuotationDelivery NVARCHAR(255) NULL,
	QuotationRemark NVARCHAR(MAX) NULL,
	QuotationDescription NVARCHAR(MAX) NULL,
	EmployeeApproveId bigint NULL
	FOREIGN KEY (QuotationNoId) REFERENCES QuotationNo(QuotationNoId),
	FOREIGN KEY (QuotationStatus) REFERENCES MasterStatus(StatusId),
	FOREIGN KEY (EmployeeApproveId) REFERENCES MasterEmployee(EmployeeId)
)

CREATE Table [PrivaAdmin].[dbo].[QuotationItem](
	ItemId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    QuotationId bigint NOT NULL,
	ItemName NVARCHAR(50) NOT NULL,
    ItemPrice money NULL,
	ItemQty NVARCHAR(20) NULL
	CONSTRAINT FK_qitem_quotation FOREIGN KEY (QuotationId)
	REFERENCES Quotation(QuotationId)
)

CREATE Table [PrivaAdmin].[dbo].[QuotationSubItem](
	SubItemId bigint IDENTITY(1,1) PRIMARY KEY CLUSTERED NOT NULL,
    ItemId bigint NOT NULL,
	ProductId bigint NULL,
	SubItemQty NVARCHAR(20) NULL
	FOREIGN KEY (ItemId) REFERENCES QuotationItem(ItemId),
	FOREIGN KEY (ProductId) REFERENCES MasterProduct(ProductId)
)

CREATE FUNCTION dbo.fnFormatDate (@Datetime DATETIME, @FormatMask NVARCHAR(32))
RETURNS NVARCHAR(32)
AS
BEGIN
    DECLARE @StringDate NVARCHAR(32)
	SET @StringDate = @FormatMask
	IF (CHARINDEX ('YYYY',@StringDate) > 0)
	   SET @StringDate = REPLACE(@StringDate, 'YYYY',
	                     DATENAME(YY, @Datetime))

    IF (CHARINDEX ('YY',@StringDate) > 0)
		SET @StringDate = REPLACE(@StringDate, 'YY',
		                  RIGHT(DATENAME(YY, @Datetime),2))

    IF (CHARINDEX ('Month',@StringDate) > 0)
	    SET @StringDate = REPLACE(@StringDate, 'Month',
		                  DATENAME(MM, @Datetime))

    IF (CHARINDEX ('MON',@StringDate COLLATE SQL_Latin1_General_CP1_CS_AS)>0)
	    SET @StringDate = REPLACE(@StringDate, 'MON',
		                  LEFT(UPPER(DATENAME(MM, @Datetime)),3))

    IF (CHARINDEX ('Mon',@StringDate) > 0)
	    SET @StringDate = REPLACE(@StringDate, 'Mon',
		                  LEFT(DATENAME(MM, @Datetime),3))

    IF (CHARINDEX ('MM',@StringDate) > 0)
	    SET @StringDate = REPLACE(@StringDate, 'MM',
		                  RIGHT('0'+CONVERT(VARCHAR,DATEPART(MM, @Datetime)),2))

    IF (CHARINDEX ('M',@StringDate) > 0)
	    SET @StringDate = REPLACE(@StringDate, 'M',
		                  CONVERT(VARCHAR,DATEPART(MM, @Datetime)))

    IF (CHARINDEX ('DD',@StringDate) > 0)
	    SET @StringDate = REPLACE(@StringDate, 'DD',
	                      RIGHT('0'+DATENAME(DD, @Datetime),2))

    IF (CHARINDEX ('D',@StringDate) > 0)
	    SET @StringDate = REPLACE(@StringDate, 'D',
		                  DATENAME(DD, @Datetime))   

RETURN @StringDate
END

GO

INSERT INTO MasterStatus
VALUES (N'pre')

ALTER TABLE QuotationNo
ADD CONSTRAINT df_QuotationNo DEFAULT N'pre_' + dbo.fnFormatDate (getdate(), N'YYYYMM00') FOR QuotationNo;


