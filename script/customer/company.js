$(document).ready(function () {
    //MOSTRAR
    function fill_company() {
        tableCompany = $('#tableCompany').DataTable({
            "bDestroy": true,
            "ajax": {
                "url": '/company_master/data',
                "dataSrc": ""
            },
            "columns": [
                {
                    "data": "index"
                },
                {
                    "data": "CompanyName"
                },
                {
                    "data": "CompanyAddress"
                },
                {
                    "data": "CompanyEmail"
                },
                {
                    "data": "CompanyTel"
                },
                {
                    "defaultContent": "<div class='text-center'><div class='btn-group'><button class='btn btn-primary p-1 m-2' id='btnEditCompany' data-toggle='modal'  data-target='#modalCompanyMaster'  style='width: 2rem;''><i class='fa fa-pencil-square-o'></i></button><button  class='btn btn-danger p-1 m-2' id='btnDelCompany' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                }
                ,
                {
                    "data": "CompanyId"
                }

            ],"columnDefs":[
                {
                    "targets": [6],
                    "visible": false
                },
            ],
        });
    }
    fill_company()

    //Create
    $(document).on("click", "#addCompany", function () {
        $("#formCompany").trigger("reset");
        $(".modal-title").text("Add Company");
        console.log("save0");
        $("#modalSaveCompany").unbind();
        $("#modalSaveCompany").click(function () {
                let CompanyName = $.trim($('#modalInpCompanyName').val());
                let CompanyAddress = $.trim($('#modalInpCompanyAddress').val());
                let CompanyEmail = $.trim($('#modalInpCompanyEmail').val());
                let CompanyTel = $.trim($('#modalInpCompanyTel').val());
            if (CompanyName !== null) {
                $.ajax({
                    url: "/company_master/add",
                    method: 'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        CompanyName: CompanyName,
                        CompanyAddress: CompanyAddress,
                        CompanyEmail: CompanyEmail,
                        CompanyTel: CompanyTel
                    }),
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Created',
                            text: 'Company data have been created',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        tableCompany.ajax.reload(null, false);
                        $('#modalCompanyMaster').modal('hide');
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

    //Edit
    $(document).on("click", "#btnEditCompany", function () {
        // $("#formCompany").trigger("reset");
        $(".modal-title").text("Edit Company");
        // console.log("save0");
        rows = $(this).closest("tr");
        let CompanyId = tableCompany.rows(rows).data()[0].CompanyId;
        let CompanyName = tableCompany.rows(rows).data()[0].CompanyName;
        let CompanyAddress = tableCompany.rows(rows).data()[0].CompanyAddress;
        let CompanyEmail = tableCompany.rows(rows).data()[0].CompanyEmail;
        let CompanyTel = tableCompany.rows(rows).data()[0].CompanyTel;
        console.log(tableCompany.rows(rows).data()[0]);
        $('#modalInpCompanyName').val(CompanyName);
        $('#modalInpCompanyAddress').val(CompanyAddress);
        $('#modalInpCompanyEmail').val(CompanyEmail);
        $('#modalInpCompanyTel').val(CompanyTel);

        $("#modalSaveCompany").unbind();
        $("#modalSaveCompany").click(function () {
            
                let CompanyName = $.trim($('#modalInpCompanyName').val());
                let CompanyAddress = $.trim($('#modalInpCompanyAddress').val());
                let CompanyEmail = $.trim($('#modalInpCompanyEmail').val());
                let CompanyTel = $.trim($('#modalInpCompanyTel').val());

                $.ajax({
                    url: "/company_master/edit/" + CompanyId,
                    method: 'put',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        CompanyName: CompanyName,
                        CompanyAddress: CompanyAddress,
                        CompanyEmail: CompanyEmail,
                        CompanyTel: CompanyTel
                    }),
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Created',
                            text: 'Company data have been created',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        tableCompany.ajax.reload(null, false);
                        $('#modalCompanyMaster').modal('hide');
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
    $(document).on("click", "#btnDelCompany", function () {
        rows = $(this).closest('tr');
        let CompanyId = tableCompany.rows(rows).data()[0].CompanyId;
        $(".modal-title").text("Confirm Delete");
        $("#btnYes").unbind("click");
        $(".btnYes").click(function () {
            $.ajax({
                url: "/company_master/delete/" + CompanyId,
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
                    tableCompany.ajax.reload(null, false);
                }
            })
            $('#modalDeleteConfirm').modal('hide');
        })
    });
});

