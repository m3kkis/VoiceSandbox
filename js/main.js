$(document).ready(function() {

    var _TextCommands = new TextCommands();

    $("#language_select").on("change",function(){
        annyang.setLanguage( $(this).val() );
    })

    $("#btn_add_voice_text").on("click",function(){
        if( $(voice_text_input).val() != "" )
        {

            var newId = randomNumberIdGen();
            var newTextCommand = $(voice_text_input).val();

            _TextCommands.addTextCommand(newId, newTextCommand);

            appendCommand(newId, newTextCommand);


            var AddToOutput = function(){
                console.log("Command worked");
            };

            var keyWord = newTextCommand,
            objCommand = {
                [keyWord]: AddToOutput
            };
        
            annyang.addCommands(objCommand);

            $(voice_text_input).val("");
            $(voice_text_input).focus();
            checkIfCommandOrOutputEmpty();
        }
        else
        {
            showAlertPopup("ERROR_FIELD_EMPTY");
        }
    });

    $("#btn_clear_commands").on("click",function(){
        if(_TextCommands != undefined)
        {
            _TextCommands.deleteAllTextCommand();
            $(".one_command").each(function(){
                var me = this;
                annyang.removeCommands($(me).parent().find(".one_command_text").text());
                $(me).remove();
            });
            checkIfCommandOrOutputEmpty();
        }
    });

    $("#btn_clear_output").on("click",function(){
        $(".one_output").each(function(){
            $(this).remove();
        });
        $(".one_output_nomatch").each(function(){
            $(this).remove();
        });
        checkIfCommandOrOutputEmpty();
    });


    $("#btn_start_listen").on("click", function(){
        /**
         * annyang.start({ autoRestart: false, continuous: false });
         */
        $(this).prop('disabled', true);
        $("#btn_start_pause").prop('disabled', false);
        $("#btn_stop_listen").prop('disabled', false);
        annyang.start();
        annyang.removeCallback();
        annyang.addCallback('resultMatch', function(userSaid, commandText, phrases) {
            var shtml = "";
            shtml += '<div class="one_output">';
            shtml += '<div><b class="one_output_title">USER SAID: </b> ' + userSaid + '</div>';
            shtml += '<div><b class="one_output_title">COMMAND: </b> ' + commandText + '</div>';
            shtml += '<div><b class="one_output_title">POSSIBILITIES: </b> ' + phrases + '</div>';
            shtml += '</div>';
            $("#output_list").prepend(shtml);
            checkIfCommandOrOutputEmpty();
        });

        annyang.addCallback('resultNoMatch', function(phrases) {
            var shtml = "";
            shtml += '<div class="one_output_nomatch">';
            shtml += '<div><b class="one_output_title">NO MATCH</b>' + phrases + '</div>';
            shtml += '</div>';
            $("#output_list").prepend(shtml);
            checkIfCommandOrOutputEmpty();
        });

        /* doesn't work well

        annyang.addCallback('soundstart', function() {
            $("#sound_detection").text(" sound detected");
        });
          
        annyang.addCallback('result', function() {
            $("#sound_detection").text(" sound stopped");
        });

        */

        annyang.addCallback('errorNetwork', function(e) {
            showAlertPopup("ERROR_NETWORK");
        });

        annyang.addCallback('errorPermissionBlocked', function(e) {
            showAlertPopup("ERROR_BROWSER_PERMISSION");
        });

        annyang.addCallback('errorPermissionDenied', function(e) {
            showAlertPopup("ERROR_USER_PERMISSION");
        });

    });

    $("#btn_start_pause").on("click", function(){
        $(this).prop('disabled', true);
        $("#btn_start_listen").prop('disabled', false);
        $("#btn_stop_listen").prop('disabled', false);
        annyang.pause();
    });

    $("#btn_stop_listen").on("click", function(){
        $(this).prop('disabled', true);
        $("#btn_start_listen").prop('disabled', false);
        $("#btn_start_pause").prop('disabled', true);
        annyang.abort();
    });


    $(document).keypress(function(e){
        if (e.which == 13){
            $("#btn_add_voice_text").click();
        }
    });

    function appendCommand(id, textCommand){
        if(_TextCommands != undefined)
        {
            var shtml = "";
            shtml += '<div class="one_command" data-id=' + id + '>';
            shtml += '<div class="one_command_text"><q>' + textCommand + '</q></div>';
            shtml += '<div class="one_command_del">&#10006;</div>';
            shtml += '</div>';
            $("#commands_list").append(shtml);

            $(".one_command_del").unbind();
            $(".one_command_del").on("click",function(){
                var me = this;
                _TextCommands.deleteTextCommand( $(me).parent().attr("data-id") );
                annyang.removeCommands($(me).parent().find(".one_command_text").text());
                $(this).parent().remove();
                checkIfCommandOrOutputEmpty();
            });
        }
    }

    function randomNumberIdGen(){
        if(_TextCommands != undefined)
        {
            var newId = Math.floor(Math.random() * 1000) + 1;
            _TextCommands.allTextCommands.forEach(function(oneCmd){
                if(newId == oneCmd.id)
                {
                    randomNumberIdGen();
                }
            });
            return newId;
        }
    }

    function checkIfCommandOrOutputEmpty(){

        if( $(".one_command").length > 0 )
        {
            $("#command_empty_list").addClass("hide-me");
        }
        else
        {
            $("#command_empty_list").removeClass("hide-me");
        }

        if( $(".one_output").length > 0 || $(".one_output_nomatch").length > 0)
        {
            $("#output_empty_list").addClass("hide-me");
        }
        else
        {
            $("#output_empty_list").removeClass("hide-me");
        }

    }

    function showAlertPopup(type){

        var shtml = "";

        if(type == "ERROR_BROWSER_PERMISSION")
        {
            if( !$("#alert_browser_block").length > 0 )
            {
                shtml += '<div id="alert_browser_block" class="alert_container"><b class="alert_state">ERROR</b><span class="alert_text">The browser blocks the permission request to use Speech Recognition.</span><div class="alert_dismiss"><b>Click to dismiss...</b></div></div>';
            }
        }
        else if(type == "ERROR_NETWORK")
        {
            if( !$("#alert_network").length > 0 )
            {
                shtml += '<div id="alert_network" class="alert_container"><b class="alert_state">ERROR</b><span class="alert_text">Speech Recognition fails because of a network error.</span><div class="alert_dismiss"><b>Click to dismiss...</b></div></div>';
            }
        }
        else if(type == "ERROR_USER_PERMISSION")
        {
            if( !$("#alert_user_block").length > 0 )
            {
                shtml += '<div id="alert_user_block" class="alert_container"><b class="alert_state">ERROR</b><span class="alert_text">The user blocks the permission request to use Speech Recognition.</span><div class="alert_dismiss"><b>Click to dismiss...</b></div></div>';
            }
        }
        else if(type == "ERROR_FIELD_EMPTY")
        {
            if( !$("#alert_field_empty").length > 0 )
            {
                shtml += '<div id="alert_field_empty" class="alert_container"><b class="alert_state">ERROR</b><span class="alert_text">Please type in a command.</span><div class="alert_dismiss"><b>Click to dismiss...</b></div></div>';
            }
        }

        $("#popup_alerts").append(shtml);

        
        $(".alert_container").unbind();
        $(".alert_container").on("click",function(){
            $(this).remove();
        });

    }

});