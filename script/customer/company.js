$(document).ready(function () {
    //MOSTRAR
    function fill_company() {
        tableCompany = $('#tableCompany').DataTable({
            "bDestroy": true,
            "scrollY": "300px",
            "scrollCollapse": true,
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
                    "defaultContent": "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditCompany' style='width: 2rem;'><i class='fa fa-pencil-square-o'></i></button><button type='button' style='width: 2rem;' class='btn btn-danger p-1 ' id='btnDelCompany'><i class='fa fa-remove'></i></button></div></div>"
                }
                ,
                {
                    "data": "CompanyId"
                }

            ], "columnDefs": [
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
        $('#modalCompanyMaster').modal('show');

        $("#formCompany").trigger("reset");
        $(".modal-title").text("Add Company");

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
                            text: 'Successfully add company',
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
                        $('#modalCompanyMaster').modal('hide');
                    }
                });
            }
        })
        $(".close,.no").click(function () {
            $('#modalCompanyMaster').modal('hide');
        })
    });

    //Edit
    $(document).on("click", "#btnEditCompany", function () {
        $('#modalCompanyMaster').modal('show');

        $(".modal-title").text("Edit Company");
        rows = $(this).closest("tr");
        let CompanyId = tableCompany.rows(rows).data()[0].CompanyId;
        let CompanyName = tableCompany.rows(rows).data()[0].CompanyName;
        let CompanyAddress = tableCompany.rows(rows).data()[0].CompanyAddress;
        let CompanyEmail = tableCompany.rows(rows).data()[0].CompanyEmail;
        let CompanyTel = tableCompany.rows(rows).data()[0].CompanyTel;

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
                        title: 'Edited',
                        text: 'Successfully edit company',
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
                    $('#modalCompanyMaster').modal('hide');
                }
            });
        })
        $(".close,.no").click(function () {
            $('#modalCompanyMaster').modal('hide');
        })
    });

    //Delete
    $(document).on("click", "#btnDelCompany", function () {
        $('#modalDeleteConfirm').modal('show');

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
                        text: 'Successfully delete company',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    tableCompany.ajax.reload(null, false);
                }
            })
            $('#modalDeleteConfirm').modal('hide');
        })
        $(".close,.no").click(function () {
            $('#modalDeleteConfirm').modal('hide');
        })
    });
});

