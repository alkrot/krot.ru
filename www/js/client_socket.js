var ws = new WebSocket('ws://127.0.0.1:8080');

function sendSocket() {
        var data = JSON.stringify({
            "group_id": localStorage.send_group_id,
            "group": document.getElementById('group').value
        });
        ws.send(data);
};

ws.onmessage = function (p1) {
    var data = JSON.parse(p1.data);
    if(data['group_id'] == localStorage.user_group_id)
        Push(data['group']);
};