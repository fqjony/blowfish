// TimeLife of cookie
var cookieExp = 7;

// Timeout ID of wallet preloader
var walletTimeoutID = 0;

// Timeout ID of transaction preloader
var transactionTimeoutID = 0;

$(function () {

    $('#encryptButton').click(function () {
        Encrypt();
    });

    if (!$.cookie('pass')) {
        ModalInit();
    } else
        RefreshUI();
});

// Init password modal
function ModalInit() {
    $('#pass').val("");

    $('#myModal').modal({
        keyboard: false
    });

    $('#pass').keydown(function (e) {
        // Press "enter"
        if (e.keyCode == 13)
            SavePassword();
    });

    $('#myModal').on('hide.bs.modal', function () {
        if (!$('#pass').val())
            return false;
    });

    $('#savePassword').click(function () {
        SavePassword();
    });
}

// Save pasword to cookie
function SavePassword() {
    var password = $.trim($('#pass').val());

    if (!password) {
        alert('Enter password');
        $('#pass').focus();
        return false;
    }

    var date = new Date();
    date.setDate(date.getDate() + cookieExp);

    $.cookie('pass', password, {expires: cookieExp});
    $.cookie('passExp', date, {expires: cookieExp});

    RefreshUI();
    $('#myModal').modal('hide');
}

// Refresh UI
function RefreshUI() {

    $('#cookiePass').text($.cookie('pass'));

    if ($.cookie('passExp')) {
        var date = new Date($.cookie('passExp'));
        $('#cookieExpiring').countdown({until: date, onExpiry: ReloadPage});
    } else
        $('#cookieExpiring').text("");

    $('#text').val("");
    $('#textResult').text("");

    setInterval('RefreshWalletData()', 30000);
    setInterval('RefreshTransactionData()', 30000);
}

// Reload page
function ReloadPage() {
    location.reload();
}

// Encrypt data and show encrypted data
function Encrypt() {
    var password = $.cookie('pass');

    if (!password) {
        alert('Missing password');
        ReloadPage();
    }

    var text = $('#text').val();
    if (!text) {
        alert('Missing text');
        return false;
    }

    var bf = new Blowfish(password);
    var encrypted = bf.encrypt(text);
    encrypted = bf.base64Encode(encrypted);
    $('#textResult').text(encrypted);

    return false;
}

// Refresh user data
/**
 * @return {boolean}
 */
function RefreshWalletData() {

    var apiSecret = $.trim($('#apiSecret').val());
    var apiKey = $.trim($('#apiKey').val());

    if(!apiSecret || !apiKey)
        return false;

    walletTimeoutID = setTimeout(function(){
        $('#wallet-preloader').removeClass('hidden');
        $('#wallet-balance-block').addClass('hidden');
    }, 2000);


    var operation = 'cabinet';

    var dateString = GetDateString();

    var hash = md5(apiKey+operation+dateString+apiSecret);

    $.jsonp({
        type: 'GET',
        url: 'http://www.transfex.biz/api/?callback=RefreshWalletDataFromServer',
        async: true,
        //callbackParameter: '',
        data: {
            api_key: apiKey,
            operation: operation,
            datetime: dateString,
            hash: hash
        }
    });
}

// API Query wallet handler
function RefreshWalletDataFromServer(jsonData){

    clearTimeout(walletTimeoutID);

    if(!$('#error').hasClass('hidden'))
        $('#error').addClass('hidden');


    if (jsonData.success) {
        $('#name').text(jsonData.data.name);

        if (jsonData.data.active != 'yes')
            $('#status').removeClass('hidden');
        else
            $('#status').addClass('hidden');

        if (jsonData.data.balance)
            for (var item in jsonData.data.balance){
                $('#'+item).text(jsonData.data.balance[item]);
            }
    }else{
        console.log(jsonData.message);
        $('#error').text(jsonData.message);
        $('#error').removeClass('hidden');
    }

    if($('#wallet-balance-block').hasClass('hidden'))
        $('#wallet-balance-block').removeClass('hidden');

    if(!$('#wallet-preloader').hasClass('hidden'))
        $('#wallet-preloader').addClass('hidden');
}

// Refresh user data
/**
 * @return {boolean}
 */
function RefreshTransactionData() {

    var apiSecret = $.trim($('#apiSecret').val());
    var apiKey = $.trim($('#apiKey').val());

    if(!apiSecret || !apiKey)
        return false;

    transactionTimeoutID = setTimeout(function(){
        $('#transaction-preloader').removeClass('hidden');
        $('#transactions-block').addClass('hidden');
    }, 2000);


    var operation = 'trans-list';

    var dateString = GetDateString();

    var hash = md5(apiKey+operation+dateString+apiSecret);

    $.jsonp({
        type: 'GET',
        url: 'http://www.transfex.biz/api/?callback=RefreshTransactionDataFromServer',
        async: true,
        //callbackParameter: '',
        data: {
            api_key: apiKey,
            operation: operation,
            datetime: dateString,
            hash: hash
        }
    });
}

// API Query transaction handler
function RefreshTransactionDataFromServer(jsonData){

    clearTimeout(transactionTimeoutID);

    if(!$('#error').hasClass('hidden'))
        $('#error').addClass('hidden');

    $('#transactions-block tr.transaction-item td').text('');

    if (jsonData.success) {
        if(jsonData.data.length){
            for(var key in jsonData.data){
                for(var item in jsonData.data[key]){
                    $('#transactions-block tr.transaction-item').eq(key).find('td.'+item).html(item.toUpperCase() + ': ' + jsonData.data[key][item]);
                }
            }
        }
    }else{
        console.log(jsonData.message);
        $('#error').text(jsonData.message);
        $('#error').removeClass('hidden');
    }

    if($('#transactions-block').hasClass('hidden'))
        $('#transactions-block').removeClass('hidden');

    if(!$('#transaction-preloader').hasClass('hidden'))
        $('#transaction-preloader').addClass('hidden');
}

/**
 * @return {string}
 */
function GetDateString(){
    var dateTime = new Date();

    var month = dateTime.getMonth()+1;
    month = month >= 10 ? month : '0'+month;

    var date = dateTime.getDate();
    date = date >= 10 ? date : '0'+date;

    var seconds = dateTime.getSeconds();
    seconds = seconds >= 10 ? seconds : '0'+seconds;

    var hours = dateTime.getHours();
    hours = hours >= 10 ? hours : '0'+hours;

    var minutes = dateTime.getMinutes();
    minutes = minutes >= 10 ? minutes : '0'+minutes;

    return dateTime.getFullYear()+"-"+month+"-"+date+" "+hours+":"+minutes+":"+seconds;
}