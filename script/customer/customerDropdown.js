async function LoadDropDown() {
    // Edit Customer
    $.ajax({
        url: "/dropdown/company",
        method: 'get',
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            response.forEach(Company => {
                $("#modalInpCompanyId").append("<option value=" + Company.CompanyId + "><span>" + Company.CompanyName + "</span></option>");
            });
            console.log(response)
        }
    })
}

