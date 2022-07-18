$(document).ready(function () {
    //Employee Table
    function fill_employee() {
        tableEmploy = $('#tableEmploy').DataTable({
            "bDestroy": true,
            "ajax": {
                "url": '/employee_master/data',
                "dataSrc": ""
            },
            "columns": [
                {
                    "data": "index"
                },
                {
                    "data": "EmployeeName"
                },
                {
                    "data": "EmployeePosition"
                },
                {
                    "data": "EmployeeEmail"
                },
                {
                    "data": "EmployeeTel"
                },
                {
                    "data": "Authority",
                    "render": function (data, type, row) {
                        if (row.Authority == 1) {
                            return " <div class='form-check'><input class='form-check-input' type='checkbox' value='1' id='flexCheckDefault' checked></div>"

                        } else {
                            return " <div class='form-check'><input class='form-check-input' type='checkbox' value='0' id='flexCheckDefault'></div>"

                        }
                    }
                },
                {
                    "defaultContent": "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditEmploy' style='width: 2rem;'><i class='fa fa-pencil-square-o'></i></button><button type='button' class='btn btn-warning p-1' id='btnEditPass' style='width: 2rem;'><i class='fa fa-key' aria-hidden='true'></i></button><button type='button' style='width: 2rem;' class='btn btn-danger p-1 ' id='btnDelEmploy'><i class='fa fa-remove'></i></button></div></div>"
                }
                ,
                {
                    "data": "EmployeeId",
                    "data": "Password",
                    "data": "Authority"


                }

            ], "columnDefs": [
                {
                    "targets": [7],
                    "visible": false
                },
            ],
        });
    }
    fill_employee()

    //Add Employee
    $(document).on("click", "#addEmploy", function () {
        $('#modalEmployeeMaster').modal('show');

        $("#passbox").removeClass('visually-hidden');
        $("#Autbox").removeClass('visually-hidden');

        $("#formEmployee").trigger("reset");
        $(".modal-title").text("Add Employee");
        $("#modalSaveEmployee").unbind();
        $("#modalSaveEmployee").click(function () {
            let EmployeeTitle = $.trim($('#modalInpEmployTitle').val());
            let EmployeeFname = $.trim($('#modalInpEmployFname').val());
            let EmployeeLname = $.trim($('#modalInpEmployLname').val());
            let Password = $.trim($('#modalInpEmployPassword').val());
            let Authority = $.trim($('#modalInpAut').val());
            let EmployeePosition = $.trim($('#modalInpEmployPosition').val());
            let EmployeeEmail = $.trim($('#modalInpEmployEmail').val());
            let EmployeeTel = $.trim($('#modalInpEmployTel').val());
            console.log(EmployeeTitle)
            $.ajax({
                url: "/employee_master/add",
                method: 'post',
                contentType: 'application/json',
                data: JSON.stringify({
                    EmployeeTitle: EmployeeTitle,
                    EmployeeFname: EmployeeFname,
                    EmployeeLname: EmployeeLname,
                    Password: Password,
                    Authority: Authority,
                    EmployeePosition: EmployeePosition,
                    EmployeeEmail: EmployeeEmail,
                    EmployeeTel: EmployeeTel
                }),
                success: function (succ) {
                    successText = succ.message;
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Created',
                        text: successText,
                        showConfirmButton: false,
                        timer: 1500
                    })
                    tableEmploy.ajax.reload(null, false);
                    $('#modalEmployeeMaster').modal('hide');
                },
                error: function (err) {
                    console.log(err);
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
        $(".close,.no").click(function () {
            $('#modalEmployeeMaster').modal('hide');
        })
    });

    //Edit Employee
    $(document).on("click", "#btnEditEmploy", function () {
        $('#modalEmployeeMaster').modal('show');

        $("#passbox").addClass('visually-hidden');
        $("#Autbox").addClass('visually-hidden');

        $("#formCompany").trigger("reset");
        $(".modal-title").text("Edit Company");
        rows = $(this).closest("tr");
        let EmployeeId = tableEmploy.rows(rows).data()[0].EmployeeId;
        let EmployeeTitle = tableEmploy.rows(rows).data()[0].EmployeeTitle;
        let EmployeeFname = tableEmploy.rows(rows).data()[0].EmployeeFname;
        let EmployeeLname = tableEmploy.rows(rows).data()[0].EmployeeLname;

        let EmployeePosition = tableEmploy.rows(rows).data()[0].EmployeePosition;
        let EmployeeEmail = tableEmploy.rows(rows).data()[0].EmployeeEmail;
        let EmployeeTel = tableEmploy.rows(rows).data()[0].EmployeeTel;


        $('#modalInpEmployTitle').val(EmployeeTitle);
        $('#modalInpEmployFname').val(EmployeeFname);
        $('#modalInpEmployLname').val(EmployeeLname);
        $('#modalInpEmployPosition').val(EmployeePosition);
        $('#modalInpEmployEmail').val(EmployeeEmail);
        $('#modalInpEmployTel').val(EmployeeTel);

        $("#modalSaveEmployee").unbind();
        $("#modalSaveEmployee").click(function () {

            let EmployeeTitle = $.trim($('#modalInpEmployTitle').val());
            let EmployeeFname = $.trim($('#modalInpEmployFname').val());
            let EmployeeLname = $.trim($('#modalInpEmployLname').val());
            let EmployeePosition = $.trim($('#modalInpEmployPosition').val());
            let EmployeeEmail = $.trim($('#modalInpEmployEmail').val());
            let EmployeeTel = $.trim($('#modalInpEmployTel').val());

            $.ajax({
                url: "/employee_master/edit/" + EmployeeId,
                method: 'put',
                contentType: 'application/json',
                data: JSON.stringify({
                    EmployeeTitle: EmployeeTitle,
                    EmployeeFname: EmployeeFname,
                    EmployeeLname: EmployeeLname,
                    EmployeePosition: EmployeePosition,
                    EmployeeEmail: EmployeeEmail,
                    EmployeeTel: EmployeeTel
                }),
                success: function (succ) {
                    successText = succ.message;
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Edited',
                        text: successText,
                        showConfirmButton: false,
                        timer: 1500
                    })
                    tableEmploy.ajax.reload(null, false);
                    $('#modalEmployeeMaster').modal('hide');
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
        $(".close,.no").click(function () {
            $('#modalEmployeeMaster').modal('hide');
        })
    });

    //Change Pass
    $(document).on("click", "#btnEditPass", function () {
        $('#modalPassMaster').modal('show');
        $("#formPass").trigger("reset");
        $(".modal-title").text("Change Password");

        

        rows = $(this).closest("tr");
        let EmployeeId = tableEmploy.rows(rows).data()[0].EmployeeId;

        $("#modalSaveEdit").unbind();
        $("#modalSaveEdit").click(function () {
            let Password = $.trim($('#modalInpEdEmployPassword').val());


            $.ajax({
                url: "/employee_master/change_password/" + EmployeeId,
                method: 'put',
                contentType: 'application/json',
                data: JSON.stringify({
                    Password: Password
                }),
                success: function (succ) {
                    successText = succ.message;
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Change Success',
                        text: successText,
                        showConfirmButton: false,
                        timer: 1500
                    })
                    tableEmploy.ajax.reload(null, false);
                    $('#modalPassMaster').modal('hide');
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
        $(".close,.no").click(function () {
            $('#modalPassMaster').modal('hide');
        })
    });

    //Delete Employee
    $(document).on("click", "#btnDelEmploy", function () {
        $('#modalDeleteConfirm').modal('show');

        rows = $(this).closest('tr');
        let EmployeeId = tableEmploy.rows(rows).data()[0].EmployeeId;
        $(".modal-title").text("Confirm Delete");

        $("#btnYes").unbind("click");
        $(".btnYes").click(function () {
            $.ajax({
                url: "/employee_master/delete/" + EmployeeId,
                method: 'delete',
                contentType: 'application/json',
                success: function (succ) {
                    successText = succ.message;
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Deleted',
                        text: successText,
                        showConfirmButton: false,
                        timer: 1500
                    })
                    tableEmploy.ajax.reload(null, false);
                }
            })
            $('#modalDeleteConfirm').modal('hide');
        })
        $(".close,.no").click(function () {
            $('#modalDeleteConfirm').modal('hide');
        })
    });

    //Change Authority
    $(document).on("click", "#flexCheckDefault", function () {
        rows = $(this).closest("tr");
        let EmployeeId = tableEmploy.rows(rows).data()[0].EmployeeId;

        if ($(this).is(":checked")) {
            let Authority = 1
            console.log(Authority);
            console.log(EmployeeId);

            $.ajax({
                url: "/employee_master/change_authority/" + EmployeeId,
                method: 'put',
                contentType: 'application/json',
                data: JSON.stringify({
                    Authority: Authority
                }),
                success: function (succ) {
                    successText = succ.message;
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Change Authority',
                        text: successText,
                        showConfirmButton: false,
                        timer: 1500
                    })
                    tableEmploy.ajax.reload(null, false);
                    $('#modalPassMaster').modal('hide');
                },
                error: function (err) {
                    tableEmploy.ajax.reload(null, false);
                }
            });

        } else {
            let Authority = 0
            console.log(Authority);
            console.log(EmployeeId);
            // checkbox is not checked -> do something different
            $.ajax({
                url: "/employee_master/change_authority/" + EmployeeId,
                method: 'put',
                contentType: 'application/json',
                data: JSON.stringify({
                    Authority: Authority
                }),
                success: function (succ) {
                    successText = succ.message;
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Change Authority',
                        text: successText,
                        showConfirmButton: false,
                        timer: 1500
                    })
                    tableEmploy.ajax.reload(null, false);
                    $('#modalPassMaster').modal('hide');
                },
                error: function (err) {
                    tableEmploy.ajax.reload(null, false);
                }
            });
        }
    })

});