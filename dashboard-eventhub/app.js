var express = require('express.io')
var uuid = require('uuid');
var EventHubClient = require('azure-event-hubs').Client;
var IotHubClient = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;

app = express().http().io()

var iotHubConnectionString = process.env.IOTHUB_CONNSTRING || ''
var eventHubConnectionString = process.env.EVENTHUB_CONNSTRING || ''
var client = EventHubClient.fromConnectionString(eventHubConnectionString, '<Event hub namespace name>')

// Setup your sessions, just like normal.
app.use(express.cookieParser())
app.use(express.session({secret: 'Company X'}))

// Session is automatically setup on initial request.
app.get('/', function(req, res) {
    req.session.loginDate = new Date().toString()
    res.sendfile(__dirname + '/index.html')
});

app.post('/:deviceId/led/:state', function (req, res) { 
    var deviceId = req.params.deviceId;
    var ledState = req.params.state;   
    var messageData = '{"ledState":' + ledState + '}';

    var client = IotHubClient.fromConnectionString(iotHubConnectionString);
    client.open(function (err) {
        if (err) {
            console.Log('Could not open the connection to the service: ' + err.message);
        } else {
            client.send(deviceId, messageData, function (err) {
                if (err) {
                    console.Log('Could not send the message to the service: ' + err.message);
                } else {
                    client.close(function (err) {
                        if (err) {
                            console.Log('Could not close the connection to the service: ' + err.message);
                        }
                    });
                }
            });
        }
    });
    
    res.status(20).end();
});

app.use(express.static(__dirname + '/static'));

// Instantiate an eventhub client

app.io.route('ready', function(req) {
    // For each partition, register a callback function
    client.getPartitionIds().then(function(ids) {
        ids.forEach(function(id) {
            var minutesAgo = 5;
            var before = (minutesAgo*60*1000);
            client.createReceiver('$Default', id, { startAfterTime: Date.now() - before })
                .then(function(rx) {
                    rx.on('errorReceived', function(err) { console.log(err); });
                    rx.on('message', function(message) {
                        console.log(message.body);
                        var body = message.body;
			console.log(body['data']);
                        try {
                            app.io.broadcast('data', body);
                        } catch (err) {
                            console.log("Error sending: " + body);
                            console.log(typeof(body));
                        }
                    });
                });
        });
    });
});

app.listen(process.env.port || 8000)
