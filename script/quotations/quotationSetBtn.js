function btn_On() {
    $(document).on('click','#btn-quotation',function() {
        $.ajax({
            url: "/quotation_set/quotation/" + QuotationId,
            method: 'get',
            cache: false,
            success:function(response){
                console.log(QuotationId)
            }
        })
    })
}