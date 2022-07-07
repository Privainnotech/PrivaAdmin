$(document).ready(function () {
    //MOSTRAR
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
                    "defaultContent": "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditEmploy' style='width: 2rem;' data-toggle='modal' data-target='#modalEmployeeMaster'><i class='fa fa-pencil-square-o'></i></button><button type='button' class='btn btn-success p-1' id='btnEditPass' style='width: 2rem;' data-toggle='modal' data-target='#modalPassMaster'><i class='fa fa-pencil-square-o'></i></button><button type='button' style='width: 2rem;' class='btn btn-danger p-1 ' id='btnDelEmploy' data-toggle='modal' data-target='#modalDeleteConfirm' ><i class='fa fa-remove'></i></button></div></div>"
                }
                ,
                {
                    "data": "EmployeeId",
                    "data": "Password",
                    "data": "Authority"


                }

            ],"columnDefs":[
                {
                    "targets": [6],
                    "visible": false
                },
            ],
        });
    }
    fill_employee()

    //Add Employee
    $(document).on("click", "#addEmploy", function () {
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
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Created',
                            text: 'Successfully add Employee',
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
    });

    //Edit
    $(document).on("click", "#btnEditEmploy", function () {
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
                // let Password = $.trim($('#modalInpEmployPassword').val());
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
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Edited',
                            text: 'Successfully edit Employee',
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
    });

    //Change Pass
    $(document).on("click", "#btnEditPass", function () {
        $("#formPass").trigger("reset");
        $(".modal-title").text("Change Password");

        rows = $(this).closest("tr");
        let EmployeeId = tableEmploy.rows(rows).data()[0].EmployeeId;

        let Password = tableEmploy.rows(rows).data()[0].Password;
        let Authority = tableEmploy.rows(rows).data()[0].Authority;

        
        $('#modalInpEmployPassword').val(Password);
        $('#modalInpAut').val(Authority);

        $("#modalSaveEdit").unbind();
        $("#modalSaveEdit").click(function () {
            
                let Password = $.trim($('#modalInpEmployPassword').val());
                let Authority = $.trim($('#modalInpAut').val());

                $.ajax({
                    url: "/employee_master/change_password/" + EmployeeId,
                    method: 'put',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        Password: Password,
                        Authority: Authority,
                    }),
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Edited',
                            text: 'Successfully Change Password',
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
    });

    //Delete
    $(document).on("click", "#btnDelEmploy", function () {
        rows = $(this).closest('tr');
        let EmployeeId = tableEmploy.rows(rows).data()[0].EmployeeId;
        $(".modal-title").text("Confirm Delete");

        $("#btnYes").unbind("click");
        $(".btnYes").click(function () {
            $.ajax({
                url: "/employee_master/delete/" + EmployeeId,
                method: 'delete',
                contentType: 'application/json',
                success: function () {
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Deleted',
                        text: 'Successfully delete Employee',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    tableEmploy.ajax.reload(null, false);
                }
            })
            $('#modalDeleteConfirm').modal('hide');
        })
    });

});