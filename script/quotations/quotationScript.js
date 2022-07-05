$(document).ready(function () {
    function fill_resetTable() {
        var trHTML = ''; 
        trHTML += '<tr>'
        trHTML +=  '<td colspan="6">Loading...</td>'
        trHTML +=  '</tr>' 
        document.getElementById("showTable").innerHTML = trHTML;
    }
    function fill_resetSubTable() {
        var trHTML = ''; 
        trHTML += '<tr>'
        trHTML +=  '<td colspan="6">Loading...</td>'
        trHTML +=  '</tr>' 
        document.getElementById("showSubTable").innerHTML = trHTML;
    }

    function fill_quotation() {
        tableQuo = $('#tableQuo').DataTable({
            "bDestroy": true,
            "scrollY": "25vh",
            "bPaginate": false,
            "bInfo": false,
            "bLengthChange": false,
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

            ],
            lengthMenu: [10,15],
            "columnDefs":[
                {
                    "targets": [9],
                    "visible": false
                },
            ],
        });
    }

    //Item table
    function fill_item(Id,status) {
        tableItem = $('#tableItem').DataTable({
            "bDestroy": true,
            "scrollY": "145px",
            "scrollCollapse": true,
            "searching": false,
            "bPaginate": false,
            "bInfo": false,
            "bLengthChange": false,
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
                    "data": "Action",
                    "render": function () {
 
                        if ( status === '1') {
                            return  "<div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditItem' data-toggle='modal' data-target='#modalItemMaster' style='width: 2rem;'><i class='fa fa-pencil-square-o'></i></button><button type='button' class='btn btn-warning p-1' id='btnSubItem' data-toggle='modal' data-target='#modalSubMaster' style='width: 2rem;'><i class='fa fa-plus'></i></button><button type='button' class='btn btn-danger p-1 ' id='btnDelItem' data-toggle='modal' data-target='#modalStatusConfirm' style='width: 2rem;'><i class='fa fa-remove'></i></button></div>"
                            ;}
                            // disabled
                                        else {
                                            return  "<div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditItem' data-toggle='modal' data-target='#modalItemMaster' style='width: 2rem;' disabled><i class='fa fa-pencil-square-o'></i></button><button type='button' class='btn btn-warning p-1' id='btnSubItem' data-toggle='modal' data-target='#modalSubMaster' style='width: 2rem;' disabled><i class='fa fa-plus'></i></button><button type='button' class='btn btn-danger p-1 ' id='btnDelItem' data-toggle='modal' data-target='#modalStatusConfirm' style='width: 2rem;' disabled><i class='fa fa-remove'></i></button></div>"
                                            ;}
                    }

                }
                ,
                {
                    "data": "ItemId",
                    "data": "QuotationId",
                    "data": "QuotationStatus"

                    
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
     function fill_subitem(Id,status) {
        tableSubItem = $('#tableSubItem').DataTable({
            "bDestroy": true,
            "scrollY": "145px",
            "scrollCollapse": true,
            "searching": false,
            "bPaginate": false,
            "bInfo": false,
            "bLengthChange": false,
            "ajax": {
                "url": `/quotation/subitem/` + Id,
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
                    "data": "SubItemQtyUnit"
                },
                {
                    "data": "Action",
                    "render": function () {
 
                        if ( status === '1') {
                            return  "<div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditSubItem' style='width: 2rem;' data-toggle='modal' data-target='#modalSubMaster'><i class='fa fa-pencil-square-o'></i></button><button type='button' style='width: 2rem;' class='btn btn-danger p-1 ' id='btnDelSubItem' data-toggle='modal' data-target='#modalDeleteConfirm' ><i class='fa fa-remove'></i></button></div>"
                            ;}
                            // disabled
                                        else {
                                            return  "<div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditSubItem' style='width: 2rem;' data-toggle='modal' data-target='#modalSubMaster' disabled><i class='fa fa-pencil-square-o'></i></button><button type='button' style='width: 2rem;' class='btn btn-danger p-1 ' id='btnDelSubItem' data-toggle='modal' data-target='#modalDeleteConfirm' disabled><i class='fa fa-remove'></i></button></div>"
                                            ;}
                    }
                }
                ,
                {
                    "data": "SubItemId",
                    "data": "QuotationId",
                    "data": "ProductId",
                    "data": "ProductType"
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
                            text: 'Successfully add Quotation',
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
                        text: 'Successfully delete pre-quotation',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    tableQuo.ajax.reload(null, false);
                }
            })
            $('#modalDeleteConfirm').modal('hide');
        })
    });

    //Show Project
    function ShowPro(QuotationId) {
        $.ajax({
            url: "/quotation/" + QuotationId,
            method: 'get',
            cache: false,
			success:function(response){
				var obj = JSON.parse(response);
                    $('#ProNo').text(obj.QuotationNo_Revised);
                    $('#CusName').val(obj.CustomerName);
                    $('#QDate').val(obj.QuotationDate);
                    $('#CusEmail').val(obj.CustomerEmail);
                    $('#ComName').val(obj.CompanyName);
                    $('#Adress').val(obj.CompanyAddress);

                    $('#PJ_Name').val(obj.QuotationSubject);
      				$('#PJ_Discount').val(obj.QuotationDiscount);
                    $('#PJ_Validity').val(obj.QuotationValidityDate);
                    $('#PJ_Payment1').val(obj.QuotationPayTerm.QuotationPayTerm1);
                    $('#PJ_Payment2').val(obj.QuotationPayTerm.QuotationPayTerm2);
                    $('#PJ_Payment3').val(obj.QuotationPayTerm.QuotationPayTerm3);
                    $('#PJ_Delivery').val(obj.QuotationDelivery);
                    $('#PJ_Remark').val(obj.QuotationRemark);
                    $('#PJ_End_Customer').val(obj.EndCustomer);
                    $('#PJ_Approve').val(obj.EmployeeApproveId);

                    $('#TotalPrice').val(obj.QuotationTotalPrice);
                    $('#PriceAfter').val(obj.QuotationNet);
                    $('#Vat').val(obj.QuotationVat);
                    $('#NetTotal').val(obj.QuotationNetVat);

			}
        })

    }

    //Reset Project
    function RePro() {
        
                    $('#ProNo').text('Project NO.');
                    $('#CusName').val('');
                    $('#QDate').val('');
                    $('#CusEmail').val('');
                    $('#ComName').val('');
                    $('#Adress').val('');

                    $('#PJ_Name').val('');
      				$('#PJ_Discount').val('');
                    $('#PJ_Validity').val('');
                    $('#PJ_Payment1').val('');
                    $('#PJ_Payment2').val('');
                    $('#PJ_Payment3').val('');
                    $('#PJ_Delivery').val('');
                    $('#PJ_Remark').val('');
                    $('#PJ_End_Customer').val('');
                    $('#PJ_Approve').val('');

                    $('#TotalPrice').val('');
                    $('#PriceAfter').val('');
                    $('#Vat').val('');
                    $('#NetTotal').val('');

		

    }


    //clickTableQuotation
    $('#tableQuo tbody' ).on('click', 'tr', function ()  {

       
        fill_resetSubTable()
        $("#btn-text").text("Edit");
        $("#PJ_Name").attr("disabled", "disabled"); 
        $("#PJ_Discount").attr("disabled", "disabled"); 
        $("#PJ_End_Customer").attr("disabled", "disabled"); 
        $("#PJ_Validity").attr("disabled", "disabled"); 
        $("#PJ_Payment1").attr("disabled", "disabled"); 
        $("#PJ_Payment2").attr("disabled", "disabled"); 
        $("#PJ_Payment3").attr("disabled", "disabled"); 
        $("#PJ_Delivery").attr("disabled", "disabled"); 
        $("#PJ_Remark").attr("disabled", "disabled"); 
        $("#PJ_Approve").attr("disabled", "disabled");
        $("#btn-cancel").attr("disabled", "disabled");
        $("#btn-quotation").attr("disabled", "disabled");
        $("#btn-book").attr("disabled", "disabled");
        $("#btn-loss").attr("disabled", "disabled");

        $("#modalEditProject").removeClass('save');
        $("#modalEditProject").removeAttr("data-toggle");
        $("#modalEditProject").removeAttr("data-target");
        

        
        rows = $(this).closest("tr");
        var QuotationId = tableQuo.rows(rows).data()[0].QuotationId;
        var QuotationStatus = tableQuo.rows(rows).data()[0].QuotationStatus;

        

        if($(this).hasClass('selected')){
            $(this).removeClass('selected');
            fill_resetTable() 
            RePro()
        }
        else{
            $('#tableQuo tr').removeClass('selected');
            $(this).toggleClass('selected');
            
            
            ShowPro(QuotationId)
            fill_item(QuotationId,QuotationStatus)

            if (QuotationStatus === "1") {
                //Show Edit Button
                $("#modalEditProject").removeClass('visually-hidden');
                //Show AddItem Button
                $("#addItem").removeClass('visually-hidden');
                //Show Quotation Button
                $("#btn-quotation").removeAttr("disabled");


                $(document).on("click", "#modalEditProject",function () {
                    if($("#modalEditProject").hasClass('save')){
                        $(".save#modalEditProject").removeClass('save');
                        $("#modalEditProject").removeAttr("data-toggle");
                        $("#modalEditProject").removeAttr("data-target");
    
                         

                        $("#btnEditYes").unbind("click");
                        $(".btnYes").click(function () {
                            $("#btn-text").text("Edit");
                            $("#PJ_Name").attr("disabled", "disabled"); 
                            $("#PJ_Discount").attr("disabled", "disabled"); 
                            $("#PJ_End_Customer").attr("disabled", "disabled"); 
                            $("#PJ_Validity").attr("disabled", "disabled"); 
                            $("#PJ_Payment1").attr("disabled", "disabled"); 
                            $("#PJ_Payment2").attr("disabled", "disabled"); 
                            $("#PJ_Payment3").attr("disabled", "disabled"); 
                            $("#PJ_Delivery").attr("disabled", "disabled"); 
                            $("#PJ_Remark").attr("disabled", "disabled"); 
                            $("#PJ_Approve").attr("disabled", "disabled");

                            let QuotationSubject = $.trim($('#PJ_Name').val());
                            let QuotationDiscount = $.trim($('#PJ_Discount').val());
                            let EndCustomer = $.trim($('#PJ_End_Customer').val());
                            let QuotationValidityDate = $.trim($('#PJ_Validity').val());
                            let QuotationPayTerm1 = $.trim($('#PJ_Payment1').val());
                            let QuotationPayTerm2 = $.trim($('#PJ_Payment2').val());
                            let QuotationPayTerm3 = $.trim($('#PJ_Payment3').val());
                            let QuotationDelivery = $.trim($('#PJ_Delivery').val());
                            let QuotationRemark = $.trim($('#PJ_Remark').val());
                            let EmployeeApproveId = $.trim($('#PJ_Approve').val());
                            let QuotationPayTerm = {
                                "QuotationPayTerm1": QuotationPayTerm1,
                                "QuotationPayTerm2": QuotationPayTerm2,
                                "QuotationPayTerm3": QuotationPayTerm3
                            }
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
                                    EndCustomer: EndCustomer,
                                    EmployeeApproveId: EmployeeApproveId
            
                                }),
                                success: function () {
                                    Swal.fire({
                                        position: 'center',
                                        icon: 'success',
                                        title: 'Saved',
                                        text: 'Successfully Edit Quotation',
                                        showConfirmButton: false,
                                        timer: 1500
                                    })
                                    tableQuo.ajax.reload(null, false);
                                    ShowPro(QuotationId)
                                    $('#modalEditConfirm').modal('hide');
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
    
                    }
                    else {
                        $("#modalEditProject").removeClass('save');
                        $("#modalEditProject").toggleClass('save');
                        $(".save#modalEditProject").attr("data-toggle","modal");
                        $(".save#modalEditProject").attr("data-target","#modalEditConfirm");


    
                        $("#btn-text").text("Save");
    
                        $("#PJ_Name").removeAttr("disabled"); 
                        $("#PJ_Discount").removeAttr("disabled"); 
                        $("#PJ_End_Customer").removeAttr("disabled"); 
                        $("#PJ_Validity").removeAttr("disabled"); 
                        $("#PJ_Payment1").removeAttr("disabled"); 
                        $("#PJ_Payment2").removeAttr("disabled"); 
                        $("#PJ_Payment3").removeAttr("disabled"); 
                        $("#PJ_Delivery").removeAttr("disabled"); 
                        $("#PJ_Remark").removeAttr("disabled"); 
                        $("#PJ_Approve").removeAttr("disabled"); 
                    }
                })

            }

            // Status Quotation
            if (QuotationStatus === "2") {
                $("#btn-text").text("Edit");
                //Eidt button
                $("#modalEditProject").removeClass('visually-hidden');
                $("#modalEditProject").toggleClass('visually-hidden');
                $("#modalEditProject").removeAttr("data-toggle");
                $("#modalEditProject").removeAttr("data-target");

                //AddItem button
                $("#addItem").removeClass('visually-hidden');
                $("#addItem").toggleClass('visually-hidden');

                $("#btn-loss").removeAttr("disabled");
                $("#btn-book").removeAttr("disabled");
                $("#btn-cancel").removeAttr("disabled");


                
            }

            // Status booking
            if (QuotationStatus === "3") {
                $("#btn-text").text("Edit");
                //Eidt button
                $("#modalEditProject").removeClass('visually-hidden');
                $("#modalEditProject").toggleClass('visually-hidden');
                $("#modalEditProject").removeAttr("data-toggle");
                $("#modalEditProject").removeAttr("data-target");

                //AddItem button
                $("#addItem").removeClass('visually-hidden');
                $("#addItem").toggleClass('visually-hidden');

                $("#btn-loss").removeAttr("disabled");
                $("#btn-quotation").removeAttr("disabled");
                $("#btn-cancel").removeAttr("disabled");
            }

            // Status loss
            if (QuotationStatus === "4") {
                $("#btn-text").text("Edit");
                //Eidt button
                $("#modalEditProject").removeClass('visually-hidden');
                $("#modalEditProject").toggleClass('visually-hidden');
                $("#modalEditProject").removeAttr("data-toggle");
                $("#modalEditProject").removeAttr("data-target");

                //AddItem button
                $("#addItem").removeClass('visually-hidden');
                $("#addItem").toggleClass('visually-hidden');

                $("#btn-book").removeAttr("disabled");
                $("#btn-quotation").removeAttr("disabled");
                $("#btn-cancel").removeAttr("disabled");
            }

            // Status cancel
            if (QuotationStatus === "5") {
                $("#btn-text").text("Edit");
                //Eidt button
                $("#modalEditProject").removeClass('visually-hidden');
                $("#modalEditProject").toggleClass('visually-hidden');
                $("#modalEditProject").removeAttr("data-toggle");
                $("#modalEditProject").removeAttr("data-target");

                //AddItem button
                $("#addItem").removeClass('visually-hidden');
                $("#addItem").toggleClass('visually-hidden');

                $("#btn-book").removeAttr("disabled");
                $("#btn-quotation").removeAttr("disabled");
                $("#btn-loss").removeAttr("disabled");
            }
            // else{
            //     $("#btn-text").text("Edit");
            //     //Eidt button
            //     $("#modalEditProject").removeClass('visually-hidden');
            //     $("#modalEditProject").toggleClass('visually-hidden');
            //     $("#modalEditProject").removeClass('save');
            //     $("#modalEditProject").removeAttr("data-toggle");
            //     $("#modalEditProject").removeAttr("data-target");
                

            //     //AddItem button
            //     $("#addItem").removeClass('visually-hidden');
            //     $("#addItem").toggleClass('visually-hidden');

            //     $("#PJ_Name").attr("disabled", "disabled"); 
            //     $("#PJ_Discount").attr("disabled", "disabled"); 
            //     $("#PJ_End_Customer").attr("disabled", "disabled"); 
            //     $("#PJ_Validity").attr("disabled", "disabled"); 
            //     $("#PJ_Payment1").attr("disabled", "disabled"); 
            //     $("#PJ_Payment2").attr("disabled", "disabled"); 
            //     $("#PJ_Payment3").attr("disabled", "disabled"); 
            //     $("#PJ_Delivery").attr("disabled", "disabled"); 
            //     $("#PJ_Remark").attr("disabled", "disabled"); 
            //     $("#PJ_Approve").attr("disabled", "disabled");
            //     $("#btn-cancel").attr("disabled", "disabled");
            //     $("#btn-quotation").attr("disabled", "disabled");
            //     $("#btn-book").attr("disabled", "disabled");
            //     $("#btn-loss").attr("disabled", "disabled");

                
            // }
           
            
    
            // Create Item
            $(document).on("click", "#addItem", function (){
                $("#formAddItem").trigger("reset");
                $(".modal-title").text("Add Item ");
                
               
                $("#modalAddItem").unbind();
                $("#modalAddItem").click(function () {
                        

                        let ItemName = $.trim($('#modalInpAddItemName').val());
                        let ItemQty = $.trim($('#modalInpAddQty').val());
                        let ItemPrice = $.trim($('#modalInpAddItemPrice').val());
                        let ItemDescription = $.trim($('#modalInpAddDetails').val());
                    if (ItemName !== null) {
                        $.ajax({
                            url: "/quotation/add_item/" + QuotationId,
                            method: 'post',
                            contentType: 'application/json',
                            data: JSON.stringify({
                                ItemName: ItemName,
                                ItemPrice: ItemPrice,
                                ItemQty: ItemQty,
                                ItemDescription: ItemDescription
                            }),
                            success: function () {
                                Swal.fire({
                                    position: 'center',
                                    icon: 'success',
                                    title: 'Created',
                                    text: 'Successfully add Item',
                                    showConfirmButton: false,
                                    timer: 1500
                                })
                                tableItem.ajax.reload(null, false);
                                ShowPro(QuotationId);
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
    
            // Revised
            $(document).on("click", "#btnRevised",function () {
                $(".modal-title").text("Confirm Revised");    
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
    
                            
                            $("#btnREYes").unbind("click");
                            $(".btnYes").click(function () {
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
                                        text: 'Successfully revise quotation',
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
                            })
                    } 
                })
            });

            // Print
            $(document).on("click", "#btnPrint",function () {
                $("#btnPrintYes").unbind("click");
                $(".btnYes").click(function () {
                    $.ajax({
                        url: "/quotation_report/" + QuotationId,
                        method: 'get',
                        contentType: 'application/json',
                        success: function () {
                            window.open("/quotation_report/" + QuotationId)
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

            //btn-quotation
            $(document).on('click','#btn-quotation',function() {
                $(".modal-title").text("Confirm Quotation");    

                $("#btnSetYes").unbind("click");
                $(".btnYes").click(function () {
                    $.ajax({
                        url: "/quotation_set/quotation/" + QuotationId,
                        method: 'get',
                        cache: false,
                        success:function(response){
                            Swal.fire({
                                position: 'center',
                                icon: 'success',
                                title: 'Set Status',
                                text: 'Successfully set Quotation',
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
                    })
                })
                
            })

            //btn-cancel
            $(document).on('click','#btn-cancel',function() {
                $(".modal-title").text("Confirm Cancel");    

                $("#btnSetYes").unbind("click");
                $(".btnYes").click(function () {
                    $.ajax({
                        url: "/quotation_set/cancel/" + QuotationId,
                        method: 'get',
                        cache: false,
                        success:function(response){
                            Swal.fire({
                                position: 'center',
                                icon: 'success',
                                title: 'Set Status',
                                text: 'Successfully set Quotation',
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
                    })
                })
                
            })

            //btn-book
            $(document).on('click','#btn-book',function() {
                $(".modal-title").text("Confirm Book");    

                $("#btnSetYes").unbind("click");
                $(".btnYes").click(function () {
                    $.ajax({
                        url: "/quotation_set/booking/" + QuotationId,
                        method: 'get',
                        cache: false,
                        success:function(response){
                            Swal.fire({
                                position: 'center',
                                icon: 'success',
                                title: 'Set Status',
                                text: 'Successfully set Quotation',
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
                    })
                })
                
            })

            //btn-loss
            $(document).on('click','#btn-loss',function() {
                $(".modal-title").text("Confirm loss");    

                $("#btnSetYes").unbind("click");
                $(".btnYes").click(function () {
                    $.ajax({
                        url: "/quotation_set/loss/" + QuotationId,
                        method: 'get',
                        cache: false,
                        success:function(response){
                            Swal.fire({
                                position: 'center',
                                icon: 'success',
                                title: 'Set Status',
                                text: 'Successfully set Quotation',
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
                    })
                })
                
            })

        }

        
    });



     //======================== Item =============================//
    //Edit
    $(document).on("click", "#btnEditItem", function () {
        $("#formEditItem").trigger("reset");
        $(".modal-title").text("Edit Item");

        
        rows = $(this).closest("tr");
        let ItemId = tableItem.rows(rows).data()[0].ItemId;
        let ItemName = tableItem.rows(rows).data()[0].ItemName;
        let ItemPrice = tableItem.rows(rows).data()[0].ItemPrice;
        let ItemQty = tableItem.rows(rows).data()[0].ItemQty;
        
        let QuotationId = tableItem.rows(rows).data()[0].QuotationId;
        
        
        $('#modalInpItemName').val(ItemName);
        $('#modalInpItemPrice').val(ItemPrice);
        $('#modalInpQty').val(ItemQty);

        $("#modalEditItem").unbind();
        $("#modalEditItem").click(function () {
                let ItemName = $.trim($('#modalInpItemName').val());
                let ItemPrice = $.trim($('#modalInpItemPrice').val());
                let ItemQty = $.trim($('#modalInpQty').val());
            if (ItemName !== null) {
                $.ajax({
                    url: "/quotation/edit_item/" + ItemId,
                    method: 'put',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        ItemName: ItemName,
                        ItemPrice: ItemPrice,
                        ItemQty: ItemQty
                    }),
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Edit',
                            text: 'Successfully Edit Item',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        tableItem.ajax.reload(null, false);
                        ShowPro(QuotationId);
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
        let QuotationId = tableItem.rows(rows).data()[0].QuotationId;
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
                        text: 'Successfully delete Item',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    tableItem.ajax.reload(null, false);
                    ShowPro(QuotationId);   
                }
            })
            $('#modalDeleteConfirm').modal('hide');
            
        })
    });

    $("#modalInpProduct").click(function () {
        let ProductId = $.trim($('#modalInpProduct').val())
        if (ProductId !== "null") {
            $.ajax({
                url: "/dropdown/product/" + ProductId,
                method: 'get',
                cache: false,
                success:function(response){
                        var obj = JSON.parse(response);
                        $('#modalInpSubName').val(obj.ProductName);
                        $('#modalInpSubPrice').val(obj.ProductPrice);
                        $('#modalInpSubType').val(obj.ProductType);
                }
            })
        }
    });


    //clickTableItem
    $('#tableItem tbody' ).on('click', 'tr', function ()  {
        rows = $(this).closest('tr');
        let ItemId = tableItem.rows(rows).data()[0].ItemId;
        let ItemName = tableItem.rows(rows).data()[0].ItemName;
        let QuotationStatus = tableItem.rows(rows).data()[0].QuotationStatus;
        let QuotationId = tableItem.rows(rows).data()[0].QuotationId;


        if($(this).hasClass('selected')){
            $(this).removeClass('selected');
            fill_resetSubTable()

        }
        else{
            $('#tableItem tr').removeClass('selected');
            $(this).toggleClass('selected');
            fill_subitem(ItemId,QuotationStatus)
        }
        
        
        //Add Sub
        $(document).on("click", "#btnSubItem", function (){
        $("#formSub").trigger("reset");
        $(".modal-title").text("Add SubItem in " + ItemName);
        
            $("#modalSaveSub").unbind();
            $("#modalSaveSub").click(function () {
                let ProductId = $.trim($('#modalInpProduct').val());
                let SubItemName = $.trim($('#modalInpSubName').val());
                let SubItemPrice = $.trim($('#modalInpSubPrice').val());
                let ProductType = $.trim($('#modalInpSubType').val());
                let SubItemQty = $.trim($('#modalInpSubQty').val());
                let SubItemUnit = $.trim($('#modalInpSubUnit').val());

                $.ajax({
                    url: "/quotation/add_subitem/" + ItemId,
                    method: 'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        ProductId: ProductId,
                        SubItemName: SubItemName,
                        SubItemPrice: SubItemPrice,
                        ProductType: ProductType,
                        SubItemQty: SubItemQty,
                        SubItemUnit: SubItemUnit
                    }),
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Created',
                            text: 'Successfully add Sub-item',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        tableSubItem.ajax.reload(null, false);
                        tableItem.ajax.reload(null, false);
                        ShowPro(QuotationId)
                        $('#modalSubMaster').modal('hide');
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
        })
    });

    //Edit Sub
    $(document).on("click", "#btnEditSubItem", function () {
        $("#formSub").trigger("reset");
        $(".modal-title").text("Edit SubItem");
            rows = $(this).closest('tr');
            let SubItemId = tableSubItem.rows(rows).data()[0].SubItemId;
            let ProductId = tableSubItem.rows(rows).data()[0].ProductId;
            let SubItemName = tableSubItem.rows(rows).data()[0].SubItemName;
            let SubItemPrice = tableSubItem.rows(rows).data()[0].SubItemPrice;
            let ProductType = tableSubItem.rows(rows).data()[0].ProductType;
            let SubItemQty = tableSubItem.rows(rows).data()[0].SubItemQty;
            let SubItemUnit = tableSubItem.rows(rows).data()[0].SubItemUnit;
            let QuotationId = tableSubItem.rows(rows).data()[0].QuotationId;
            console.log(tableSubItem.rows(rows).data()[0])

            $('#modalInpProduct').val(ProductId);
            $('#modalInpSubName').val(SubItemName);
            $('#modalInpSubPrice').val(SubItemPrice);
            $('#modalInpSubType').val(ProductType);
            $('#modalInpSubQty').val(SubItemQty);
            $('#modalInpSubUnit').val(SubItemUnit);

            $("#modalSaveSub").unbind();
            $("#modalSaveSub").click(function () {
                let ProductId = $.trim($('#modalInpProduct').val());
                let SubItemName = $.trim($('#modalInpSubName').val());
                let SubItemPrice = $.trim($('#modalInpSubPrice').val());
                let ProductType = $.trim($('#modalInpSubType').val());
                let SubItemQty = $.trim($('#modalInpSubQty').val());
                let SubItemUnit = $.trim($('#modalInpSubUnit').val());

                $.ajax({
                    url: "/quotation/edit_subitem/" + SubItemId,
                    method: 'put',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        ProductId: ProductId,
                        SubItemName: SubItemName,
                        SubItemPrice: SubItemPrice,
                        ProductType: ProductType,
                        SubItemQty: SubItemQty,
                        SubItemUnit: SubItemUnit
                    }),
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Edited',
                            text: 'Successfully Edit Sub-Item',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        tableSubItem.ajax.reload(null, false);
                        tableItem.ajax.reload(null, false);
                        ShowPro(QuotationId);
                        $('#modalSubMaster').modal('hide');
                    },
                    error: function (err) {
                        errorText = "err.responseJSON.message;"
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
        })

        //Delete
        $(document).on("click", "#btnDelSubItem", function () {
            rows = $(this).closest('tr');
            let SubItemId = tableSubItem.rows(rows).data()[0].SubItemId;
            let QuotationId = tableSubItem.rows(rows).data()[0].QuotationId;
            $(".modal-title").text("Confirm Delete");
            $("#btnYes").unbind("click");
            $(".btnYes").click(function () {
                $.ajax({
                    url: "/quotation/delete_subitem/" + SubItemId,
                    method: 'delete',
                    contentType: 'application/json',
                    success: function () {
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Deleted',
                            text: 'Successfully delete Sub-item',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        tableSubItem.ajax.reload(null, false);
                        tableItem.ajax.reload(null, false);
                        ShowPro(QuotationId)

                    }
                })
                $('#modalDeleteConfirm').modal('hide');
            })
        });

    

    
    
});

