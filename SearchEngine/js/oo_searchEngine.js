/* 
 * $.searchEngine v1.0
 * Copywrite 2014 , deepika guliani , FAGBOKFORLAGET
 */
;
(function ($) {
    var className = 'searchEngine';

    /* ======================================== */
    /* Added trim function to the string object */
    /* ======================================== */
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        }
    }

    function searchEngineBuilder() {
        if (typeof (SearchEngine_interface) != 'function') {
            /* TODO -- add translation to this */
            alert('Missing Search Engine Design Interface');
            return;
        }
        if (typeof (PF_interface) != 'function') {
            /* TODO -- add translation to this */
            alert('Missing portfolio manager');
            return;
        }

        /* ======================================== */
        /* set the defaults for this builder */
        /* ======================================== */
        this._defaults = {
            version: 0.01,
            dev: 1,
            pf_input_object: ''
        };

    }

    $.extend(searchEngineBuilder.prototype, {

        _init: function (target, settings) {
            var self = this;
            if (this._getInstance(target)) {
                return false;
            }
            var $target = $(target);
            $target.attr('id', 'app_' + settings.app_id);

            settings.container = $target;

            /* Import SearchEngine_interface Library */
            settings.design = new SearchEngine_interface({
                ui_language: settings.ui_language,
                target: $target,
                searchEngineBuilder: self
            });

            /* Import PF_manager Library */
            settings.pf = new PF_interface({
                ui_langauge: settings.ui_language,
                target: $target
            });

            settings.pf.read_input(settings, function (uuid) {
                settings.pf_input_object = uuid;
                var instance = self._newInstance($target);

                $.extend(instance.settings, self._defaults, settings);

                self._storeInstance(target, instance);
                self._settings = instance.settings;

                if (typeof (instance.settings.onInit) == 'function') {
                    instance.settings.onInit(instance);
                }
                self._setInputParameters(instance);

            });

        },

        _setInputParameters: function (instance) {
            var settings = instance.settings;
            var target = instance.container;
            var self = this;

            var filter_values = {},
                subcategories = {},
                drop_down_id = {},
                files = [],
                tag_short_forms = {},
                dependent_value = '',
                depending_value = '',
                files_container = '',
                html_to_be_loaded = '',
                css_to_be_loaded = '';


            var setParameters = function (content) {

                var content_text_split = content.split(/\n{2,}/g);
                if (content_text_split.length !== 2) { /* two blocks of input content */
                    var message = settings.design._gettext('Invalid input content no 2 blocks of content');
                    settings.design._showError(message);
                    return;
                }
                var filter_content = content_text_split[0].split("\n");
                var design_values = content_text_split[1].split("\n");

                if (filter_content.length !== 4) {
                    var message = settings.design._gettext('Invalid input content filtercontent !== 4');
                    settings.design._showError(message);
                    return;
                }

                $.each(filter_content, function (i, line) {
                    var lineSplit = line.split(';');
                    if (lineSplit.length !== 2) {
                        var message = settings.design._gettext('Invalid input content lineSplit !== 2');
                        settings.design._showError(message);
                        return;
                    }

                    var label = lineSplit[0];

                    if (label.indexOf('$') !== -1) {
                        label = label.split('$');
                        var values = (lineSplit[1])
                            .split("*");
                        if (label.length !== 2) {
                            var message = settings.design._gettext('Invalid input content label.length !== 2');
                            settings.design._showError(message);
                            return;
                        }
                        label[0] = label[0].trim();
                        filter_values[label[0]] = [];
                        dependent_value = label[1].trim();
                        depending_value = label[0];
                        filter_values[label[0]]['depends'] = label[1].trim();
                        $.each(values, function (i, val) {
                            val = val.split('#');
                            if (val.length !== 2) {
                                var message = settings.design._gettext('Invalid input content val.length !== 2');
                                settings.design._showError(message);
                                return;
                            }
                            filter_values[label[0]].push('All');
                            val[0] = val[0].trim();
                            subcategories[val[0]] = val[1].split(',');
                        });
                    } else {
                        var drop_down_values = lineSplit[1].split(',');
                        filter_values['' + label] = drop_down_values;
                    }
                });

                var drop_down_id_array = ((design_values[0].split(";"))[1])
                    .split(',');
                $.each(drop_down_id_array, function (i, id) {
                    id = id.split('#');
                    if (id.length !== 2) {
                        var message = settings.design._gettext('Invalid input content');
                        settings.design._showError(message);
                        return;
                    }
                    id[0] = id[0].trim();
                    drop_down_id[id[0]] = id[1].trim();
                });

                files_container = (design_values[1].split(";"))[1];

                var tag_short_forms_array = ((design_values[2].split(";"))[1])
                    .split(',');
                $.each(tag_short_forms_array, function (i, short_form) {
                    short_form = short_form.split('#');
                    short_form[0] = short_form[0].trim();
                    tag_short_forms[short_form[0]] = (short_form[1])
                        .trim();
                });

                html_to_be_loaded = ((design_values[3].split(";"))[1])
                    .split("#")[0].trim();
                css_to_be_loaded = ((design_values[3].split(";"))[1])
                    .split("#")[1].trim();

                self._readFiles(files_container, target);

                $.extend(settings, {
                    filter_values: filter_values,
                    subcategories: subcategories,
                    drop_down_id: drop_down_id,
                    //files        : files ,
                    dependent_value: dependent_value,
                    depending_value: depending_value,
                    FILES_CONTAINER: files_container,
                    tag_short_forms: tag_short_forms,
                    html_to_be_loaded: html_to_be_loaded,
                    css_to_be_loaded: css_to_be_loaded
                });

                self._storeInstance(target, instance);
                settings.design._buildStructure(instance);

            }

            self._show_loading_indicator(target, settings.design._gettext('Preparing search Engine'));

            settings.pf.read(settings.pf_input_object, 'read_container', settings, setParameters);

        },

        /* ======================================================= */
        /* common functions for searching irrespctive of the design */
        /* ======================================================== */
        _readFiles: function (files_container, target) {

            var self = this;
            var files = [],
                instance = self._getInstance(target),
                settings = instance.settings;

            var _readFilesAsyncComplete = function (response) {
                var $xml = $(response);
                var $objects = $xml.find('object');
                $.each($objects, function (i, object) {
                    var $object = $(object);
                    var customInit = $object.attr('custom_init');
                    var title = $object.find('title')
                        .text();
                    var file = {};
                    file["uuid"] = $object.attr('id');
                    file["name"] = title;
                    if (customInit.length > 0) {
                        file["taggedObj"] = _parseCustomInit(customInit);
                        files.push(file);
                    }
                });

                settings.files = files;
                self._storeInstance(target, instance);
                return files;
            }

            var _parseCustomInit = function (customInit) {
                var tags = customInit.split("|");
                var taggedObj = {};
                $.each(tags, function (i, tag) {
                    tag = tag.replace("mo_", "");
                    // check if = exists or not
                    var name = tag.substr(0, tag.indexOf("="));
                    // check if value exists or not
                    taggedObj[name] = tag.substr(tag.indexOf("=") + 1);
                });
                return taggedObj;
            }

            $.ajax({
                type: "GET",
                url: self._getUrl('readxml', files_container, target),
                context: this,
                success: _readFilesAsyncComplete,
                error: function (jqXHR, textStatus, errorThrow) {
                    settings.design._showError(textStatus);
                }
            });

        },

        filter_files: function (target) {

            var self = this;
            var instance = self._getInstance(target),
                settings = instance.settings,
                dropDownId = settings.drop_down_id,
                files = settings.files;

            /* check if the file has all the tags */
            var _fileHasAllTheTags = function (taggedProperties) {
                var hasAllTags = true;
                for (var key in dropDownId) {
                    var tagValue = dropDownId[key];
                    if (!taggedProperties[tagValue]) {
                        hasAllTags = false;
                    }
                }
                return hasAllTags;
            }

            /* check if the file matches the filter criteria */
            var _matchesFilterCriteria = function () {
                var searchedFields = settings.searchedFields;
                var isFiltered = true;
                for (var field in searchedFields) {
                    if (searchedFields[field] === "all" || searchedFields[field] === "All") {
                        return true;
                    }
                    if (!(this[field] == searchedFields[field])) {
                        isFiltered = false;
                        return;
                    }
                }
                return isFiltered;
            }


            var filteredFiles = [];

            $.each(files, function (i, file) {
                var taggedProperties = file["taggedObj"];
                if (_fileHasAllTheTags(taggedProperties)) {
                    if (_matchesFilterCriteria.call(taggedProperties)) {
                        filteredFiles.push(file);
                    }
                }
            });
            settings.filteredFiles = filteredFiles;
            self._storeInstance(target, instance);

            settings.design.draw_data_table(target, instance);

        },

        download_files: function (target, uuid_array) {

            var self = this,
                instance = self._getInstance(target),
                settings = instance.settings;

            var generate_anchors = function (uuid) {
                $('#app_' + settings.app_id)
                    .append($('<iframe/>', {
                            'src': self._getUrl('download', uuid, target)
                        })
                        .hide());
            }
            var i = 0;
            while (i < uuid_array.length) {
                generate_anchors(uuid_array[i]);
                i++;
            }

        },

        _getUrl: function (type, container_id, target) {
            var self = this;
            var instance = self._getInstance(target);
            var url = instance.settings.base_url;
            switch (type) {
            case 'readxml':
                url += "xml/read_container/" + container_id;
                break;
            case 'download':
                url += "download/" + container_id;
                break;
            }
            return url;
        },

        /* ======================================== */
        /* OOPS function */
        /* ======================================== */

        _getInstance: function (target) {
            return $(target)
                .data(className);
        },

        _storeInstance: function (target, instance) {
            return $(target)
                .data(className, instance);
        },

        _newInstance: function (target) {
            return {
                id: $(target)
                    .attr('id'),
                container: target,
                self: this,
                settings: {}
            };
        },

        /* ======================================== */
        /* show and hide loading indicators , common to all  */
        /* ======================================== */

        _show_loading_indicator: function (target, msg) {
            var self = this,
                instance = self._getInstance(target),
                settings = instance.settings;

            if (typeof (instance) == undefined) {
                return;
            }

            self._hide_loading_indicator(target);

            $(target)
                .addClass('loading');
            var $message = '';
            if (msg) {
                $message = $('<span/>', {
                    'css': {
                        'top': '40%',
                        'position': 'relative',
                        'font-size': '15px',
                        'color': '#A52A2A'
                    }
                })
                    .html(msg);
            }

            $(target)
                .append($('<div/>', {
                        'class': 'loading-modal',
                        'css': {
                            'position': 'fixed',
                            'z-index': 1000,
                            'top': 0,
                            'left': 0,
                            'height': '100%',
                            'width': '100%',
                            'text-align': 'center',
                            'background': 'rgba(255, 255, 255, 0.6) url(' + settings.app_base_url + 'images/appImages/ajax-loader.gif) no-repeat 50% 17%'
                        }
                    })
                    .append($message));
        },

        _hide_loading_indicator: function (target) {
            return;
            $(target)
                .removeClass('loading');
            $(target)
                .find('.loading-modal')
                .remove();
        }
    });

    $.fn.searchEngine = function (settings) {
        var otherArgs = Array.prototype.slice.call(arguments, 1);
        return typeof settings == 'string' ? $.searchEngine[settings].apply($.searchEngine, [this].concat(otherArgs)) : $.searchEngine._init(this, settings);
    }

    $.searchEngine = new searchEngineBuilder();


})(jQuery);