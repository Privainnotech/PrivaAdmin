
// let loadDetail = null;

//Hide Edit Button
function hideEdit() {
    $("#modalEditProject").removeClass('invisible');
    $("#modalEditProject").toggleClass('invisible');
}
//Hide Add Item Button
function hideAdd() {
    $("#addItem").removeClass('visually-hidden');
    $("#addItem").toggleClass('visually-hidden');
}

//Hide Setting
function hideSetting() {
    $("#modalSaveSetting").removeClass('visually-hidden');
    $("#modalSaveSetting").toggleClass('visually-hidden');

    $("#IP-Set-TableShow").attr("disabled", "disabled");
    $("#IP-Set-TablePrice").attr("disabled", "disabled");
    $("#IP-Set-TableQty").attr("disabled", "disabled");
    $("#IP-Set-TableTotal").attr("disabled", "disabled");

}

//Show Setting
function ShowSetting() {
    $("#modalSaveSetting").removeClass('visually-hidden');

    $("#IP-Set-TableShow").removeAttr("disabled");
    $("#IP-Set-TablePrice").removeAttr("disabled");
    $("#IP-Set-TableQty").removeAttr("disabled");
    $("#IP-Set-TableTotal").removeAttr("disabled");

}

//Show Project
function ShowPro(QuotationId) {
    $.ajax({
        url: "/quotation/" + QuotationId,
        method: 'get',
        cache: false,
        success: function (response) {
            var obj = JSON.parse(response);
            $('#ProNo').text(obj.QuotationNo_Revised);
            // $('#Revised').val("_"+obj.QuotationRevised);
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

            // setting show status
            $('#IP-Set-TableShow').val(obj.TableShow);
            $('#IP-Set-TablePrice').val(obj.TablePrice);
            $('#IP-Set-TableQty').val(obj.TableQty);
            $('#IP-Set-TableTotal').val(obj.TableTotal);
            $('#IP-Set-DetailShow').val(obj.DetailShow);
            $('#IP-Set-DetailQty').val(obj.DetailQty);
            $('#IP-Set-DetailTotal').val(obj.DetailTotal);


        }
    })

}

//Reset Project
function RePro() {
    // QuotationId = null
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
    $('#PJ_Approve').val('-');

    $('#TotalPrice').val('');
    $('#PriceAfter').val('');
    $('#Vat').val('');
    $('#NetTotal').val('');

    $('#IP-Set-TableShow').val('0');
    $('#IP-Set-TablePrice').val('0');
    $('#IP-Set-TableQty').val('0');
    $('#IP-Set-TableTotal').val('0');
    
}



// get Custom Detail
function getDetail(QuotationId) {
    $.ajax({
        url: "/quotation/" + QuotationId,
        method: 'get',
        cache: false,
        success: function (response) {
            var obj = JSON.parse(response);
            const loadDetail = JSON.stringify(obj.QuotationDetail);
            const editor = new EditorJS(
                {
                    tools: {
                        text: {
                            class: SimpleText,
                            inlineToolbar: ['link']
                        },
                    }
                }
            );

            editor.isReady.then(() => {
                editor.render(JSON.parse(loadDetail));
            })

            //  Edit Detail
            const saveButton = document.getElementById('save-button');

            saveButton.addEventListener('click', () => {
                $('#modalEditConfirm').modal('show');
                $(".modal-title").text("Confirm Edit Detail");
                $("#btnEditYes").unbind();
                $("#btnEditYes").click(function () {
                    editor.save().then(savedData => {
                        load = JSON.stringify(savedData, null, 4)
                        $.ajax({
                            url: "/quotation/edit_detail/" + QuotationId,
                            method: 'put',
                            contentType: 'application/json',
                            data: JSON.stringify({
                                QuotationDetail: savedData,
                            }),
                            success: function () {
                                Swal.fire({
                                    position: 'center',
                                    icon: 'success',
                                    title: 'Edit',
                                    text: 'Successfully Edit Detail',
                                    showConfirmButton: false,
                                    timer: 1500
                                })
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
                        $('#modalEditConfirm').modal('hide');
                    })

                })
            })
            $(".close,.no").click(function () {
                $('#modalEditConfirm').modal('hide');
            })
        }


    })

}

//Remove Detail Paper
function removeDetailPaper() {
    const detailPaper = document.querySelectorAll('.codex-editor');
    if ($('div').hasClass('codex-editor')) {
        detailPaper.forEach(paper => {
            paper.remove();
        });
    }
}



$(document).ready(function () {
    //Reset Item Table
    function fill_resetTable() {
        var trHTML = '';
        trHTML += '<tr>'
        trHTML += '<td colspan="6">Loading...</td>'
        trHTML += '</tr>'
        document.getElementById("showTable").innerHTML = trHTML;
    }

    //Reset Sub-Item Table
    function fill_resetSubTable() {
        var trHTML = '';
        trHTML += '<tr>'
        trHTML += '<td colspan="6">Loading...</td>'
        trHTML += '</tr>'
        document.getElementById("showSubTable").innerHTML = trHTML;
    }

    //Quotation Table
    function fill_quotation() {
        tableQuo = $('#tableQuo').DataTable({
            "bDestroy": true,
            "scrollY": "40vh",
            "scrollX": true,
            "bPaginate": false,
            // "bInfo": false,
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
                    "data": "QuotationNo"
                },
                {
                    "data": "QuotationRevised"
                },
                {
                    "data": "QuotationSubject"
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
                    "data": "EmployeeFname"
                },
                {
                    "data": "Action",
                    "render": function (data, type, row) {

                        if (row.StatusName === 'pre') {
                            return "<div class='text-center'><div class='btn-group'><button  class='btn btn-danger p-1 m-2' id='btnDelProject' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                                ;
                        }

                        else {
                            return "<div class='text-center'><div class='btn-group'><button  class='btn btn-dark p-1 m-2 disabled' id='btnDelProject' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                                ;
                        }
                    }
                }
                ,
                {
                    "data": "QuotationId"

                }

            ],
            // lengthMenu: [10,15],
            "columnDefs": [
                {
                    "targets": [10],
                    "visible": false
                },
            ],
        });
    }

    //Item table
    function fill_item(Id, status) {
        tableItem = $('#tableItem').DataTable({
            "bDestroy": true,
            "scrollY": "28vh",
            "scrollX": true,
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
                    "data": "ItemName"
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

                        if (status === '1') {
                            return "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditItem' style='width: 2rem;'><i class='fa fa-pencil-square-o'></i></button><button type='button' class='btn btn-warning p-1' id='btnSubItem' style='width: 2rem;'><i class='fa fa-plus'></i></button><button type='button' class='btn btn-danger p-1 ' id='btnDelItem' style='width: 2rem;'><i class='fa fa-remove'></i></button></div></div>"
                                ;
                        }
                        // disabled
                        else {
                            return "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditItem' style='width: 2rem;' disabled><i class='fa fa-pencil-square-o'></i></button><button type='button' class='btn btn-warning p-1' id='btnSubItem' style='width: 2rem;' disabled onclick='LoadDropDown()'><i class='fa fa-plus'></i></button><button type='button' class='btn btn-danger p-1 ' id='btnDelItem' style='width: 2rem;' disabled><i class='fa fa-remove'></i></button></div></div>"
                                ;
                        }
                    }

                }
                ,
                {
                    "data": "ItemId",
                    "data": "QuotationId",
                    "data": "QuotationStatus"


                }

            ], "columnDefs": [
                {
                    "targets": [4],
                    "visible": false
                },
            ],
        });
    }

    //Sub-Item Table
    function fill_subitem(Id, status) {
        tableSubItem = $('#tableSubItem').DataTable({
            "bDestroy": true,
            "scrollY": "28vh",
            "scrollX": true,
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
                    "data": "SubItemName"
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

                        if (status === '1') {
                            return "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditSubItem' style='width: 2rem;'><i class='fa fa-pencil-square-o'></i></button><button type='button' style='width: 2rem;' class='btn btn-danger p-1 ' id='btnDelSubItem'><i class='fa fa-remove'></i></button></div></div>"
                                ;
                        }
                        // disabled
                        else {
                            return "<div class='text-center'><div class='btn-group' role='group' aria-label='Basic mixed styles example'><button type='button' class='btn btn-primary p-1' id='btnEditSubItem' style='width: 2rem;' disabled><i class='fa fa-pencil-square-o'></i></button><button type='button' style='width: 2rem;' class='btn btn-danger p-1 ' id='btnDelSubItem' disabled><i class='fa fa-remove'></i></button></div></div>"
                                ;
                        }
                    }
                }
                ,
                {
                    "data": "SubItemId",
                    "data": "QuotationId",
                    "data": "ProductId",
                    "data": "ProductType"
                }


            ], "columnDefs": [
                {
                    "targets": [4],
                    "visible": false
                },
            ],
        });
    }
    fill_quotation()

    //======================== Quotation =============================//
    //Create Project
    $(document).on("click", "#addProject", function () {
        $('#modalQuotationMaster').modal('show');

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
                $('#modalQuotationMaster').modal('hide');
            }
        })
        $(".close,.no").click(function () {
            $('#modalQuotationMaster').modal('hide');
        });
    });

    //Delete Project
    $(document).on("click", "#btnDelProject", function () {
        $('#modalDeleteConfirm').modal('show');

        rows = $(this).closest('tr');
        let QuotationId = tableQuo.rows(rows).data()[0].QuotationId;
        $(".modal-title").text("Confirm Delete");
        $("#btnYes").unbind();
        $("#btnYes").click(function () {
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
        });
        $(".close,.no").click(function () {
            $('#modalDeleteConfirm').modal('hide');
        });
    });

    //clickTableQuotation
    $('#tableQuo tbody').on('click', 'tr', function () {
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

        $("#IP-Set-TableShow").attr("disabled", "disabled");
        $("#IP-Set-TablePrice").attr("disabled", "disabled");
        $("#IP-Set-TableQty").attr("disabled", "disabled");
        $("#IP-Set-TableTotal").attr("disabled", "disabled");

        $("#modalEditProject").removeClass('save');

        rows = $(this).closest("tr");
        var QuotationId = tableQuo.rows(rows).data()[0].QuotationId;
        var QuotationStatus = tableQuo.rows(rows).data()[0].QuotationStatus;


        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            $('#save-button').removeClass('visually-hidden');
            $('#save-button').toggleClass('visually-hidden');

            removeDetailPaper()

            hideAdd()

            hideEdit()

            hideSetting()

            fill_resetTable()
            RePro()


        }
        else {
            $('#tableQuo tr').removeClass('selected');
            $(this).toggleClass('selected');

            $('#save-button').removeClass('visually-hidden');
            $('#save-button').toggleClass('visually-hidden');

            $("#modalEditProject").removeClass('save');



            removeDetailPaper()
            getDetail(QuotationId)

            ShowPro(QuotationId)
            fill_item(QuotationId, QuotationStatus)

            if (QuotationStatus === "1") {
                //Show Edit Button
                $("#modalEditProject").removeClass('invisible');
                //Show AddItem Button
                $("#addItem").removeClass('visually-hidden');
                //Show Quotation Button
                $("#btn-quotation").removeAttr("disabled");
                //Show Detail Custom Button
                $('#save-button').removeClass('visually-hidden');
                //Show Setting
                ShowSetting()

                $(document).on("click", "#modalEditProject", function () {
                    if ($("#modalEditProject").hasClass('save')) {
                        $('#modalEditConfirm').modal('show');
                        $(".modal-title").text("Confirm Edit Project");

                        $(".save#modalEditProject").removeClass('save');

                        $("#btnEditYes").unbind();
                        $("#btnEditYes").click(function () {
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
                                    EmployeeApproveId: EmployeeApproveId,

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
                                    ShowPro(QuotationId)
                                }
                            });
                            $('#modalEditConfirm').modal('hide');
                        })
                        $(".close,.no").click(function () {
                            $('#modalEditConfirm').modal('hide');
                        })
                    }
                    else {
                        $("#modalEditProject").removeClass('save');
                        $("#modalEditProject").toggleClass('save');

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
                // Save Setting
                $(document).on("click", "#modalSaveSetting", function () {
                    $('#modalSettingConfirm').modal('show');

                    $(".modal-title").text("Confirm Setting");


                    $("#btnSettingYes").unbind();
                    $("#btnSettingYes").click(function () {
                        let TableShow = $.trim($('#IP-Set-TableShow').val());
                        let TablePrice = $.trim($('#IP-Set-TablePrice').val());
                        let TableQty = $.trim($('#IP-Set-TableQty').val());
                        let TableTotal = $.trim($('#IP-Set-TableTotal').val());

                        $.ajax({
                            url: "/quotation/edit_setting/" + QuotationId,
                            method: 'put',
                            contentType: 'application/json',
                            data: JSON.stringify({
                                TableShow: TableShow,
                                TablePrice: TablePrice,
                                TableQty: TableQty,
                                TableTotal: TableTotal,

                            }),
                            success: function (success) {
                                successText = success.message;
                                Swal.fire({
                                    position: 'center',
                                    icon: 'success',
                                    title: 'Saved',
                                    text: successText,
                                    showConfirmButton: false,
                                    timer: 1500
                                })
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
                        $('#modalSettingConfirm').modal('hide');
                    })
                    $(".close,.no").click(function () {
                        $('#modalSettingConfirm').modal('hide');
                    })
                })

            }

            //======================== Set Status =============================//
            // Status Quotation
            if (QuotationStatus === "2") {

                $("#btn-text").text("Edit");
                //Eidt button
                hideEdit()
                //AddItem button
                hideAdd()

                hideSetting()

                $("#btn-loss").removeAttr("disabled");
                $("#btn-book").removeAttr("disabled");
                $("#btn-cancel").removeAttr("disabled");
            }

            // Status booking
            if (QuotationStatus === "3") {
                $("#btn-text").text("Edit");
                //Eidt button
                hideEdit()
                //AddItem button
                hideAdd()

                hideSetting()

                $("#btn-loss").removeAttr("disabled");
                $("#btn-quotation").removeAttr("disabled");
                $("#btn-cancel").removeAttr("disabled");
            }

            // Status loss
            if (QuotationStatus === "4") {
                $("#btn-text").text("Edit");
                //Eidt button
                hideEdit()
                //AddItem button
                hideAdd()

                hideSetting()

                $("#btn-book").removeAttr("disabled");
                $("#btn-quotation").removeAttr("disabled");
                $("#btn-cancel").removeAttr("disabled");
            }

            // Status cancel
            if (QuotationStatus === "5") {
                $("#btn-text").text("Edit");
                //Eidt button
                hideEdit()
                //AddItem button
                hideAdd()

                hideSetting()

                $("#btn-book").removeAttr("disabled");
                $("#btn-quotation").removeAttr("disabled");
                $("#btn-loss").removeAttr("disabled");
            }

            // Revised
            $(document).on("click", "#btnRevised", function () {
                $('#modalRevisedConfirm').modal('show');

                $(".modal-title").text("Confirm Revised");
                $.ajax({
                    url: "/quotation/" + QuotationId,
                    method: 'get',
                    cache: false,
                    success: function (response) {
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
                        let QuotationDetail = obj.QuotationDetail;

                        $("#btnREYes").unbind();
                        $("#btnREYes").click(function () {
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
                                    QuotationDetail: QuotationDetail,
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
                            $('#modalRevisedConfirm').modal('hide');
                        })
                        $(".close,.no").click(function () {
                            $('#modalRevisedConfirm').modal('hide');
                        });
                    }
                })
            });

            // Preview PDF
            $(document).on("click", "#btnExample", function () {
                $('#modalPrintConfirm').modal('show');

                $(".modal-title").text("Confirm Preview PDF");

                $("#btnPrintYes").unbind();
                $("#btnPrintYes").click(function () {
                    document.getElementById('PreviewPDF').src = "";
                    $('#modalPreview').modal('show');
                    $(".modal-title").text("Preview PDF");
                    $.ajax({
                        url: "/quotation_report/" + QuotationId,
                        method: 'get',
                        contentType: 'application/json',
                        success: function (success) {
                            fileName = success.message;
                            document.getElementById('PreviewPDF').src = fileName + "#toolbar=0";
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
                            $('#modalPreview').modal('hide');
                        }
                    });

                    $(".close,.no").click(function () {
                        $('#modalPreview').modal('hide');
                    });
                    $('#modalPrintConfirm').modal('hide');
                })
                $(".close,.no").click(function () {
                    $('#modalPrintConfirm').modal('hide');
                });


            });

            // Print PDF
            $(document).on("click", "#btnPrint", function () {
                $('#modalPrintConfirm').modal('show');

                $("#modalPrintConfirm .modal-title").text("Confirm Download PDF");

                $("#btnPrintYes").unbind();
                $("#btnPrintYes").click(function () {
                    $.ajax({
                        url: "/quotation_report/download/" + QuotationId,
                        method: 'get',
                        contentType: 'application/json',
                        success: function () {
                            window.open("/quotation_report/download/" + QuotationId)
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
                    $('#modalPrintConfirm').modal('hide');
                })
                $(".close,.no").click(function () {
                    $('#modalPrintConfirm').modal('hide');
                });
            });

            //btn-quotation
            $(document).on('click', '#btn-quotation', function () {
                $('#modalStatusConfirm').modal('show');

                $(".modal-title").text("Confirm Set Status Quotation");

                $("#btnSetYes").unbind();
                $("#btnSetYes").click(function () {
                    $.ajax({
                        url: "/quotation_set/quotation/" + QuotationId,
                        method: 'get',
                        cache: false,
                        success: function (response) {
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
                    $('#modalStatusConfirm').modal('hide');
                })
                $(".close,.no").click(function () {
                    $('#modalStatusConfirm').modal('hide');
                });
            })

            //btn-cancel
            $(document).on('click', '#btn-cancel', function () {
                $('#modalStatusConfirm').modal('show');

                $(".modal-title").text("Confirm Set Status Cancel");
                $("#btnSetYes").unbind();
                $("#btnSetYes").click(function () {
                    $.ajax({
                        url: "/quotation_set/cancel/" + QuotationId,
                        method: 'get',
                        cache: false,
                        success: function (response) {
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
                    $('#modalStatusConfirm').modal('hide');
                })
                $(".close,.no").click(function () {
                    $('#modalStatusConfirm').modal('hide');
                });
            })

            //btn-book
            $(document).on('click', '#btn-book', function () {
                $('#modalStatusConfirm').modal('show');

                $(".modal-title").text("Confirm Set Status Book");
                $("#btnSetYes").unbind();
                $("#btnSetYes").click(function () {
                    $.ajax({
                        url: "/quotation_set/booking/" + QuotationId,
                        method: 'get',
                        cache: false,
                        success: function (response) {
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
                    $('#modalStatusConfirm').modal('hide');
                })
                $(".close,.no").click(function () {
                    $('#modalStatusConfirm').modal('hide');
                });
            })

            //btn-loss
            $(document).on('click', '#btn-loss', function () {
                $('#modalStatusConfirm').modal('show');

                $(".modal-title").text("Confirm Set Status Loss");
                $("#btnSetYes").unbind();
                $("#btnSetYes").click(function () {
                    $.ajax({
                        url: "/quotation_set/loss/" + QuotationId,
                        method: 'get',
                        cache: false,
                        success: function (response) {
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
                    $('#modalStatusConfirm').modal('hide');
                })
                $(".close,.no").click(function () {
                    $('#modalStatusConfirm').modal('hide');
                });
            })

            //======================== Item =============================//
            // Create Item
            $(document).on("click", "#addItem", function () {
                $('#modalAddItemMaster').modal('show');

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
                $(".close,.no").click(function () {
                    $('#modalAddItemMaster').modal('hide');
                });
            })
        }


    });



    //======================== Item =============================//
    //Edit Item
    $(document).on("click", "#btnEditItem", function () {
        $('#modalItemMaster').modal('show');

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
        $(".close").click(function () {
            $('#modalItemMaster').modal('hide');
        });
    });

    //Delete Item
    $(document).on("click", "#btnDelItem", function () {
        $('#modalDeleteConfirm').modal('show');

        rows = $(this).closest('tr');
        let ItemId = tableItem.rows(rows).data()[0].ItemId;
        let QuotationId = tableItem.rows(rows).data()[0].QuotationId;
        $(".modal-title").text("Confirm Delete");
        $("#btnYes").unbind();
        $("#btnYes").click(function () {
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
        $(".close,.no").click(function () {
            $('#modalDeleteConfirm').modal('hide');
        });
    });

    //dropdown Product
    $("#modalInpProduct").click(function () {
        let ProductId = $.trim($('#modalInpProduct').val())
        if (ProductId !== "null") {
            $.ajax({
                url: "/dropdown/product/" + ProductId,
                method: 'get',
                cache: false,
                success: function (response) {
                    var obj = JSON.parse(response);
                    $('#modalInpSubName').val(obj.ProductName);
                    $('#modalInpSubPrice').val(obj.ProductPrice);
                    $('#modalInpSubType').val(obj.ProductType);
                }
            })
        }
    });


    //clickTableItem
    $('#tableItem tbody').on('click', 'tr', function () {
        rows = $(this).closest('tr');
        let ItemId = tableItem.rows(rows).data()[0].ItemId;
        let ItemName = tableItem.rows(rows).data()[0].ItemName;
        let QuotationStatus = tableItem.rows(rows).data()[0].QuotationStatus;
        let QuotationId = tableItem.rows(rows).data()[0].QuotationId;

        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            fill_resetSubTable()
        }
        else {
            $('#tableItem tr').removeClass('selected');
            $(this).toggleClass('selected');
            fill_subitem(ItemId, QuotationStatus)
        }

        //Add Sub-Item
        $(document).on("click", "#btnSubItem", function () {
            $('#modalAddSubMaster').modal('show');

            $("#formSub").trigger("reset");
            $(".modal-title").text("Add Description in " + ItemName);

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
                        $('#modalAddSubMaster').modal('hide');

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
            $(".close").click(function () {
                $('#modalAddSubMaster').modal('hide');
            });
        })
    });

    //Edit Sub-Item
    $(document).on("click", "#btnEditSubItem", function () {
        $('#modalSubMaster').modal('show');

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

        $('#modalInpEdProduct').val(ProductId);
        $('#modalInpEdSubName').val(SubItemName);
        $('#modalInpEdSubPrice').val(SubItemPrice);
        $('#modalInpEdSubType').val(ProductType);
        $('#modalInpEdSubQty').val(SubItemQty);
        $('#modalInpEdSubUnit').val(SubItemUnit);

        $("#modalEdSaveSub").unbind();
        $("#modalEdSaveSub").click(function () {
            let ProductId = $.trim($('#modalInpEdProduct').val());
            let SubItemName = $.trim($('#modalInpEdSubName').val());
            let SubItemPrice = $.trim($('#modalInpEdSubPrice').val());
            let ProductType = $.trim($('#modalInpEdSubType').val());
            let SubItemQty = $.trim($('#modalInpEdSubQty').val());
            let SubItemUnit = $.trim($('#modalInpEdSubUnit').val());

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
        $(".close").click(function () {
            $('#modalSubMaster').modal('hide');
        });
    })

    //Delete Sub-Item
    $(document).on("click", "#btnDelSubItem", function () {
        $('#modalDeleteConfirm').modal('show');

        rows = $(this).closest('tr');
        let SubItemId = tableSubItem.rows(rows).data()[0].SubItemId;
        let QuotationId = tableSubItem.rows(rows).data()[0].QuotationId;
        $(".modal-title").text("Confirm Delete");
        $("#btnYes").unbind();
        $("#btnYes").click(function () {
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
        $(".close,.no").click(function () {
            $('#modalDeleteConfirm').modal('hide');
        });
    });

});




