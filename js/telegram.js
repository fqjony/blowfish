$(function(){
    $.ajax({
        url: 'https://api.telegram.org/bot206784565:AAE3kjfxp3Qb9w0xPu-DSAixj_YSxt0_wvs/getUpdates',
        success: function(data) {
            if(data.ok == true)
                $('body').text('bot is disabled');
        },
        error: function(error){
            if(error.status == 409)
                $('body').text('bot is enabled');
            else
                $('body').text('error');
        }
    });
});