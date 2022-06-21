SELECT
row_number() over(order by a.QuotationId desc) as 'index',
a.QuotationId,
a.QuotationNo,
a.QuotationSubject Subject,
b.CustomerTitle + b.CustomerFname + b.CustomerLname Customer,
a.QuotationDate,
a.QuotationStatus Status
FROM [quotation] a
LEFT JOIN [customer] b ON a.customerId = b.customerId

Select *
FROM [Customer] a
LEFT JOIN [Company] b ON a.CompanyId = b.CompanyId
order by a.CustomerFname

Select * FROM MasterCompany order by CompanyName
Select * FROM MasterCustomer order by CustomerFname

DELETE FROM MasterCustomer

SELECT row_number() over(order by CustomerFname) as 'index', *
FROM MasterCustomer a
LEFT JOIN MasterCompany b ON a.CompanyId = b.CompanyId
ORDER BY CustomerFname
WHERE CompanyId = ${CompanyId}