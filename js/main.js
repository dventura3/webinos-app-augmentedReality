navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;

var sensorServices = [];
var actuatorServices = [];
var sensor_types = "http://webinos.org/api/sensors/*";
var actuator_types = "http://webinos.org/api/actuators/*";

var video;
var canvas;
var ctx;


google.load("visualization", "1", {packages:["corechart"]});

$(document).ready(init);

//graphic to show on display
var graphic;

//actuator component to show on display
var actComponent;

var eventListenerFunction = function(event){
			if(graphic.type == "thermometer"){
				graphic.setVal(event.sensorValues[0]);
				$("#content_chart").show();
			}else if(graphic.type == "line-chart"){
				var time=new Date(event.timestamp);
				time=(time.getUTCHours()+2)+ ":"+time.getUTCMinutes()+":"+time.getUTCSeconds();

				var arrayTMP = new Array();
				arrayTMP[0] = time;
				arrayTMP[1] = parseInt(event.sensorValues[0]);

				var dimGraphData = graphic.graphData.addRow(arrayTMP);

				graphic.numberOfValues++;
		  		graphic.chart.draw(graphic.graphData, graphic.options);
				if(graphic.numberOfValues>150){
					graphic.graphData.removeRow(0);
				}
				$("#content_chart").show();	
			}else{
				console.log("Error!");
			}
			$("#valueDiv").show();
			$("#values").text(event.sensorValues[0]);
};

var stopCapture = false;
var sensor;
var actuator;
var sensor_count;
var registered = false;
var deferred;
var sensor_chart;

function init() {
			video = document.getElementById('monitor');
			canvas = document.getElementById('photo');
			ctx = canvas.getContext('2d');
			if (!navigator.getUserMedia) {
						alert('Sorry. <code>navigator.getUserMedia()</code> is not available.');
						return;
			}  
			navigator.getUserMedia({video: true}, gotStream, noStream);
			discoverActuators();
			discoverSensors();

			//hide the content of chart
			$("#content_chart").hide();
}

function gotStream(stream) {
  if (window.URL) {
    video.src = window.URL.createObjectURL(stream);
  } else {
    video.src = stream; // Opera.
  }

  video.onerror = function(e) {
    //stream.stop();
  };

  stream.onended = noStream;

  // Since video.onloadedmetadata isn't firing for getUserMedia video, we have
  // to fake it.
  setTimeout(function() {
    //canvas.width = video.videoWidth;
    //canvas.height = video.videoHeight;
  }, 50);
  startCapture();
}

function noStream(e) {
  var msg = 'No camera available.';
  if (e.code == 1) {
	msg = 'User denied access to use camera.';
  }
  alert(msg);
  //document.getElementById('errorMessage').textContent = msg;
}

function capture() {
	console.log("Capturing image");
	try{
			
        ctx.drawImage(video,0,0, 640, 480);
        try{
			qrcode.callback = read;
		        qrcode.decode();
        }
        catch(e){       
            console.log(e);
			if(!stopCapture)
				setTimeout(capture, 500);
        };
    }
    catch(e){       
            console.log(e);
			if(!stopCapture)
				setTimeout(capture, 500);
    };
}

function startCapture(){
	setTimeout(capture, 500);
	stopCapture = false;
	//$("#capture").text("Stop").on("click", endCapture);
}

function endCapture(){
	stopCapture = true;
	setTimeout(function(){
			$("#capture").off("click").text("Capture").on("click", startCapture);
	}, 500);
}

function read(id){
        console.log("QR Code callback");
	if( id == "error decoding QR Code"){
			console.log(id);
		if(!stopCapture)
			setTimeout(capture, 500);
	}
	else{
			console.log("QRCode correctly readed");
		find(id);
		if (!stopCapture) {
			setTimeout(capture, 10000);
		}

	}
}

function showOverlay() {
			$("#capture").show().text("Back").on("click",hideOverlay);
			if (sensor) {
						showSensorOverlay();
			}
			else if (actuator) {
						showActuatorOverlay();
			}
}
function hideOverlay() {
			$("#capture").hide();
			if (sensor) {
						listenSensor();
						sensor = undefined;
						hideSensorOverlay();
			}
			else if (actuator) {
						actuator = undefined;
						hideActuatorOverlay();
			}
}
function showSensorOverlay() {
		$("#overlay").show();
		$("#serviceName").text(sensor.displayName);
		$("#serviceDescription").text(sensor.description);
		$("#sensorButton").show().text("Start");
		listenSensor();
}
function showActuatorOverlay() {
			$("#overlay").show();
			$("#serviceName").text(actuator.displayName);
			$("#serviceDescription").text(actuator.description);
			showActuator();
			//$("#actuatorSlider").show().slider({ min: actuator.range[0][0], max: actuator.range[0][(actuator.range[0].length - 1)], step:actuator.range[0][1] - actuator.range[0][0] });
			//$("#actuatorButton").show().text("Apply");
}

function hideSensorOverlay() {
			$("#overlay").hide();
			$("#sensor-chart").hide();
			$("#valueDiv").hide();
			$("#values").text("");
			$("#sensor-chart").hide();
			$("chart-options").hide();
			sensor.removeEventListener('sensor', eventListenerFunction, true);
}

function hideActuatorOverlay() {
			$("#overlay").hide();
			//$("#actuatorSlider").hide();
			//$("#actuatorButton").hide();
}


function discoverSensors() {
		var serviceType = new ServiceType(sensor_types);
		webinos.discovery.findServices(serviceType, {
					onFound: function (service) {
								sensorServices.push(service);
					},
					onLost: function(service){
					},
					onError: function(error){
					}
		});	
}
function discoverActuators() {
		var serviceType = new ServiceType(actuator_types);
		webinos.discovery.findServices(serviceType, {
					onFound: function (service) {
								actuatorServices.push(service);
					},
					onLost: function(service){
					},
					onError: function(error){
					}
		});
			
}
function find(id){
			for (var i = 0; i < sensorServices.length; i++) {
					if(sensorServices[i].id == id){
						if (sensor || actuator) {
									hideOverlay();
						}
						sensorServices[i].bind({onBind:function(){
						sensorServices[i].configureSensor({rate: 1000, eventFireMode: "fixedinterval"},
							function(){
								sensor = sensorServices[i];
								setTimeout(showOverlay(), 1000);
							},
							function (){
								sensor = undefined;
								console.error('Error configuring Sensor ' + service.api);
							});
						}
						});
						return;
					}
			}
			for (i = 0; i < actuatorServices.length; i++) {
						if (actuatorServices[i].id == id) {
								if (sensor || actuator) {
									hideOverlay();
								}
								actuatorServices[i].bind({onBind:function(){
										actuator = actuatorServices[i];
								        setTimeout(showOverlay(), 100);
								    }
						        });
						return;
						}
			}
			alert("Nothing Found, Maybe a Wrong QR Code?");
}

function listenSensor(){
	if(!registered){

		//remove the OLD content inside the div $("#content_chart")
		$("#content_chart").empty();
		$("#content_actuator").empty();

		if(sensor.api.indexOf("temperature") !== -1)
			graphic = new Thermometer(sensor.id);
		else
			graphic = new LineChart(sensor.id);

		sensor.addEventListener('sensor', eventListenerFunction, true);
		$("#sensorButton").text("Stop");
		registered = true;
		$("#valueDiv").show();
	}
	else{
		sensor.removeEventListener('sensor', eventListenerFunction, true);
		//divValues.hidden = true;
		registered = false;
		$("#sensorButton").text("Start");
		$("values").text("");
	}
}



function showActuator(){
	$("#content_chart").empty();
	$("#content_actuator").empty();

	if(actuator.range[0].length == 2){
		if(actuator.range[0][0] == 0 && actuator.range[0][1] == 1)
			actComponent = new Switch(actuator.id, 0, 1);
		else
			actComponent = new Slider(actuator.id, actuator.range[0][0], actuator.range[0][1]);
	}
	else
		actComponent = new InputBox(actuator.id);
}

