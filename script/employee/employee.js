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
                    "defaultContent": "<div class='text-center'><div class='btn-group'><button class='btn btn-primary p-1 m-2' id='btnEditEmploy' data-toggle='modal'  data-target='#modalEmployeeMaster'  style='width: 2rem;''><i class='fa fa-pencil-square-o'></i></button><button  class='btn btn-danger p-1 m-2' id='btnDelEmploy' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                }
                ,
                {
                    "data": "EmployeeId"
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
        $("#formEmployee").trigger("reset");
        $(".modal-title").text("Add Employee");
        $("#modalSaveEmployee").unbind();
        $("#modalSaveEmployee").click(function () {
                let EmployeeTitle = $.trim($('#modalInpEmployTitle').val());
                let EmployeeFname = $.trim($('#modalInpEmployFname').val());
                let EmployeeLname = $.trim($('#modalInpEmployLname').val());
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
        // $("#formCompany").trigger("reset");
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