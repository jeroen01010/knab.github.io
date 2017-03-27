/// <reference path="../../../../Scripts/jquery-ui.js" />
/// <reference path="../../../../Scripts/jquery-1.4.4-vsdoc.js" />
/// <reference path="../../../../Scripts/BVM/bvm-ui.js" />

var BVM = BVM || {};

BVM.RequestNewPasswordManager = function () {
    this.basicPage = new BVM.BasicPage();
    $.extend(true, this, this.basicPage);
    var formToValidateId = "#RequestNewPasswordForm";
    this._challengeCode = '';
    var hrefLink = $("#aGoHome").attr("href");

    this.OpenLightBox = function (userName) {
        if (userName !== null) {

            var div = document.getElementById('userNameText');
            div.innerHTML += " " + userName;
            $('#userNameText').show();
        };
        passwordChangedConfirm();
    };

    this.ShowUsername = function (userName) {
        showUsername();
        var div = document.getElementById('userNameContent');

        div.innerHTML += " " + userName;
    }

    this.onInit = function () {
        var that = this;

        this.setLightbox({
            functionTrigger: "passwordChangedConfirm",
            triggerClose: ".action-close",
            target: "#passwordChangedConfirm"
        });

        $("#passwordChangedConfirm .closeOverlay, #showUsername .closeOverlay").attr("href", hrefLink);

        this.setLightbox({
            functionTrigger: "moreInfoOpen",
            triggerClose: ".action-close",
            target: "#openOverlayAuthorizeHelp",
            callbeforeopen: function (ele, evt) {
                $('#authorizeOrdersHelp').html('');
                $('#authorizeOrdersHelp').html($('#helpText').val());
            }
        });

        this.setLightbox({
            functionTrigger: "moreInfoMemberOpen",
            triggerClose: ".action-close",
            target: "#openOverlayMemberHelp",
            callbeforeopen: function (ele, evt) {
                $('#memberPasswordHelp').html('');
                $('#memberPasswordHelp').html($('#helpTextMember').val());
            }
        });

        this.setLightbox({
            functionTrigger: "showUsername",
            triggerClose: ".action-close",
            target: "#showUsername"
        });

        $("#btnHelp").click(function (evt) {
            evt.preventDefault();
            moreInfoOpen();
        });

        $("#btnCancel").click(function (evt) {
            evt.preventDefault();
            window.location = hrefLink;
        });

        $("#bSignRequest").click(function (evt) {
            evt.preventDefault();
            var panCodes = $("#panCode input");
            var panCode = "";
            if ($(formToValidateId).valid()) {
                for (var i = 0; i < panCodes.length; i++) {
                    panCode += $(panCodes[i]).val();
                }
                var patt = /\d{16}/;
                if (panCode.search(patt) !== 0) {
                    $("input#PanCode").addClass("error");
                    $("#errorMsgFC").html($("#errorMsgFC").data("defErrorMsg")).show();
                } else {
                    that.requestNewPasswordSvcCall(panCode);
                }
            }
            else {
                return;
            }
        });

        $("#bGoHome").click(function (evt) {
            evt.preventDefault();
            window.location = hrefLink;
        });


        //$("#panCode input").keydown(function (event) {
        //    // keycode=8=>backspace;
        //    // keycode=39=>left arrow;
        //    // keycode=8=>right arrow;
        //    if ($("#panCode input").attr("maxlength") == $(this).val().length && event.keyCode !== 8 && event.keyCode !== 37 && event.keyCode !== 39) {
        //        $(this).parent().next().find("input").focus();
        //    }
        //});

        var charLimit = 4;
        $(".inputs").keydown(function (e) {

            var keys = [8, 9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 144, 145];

            if (e.which == 8 && this.value.length == 0) {
                $(this).parent().prev().find('.inputs').focus();
            } else if ($.inArray(e.which, keys) >= 0) {
                return true;
            } else if (e.shiftKey || e.which <= 47 || (e.which >= 58 && e.which < 96) || e.which > 105) {
                return false;
            }
        });
        $(".inputs").keyup(function () {
            if (this.value.length >= charLimit) {
                $(this).parent().next().find('.inputs').focus();
                //$(this).parent().next('.inputs').focus();
                return false;
            }
        });
    };

    this.onInit();

    this.requestNewPasswordSvcCall = function (panCode) {
        var self = this;
        $("#errorMsgFC, #errorMsgChallengeCodeFC").text('');
        $("#errorMsgFC, #errorMsgChallengeCodeFC").hide();
        $("input#PanCode").removeClass("error");
        this.clientRequestoptions = $('.radio-group li .cust_radio_on').next('input').attr('id');
        this.clientRequest = "";

        switch (this.clientRequestoptions) {
            case 'reset-1': this.clientRequest = 'U';
                break;
            case 'reset-2': this.clientRequest = 'P';
                break;
            case 'reset-3': this.clientRequest = 'UP'
                break;
            default: clientRequest = "";

        };
       
        var responseCode = $("#Code").val();
        var username = $("#UserName").val();
 
        if ($("#RequestNewPasswordForm").valid()) {
            $.ajax({
                url: "/svc/Desktop/Account.svc/ForgotCredentials",
                onDuplicatedCall: "abort",
                //errorMessage: "#errorMsgFC",
                loader: "#requestPasswordLoader",
                disableEnable: "#bSignRequest",
                hideShow: "#btnCancel, #btnHelp",
                context: this,
                data: { challenge: this._challengeCode, responseCode: responseCode, pan: panCode, clientRequest: this.clientRequest, channel: 'web' },
                success: function (data, text) {
                    this.requestNewPassword_onSuccess(data.ForgotCredentialsResult, self.clientRequest);
                },
                error: function (data) {
                    $("input#PanCode").addClass("error");
                    $("#errorMsgFC").html($("#errorMsgFC").data("defErrorMsg")).show();
                }
            });
        }
    };

    this.requestNewPassword_onSuccess = function (result, option) {
        if (result.ChallengeCode == null || result.ChallengeCode == '') {
            switch (option) {
                case 'U': this.ShowUsername(result.UserName);
                    break;
                case 'P': this.OpenLightBox(null);
                    break;
                case 'UP':
                    this.OpenLightBox(result.UserName);
                    break;
                default: break;
            }
        }
        else {
            $(".card_code").html($(".card_code").html().replace(this._challengeCode.toString().splitCode(), result.ChallengeCode.toString().splitCode()));
            $("#errorMsgChallengeCodeFC").html(result.ErrorMessage);
            $("#errorMsgChallengeCodeFC").show();
            this._challengeCode = result.ChallengeCode;
            $("#Code").val('');
        }
    };
};