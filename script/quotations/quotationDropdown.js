async function LoadDropDown() {
    // Edit Customer
    $.ajax({
        url: "/dropdown/customer",
        method: 'get',
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            response.forEach(Customer => {
                $("#modalInpCustomerId").append("<option value=" + Customer.CustomerId + "><span>" + Customer.CustomerName + "</span></option>");
            });
        }
    })
}

LoadDropDown();