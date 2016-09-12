$(document).ready(function() {
    $("#OnButton").click(function() {
        var deviceId = $("#deviceId").val();
        var uri = "/" + deviceId + "/led/1";
        
        $.post(uri, function() {
            alert("ON sent");
        })
        .fail(function(data) {
            alert( "ON error" );
        });
    });
        
    $("#OffButton").click(function() {
        var deviceId = $("#deviceId").val();
        var uri = "/" + deviceId + "/led/0";
        
        $.post(uri, function() {
            alert("OFF sent");
        })
        .fail(function() {
            alert( "OFF error" );
        });
    });
});
