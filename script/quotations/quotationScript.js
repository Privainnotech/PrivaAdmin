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
                    "data":  "QuotationNo_Revised" 
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
                    "data": "QuotationStatus"
                },
                {
                    "defaultContent": "<div class='text-center'><div class='btn-group'><button class='btn btn-primary p-1 m-2' id='btnEditCustomer' data-toggle='modal'  data-target='#modalCustomerMaster'  style='width: 2rem;''><i class='fa fa-pencil-square-o'></i></button><button  class='btn btn-danger p-1 m-2' id='btnDelCustomer' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                }
                ,
                {
                    "data": "QuotationId"
                }

            ],"columnDefs":[
                {
                    "targets": [7],
                    "visible": false
                },
            ],
        });
    }
    fill_quotation()
    

    
});

