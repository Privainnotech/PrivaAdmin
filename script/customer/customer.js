$(document).ready(function () {
    //MOSTRAR
    function fill_resetTable() {
        var trHTML = ''; 
        trHTML += '<tr>'
        trHTML +=  '<td colspan="6">Choose Company...</td>'
        trHTML +=  '</tr>' 
        document.getElementById("showTable").innerHTML = trHTML;
    }

    function fill_customer(Id) {
        // console.log(Id)
        tableCustomer = $('#tableCustomer').DataTable({
            "bDestroy": true,
            "ajax": {
                "url": `/customer_master/data/` + Id,
                "dataSrc": ""
            },
            "columns": [
                {
                    "data": "index"
                },
                {
                    "data":  "CustomerName" 
                },
                {
                    "data": "CompanyId"
                },
                {
                    "data": "CustomerEmail"
                },
                {
                    "data": "CustomerTel"
                },
                {
                    "defaultContent": "<div class='text-center'><div class='btn-group'><button class='btn btn-primary p-1 m-2' id='btnEditCustomer' data-toggle='modal'  data-target='#modalCustomerMaster'  style='width: 2rem;''><i class='fa fa-pencil-square-o'></i></button><button  class='btn btn-danger p-1 m-2' id='btnDelCustomer' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                }
                ,
                {
                    "data": "CustomerId"
                }

            ],"columnDefs":[
                {
                    "targets": [6],
                    "visible": false
                },
            ],
        });
    }
    // fill_customer(1)

    //Create
    $(document).on("click", "#addCustomer", function () {
        $("#formCustomer").trigger("reset");
        $(".modal-title").text("Add Customer");
        console.log("save0");
        $("#modalSaveCustomer").unbind();
        $("#modalSaveCustomer").click(function () {
                let CustomerTitle = $.trim($('#modalInpCustomerTitle').val());
                let CustomerFname = $.trim($('#modalInpCustomerFname').val());
                let CustomerLname = $.trim($('#modalInpCustomerLname').val());
                let CustomerEmail = $.trim($('#modalInpCustomerEmail').val());
                let CustomerTel = $.trim($('#modalInpCustomerTel').val());
                let CompanyId = $.trim($('#modalInpCompanyId').val());

            if (CustomerFname != null) {
                $.ajax({
                    url: "/customer_master/add",
                    method: 'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        CustomerTitle: CustomerTitle,
                        CustomerFname: CustomerFname,
                        CustomerLname: CustomerLname,
                        CustomerEmail: CustomerEmail,
                        CustomerTel: CustomerTel,
                        CompanyId: CompanyId

                    }),
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Created',
                            text: 'Customer data have been created',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        // tableCustomer.ajax.reload(null, false);
                        // $('#modalCustomerMaster').modal('hide');
                    },
                    error: function (err) {
                        errorText = err.responseJSON.message;
                        Swal.fire({
                            position: 'center',
                            icon: 'warning',
                            title: 'Warning',
                            text: errorText,
                            showConfirmButton: true,
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#FF5733'
                        });
                    }
                });
            }
        })
    });

    // Edit
    $(document).on("click", "#btnEditCustomer", function () {
        // $("#formCompany").trigger("reset");
        $(".modal-title").text("Edit Customer");
        // console.log("save0");
        rows = $(this).closest("tr");
        let CompanyId = tableCustomer.rows(rows).data()[0].CompanyId;
        let CustomerId = tableCustomer.rows(rows).data()[0].CustomerId;
        let CustomerTitle = tableCustomer.rows(rows).data()[0].CustomerTitle;
        let CustomerFname = tableCustomer.rows(rows).data()[0].CustomerFname;
        let CustomerLname = tableCustomer.rows(rows).data()[0].CustomerLname;
        let CustomerEmail = tableCustomer.rows(rows).data()[0].CustomerEmail;
        let CustomerTel = tableCustomer.rows(rows).data()[0].CustomerTel;
        // console.log(tableCustomer.rows(rows).data()[0]);
        $('#modalInpCustomerTitle').val(CustomerTitle);
        $('#modalInpCustomerFname').val(CustomerFname);
        $('#modalInpCustomerLname').val(CustomerLname);
        $('#modalInpCustomerEmail').val(CustomerEmail);
        $('#modalInpCustomerTel').val(CustomerTel);
        $('#modalInpCompanyId').val(CompanyId);

        $("#modalSaveCustomer").unbind();
        $("#modalSaveCustomer").click(function () {
            
            let CustomerTitle = $.trim($('#modalInpCustomerTitle').val());
            let CustomerFname = $.trim($('#modalInpCustomerFname').val());
            let CustomerLname = $.trim($('#modalInpCustomerLname').val());
            let CustomerEmail = $.trim($('#modalInpCustomerEmail').val());
            let CustomerTel = $.trim($('#modalInpCustomerTel').val());
            let CompanyId = $.trim($('#modalInpCompanyId').val());

                $.ajax({
                    url: "/customer_master/edit/" + CustomerId,
                    method: 'put',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        CustomerTitle: CustomerTitle,
                        CustomerFname: CustomerFname,
                        CustomerLname: CustomerLname,
                        CustomerEmail: CustomerEmail,
                        CustomerTel: CustomerTel,
                        CompanyId: CompanyId
                    }),
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Created',
                            text: 'Customer data have been created',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        tableCustomer.ajax.reload(null, false);
                        $('#modalCustomerMaster').modal('hide');
                    },
                    error: function (err) {
                        errorText = err.responseJSON.message;
                        Swal.fire({
                            position: 'center',
                            icon: 'warning',
                            title: 'Warning',
                            text: errorText,
                            showConfirmButton: true,
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#FF5733'
                        });
                    }
                });
            
        })
    });
    
    //Delete
    $(document).on("click", "#btnDelCustomer", function () {
        rows = $(this).closest('tr');
        let CustomerId = tableCustomer.rows(rows).data()[0].CustomerId;
        $(".modal-title").text("Confirm Delete");
        $("#btnYes").unbind("click");
        $(".btnYes").click(function () {
            $.ajax({
                url: "/customer_master/delete/" + CustomerId,
                method: 'delete',
                contentType: 'application/json',
                success: function () {
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Deleted',
                        text: 'Company have been deleted',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    tableCustomer.ajax.reload(null, false);
                }
            })
            $('#modalDeleteConfirm').modal('hide');
        })
    });

    //==================================================================================//
    // click on tableCompany Number table
    $('#tableCompany tbody' ).on('click', 'tr', function () {
        rows = $(this).closest("tr");
        let CompanyId = tableCompany.rows(rows).data()[0].CompanyId;

        if($(this).hasClass('Myselected')){
            $(this).removeClass('Myselected');
            fill_resetTable();
        }
        else{
            $('#tableCompany tr').removeClass('Myselected');
            $(this).toggleClass('Myselected');
            fill_customer(CompanyId)
        }
    })
});

