<!--

    Store medium encryption passwords in memory
    
    Copyright (C) 2010-2015 Ian Moore (imoore76 at yahoo dot com)
    
    $Id: mediumEncryptionPasswords.html 596 2015-04-19 11:50:53Z imoore76 $
    
-->
<div id='vboxMediumEncryptionPasswords'>
<div class='vboxBordered'>
    <table class='vboxTable vboxHorizontal'>
        <thead>
            <tr>
                <th class='translate' style='width:1%; text-align:center'>Status</th>
                <th class='translate' style='width:30%; text-align:center'>ID</th>
                <th class='translate'>Password</th>
            </tr>
        </thead>
        <tbody id='vboxMediumEncryptionPasswordList'>
        </tbody>
    </table>
</div>
</div>
<script type='text/javascript'>
$('#vboxMediumEncryptionPasswords').find(".translate").html(function(i,h){return trans(h,'password table field');});
function vboxMediumEncryptionPasswordAdd(eid, valid) {
    var status = (valid ? 'check' : 'error');
    $('<tr />')
        .data({'vboxEncryptionId':eid, 'vboxAlreadySupplied': valid})
        .append($('<td />').css({'text-align':'center'})
                .append($('<img />').attr('src','images/vbox/status_%s_16px.png'.replace('%s', status)).addClass('vboxImage'))
        )
        .append($('<td />').css({'text-align':'center'})
                .append($('<span />').text(eid))
        )
        .append($('<td />')
                .append(
                        valid ? '*****' : 
                        $('<input />').attr({'type':'password','style':'width:95%'}).addClass('vboxText')
                        )
        )
        .appendTo($('#vboxMediumEncryptionPasswordList'))
}

function vboxMediumEncryptionPasswordsGet() {
    
    if(!vboxMediumEncryptionPasswordsValidateInput())
        return false;
    
    var encryptionPWs = [];
    var rowlist = $('#vboxMediumEncryptionPasswordList').children();
    for(var i = 0; i < rowlist.length; i++) {
        if($(rowlist[i]).data('vboxAlreadySupplied'))
            continue;
        encryptionPWs.push({
            'id': $(rowlist[i]).data('vboxEncryptionId'),
            'password': $(rowlist[i]).find('input').first().val()
        });
        
    }
    return encryptionPWs;
}

function vboxMediumEncryptionPasswordsValidateInput() {
    var valid = true;
    $('#vboxMediumEncryptionPasswordList').children().each(function(i, elm) {
       var pwinput =  $(elm).find('input').first();
       if($(pwinput).val()) {
           $(pwinput).removeClass('vboxRequired');
       } else {
           $(pwinput).addClass('vboxRequired');
           valid = false;
       }
    });
    return valid;
}
</script>