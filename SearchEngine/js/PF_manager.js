/*
 * PF interfacde
 * Copyright 2014, Deepika Guliani , FAGBOKFORLAGET
 */
PF_interface = (function (ui_language) {

    function PF_interface(configuration) {

        this.ui_language = configuration.ui_language;
        this.target = configuration.target;

        this._getUrl = function (settings, type) {
            var urls = {
                'input': "xml/read/" + settings.app_input_id,
                'readsettings': "xml/read_config/"
            };
            return settings.site_url + urls[type];
        };

        this._beautifyContent = function (content) {
            content = content.replace(/\r\n/g, '\n');
            content = content.replace(/ +/g, ' ');
            content = content.replace(/ *\\ */g, '\\');
            content = content.replace(/# /g, '#');
            content = content.replace(/\* /g, '*');
            content = content.replace(/\[ /g, '[');
            content = content.replace(/ \]/g, ']');
            content = content.replace(/[ \t]*\n[ \t]*/g, '\n');
            content = content.trim();
            return content;
        };

        this.read_input = function (settings, callback) {
            var self = this;
            var default_error_msg = "An error occurred when loading the app settings.";
            $.ajax({
                type: "GET",
                url: self._getUrl(settings, 'input'),
                dataType: "xml",
                context: this,
                success: function (xml) {
                    var $xml = $(xml),
                        $response = $xml.find("response"),
                        code = $response.attr("code"),
                        status = $response.attr("status"),
                        $object = $xml.find("object"),
                        custom_init = $object.attr("custom_init"),
                        content = $xml.find("content"),
                        content = $(content[0])
                            .text(),
                        content = self._beautifyContent(content);

                    if (code && code == 200) {
                        callback(content);
                    } else {
                        alert(status);
                        return;
                    }
                },
                error: function () {
                    alert(default_error_msg);
                }
            });
        };

        this.read = function (url, type, settings, callback) {
            var self = this;
            var baseUrl = self.site_url;
            var default_error_msg = "An error occurred when loading the app object.";
            $.ajax({
                type: "GET",
                url: self._getUrl(settings, 'input'),
                dataType: "xml",
                context: this,
                success: function (xml) {
                    var $xml = $(xml),
                        $response = $xml.find("response"),
                        code = $response.attr("code"),
                        status = $response.attr("status"),
                        $object = $xml.find("object"),
                        custom_init = $object.attr("custom_init"),
                        content = $xml.find("content"),
                        content = $(content[0])
                            .text(),
                        content = self._beautifyContent(content);

                    if (code && code == 200) {
                        callback(content);
                    } else {
                        alert(status);
                        if (callback) {
                            callback();
                        }
                    }
                },
                error: function () {
                    alert(default_error_msg);
                    if (callback) {
                        callback();
                    }
                }
            });
        };

    }

    return PF_interface;

})();