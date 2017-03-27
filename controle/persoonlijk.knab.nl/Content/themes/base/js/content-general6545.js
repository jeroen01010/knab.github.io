var BVM = BVM || {};

BVM.ContentManager = function (lightBoxContentId, hookToMoreInfoLinks, contentType, fixedLoadingElementSelector, triggerElement, triggerLightboxFunction) {
    this._cache = {};
    this._currentKey = null;
    this._lightboxContentContainerId = "#" + lightBoxContentId;
    this._fixedLoadingElementSelector = fixedLoadingElementSelector;
    this._hookToMoreInfoLinks = hookToMoreInfoLinks;
    this._contentType = contentType;
  //  this._manualLink = '';

    this._triggerElement = (triggerElement ? triggerElement : '.productInfo');
    this._triggerLightboxFunction = (triggerLightboxFunction ? triggerLightboxFunction : 'moreInfoOpen');

    this.getContent = function (contentKey) {
        _currentKey = contentKey;

        if ((contentKey == null) || (typeof (contentKey) === "undefined")) {
            return;
        }

        var content = this._getFromCache(contentKey);
        if ((content == null) || (content === "")) {
            this._showLoading(contentKey);

            var that = this;
            $.ajax({
                url: "/svc/Desktop/Content.svc/GetContent",
                context: document.body,
                data: JSON.stringify({ key: contentKey, contentType: this._contentType }),
                success: function (data, text) {
                    that.getContent_onSuccess(data.GetContentResult);
                },
                error: function (request, status, error) {
                    that.getContent_onFailed($.parseJSON(request.responseText));
                }
            });
        }
        else {
            this._renderContent(content);
        }
    };

    this.getContent_onSuccess = function (result) {
        this._storeInCache(_currentKey, result);
        this._hideLoading(_currentKey);
        this._renderContent(result);

        _currentKey = null;
    };

    this.getContent_onFailed = function (result) {
        //console.log("failed");
        this._hideLoading(_currentKey);
        _currentKey = null;
    };

    this._storeInCache = function (key, content) {
        this._cache[key] = content;
    };

    this._getFromCache = function (key) {
        if ((key == null) || (typeof (key) === "undefined")) {
            return null;
        };

        return this._cache[key];
    };

    this._renderContent = function (content) {

        $(this._lightboxContentContainerId).html(content);
        window[this._triggerLightboxFunction]();
        //moreInfoOpen();
    };

    this._showLoading = function (key) {
        if (typeof (this._fixedLoadingElementSelector) === "undefined") {
            $("#" + key).css({ display: "inline-block" });
        }
        else {

        }
    }

    this._hideLoading = function (key) {
        $("#" + key).hide();
    }

    this.onCreate = function () {
        var that = this;
        if (this._hookToMoreInfoLinks === true) {
            $(this._triggerElement).bind('click', function (e) {
                e.preventDefault();
                that.getContent($(this).attr("data-ck").replace(/\s/g, ""));
            });
        }
    };

    this.onCreate();
};