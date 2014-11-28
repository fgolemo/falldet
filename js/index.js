var n, random, data, margin, width, height, x, y, lineX, lineY, lineZ, svg, path1, path2, path3;

function fillZero() {
    return [0, 0, 0];
}

function sensorDiagram() {
    n = 100;
    random = function () {
        return d3.random.normal(0, .2)() * 10;
    };
    data = d3.range(n).map(fillZero);
    margin = {top: 20, right: 20, bottom: 20, left: 40};
    height = 500 - margin.top - margin.bottom;
    svg = d3.select("#diagram").append("svg");
    width = $("svg").parent().width();
    x = d3.scale.linear()
        .domain([0, n - 1])
        .range([0, width]);
    y = d3.scale.linear()
        .domain([0, 40])
        .range([height, 0]);
    lineX = d3.svg.line()
        .x(function (d, i) {
            return x(i);
        })
        .y(function (d, i) {
            return y(d[0]);
        });
    lineY = d3.svg.line()
        .x(function (d, i) {
            return x(i);
        })
        .y(function (d, i) {
            return y(d[1]);
        });
    lineZ = d3.svg.line()
        .x(function (d, i) {
            return x(i);
        })
        .y(function (d, i) {
            return y(d[2]);
        });
    d3.select("svg")
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.svg.axis().scale(x).orient("bottom"));
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis().scale(y).orient("left"));
    path1 = svg.append("g")
        .attr("clip-path", "url(#clip)")
        .append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", lineX);
    path2 = svg.append("g")
        .attr("clip-path", "url(#clip)")
        .append("path")
        .datum(data)
        .attr("class", "line")
        .style("stroke", "red")
        .attr("d", lineY);
    path3 = svg.append("g")
        .attr("clip-path", "url(#clip)")
        .append("path")
        .datum(data)
        .attr("class", "line")
        .style("stroke", "green")
        .attr("d", lineZ);
    //tick()
}

function tick(xAcc, yAcc, zAcc) {
    //var xAcc = random();
    //var yAcc = random();
    //var zAcc = random();
    data.push([xAcc, yAcc, zAcc]);
    path1.attr("d", lineX)
        .attr("transform", null)
        .transition()
        .duration(100)
        .ease("linear")
        .attr("transform", "translate(" + x(-1) + ",0)");
    path2.attr("d", lineY)
        .attr("transform", null)
        .transition()
        .duration(100)
        .ease("linear")
        .attr("transform", "translate(" + x(-1) + ",0)");
    path3.attr("d", lineZ)
        .attr("transform", null)
        .transition()
        .duration(100)
        .ease("linear")
        .attr("transform", "translate(" + x(-1) + ",0)");
    data.shift();
}

function sum(list) {
    if (list.length == 0) {
        return 0;
    }
    if (list.length == 1) {
        return list[0];
    }
    var diff = 0,
        last = list[0];
    for (var i in list) {
        if (i == 0) {
            continue;
        }
        var val = list[i];
        diff += Math.abs(last - val);
        last = val;
    }
    return diff;
}

function watchAccel() {
    var lastX = [],
        lastY = [],
        lastZ = [],
        sumX = 0,
        sumY = 0,
        sumZ = 0,
        totalsum = 0;

    function onSuccess(acceleration) {
        //alert('Acceleration X: ' + acceleration.x + '\n' +
        //'Acceleration Y: ' + acceleration.y + '\n' +
        //'Acceleration Z: ' + acceleration.z + '\n' +
        //'Timestamp: '      + acceleration.timestamp + '\n');
        lastX.push(acceleration.x);
        lastY.push(acceleration.y);
        lastZ.push(acceleration.z);
        if (lastX.length > 3) {
            lastX.shift();
            lastY.shift();
            lastZ.shift();
        }
        sumX = sum(lastX);
        sumY = sum(lastY);
        sumZ = sum(lastZ);
        totalsum = sumX + sumY + sumZ;
        $("#rumble").text(totalsum);
        //if ((totalsum > 30)) {
        if ((sumZ < 30 && totalsum > 35) || (totalsum > 60)) {
            document.location.href='falldetected.html';
        }
        tick(sumX, sumY, sumZ)
    };

    function onError() {
        alert('onError!');
    };

    var options = {frequency: 100};  // Update every 0.1s

    var watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
}

function fallDetected() {
    navigator.vibrate([1000, 500, 1500]);
    playAudio("sounds/fall-detected.wav");
}

function standby() {
    sensorDiagram();
    watchAccel();
}

function help() {
    navigator.vibrate([500, 500, 500]);
    playAudio("sounds/help.wav");
}

function cancel() {
    //playAudio("sounds/test.mp3");
}

function playAudio(fileurl) {
    var media = new Media(getPhoneGapPath(fileurl), null, null);
    media.play();
}

function getPhoneGapPath(s) {
    var path = window.location.pathname;
    path = path.substring(0, path.lastIndexOf("/") + 1);
    var fullpath = 'file://' + path + s;
    return fullpath;
}

function mediaError(e) {
    alert('Media Error');
    alert(JSON.stringify(e));
}

var app = {
    // Application Constructor
    initialize: function (odr) {
        this.bindEvents(odr);
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function (odr) {
        document.addEventListener('deviceready', odr, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        console.log('Received Event: ' + id);
    }
};

