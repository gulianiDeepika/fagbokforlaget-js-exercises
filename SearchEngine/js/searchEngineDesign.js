/* 
 * searchEngineDesign v1.0
 * Copywrite 2014 , Deepika guliani , FAGBOKFORLAGET
 */
SearchEngine_interface = (function (ui_language) {

    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    function SearchEngine_interface(configuration) {

        this.ui_language = configuration.ui_language;
        this.target = configuration.target;
        this.searchEngineBuilder = configuration.searchEngineBuilder;

        this.apply_i18n = function () {
            var self = this;
            $.each($('.i18n'), function (i, el) {
                if ($(el)
                    .is("input")) {
                    var current_input_value = $(el)
                        .attr('value');
                    $(el)
                        .attr('value', self._gettext(current_input_value));
                }
                var content = $.trim($(el)
                    .text());
                if (content) {
                    $(el)
                        .text(self._gettext(content));
                }
            });
        };

        this._buildStructure = function (instance) {
            var settings = instance.settings;
            var self = this,
                searchedFields = {};
            var filter_values = settings.filter_values,
                tagShortforms = settings.tag_short_forms,
                depending_value = settings.depending_value,
                dependent_value = settings.dependent_value,
                subcategories = settings.subcategories,
                drop_down_id = settings.drop_down_id;



            /* ======================= */
            /* append base tag to head */
            /* ======================= */
            var $base = $('<base/>', {
                'href': settings.app_base_url
            });
            $('head')
                .append($base);

            var set_element_shortcuts = function () {
                return {
                    $download_button: $('.downloadButton'),
                    $left: $('.left'),
                    $right: $('.right'),
                    $go_back: $('.goback'),
                    $filter_results: $('.filter-results'),
                    $select_all_checkbox: $('#selectAllFiles'),
                    $drop_downs: $('.dropdowns'),
                    $thumbnail: $('.thumbnail'),
                    $table: $('#table_id'),
                    $table_body: $('#table_id tbody'),
                    $filenumber: $('.filenumber')
                };
            }


            var init_search = function () {
                self.element_shortcuts = set_element_shortcuts();
                self.load_dropdowns();
                self.apply_i18n();
            }

            var load_dropdowns = function () {
                var $div = $('<div/>');
                for (var prop in filter_values) {
                    $div.append(self._make_select_element(prop, filter_values[prop]));
                }
                var $search = $('<input/>', {
                    'type': 'button',
                    'class': 'i18n',
                    'value': 'Go'
                })
                    .bind('click', self._get_search_criteria);

                $div.append($search);
                self.element_shortcuts.$drop_downs.append($div);
            }

            var _get_search_criteria = function () {
                var $selects = $('#app_' + settings.app_id)
                    .find('select');
                $.each($selects, function (i, dropdown) {
                    var $dropdown = $(dropdown);
                    searchedFields[$dropdown.attr('id')] = this.options[this.selectedIndex].value.trim();
                });
                settings.searchedFields = searchedFields;
                var instance = self.searchEngineBuilder._getInstance(self.target);
                self.searchEngineBuilder._storeInstance(self.target, instance);
                self.searchEngineBuilder.filter_files(self.target);
            }

            var _make_select_element = function (label, array) {

                var _addOptionsToDropdowns = function (options) {
                    var $select = $(this);
                    $.each(options, function (i, value) {
                        value = value.trim();
                        var val = tagShortforms[value];
                        var $option = $('<option/>', {
                            'value': (val == '' ? value : val),
                            'class': 'i18n'
                        })
                            .text(value);
                        $select.append($option);
                    });
                }

                var _loadSubcategory = function () {
                    var selectedDepenedentValue = $('select#' + drop_down_id[dependent_value] + ' option:selected')
                        .text()
                        .trim();
                    $('#' + drop_down_id[depending_value])
                        .empty();
                    _addOptionsToDropdowns.call($('#' + drop_down_id[depending_value]), subcategories[selectedDepenedentValue]);

                }

                var $container = $('<div/>', {
                    'class': 'dropdown-container'
                });
                var $label = $('<label/>', {
                    'class': 'i18n'
                })
                    .css({
                        'font-weight': 'bold'
                    });
                $label.text(label);
                var $select = $('<select/>', {
                    'id': drop_down_id[label]
                });
                if (label === settings.dependent_value) {
                    $select.bind('change', _loadSubcategory);
                }
                _addOptionsToDropdowns.call($select, array);
                $container.append($label)
                    .append($select);
                return $container;
            }

            $.extend(self, {
                init_search: init_search,
                load_dropdowns: load_dropdowns,
                _make_select_element: _make_select_element,
                _get_search_criteria: _get_search_criteria
            });

            $('#app_' + settings.app_id)
                .load(settings.app_base_url + settings.html_to_be_loaded, self.init_search);

        };

        this.draw_data_table = function (target, instance) {

            var self = this;
            var element_shortcuts = self.element_shortcuts,
                $table = element_shortcuts.$table,
                $table_body = element_shortcuts.$table_body,
                $thumbnail = element_shortcuts.$thumbnail,
                $select_all_checkbox = element_shortcuts.$select_all_checkbox,
                $download_button = element_shortcuts.$download_button,
                $right = element_shortcuts.$right,
                $left = element_shortcuts.$left,
                $filter_results = element_shortcuts.$filter_results,
                $filenumber = element_shortcuts.$filenumber;
            settings = instance.settings,
            filteredFiles = settings.filteredFiles;

            /* ShowThumbnail */
            var _showThumbnail = function () {
                var $checkbox = $(this);
                $thumbnail.empty();
                $filenumber.css('display', 'none');
                if (!$checkbox.is(':checked')) {
                    $checkbox.parent()
                        .parent()
                        .removeClass('selected-file');
                    $select_all_checkbox.attr('checked', false);
                    return;
                }
                $checkbox.parent()
                    .parent()
                    .addClass('selected-file');
                var length = filteredFiles.length;
                var queueNumber = $checkbox.attr('id');
                queueNumber = parseInt(queueNumber.replace('file', '')) + 1;
                var textToShow = queueNumber + ' / ' + length;
                $filenumber.find('strong')
                    .html(textToShow);
                $filenumber.css('display', 'inline-block');
                _show_thumbnail_image($checkbox);
            }

            var _show_thumbnail_on_click = function (id) {
                var $checkbox = $('.filenames #file' + id);
                $thumbnail.empty();
                $('.filenames .overview table tbody')
                    .children()
                    .find('input:not(:checked)')
                    .parent()
                    .parent()
                    .removeClass('selected-file');
                $checkbox.parent()
                    .parent()
                    .addClass('selected-file');
                var length = filteredFiles.length;
                var textToShow = (parseInt(id + 1)) + ' / ' + length;
                $filenumber.find('strong')
                    .html(textToShow);
                _show_thumbnail_image($checkbox);
            }

            var _show_thumbnail_image = function ($checkbox) {
                var image_name = $checkbox.data('thumbnail');
                var $image = $('<img/>', {
                    'src': settings.app_base_url + 'images/thumbnails/' + image_name,
                    'class': 'thumbnail-image'
                });
                $thumbnail.append($image);
            }

            /* show Next Thumbnail */
            var _showNextThumbnail = function () {
                var success = _update_thumbnail_text('increase');
                if (!success) {
                    return;
                }
            }

            /* show Previous Thumbnail */
            var _showPreviousThumbnail = function () {
                var success = _update_thumbnail_text('decrease');
                if (!success) {
                    return;
                }
            }

            var _update_thumbnail_text = function (operation) {
                var successful_updation = true;
                var queueText = $filenumber.find('strong')
                    .text();
                var split = $filenumber.find('strong')
                    .text()
                    .split('/');
                var selected_thumbnail = split[0].trim();
                if (!operation) {
                    return;
                }
                var thumbnail_to_show = operation == 'decrease' ? (parseInt(selected_thumbnail) - 1) : (parseInt(selected_thumbnail) + 1);
                if (thumbnail_to_show < 1 || thumbnail_to_show > parseInt(split[1].trim())) {
                    successful_updation = false;
                    return successful_updation;
                }
                $filenumber.find('strong')
                    .html(thumbnail_to_show + ' / ' + split[1].trim());
                _update_scrollbar(thumbnail_to_show - 1);
                _show_thumbnail_on_click(thumbnail_to_show - 1);
                return successful_updation;
            }

            var _update_scrollbar = function (id) {
                if (id < 0) {
                    return;
                }
                var checkbox_position = $('.filenames #file' + id)
                    .parent()
                    .position()
                    .top;
                var update_scroll_bar_position = '';
                if (checkbox_position >= 170) { // hack 
                    update_scroll_bar_position = 'bottom';
                } else {
                    update_scroll_bar_position = checkbox_position;
                }
                $('.filenames')
                    .tinyscrollbar_update(update_scroll_bar_position);
            }

            /* Toggle selection of all files */
            var _toggle_selection_all_files = function () {
                var $filteredFilesCheckboxes = $('.fileCheckBox');
                if ($(this)
                    .is(':checked')) {
                    $filteredFilesCheckboxes.attr('checked', true);
                    $filteredFilesCheckboxes.parent()
                        .parent()
                        .addClass('selected-file');
                } else {
                    $filteredFilesCheckboxes.attr('checked', false);
                    $filteredFilesCheckboxes.parent()
                        .parent()
                        .removeClass('selected-file');
                }
            }

            $table_body.empty();

            $.each(filteredFiles, function (i, filteredFile) {
                var $tr = $('<tr/>', {
                    'class': 'file'
                });
                var $tdCheckbox = $('<td/>', {
                    'class': 'tdCheckBox'
                });

                var $input = $('<input/>', {
                    'type': 'checkbox',
                    'id': 'file' + i,
                    'class': 'fileCheckBox'
                })
                    .attr({
                        'data-uuid': this.uuid,
                        'data-thumbnail': this.taggedObj.thumbnail
                    })
                    .bind('click', _showThumbnail);

                $tdCheckbox.append($input);
                $tr.append($tdCheckbox);

                var $tdTitle = $('<td/>', {
                    'class': 'tdFileName'
                })
                    .text(this.name);
                var $tdHidden = $('<td/>')
                    .css('display', 'none')
                    .text(this.uuid);
                $tr.append($tdCheckbox)
                    .append($tdTitle)
                    .append($tdHidden);
                $table.append($tr);
            });

            if (filteredFiles.length > 0) {
                /* bind select all checkbox for toggling files */
                $select_all_checkbox.bind('click', _toggle_selection_all_files);
                $download_button.show();
                $filter_results.show();
                $download_button.bind('click', function () {
                    var uuid_array = [],
                        checkedCheckboxes = $('#app_' + settings.app_id)
                            .find("input[type=checkbox].fileCheckBox:checked");

                    $.each(checkedCheckboxes, function (i, e) {
                        var $checkbox = $(e);
                        uuid_array.push($checkbox.data('uuid'));
                    });
                    self.searchEngineBuilder.download_files(target, uuid_array);
                });
                var scrollbar = $('.filenames')
                    .tinyscrollbar();
                $right.bind('click', _showNextThumbnail);
                $left.bind('click', _showPreviousThumbnail);
            } else {
                $filter_results.hide();
            }
        };

        this._showError = function (message) {
            alert(this._gettext('An error occurred when loading the task.' + message));
        };

        this._gettext = function (str) {
            var self = this;

            /* Client language not set */
            var ui_language = this.ui_language;
            if (!ui_language) {
                return str;
            }

            /* Lookup table must exist */
            if (!app.messages) {
                return str;
            }

            /* Original string (msgid) must exist */
            if (!app.messages[str]) {
                return str;
            }

            /* Translation must exist */
            if (!app.messages[str][ui_language]) {
                return str;
            }

            /* Everything is ok, return translated string */
            return app.messages[str][ui_language];
        };
    }

    return SearchEngine_interface;

})();