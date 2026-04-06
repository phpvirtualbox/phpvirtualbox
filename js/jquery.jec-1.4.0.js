/**
 * jQuery jEC (jQuery Editable Combobox) 1.4.0
 *
 * Copyright (c) 2008-2012 Lukasz Rajchel
 * Licensed under the Apache license (https://www.apache.org/licenses/LICENSE-2.0.html)
 *
 * Website       :  https://github.com/RaYell/jquery-domec
 * Contributors  :  Lukasz Rajchel, Artem Orlov
 */

/*jslint indent: 4, maxlen: 120 */
/*global Math, String, jQuery*/
/*properties ':', Handle, Remove, Set, acceptedKeys, addClass, all, append, appendTo, array, attr, before, bool,
ceil, change, charCode, classes, click, css, data, destroy, disable, each, editable, enable, eq, expr, extend, filter,
find, floor, fn, focusOnNewOption, fromCharCode, get, getId, handleCursor, ignoreOptGroups, ignoredKeys, inArray, init,
initJS, integer, isArray, isPlainObject, jEC, jec, jecKill, jecOff, jecOn, jecPref, jecValue, keyCode, keyDown,
keyPress, keyRange, keyUp, keys, length, max, maxLength, min, object, on, off, optionClasses, optionStyles, parent,
parents, position, pref, prop, push, random, remove, removeAttr, removeClass, removeData, removeProp, selectedIndex,
setEditableOption, split, styles, substring, text, trigger, triggerChangeEvent, uneditable, useExistingOptions, val,
value*/
(function ($) {
    'use strict';

    $.jEC = (function () {
        var pluginClass = 'jecEditableOption',
            options = {},
            values = {},
            lastKeyCode,
            defaults,
            Validators,
            EventHandlers,
            Combobox;

        defaults = {
            position: 0,
            ignoreOptGroups: false,
            maxLength: 255,
            classes: [],
            styles: {},
            optionClasses: [],
            optionStyles: {},
            triggerChangeEvent: false,
            focusOnNewOption: false,
            useExistingOptions: false,
            ignoredKeys: [],
            acceptedKeys: [[32, 126], [191, 382]]
        };

        Validators = (function () {
            return {
                integer: function (value) {
                    return typeof value === 'number' && Math.ceil(value) === Math.floor(value);
                },

                keyRange: function (value) {
                    var min, max;
                    if ($.isPlainObject(value)) {
                        min = value.min;
                        max = value.max;
                    } else if ($.isArray(value) && value.length === 2) {
                        min = value[0];
                        max = value[1];
                    }
                    return Validators.integer(min) && Validators.integer(max) && min <= max;
                }
            };
        }());

        EventHandlers = (function () {
            var getKeyCode = function (event) {
                var charCode = event.charCode;
                if (charCode !== undefined && charCode !== 0) {
                    return charCode;
                }

                return event.keyCode;
            };

            return {
                // keydown event handler
                // handles keys pressed on select (backspace and delete must be handled
                // in keydown event in order to work in IE)
                keyDown: function (event) {
                    var keyCode = getKeyCode(event),
                        option,
                        value;

                    lastKeyCode = keyCode;

                    switch (keyCode) {
                    case 8: // backspace
                    case 46: // delete
                        option = $(this).find('option.' + pluginClass);
                        if (option.val().length >= 1) {
                            value = option.text().substring(0, option.text().length - 1);
                            option.val(value).text(value).prop('selected', true);
                        }
                        return (keyCode !== 8);
                    default:
                        break;
                    }
                },

                // keypress event handler
                // handles the rest of the keys (keypress event gives more informations
                // about pressed keys)
                keyPress: function (event) {
                    var keyCode = getKeyCode(event),
                        opt = options[Combobox.getId($(this))],
                        option,
                        value,
                        specialKeys,
                        exit = false,
                        text,
                        select;

                    if (keyCode !== 9 && keyCode !== 13 && keyCode !== 27) {
                        // special keys codes
                        specialKeys = [37, 38, 39, 40, 46];
                        // handle special keys
                        /*jslint unparam: true*/
                        $.each(specialKeys, function (i, val) {
                            if (keyCode === val && keyCode === lastKeyCode) {
                                exit = true;
                            }
                        });
                        /*jslint unparam: false*/

                        // don't handle ignored keys
                        if (!exit && $.inArray(keyCode, opt.ignoredKeys) === -1) {
                            // remove selection from all options
                            $(this).find('option:selected').removeProp('selected');

                            if ($.inArray(keyCode, opt.acceptedKeys) !== -1) {
                                option = $(this).find('option.' + pluginClass);
                                text = option.text();

                                if (text.length < opt.maxLength) {
                                    value = text + String.fromCharCode(getKeyCode(event));
                                    option.val(value).text(value);
                                }

                                select = option.parents('select');
                                select.get(0).selectedIndex = opt.position;
                            }
                        }

                        return false;
                    }
                },

                keyUp: function () {
                    var opt = options[Combobox.getId($(this))];
                    if (opt.triggerChangeEvent) {
                        $(this).trigger('change');
                    }
                },

                // change event handler
                // handles editable option changing based on a pre-existing values
                change: function () {
                    var opt = options[Combobox.getId($(this))];
                    if (opt.useExistingOptions) {
                        Combobox.setEditableOption($(this));
                    }
                }
            };
        }());

        // Combobox
        Combobox = (function () {
            var Parameters, EditableOption, generateId, setup;

            // validates and set combobox parameters
            Parameters = (function () {
                var Set, Remove, Handle;

                Set = (function () {
                    var parseKeys, Handles;

                    parseKeys = function (value) {
                        var keys = [];
                        if ($.isArray(value)) {
                            /*jslint unparam: true*/
                            $.each(value, function (i, val) {
                                var j, min, max;
                                if (Validators.keyRange(val)) {
                                    if ($.isArray(val)) {
                                        min = val[0];
                                        max = val[1];
                                    } else {
                                        min = val.min;
                                        max = val.max;
                                    }
                                    for (j = min; j <= max; j += 1) {
                                        keys.push(j);
                                    }
                                } else if (typeof val === 'number' && Validators.integer(val)) {
                                    keys.push(val);
                                }
                            });
                            /*jslint unparam: false*/
                        }
                        return keys;
                    };

                    Handles = (function () {
                        return {
                            integer: function (elem, name, value) {
                                var id = Combobox.getId(elem),
                                    opt = options[id];
                                if (opt !== undefined && Validators.integer(value) && value >= 0) {
                                    opt[name] = value;
                                    return true;
                                }
                                return false;
                            },
                            bool: function (elem, name, value) {
                                var id = Combobox.getId(elem),
                                    opt = options[id];
                                if (opt !== undefined && typeof value === 'boolean') {
                                    opt[name] = value;
                                    return true;
                                }
                                return false;
                            },
                            array: function (elem, name, value) {
                                if (typeof value === 'string') {
                                    value = value.split(/\s+/);
                                }
                                var id = Combobox.getId(elem),
                                    opt = options[id];
                                if (opt !== undefined && $.isArray(value)) {
                                    opt[name] = value;
                                    return true;
                                }
                                return false;
                            },
                            object: function (elem, name, value) {
                                var id = Combobox.getId(elem),
                                    opt = options[id];
                                if (opt !== undefined && value !== null && $.isPlainObject(value)) {
                                    opt[name] = value;
                                }
                            },
                            keys: function (elem, name, value) {
                                var id = Combobox.getId(elem),
                                    opt = options[id];
                                if (opt !== undefined && $.isArray(value)) {
                                    opt[name] = parseKeys(value);
                                }
                            }
                        };
                    }());

                    return {
                        position: function (elem, value) {
                            if (Handles.integer(elem, 'position', value)) {
                                var id = Combobox.getId(elem),
                                    opt = options[id],
                                    optionsCount = elem.find('option:not(.' + pluginClass + ')').length;
                                if (value > optionsCount) {
                                    opt.position = optionsCount;
                                }
                            }
                        },

                        ignoreOptGroups: function (elem, value) {
                            Handles.bool(elem, 'ignoreOptGroups', value);
                        },

                        maxLength: function (elem, value) {
                            if (Handles.integer(elem, 'maxLength', value)) {
                                var id = Combobox.getId(elem),
                                    opt = options[id];
                                if (value < 0 || value > 255) {
                                    opt.maxLength = 255;
                                }
                            }
                        },

                        classes: function (elem, value) {
                            Handles.array(elem, 'classes', value);
                        },

                        optionClasses: function (elem, value) {
                            Handles.array(elem, 'optionClasses', value);
                        },

                        styles: function (elem, value) {
                            Handles.object(elem, 'styles', value);
                        },

                        optionStyles: function (elem, value) {
                            Handles.object(elem, 'optionStyles', value);
                        },

                        triggerChangeEvent: function (elem, value) {
                            Handles.bool(elem, 'triggerChangeEvent', value);
                        },

                        focusOnNewOption: function (elem, value) {
                            Handles.bool(elem, 'focusOnNewOption', value);
                        },

                        useExistingOptions: function (elem, value) {
                            Handles.bool(elem, 'useExistingOptions', value);
                        },

                        ignoredKeys: function (elem, value) {
                            Handles.keys(elem, 'ignoredKeys', value);
                        },

                        acceptedKeys: function (elem, value) {
                            Handles.keys(elem, 'acceptedKeys', value);
                        }
                    };
                }());
                Remove = (function () {
                    var removeClasses, removeStyles;

                    removeClasses = function (elem, classes) {
                        /*jslint unparam: true*/
                        $.each(classes, function (i, val) {
                            elem.removeClass(val);
                        });
                        /*jslint unparam: false*/
                    };

                    removeStyles = function (elem, styles) {
                        $.each(styles, function (key) {
                            elem.css(key, '');
                        });
                    };

                    return {
                        classes: function (elem) {
                            var id = Combobox.getId(elem),
                                opt = options[id];
                            if (opt !== undefined) {
                                removeClasses(elem, opt.classes);
                            }
                        },

                        optionClasses: function (elem) {
                            var id = Combobox.getId(elem),
                                opt = options[id];
                            if (opt !== undefined) {
                                removeClasses(elem.find('option.' + pluginClass),
                                    opt.optionClasses);
                            }
                        },

                        styles: function (elem) {
                            var id = Combobox.getId(elem),
                                opt = options[id];
                            if (opt !== undefined) {
                                removeStyles(elem, opt.styles);
                            }
                        },

                        optionStyles: function (elem) {
                            var id = Combobox.getId(elem),
                                opt = options[id];
                            if (opt !== undefined) {
                                removeStyles(elem.find('option.' + pluginClass),
                                    opt.optionStyles);
                            }
                        },

                        all: function (elem) {
                            Remove.classes(elem);
                            Remove.optionClasses(elem);
                            Remove.styles(elem);
                            Remove.optionStyles(elem);
                        }
                    };
                }());
                Handle = (function () {
                    var setClasses, setStyles;

                    setClasses = function (elem, classes) {
                        /*jslint unparam: true*/
                        $.each(classes, function (i, val) {
                            elem.addClass(String(val));
                        });
                        /*jslint unparam: false*/
                    };

                    setStyles = function (elem, styles) {
                        $.each(styles, function (key, val) {
                            elem.css(key, val);
                        });
                    };

                    return {
                        position: function (elem) {
                            var opt = options[Combobox.getId(elem)],
                                option,
                                uneditableOptions,
                                container;
                            option = elem.find('option.' + pluginClass);

                            uneditableOptions = elem.find('option:not(.' + pluginClass + ')');
                            if (opt.position < uneditableOptions.length) {
                                container = uneditableOptions.eq(opt.position);

                                if (!opt.ignoreOptGroups && container.parent('optgroup').length > 0) {
                                    uneditableOptions.eq(opt.position).parent().before(option);
                                } else {
                                    uneditableOptions.eq(opt.position).before(option);
                                }
                            } else {
                                elem.append(option);
                            }
                        },

                        maxLength: function (elem) {
                            var opt = options[Combobox.getId(elem)],
                                option = elem.find('option.' + pluginClass),
                                val = option.text().substring(0, opt.maxLength);
                            option.text(val).val(val);
                        },

                        classes: function (elem) {
                            var id = Combobox.getId(elem),
                                opt = options[id];
                            if (opt !== undefined) {
                                setClasses(elem, opt.classes);
                            }
                        },

                        optionClasses: function (elem) {
                            var id = Combobox.getId(elem),
                                opt = options[id];
                            if (opt !== undefined) {
                                setClasses(elem.find('option.' + pluginClass), opt.optionClasses);
                            }
                        },

                        styles: function (elem) {
                            var id = Combobox.getId(elem),
                                opt = options[id];
                            if (opt !== undefined) {
                                setStyles(elem, opt.styles);
                            }
                        },

                        optionStyles: function (elem) {
                            var id = Combobox.getId(elem),
                                opt = options[id];
                            if (opt !== undefined) {
                                setStyles(elem.find('option.' + pluginClass), opt.optionStyles);
                            }
                        },

                        focusOnNewOption: function (elem) {
                            var id = Combobox.getId(elem),
                                opt = options[id];
                            if (opt !== undefined && opt.focusOnNewOption) {
                                elem.find(':not(option.' + pluginClass + ')').removeProp('selected');
                                elem.find('option.' + pluginClass).prop('selected', true);
                            } else if (opt !== undefined) {
                                elem.find('option.' + pluginClass).removeProp('selected');
                                if (elem.val() === '') {
                                    elem.find('option:not(.' + pluginClass + '):first').prop('selected', true);
                                }
                            }
                        },

                        useExistingOptions: function (elem) {
                            var id = Combobox.getId(elem),
                                opt = options[id];
                            if (opt !== undefined && opt.useExistingOptions) {
                                Combobox.setEditableOption(elem);
                            }
                        },

                        all: function (elem) {
                            Handle.position(elem);
                            Handle.classes(elem);
                            Handle.optionClasses(elem);
                            Handle.styles(elem);
                            Handle.optionStyles(elem);
                            Handle.focusOnNewOption(elem);
                            Handle.useExistingOptions(elem);
                        }
                    };
                }());

                return {
                    Set: Set,
                    Remove: Remove,
                    Handle: Handle
                };
            }());

            EditableOption = (function () {
                return {
                    init: function (elem) {
                        if (!elem.find('option.' + pluginClass).length) {
                            var editableOption = $('<option>');
                            editableOption.addClass(pluginClass);
                            elem.append(editableOption);
                        }

                        elem.on('keydown', EventHandlers.keyDown);
                        elem.on('keypress', EventHandlers.keyPress);
                        elem.on('keyup', EventHandlers.keyUp);
                        elem.on('change', EventHandlers.change);
                        elem.on('click', EventHandlers.click);
                    },

                    destroy: function (elem) {
                        elem.find('option.' + pluginClass).remove();

                        elem.off('keydown', EventHandlers.keyDown);
                        elem.off('keypress', EventHandlers.keyPress);
                        elem.off('keyup', EventHandlers.keyUp);
                        elem.off('change', EventHandlers.change);
                        elem.off('click', EventHandlers.click);
                    }
                };
            }());

            // generates unique identifier
            generateId = function () {
                var random;
                while (true) {
                    random = Math.floor(Math.random() * 100000);

                    if (options[random] === undefined) {
                        return random;
                    }
                }
            };

            // sets combobox
            setup = function (elem) {
                EditableOption.init(elem);
                Parameters.Handle.all(elem);
            };

            // Combobox public members
            return {
                // create editable combobox
                init: function (settings) {
                    return $(this).filter(':uneditable').each(function () {
                        var id = generateId(),
                            elem = $(this);

                        elem.data('jecId', id);
                        elem.data('jecActive', true);

                        // override passed default options
                        options[id] = $.extend(true, {}, defaults);

                        // parse keys
                        Parameters.Set.ignoredKeys(elem, options[id].ignoredKeys);
                        Parameters.Set.acceptedKeys(elem, options[id].acceptedKeys);

                        if ($.isPlainObject(settings)) {
                            $.each(settings, function (key, val) {
                                if (val !== undefined) {
                                    switch (key) {
                                    case 'position':
                                        Parameters.Set.position(elem, val);
                                        break;
                                    case 'ignoreOptGroups':
                                        Parameters.Set.ignoreOptGroups(elem, val);
                                        break;
                                    case 'maxLength':
                                        Parameters.Set.maxLength(elem, val);
                                        break;
                                    case 'classes':
                                        Parameters.Set.classes(elem, val);
                                        break;
                                    case 'optionClasses':
                                        Parameters.Set.optionClasses(elem, val);
                                        break;
                                    case 'styles':
                                        Parameters.Set.styles(elem, val);
                                        break;
                                    case 'optionStyles':
                                        Parameters.Set.optionStyles(elem, val);
                                        break;
                                    case 'triggerChangeEvent':
                                        Parameters.Set.triggerChangeEvent(elem, val);
                                        break;
                                    case 'focusOnNewOption':
                                        Parameters.Set.focusOnNewOption(elem, val);
                                        break;
                                    case 'useExistingOptions':
                                        Parameters.Set.useExistingOptions(elem, val);
                                        break;
                                    case 'ignoredKeys':
                                        Parameters.Set.ignoredKeys(elem, val);
                                        break;
                                    case 'acceptedKeys':
                                        Parameters.Set.acceptedKeys(elem, val);
                                        break;
                                    }
                                }
                            });
                        }

                        setup($(this));
                    });
                },

                // creates editable combobox without using existing select elements
                initJS: function (options, settings) {
                    var select = $('<select>'),
                        addOptions = function (elem, options) {
                            if ($.isArray(options)) {
                                /*jslint unparam: true*/
                                $.each(options, function (i, val) {
                                    if ($.isPlainObject(val)) {
                                        $.each(val, function (key, value) {
                                            if ($.isArray(value)) {
                                                var og = $('<optgroup>').attr('label', key);
                                                addOptions(og, value);
                                                og.appendTo(select);
                                            } else if (typeof value === 'number' || typeof value === 'string') {
                                                $('<option>').text(value).attr('value', key)
                                                    .appendTo(elem);
                                            }
                                        });
                                    } else if (typeof val === 'string' || typeof val === 'number') {
                                        $('<option>').text(val).attr('value', val).appendTo(elem);
                                    }
                                });
                                /*jslint unparam: false*/
                                elem.find('option:first').prop('selected');
                            }
                        };

                    addOptions(select, options);

                    return select.jec(settings);
                },

                // destroys editable combobox
                destroy: function () {
                    return $(this).filter(':editable').each(function () {
                        $(this).jecOff();
                        $.removeData($(this).get(0), 'jecId');
                        $.removeData($(this).get(0), 'jecActive');
                    });
                },

                // enable editablecombobox
                enable: function () {
                    return $(this).filter(':editable').each(function () {
                        if (!$(this).data('jecActive')) {
                            var id = Combobox.getId($(this)),
                                value = values[id];
                            $(this).data('jecActive', true);

                            setup($(this));

                            if (value !== undefined) {
                                $(this).jecValue(value);
                            }
                        }
                    });
                },

                // disable editable combobox
                disable: function () {
                    return $(this).filter(':editable').each(function () {
                        if ($(this).data('jecActive')) {
                            var val = $(this).find('option.' + pluginClass).val();
                            values[Combobox.getId($(this))] = val;
                            Parameters.Remove.all($(this));
                            EditableOption.destroy($(this));
                            $(this).data('jecActive', false);
                        }
                    });
                },

                // gets or sets editable option's value
                value: function (value, setFocus) {
                    if ($(this).filter(':editable').length > 0) {
                        if (value === null || value === undefined) {
                            // get value
                            return $(this).find('option.' + pluginClass).val();
                        }
                        if (typeof value === 'string' || typeof value === 'number') {
                            // set value
                            return $(this).filter(':editable').each(function () {
                                var option = $(this).find('option.' + pluginClass);
                                option.val(value).text(value);
                                if (typeof setFocus !== 'boolean' || setFocus) {
                                    option.prop('selected', true);
                                }
                            });
                        }
                    }
                },

                // gets or sets editable option's preference
                pref: function (name, value) {
                    if ($(this).filter(':editable').length > 0) {
                        if (typeof name === 'string') {
                            if (value === null || value === undefined) {
                                // get preference
                                return options[Combobox.getId($(this))][name];
                            }

                            // set preference
                            return $(this).filter(':editable').each(function () {
                                switch (name) {
                                case 'position':
                                    Parameters.Set.position($(this), value);
                                    Parameters.Handle.position($(this));
                                    break;
                                case 'maxLength':
                                    Parameters.Set.maxLength($(this), value);
                                    Parameters.Handle.maxLength($(this));
                                    break;
                                case 'classes':
                                    Parameters.Remove.classes($(this));
                                    Parameters.Set.classes($(this), value);
                                    Parameters.Handle.position($(this));
                                    break;
                                case 'optionClasses':
                                    Parameters.Remove.optionClasses($(this));
                                    Parameters.Set.optionClasses($(this), value);
                                    Parameters.Set.optionClasses($(this));
                                    break;
                                case 'styles':
                                    Parameters.Remove.styles($(this));
                                    Parameters.Set.styles($(this), value);
                                    Parameters.Set.styles($(this));
                                    break;
                                case 'optionStyles':
                                    Parameters.Remove.optionStyles($(this));
                                    Parameters.Set.optionStyles($(this), value);
                                    Parameters.Handle.optionStyles($(this));
                                    break;
                                case 'focusOnNewOption':
                                    Parameters.Set.focusOnNewOption($(this), value);
                                    Parameters.Handle.focusOnNewOption($(this));
                                    break;
                                case 'useExistingOptions':
                                    Parameters.Set.useExistingOptions($(this), value);
                                    Parameters.Handle.useExistingOptions($(this));
                                    break;
                                case 'ignoredKeys':
                                    Parameters.Set.ignoredKeys($(this), value);
                                    break;
                                case 'acceptedKeys':
                                    Parameters.Set.acceptedKeys($(this), value);
                                    break;
                                }
                            });
                        }
                    }
                },

                // sets editable option to the value of currently selected option
                setEditableOption: function (elem) {
                    var value = elem.find('option:selected').text();
                    elem.find('option.' + pluginClass).attr('value', elem.val()).text(value).prop('selected', true);
                },

                // get combobox id
                getId: function (elem) {
                    return elem.data('jecId');
                }
            };
        }());

        // jEC public members
        return {
            init: Combobox.init,
            enable: Combobox.enable,
            disable: Combobox.disable,
            destroy: Combobox.destroy,
            value: Combobox.value,
            pref: Combobox.pref,
            initJS: Combobox.initJS,
            handleCursor: Combobox.handleCursor
        };
    }());

    // register functions
    $.fn.extend({
        jec: $.jEC.init,
        jecOn: $.jEC.enable,
        jecOff: $.jEC.disable,
        jecKill: $.jEC.destroy,
        jecValue: $.jEC.value,
        jecPref: $.jEC.pref
    });

    $.extend({
        jec: $.jEC.initJS
    });

    // register selectors
    $.extend($.expr.pseudos, {
        editable: function (a) {
            var data = $(a).data('jecId');
            return data !== null && data !== undefined;
        },

        uneditable: function (a) {
            var data = $(a).data('jecId');
            return data === null || data === undefined;
        }
    });

}(jQuery));