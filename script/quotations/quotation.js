$(document).ready(function () {
    //MOSTRAR
    function fill_Quotation() {
        tableQuotation = $('#tableQuotation').DataTable({
            "bDestroy": true,
            "ajax": {
                "url": '/quotation/list',
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
                    "data": "QuotationSubject"
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
                    "defaultContent": "<div class='text-center'><div class='btn-group'><button class='btn btn-primary p-1 m-2' id='btnEditCompany' data-toggle='modal'  data-target='#modalCompanyMaster'  style='width: 2rem;''><i class='fa fa-pencil-square-o'></i></button><button  class='btn btn-danger p-1 m-2' id='btnDelCompany' data-toggle='modal' data-target='#modalDeleteConfirm' style='width: 2rem;''><i class='fa fa-remove'></i></button></div></div>"
                }
                
            ],"columnDefs":[
                {
                    "targets": [7],
                    "visible": false
                },
            ],
        });
    }
    fill_Quotation();

});