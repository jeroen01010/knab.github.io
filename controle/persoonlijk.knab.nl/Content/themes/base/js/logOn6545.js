var BVM = BVM || {};

BVM.LogOnManager = function (_userName, _returnUrl, _isDuplicateSession) {
    var userName = _userName;
    var returnUrl = _returnUrl;
    var isDuplicateSession = false;

    if (_isDuplicateSession == 'True')
        isDuplicateSession = true;

    this.basicPage = new BVM.BasicPage();
    $.extend(true, this, this.basicPage);

    this.handleEvents = function () {
        $("#safeName").val(userName);
        $('#UserName').val(userName);
        $('#Password').val("********");
        $('#logonSubmit').hide();

        $('#okButton').click(function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            closeDoubleSessionNotificationOverlay();
            $('.loader').show();
            window.document.location = window.document.location.protocol + "//" + window.document.location.hostname;
        });
        $('#DoubleSessionNotificationOverlay').BVMoverlay({ triggerOpenFunction: 'openDoubleSessionNotificationOverlay', triggerCloseFunction: 'closeDoubleSessionNotificationOverlay', defaultClosable: false });
        openDoubleSessionNotificationOverlay();

    };

    this.getPopupContent = function (url) {
        $("#bannerPopupContent").load(url, function () {
            $("#bannerPopupLoader").hide();
        });
    }

    this.onInit = function () {
        var that = this;

        $("#btnLogOn").click(function (evt) {
            $("#errorMsg").hide();
            $("#UserName").val($("#safeName").val());
        });

        $("#safeName").bind('blur', function () {
            if ($("#Password").val() != "") {
                $("#Password").triggerHandler('blur');
            }
        });

        $('#logOnSection').css({ visibility: 'visible' }).autofocus();

        if ($("#hDisableMode").val() == 1) {
            var blockedTime = $("#hBlockedTime").val() * 60 * 1000;

            var id = window.setInterval(function () {
                window.clearInterval(id);
                $("#safeName, #Password, #btnLogOn").removeAttr("disabled").clearValidation();
            }, blockedTime);
        }

        if (isDuplicateSession) {
            this.handleEvents();
        }

        var addPar = isDuplicateSession ? '?se=1' : "";

        $.ajax({
            type: "GET",
            url: "/banners/login-pagina"+addPar,
            dataType: "html",
            success: function (msg) {
                $(".bannerBottom", msg).appendTo($("#bannerContainer"));
            }
        });

        this.setLightbox({
            callbeforeopen: function (ele, e) {
                $("#bannerPopupContent").html("");
                $("#bannerPopupLoader").show();
                that.getPopupContent($("#main_0_hlBanner").attr("href"));
            },
            functionTrigger: "openBannerPopup",
            target: "#bannerPopupOverlay"
        });

        $("#main_0_hlBanner").livequery(function () {
            $(this).bind("click", function (event) {

                var rel = $(this).attr("rel");

                if (rel != undefined && rel != null && rel == 'lightbox') {
                    event.preventDefault();
                    openBannerPopup();
                }
            });
        });
    };

    this.onInit();
};