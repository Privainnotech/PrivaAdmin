$(document).ready(function () {
    function fill_quotation() {
        tableQuo = $('#tableQuo').DataTable({
            "bDestroy": true,
            "ajax": {
                "url": "/quotation/list",
                "dataSrc": ""
            },
            "columns": [
                {
                    "data": "index"
                },
                {
                    "data":  "QuotationNo" 
                },
                {
                    "data":  "QuotationRevised" 
                },
                {
                    "data":  "QuotationSubject" 
                },
                {
                    "data": "CustomerName"
                },
                {
                    "data": "QuotationDate"
                },
                {
                    "data": "StatusName"
                },
                {
                    "data": "Action",
                    "render": function (data, type, row) {
 
                        if ( row.StatusName === 'pre') {
                            return  "<div class='text-center'><div class='btn-group'><button class='btn btn-primary p-1 m-2 ' id='btnEditQuotation' data-toggle='modal'  data-target='#modalQuotationEditMaster'  style='width: 2rem;''><i class='fa fa-pencil-square-o'></i></button><button  class='btn btn-danger p-1 m-2' id='btnDelProject' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                            ;}
                            if ( row.StatusName === 'quotation') {
                                return  "<div class='text-center'><div class='btn-group'><button class='btn btn-warning p-1 m-2 ' id='btnRevisedQuotation' data-toggle='modal'  style='width: 2rem;''><i class='fa fa-file-o'></i></button><button  class='btn btn-danger p-1 m-2 disabled' id='btnDelProject' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                                ;}
                                    if ( row.StatusName === 'cancel') {
                                        return  "<div class='text-center'><div class='btn-group'><button class='btn btn-primary p-1 m-2 disabled' id='btnEditQuotation' data-toggle='modal'  data-target='#modalQuotationEditMaster'  style='width: 2rem;''><i class='fa fa-pencil-square-o'></i></button><button  class='btn btn-danger p-1 m-2 disabled' id='btnDelProject' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                                        ;}
                                        else {
                            
                                            return  "<div class='text-center'><div class='btn-group'><button class='btn btn-primary p-1 m-2 disabled' id='btnEditQuotation' data-toggle='modal'  data-target='#modalQuotationEditMaster'  style='width: 2rem;''><i class='fa fa-pencil-square-o'></i></button><button  class='btn btn-danger p-1 m-2' id='btnDelProject' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                                            ;}
                        }
                }
                ,
                {
                    "data": "QuotationId"
                }

            ],"columnDefs":[
                {
                    "targets": [8],
                    "visible": false
                },
            ],
        });
    }
    fill_quotation()
    
    //Create
    $(document).on("click", "#addProject", function () {
        $("#formQuotation").trigger("reset");
        $(".modal-title").text("Add Project");
        console.log("save0");
        $("#modalSaveProject").unbind();
        $("#modalSaveProject").click(function () {
                let ProjectName = $.trim($('#modalInpProjectName').val());
                let CustomerId = $.trim($('#modalInpCustomerId').val());
            if (ProjectName !== null) {
                $.ajax({
                    url: "/quotation/add_pre_quotation",
                    method: 'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        QuotationSubject: ProjectName,
                        CustomerId: CustomerId
                    }),
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Created',
                            text: 'Project have been created',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        tableQuo.ajax.reload(null, false);
                        $('#modalQuotationMaster').modal('hide');
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
    $(document).on("click", "#btnEditQuotation", function () {
        $(".modal-title").text("Edit Quotation");
        // console.log("save0");
        rows = $(this).closest("tr");
        let QuotationId = tableQuo.rows(rows).data()[0].QuotationId;
        $.ajax({
            url: "/quotation/" + QuotationId,
            method: 'get',
            cache: false,
			success:function(response){
				// console.log(QuotationId);
				var obj = JSON.parse(response);
				// console.log(obj.QuotationSubject);
                    $('#modalEditProjectName').val(obj.QuotationSubject);
      				$('#modalEditDiscout').val(obj.QuotationDiscount);
                    $('#modalEditValidity').val(obj.QuotationValidityDate);
                    $('#modalEditPayment').val(obj.QuotationPayTerm);
                    $('#modalEditDelivery').val(obj.QuotationDelivery);
                    $('#modalEditRemark').val(obj.QuotationRemark);
                    $('#modalEditApprove').val(obj.EmployeeApproveId);
			}
        })
        
        $("#modalEditProject").unbind();
        $("#modalEditProject").click(function () {
            
                let QuotationSubject = $.trim($('#modalEditProjectName').val());
                let QuotationDiscount = $.trim($('#modalEditDiscout').val());
                let QuotationValidityDate = $.trim($('#modalEditValidity').val());
                let QuotationPayTerm = $.trim($('#modalEditPayment').val());
                let QuotationDelivery = $.trim($('#modalEditDelivery').val());
                let QuotationRemark = $.trim($('#modalEditRemark').val());
                let EmployeeApproveId = $.trim($('#modalEditApprove').val());
				console.log(EmployeeApproveId);

                $.ajax({
                    url: "/quotation/edit_quotation/" + QuotationId,
                    method: 'put',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        QuotationSubject: QuotationSubject,
                        QuotationDiscount: QuotationDiscount,
                        QuotationValidityDate: QuotationValidityDate,
                        QuotationPayTerm: QuotationPayTerm,
                        QuotationDelivery: QuotationDelivery,
                        QuotationRemark: QuotationRemark,
                        EmployeeApproveId: EmployeeApproveId

                    }),
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Created',
                            text: 'Quotation data have been Edited',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        tableQuo.ajax.reload(null, false);
                        $('#modalQuotationEditMaster').modal('hide');
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
    // Revised
    $(document).on("click", "#btnRevisedQuotation", function () {
        $(".modal-title").text("Edit Quotation");
        // console.log("save0");
        rows = $(this).closest("tr");
        let QuotationId = tableQuo.rows(rows).data()[0].QuotationId;
        $.ajax({
            url: "/quotation/" + QuotationId,
            method: 'get',
            cache: false,
			success:function(response){
				// console.log(QuotationId);
				var obj = JSON.parse(response);

                    let QuotationNoId = obj.QuotationNoId;
                    let QuotationRevised = obj.QuotationRevised;
                    let QuotationStatus = obj.QuotationStatus;
                    let QuotationSubject = obj.QuotationSubject;
                    let QuotationTotalPrice = obj.QuotationTotalPrice;
                    let QuotationDiscount = obj.QuotationDiscount;
                    let QuotationValidityDate = obj.QuotationValidityDate;
                    let QuotationPayTerm = obj.QuotationPayTerm;
                    let QuotationDelivery = obj.QuotationDelivery;
                    let QuotationRemark = obj.QuotationRemark;
                    let EmployeeApproveId = obj.EmployeeApproveId;
                    
                    console.log(QuotationId)
                    $.ajax({
                        url: "/quotation_set/revise/" + QuotationId,
                        method: 'post',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            QuotationNoId: QuotationNoId,
                            QuotationRevised: QuotationRevised,
                            QuotationStatus: QuotationStatus,
                            QuotationSubject: QuotationSubject,
                            QuotationTotalPrice: QuotationTotalPrice,
                            QuotationDiscount: QuotationDiscount,
                            QuotationValidityDate: QuotationValidityDate,
                            QuotationPayTerm: QuotationPayTerm,
                            QuotationDelivery: QuotationDelivery,
                            QuotationRemark: QuotationRemark,
                            EmployeeApproveId: EmployeeApproveId
    
                        }),
                        success: function () {
                            Swal.fire({
                                position: 'center',
                                icon: 'success',
                                title: 'Created',
                                text: 'Quotation data have been Edited',
                                showConfirmButton: false,
                                timer: 1500
                            })
                            tableQuo.ajax.reload(null, false);
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

     //Delete
     $(document).on("click", "#btnDelProject", function () {
        rows = $(this).closest('tr');
        let QuotationId = tableQuo.rows(rows).data()[0].QuotationId;
        $(".modal-title").text("Confirm Delete");
        $("#btnYes").unbind("click");
        $(".btnYes").click(function () {
            $.ajax({
                url: "/quotation/delete_quotation/" + QuotationId,
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
                    tableQuo.ajax.reload(null, false);
                }
            })
            $('#modalDeleteConfirm').modal('hide');
        })
    });
    
});

