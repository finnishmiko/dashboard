var io = io.connect();

var chart = c3.generate({
    bindto: '#graph',
    data: {
        x: 'x',
        columns: [
        ],
    type: 'bar'
        },
    bar: {
        width: {ratio: 1}

    },
    axis: {
        x: {
            type: 'timeseries',
            tick: {
                format: '%X'
            }
        }
    }
});

var DATA_POINT_COUNT = 2;
//var LABEL_PREFIXES = /^avg|^min|^max/;
var LABEL_PREFIXES = /^-10min|^-9min|^-8min|^-7min|^-6min|^-5min|^-4min|^-3min|^-2min|^-1min/;
//var LABEL_PREFIXES = /^temp|^light|^counter/;
var labels = null;
var columns = [];

var appendColumn = function (index, label, value) {
    if (columns.length <= index) {
        columns.push([label]);
    }
    columns[index].push(value);
    if (columns[index].length > DATA_POINT_COUNT) {
        columns[index].splice(1, 1);
    }
};

var initializeLabels = function (data) {
    labels = [];
    Object.keys(data).forEach(function (key) {
        if (LABEL_PREFIXES.test(key)) {
            labels.push(key);
        }
    });
};

io.on('data', function (incomingData) {
    // Initialize labels from incoming data
    if (labels === null) {
        initializeLabels(incomingData);
    }
    //document.getElementById("output1").innerHTML = incomingData['time'];

    appendColumn(0, 'x', new Date(incomingData['time']));//.EventProcessedUtcTime));//timestamp));
    for (var i = 0; i < labels.length; i++) {
        appendColumn(i + 1, labels[i], incomingData[labels[i]]);
    }
    //document.getElementById("output1").innerHTML = labels;
    //document.getElementById('output2').innerHTML = columns;
    chart.load({
        columns: columns
    });
});

// Listen for session event.
io.emit('ready');

