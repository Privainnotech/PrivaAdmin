async function LoadDropDown() {
    // Dropdown Customer
    $.ajax({
        url: "/dropdown/customer",
        method: "get",
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            response.forEach((Customer) => {
                $("#modalInpCustomerId").append(
                    "<option value=" +
                    Customer.CustomerId +
                    "><span>" +
                    Customer.CustomerName +
                    "</span></option>"
                );
            });
        },
    });

    // Dropdown Edit Status
    $.ajax({
        url: "/dropdown/status",
        method: "get",
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            response.forEach((Status) => {
                $("#modalEditStatus").append(
                    "<option value=" +
                    Status.StatusId +
                    "><span>" +
                    Status.StatusName +
                    "</span></option>"
                );
            });
        },
    });

    // Dropdown Edit Employee
    $.ajax({
        url: "/dropdown/employee",
        method: "get",
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            response.forEach((Employee) => {
                $("#PJ_Approve").append(
                    "<option value=" +
                    Employee.EmployeeId +
                    "><span>" +
                    Employee.EmployeeName +
                    "</span></option>"
                );
            });
        },
    });
    $.ajax({
        url: "/dropdown/product",
        method: "get",
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            response.forEach((Product) => {
                $("#modalInpProduct").append(
                    "<option value=" +
                    Product.ProductId +
                    "><span>" +
                    Product.ProductName +
                    "</span></option>"
                );
            });
        },
    });

    $.ajax({
        url: "/dropdown/product",
        method: "get",
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            response.forEach((Product) => {
                $("#modalInpEdProduct").append(
                    "<option value=" +
                    Product.ProductId +
                    "><span>" +
                    Product.ProductName +
                    "</span></option>"
                );
            });
        },
    });
}

LoadDropDown();
