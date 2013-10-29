var actuatorsRegistered = {};

function ActuatorComponent(actuatorID, minRange, maxRange) {
    this.actuatorIDAssociated = actuatorID;
    this.title='';
    this.type='';
    this.options='';
    this.minRange = minRange;
    this.maxRange = maxRange;
    this.actualVal = '';
}

ActuatorComponent.methods({
    updateState : function(val){
        actuator.bind({
            onBind:function(service){
                var val_array = new Array(); 
                val_array[0] = parseFloat(val);

                try{
                    actuator.setValue(val_array,
                        function(actuatorEvent){
                            console.log("SETTED >>>>> " + actuatorEvent.actualValue[0]);
                        },
                        function(actuatorError){
                            console.log("[ERROR] on actuators set state: "+JSON.stringify(actuatorError));
                        }
                    );
                }
                catch(err){
                    console.log("Not a valid webinos actuator: " + err.message);
                }
            }
        });
    }
});



function Switch(actuatorID, minRange, maxRange){
    arguments.callee.superConstructor.call(this, actuatorID, minRange, maxRange);
    var that = this;

    $("#content_actuator").prepend(this.getHTMLContent());
    this.addEventOnClick(that);
}

Switch.subclassFrom(ActuatorComponent);

Switch.methods({
    setActuatorState : function() {
        this.actualVal = this.getState();
        this.updateState(this.actualVal);
        actuatorsRegistered[this.actuatorIDAssociated] = this.actualVal;
    },
    getHTMLContent : function(){
        //http://proto.io/freebies/onoff/
        var html = "<div class='onoffswitch switch_style'>";
        if((this.actuatorIDAssociated in actuatorsRegistered)){
            if(actuatorsRegistered[this.actuatorIDAssociated] == 1)
                html += "<input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox' id='myonoffswitch' checked>";
            else
                html += "<input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox' id='myonoffswitch'>";
        }
        else
            html += "<input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox' id='myonoffswitch'>";
        html += "<label class='onoffswitch-label' for='myonoffswitch'>";
        html += "<div class='onoffswitch-inner'></div>";
        html += "<div class='onoffswitch-switch'></div>";
        html += "</label>";
        html += "</div>";
        return html;
    },
    getState : function(){
        if($("#myonoffswitch").is(':checked'))
            return 1;  // checked
        else
            return 0;  // unchecked
    },
    addEventOnClick : function(that){
        $("#myonoffswitch").click(function(){
            console.log("CLICK!!!!");
            that.setActuatorState();
        });
    }
});


function Slider(actuatorID, minRange, maxRange){
    arguments.callee.superConstructor.call(this, actuatorID, minRange, maxRange);
    var that = this;

    $("#content_actuator").prepend(this.getHTMLContent());
    this.addEventOnClick(that);   
}

Slider.subclassFrom(ActuatorComponent);

Slider.methods({
    setActuatorState : function(val) {
        this.actualVal = val;
        this.updateState(this.actualVal);
    },
    getHTMLContent : function(){
        var html = "<div id='speed'>";
        html += "<h2 id='amount'>Actual Value: 1</h2>";
        html += "<div id='slider-range-max'></div>";
        html += "</div>";
        return html;
    },
    addEventOnClick : function(that){
        $("#slider-range-max").slider({
            orientation: "horizontal",
            range: "min",
            min: that.minRange,
            max: that.maxRange,
            value: 1,
            slide: function( event, ui ) {
                $("#amount").empty();
                $("#amount").text( "Actual Value: " + ui.value );
                that.setActuatorState(ui.value);
            }
        });
    }
});


function InputBox(actuatorID){
    arguments.callee.superConstructor.call(this, actuatorID, 0, 0);
    var that = this;

    $("#content_actuator").prepend(this.getHTMLContent());
    this.addEventOnClick(that);  
}

InputBox.subclassFrom(ActuatorComponent);

InputBox.methods({
    setActuatorState : function(val) {
        this.actualVal = val;
        this.updateState(this.actualVal);
    },
    getHTMLContent : function(){
        var html = "<div class='inputBox_style'>";
        html += "<input class='textbox' type='text' id='text_act_val'>";
        html += "<button class='trasparent-button' id='but_text_act_val'>Set Actuator Value</button>";
        html += "</div>";
        return html;
    },
    addEventOnClick : function(that){
        $("#but_text_act_val").click(function(){
            that.setActuatorState($("#text_act_val").val());
        });
    }
});