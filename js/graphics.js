var min_temperature_range = -30;
var max_temperature_range = 70;

Function.prototype.subclassFrom=function(superClassFunc) {
    if (superClassFunc == null) {
        this.prototype={};
    } 
    else {
        this.prototype = new superClassFunc();
        this.prototype.constructor=this;
        this.superConstructor=superClassFunc;   
  }
}

Function.prototype.methods=function(funcs) {
    for (each in funcs) 
        if (funcs.hasOwnProperty(each)) {
            var original=this.prototype[each];
            funcs[each].superFunction=original;
            this.prototype[each]=funcs[each];
        }
}


function Graphic(sensorID) {
    this.sensorIDAssociated = sensorID;
    this.graphData =[];
    this.values=[];
    this.service_list=[];
    this.numberOfValues=0;
    this.title='';
    this.type='';
    this.options='';
    this.minRange;
    this.maxRange;
}

Graphic.methods({
    setVal : function(val) {}
});



function Thermometer(sensorID){
    arguments.callee.superConstructor.call(this, sensorID);
    
    this.type="thermometer";
    this.minRange=min_temperature_range;
    this.maxRange=max_temperature_range;
    
    $("#content_chart").prepend(this.getHTMLContent());
    this.chart = new RGraph.Thermometer("chart", this.minRange, this.maxRange, 0);
    RGraph.Effects.Thermometer.Grow(this.chart);
}

Thermometer.subclassFrom(Graphic);

Thermometer.methods({
    setVal : function(val) {
        this.chart.value = val;
        RGraph.Effects.Thermometer.Grow(this.chart);
    },
    getHTMLContent : function(){
        var html = "<canvas id='chart' width='100' height='400' class='thermometer_style'></canvas>";
        return html;
    },
    getCustomSettingsForSensor : function(sensor){
        return "<div id='range'> Range:     Min <input type='text' id='min_range-"+this.service_list[sensor]+"' value='"+this.minRange+"'>        Max <input type='text' id='max_range-"+this.service_list[sensor]+"' value='"+this.maxRange+"'></div>";
    }
});


function LineChart(sensorID){
    arguments.callee.superConstructor.call(this, sensorID);
    this.type="line-chart";
    
    this.graphData=new google.visualization.DataTable();
    this.graphData.addColumn('string','Data');
    this.graphData.addColumn('number',null);
    this.options = {
        title: '',
        chartArea: {width: '90%', height: '75%', top:'25', left: '50'},
        //legend: {position: 'top'},
        titlePosition: 'in', axisTitlesPosition: 'in',
        hAxis: {textPosition: 'out'}, vAxis: {textPosition: 'out'},     
        colors:['blue','red','orange','green','violet','brown','pink','yellow'],
        pointSize: 0
    };

    $("#content_chart").prepend(this.getHTMLContent());
    var chart_div = document.getElementById("chart");
    this.chart = new google.visualization.LineChart(chart_div);
    this.chart.draw(this.graphData, this.options);
}

LineChart.subclassFrom(Graphic);

LineChart.methods({
    setVal : function(val) {
        alert("check here");
    },
    getHTMLContent : function(){
        var html = "<div id='chart' class='lineChart_style'></div>";
        return html;
    },
    getCustomSettingsForSensor : function(sensor){
        var html = "";
        html+= "<div id='color' class='param_td'>Color";
        html+= "<select id='cfg_color-"+this.service_list[sensor]+"'>";
        for(var i=0;i<this.options.colors.length;i++){
            if(lineColor[i]==this.options.colors[sensor]){
                html+= "<option selected value='"+lineColor[i]+"'>"+lineColor[i]+"</option>";
            }
            else{
                html+= "<option value='"+lineColor[i]+"'>"+lineColor[i]+"</option>";
            }
        }
        html+= "</select>"; 
        return html;
    }
});