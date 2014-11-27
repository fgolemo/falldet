function fallDetected() {
    navigator.vibrate([1000, 500, 2000, 500, 3000]);
    var my_media = new Media("sounds/fall-detected.wav",
        function () {
            console.log("playAudio():Audio Success");
        },
        function (err) {
            console.log("playAudio():Audio Error: " + err);
        }
    );
    my_media.play();
}

var app = {
    // Application Constructor
    initialize: function(odr) {
        this.bindEvents(odr);
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function(odr) {
        document.addEventListener('deviceready', odr, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        console.log('Received Event: ' + id);
    }
};

