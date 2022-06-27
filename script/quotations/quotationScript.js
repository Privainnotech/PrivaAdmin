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
                    "data": "QuotationUpdatedDate" 
                },
                {
                    "data": "StatusName"
                },
                {
                    "data": "Action",
                    "render": function (data, type, row) {
 
                        if ( row.StatusName === 'pre') {
                            return  "<div class='text-center'><div class='btn-group'><button  class='btn btn-danger p-1 m-2' id='btnDelProject' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                            ;}
                            
                                        else {
                                            return  "<div class='text-center'><div class='btn-group'><button  class='btn btn-danger p-1 m-2 disabled' id='btnDelProject' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                                            ;}
                        }
                }
                ,
                {
                    "data": "QuotationId"
                }

            ],"columnDefs":[
                {
                    "targets": [9],
                    "visible": false
                },
            ],
        });
    }

    //Item table
    function fill_item(Id) {
        // console.log(Id)
        tableItem = $('#tableItem').DataTable({
            "bDestroy": true,
            "scrollY": "250px",
            "scrollCollapse": true,
            // "paging": false,
            "ajax": {
                "url": `/quotation/item/` + Id,
                "dataSrc": ""
            },
            "columns": [
                {
                    "data":  "ItemName" 
                },
                {
                    "data": "ItemPrice"
                },
                {
                    "data": "ItemQty"
                },
                {
                    "defaultContent": "<div class='text-center'><div class='btn-group'><button class='btn btn-primary p-1 m-2' id='btnEditItem' data-toggle='modal'  data-target='#modalItemMaster'  style='width: 2rem;''><i class='fa fa-pencil-square-o'></i></button><button type='button' class='btn btn-success p-1 m-2' id='addSubItem' data-toggle='modal' data-target='#modalSubItemMaster'>Add</button><button  class='btn btn-danger p-1 m-2' id='btnDelItem' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                }
                ,
                {
                    "data": "ItemId"
                }

            ],"columnDefs":[
                {
                    "targets": [4],
                    "visible": false
                },
            ],
        });
    }

     //Item Sub Table
     function fill_subitem(Id) {
        // console.log(Id)
        tableSubItem = $('#tableSubItem').DataTable({
            "bDestroy": true,
            "scrollY": "250px",
            "scrollCollapse": true,
            // "paging": false,
            "ajax": {
                "url": `/quotation/item/` + Id,
                "dataSrc": ""
            },
            "columns": [
                {
                    "data":  "SubItemName" 
                },
                {
                    "data": "SubItemPrice"
                },
                {
                    "data": "SubItemQty"
                },
                {
                    "defaultContent": "<div class='text-center'><div class='btn-group'><button class='btn btn-primary p-1 m-2' id='btnEditItem' data-toggle='modal'  data-target='#modalItemMaster'  style='width: 2rem;''><i class='fa fa-pencil-square-o'></i></button><button  class='btn btn-danger p-1 m-2' id='btnDelItem' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                }
                ,
                {
                    "data": "SubItemId"
                }

            ],"columnDefs":[
                {
                    "targets": [4],
                    "visible": false
                },
            ],
        });
    }
    fill_quotation()

    //======================== Quotation =============================//
    //Create
    $(document).on("click", "#addProject", function () {
        $("#formQuotation").trigger("reset");
        $(".modal-title").text("Add Project");
        // console.log("save0");
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

    // Revised
    $(document).on("click", "#btnRevisedQuotation", function () {
        // $(".modal-title").text("Edit Quotation");
        rows = $(this).closest("tr");
        let QuotationId = tableQuo.rows(rows).data()[0].QuotationId;
        $.ajax({
            url: "/quotation/" + QuotationId,
            method: 'get',
            cache: false,
			success:function(response){
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

    //ShowPro
    function ShowPro(QuotationId) {
        $.ajax({
            url: "/quotation/" + QuotationId,
            method: 'get',
            cache: false,
			success:function(response){
				// console.log(QuotationId);
				var obj = JSON.parse(response);
                // QuotationNo_Revised
                    
                    $('#ProNo').val(obj.QuotationNo_Revised);
                    $('#CusName').val(obj.CustomerName);
                    $('#QDate').val(obj.QuotationDate);
                    $('#CusEmail').val(obj.CustomerEmail);
                    $('#ComName').val(obj.CompanyName);
                    $('#Adress').val(obj.CompanyAddress);

                    $('#PJ_Name').val(obj.QuotationSubject);
      				$('#PJ_Discout').val(obj.QuotationDiscount);
                    $('#PJ_Validity').val(obj.QuotationValidityDate);
                    $('#PJ_Payment').val(obj.QuotationPayTerm);
                    $('#PJ_Delivery').val(obj.QuotationDelivery);
                    $('#PJ_Remark').val(obj.QuotationRemark);
                    $('#PJ_Approve').val(obj.EmployeeApproveId);
			}
        })

    }
    //clickTableQuotation
    $('#tableQuo tbody' ).on('click', 'tr', function ()  {
        // $(".modal-title").text("Edit Quotation");
        rows = $(this).closest("tr");
        let QuotationId = tableQuo.rows(rows).data()[0].QuotationId;
        // console.log('Main =',QuotationId)
        ShowPro(QuotationId)
        fill_item(QuotationId)

        $("#modalEditProject").unbind();
        $("#modalEditProject").click(function () {
            
                let QuotationSubject = $.trim($('#PJ_Name').val());
                let QuotationDiscount = $.trim($('#PJ_Discout').val());
                let QuotationValidityDate = $.trim($('#PJ_Validity').val());
                let QuotationPayTerm = $.trim($('#PJ_Payment').val());
                let QuotationDelivery = $.trim($('#PJ_Delivery').val());
                let QuotationRemark = $.trim($('#PJ_Remark').val());
                let EmployeeApproveId = $.trim($('#PJ_Approve').val());

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

        // Create Item
        $("#addItem").click(function () {
            $("#formAddItem").trigger("reset");
            // console.log('item = ',QuotationId)
            $("#modalAddItem").unbind();
        $("#modalAddItem").click(function () {
                let ItemName = $.trim($('#modalInpAddItemName').val());
                let ItemQty = $.trim($('#modalInpAddQty').val());
                let ItemDescription = $.trim($('#modalInpAddDetails').val());
            if (ItemName !== null) {
                $.ajax({
                    url: "/quotation/add_item/" + QuotationId,
                    method: 'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        ItemName: ItemName,
                        ItemQty: ItemQty,
                        ItemDescription: ItemDescription
                    }),
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Created',
                            text: 'Item have been created',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        tableItem.ajax.reload(null, false);
                        $('#modalAddItemMaster').modal('hide');
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
            
        })
    });



     //======================== Item =============================//
    //Edit
    $(document).on("click", "#btnEditItem", function () {
        $("#formEditItem").trigger("reset");
        $(".modal-title").text("Edit Item");

        rows = $(this).closest("tr");
        let ItemId = tableItem.rows(rows).data()[0].ItemId;
        let ItemName = tableItem.rows(rows).data()[0].ItemName;
        let ItemQty = tableItem.rows(rows).data()[0].ItemQty;
        
        $('#modalInpItemName').val(ItemName);
        $('#modalInpQty').val(ItemQty);

        $("#modalEditItem").unbind();
        $("#modalEditItem").click(function () {
                let ItemName = $.trim($('#modalInpItemName').val());
                let ItemQty = $.trim($('#modalInpQty').val());
            if (ItemName !== null) {
                $.ajax({
                    url: "/quotation/edit_item/" + ItemId,
                    method: 'put',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        ItemName: ItemName,
                        ItemQty: ItemQty
                    }),
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Edit',
                            text: 'Item have been edited',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        tableItem.ajax.reload(null, false);
                        $('#modalItemMaster').modal('hide');
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
    $(document).on("click", "#btnDelItem", function () {
        rows = $(this).closest('tr');
        let ItemId = tableItem.rows(rows).data()[0].ItemId;
        $(".modal-title").text("Confirm Delete");
        $("#btnYes").unbind("click");
        $(".btnYes").click(function () {
            $.ajax({
                url: "/quotation/delete_item/" + ItemId,
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
                    tableItem.ajax.reload(null, false);
                }
            })
            $('#modalDeleteConfirm').modal('hide');
        })
    });


    //clickTableQuotation
    $('#tableSubItem tbody' ).on('click', 'tr', function ()  {
        rows = $(this).closest('tr');
        let ItemId = tableItem.rows(rows).data()[0].ItemId;
        fill_subitem(ItemId)
    });
    
});

