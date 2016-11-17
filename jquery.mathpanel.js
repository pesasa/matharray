/**
 * Mathpanel (jquery.mathpanel.js)
 * A math symbol panel form MathQuill
 * Uses:
 * - MathQuill (http://mathquill.com) for math
 * - jQuery (http://jquery.com/)
 *
 * Petri Salmela <pesasa@iki.fi>
 * 16.11.2016
 */

(function(window, $) {
    
    var PLUGIN_NAME = 'mqmathpanel';
    window.MQMathPanel = {};
    var MQ = MathQuill.getInterface(2);
    
    var MathPanel = function(place, options) {
        if ($('#mqmathpanel').length === 0) {
            this.place = $(place);
            options = $.extend(true, {}, this.defaults, options);
            this.configs = options.configs;
            this.categories = options.categories;
            this.setStyles();
            this.setAttrs();
            this.mqdata = window.MQMathPanel;
            this.initHandlers();
            this.show();
        }
    }
    
    MathPanel.prototype.setAttrs = function() {
        this.place.addClass('mqmathpanel').attr('id', 'mqmathpanel');
    }
    
    MathPanel.prototype.setStyles = function() {
        if ($('head style#mqmathpanelstyles').length === 0) {
            $('head').append('<style type="text/css" id="mqmathpanelstyles">\n'+this.styles+'\n</style>')
        }
    }
    
    MathPanel.prototype.show = function() {
        this.symbolmap = {};
        var inputs = [];
        var tabshtml = ['<ul class="mqmathpanel-tablist">'];
        var palettes = ['<div class="mqmathpanel-palette-wrapper">'];
        var category, button, counter = 0;
        for (let key in this.categories) {
            category = this.categories[key]
            this.symbolmap[category.name] = {};
            inputs.push('<input type="radio" class="mqmathpanel-tabselector mqmathpanel-tabselector-'+counter+'" id="mqmathpanel-categorytab-' + category.name + '" name="mqmathpanel-tabselector" '+(counter === 0 ? 'checked="checked"' : '')+'>');
            tabshtml.push([
                '<li class="mqmathpanel-tabitem mqmathpanel-tabitem-'+counter+'" data-category="'+category.name+'" style="order: '+category.weight+';">',
                '<label for="mqmathpanel-categorytab-'+ category.name +'" title="'+category.name+'">',
                '<span class="mqmathpanel-categorybutton">'+ category.icon +'</span>',
                '</label>',
                '</li>'
            ].join(''));
            //palettes.push('<input type="radio" '+(counter === 0 ? 'checked="checked"' : '')+' class="mqmathpanel-selector" id="mqmathpanel-categoryid-' + category.name + '" name="mqmathpanel-selector">');
            palettes.push('<ul class="mqmathpanel-categoryset mqmathpanel-categoryset-'+counter+'" data-category="'+category.name+'">');
            for (let i = 0, len = category.buttons.length; i < len; i++) {
                button = category.buttons[i];
                this.symbolmap[category.name][button.name] = button;
                palettes.push('<li class="mqmathpanel-symbolitem"><span class="mqmathpanel-symbolbutton" data-category="'+category.name+'" data-symbol="'+button.name+'">' + button.icon + '</span></li>');
            };
            palettes.push('</ul>');
            counter++;
        };
        palettes.push('</div>');
        tabshtml.push('</ul>');
        this.place.html(inputs.join('') + tabshtml.join('\n') + palettes.join('\n'));
    }
    
    MathPanel.prototype.initHandlers = function() {
        var panel = this;
        $('body').off('focus.mqmathpanel').on('focus.mqmathpanel', '.mq-editable-field', function(event, data) {
            panel.mqdata.lastmq = $(this);
            if (panel.mqdata.lastmq.is('.mq-math-mode')) {
                panel.mqdata.mqfield = MQ.MathField(this);
            } else if (panel.mqdata.lastmq.is('.mq-text-mode')) {
                panel.mqdata.mqfield = MQ.TextField(this);
            };
            panel.showPanel();
        });
        $('body').off('blur.mqmathpanel').on('blur.mqmathpanel', '.mq-editable-field', function(event, data) {
            panel.hidePanel();
        });
        this.place.off('mousedown.mqmathpanel').on('mousedown.mqmathpanel', '.mqmathpanel-symbolbutton', function(event, data) {
            event.stopPropagation();
            event.preventDefault();
            var button = $(this);
            var category = button.attr('data-category');
            var symbol = button.attr('data-symbol');
            panel.execCommand(category, symbol);
        });
        this.place.off('mousedown.mqmathpanelall').on('mousedown.mqmathpanelall', function(event, data) {
            event.stopPropagation();
            event.preventDefault();
        });
    };
    
    MathPanel.prototype.showPanel = function() {
        this.place.addClass('mqmathpanel-visible');
    }
    
    MathPanel.prototype.hidePanel = function() {
        this.place.removeClass('mqmathpanel-visible');
    }
    
    MathPanel.prototype.execCommand = function(category, symbol) {
        var syms = this.symbolmap;
        if (syms[category] && syms[category][symbol]) {
            var button = this.symbolmap[category][symbol];
            var text = button.text;
            var action = button.action;
            var mqel = this.mqdata.mqfield;
            mqel.focus();
            switch (action) {
                case 'write':
                    mqel.write(text);
                    break;
                case 'cmd':
                    mqel.cmd(text);
                    break;
                case 'keystroke':
                    mqel.keystroke(text);
                    break;
                case 'typedText':
                    mqel.typedText(text);
                    break;
                default:
                    break;
            };
        };
    };
    
    MathPanel.prototype.styles = [
        '.mqmathpanel {display: none; position: fixed; top: 500px; left: 130px; max-width: 400px; opacity: 0.6; transition: opacity 0.5s;}',
        '.mqmathpanel:hover {opacity: 1;}',
        '.mqmathpanel.mqmathpanel-visible {display: block;}',
        '.mqmathpanel-tablist {list-style: none; display: flex; flex-flow: row nowrap; margin: 0 4px; padding: 2px;}',
        '.mqmathpanel-categoryset {position: relative; list-style: none; display: none; flex-flow: row wrap; margin: 0; padding: 2px; background-color: #eee; border-radius: 5px;}',
        'input.mqmathpanel-tabselector, input.mqmathpanel-selector {display: none;}',
        '.mqmathpanel-symbolitem {cursor: pointer; border-radius: 4px; width: 25px; height: 25px; border: 1px solid transparent;}',
        '.mqmathpanel-symbolitem:hover {background-color: rgba(255,255,255,0.5); border: 1px solid #777;}',
        //'input.mqmathpanel-tabselector:checked + .mqmathpanel-categorybutton {background-color: red; display: inline-block;}',
        //'input.mqmathpanel-selector:checked + .mqmathpanel-categoryset {display: flex;}',
        '.mqmathpanel-palette-wrapper {margin-top: -2px; background-color: #eee; border: 1px solid #666; border-radius: 4px; background-color: #ddd; box-shadow: 2px 2px 8px rgba(0,0,0,0.5); }',
        '.mqmathpanel-tabitem {border: 1px solid #666; border-bottom: none; margin-bottom: 0; padding-bottom: 0; border-radius: 3px 3px 0 0; position: relative; cursor: pointer; background-color: #ccc;}',
        '.mqmathpanel-tabitem label {cursor: pointer; display: inline-block; padding: 3px; min-width: 30px; min-height: 20px; text-align: center; line-height: 100%;}',
        '.mqmathpanel-tabitem label span {vertical-align: middle;}',
        'input.mqmathpanel-tabselector-0:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-0 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-0:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-0 {display: flex;}',
        'input.mqmathpanel-tabselector-1:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-1 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-1:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-1 {display: flex;}',
        'input.mqmathpanel-tabselector-2:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-2 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-2:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-2 {display: flex;}',
        'input.mqmathpanel-tabselector-3:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-3 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-3:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-3 {display: flex;}',
        'input.mqmathpanel-tabselector-4:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-4 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-4:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-4 {display: flex;}',
        'input.mqmathpanel-tabselector-5:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-5 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-5:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-5 {display: flex;}',
        'input.mqmathpanel-tabselector-6:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-6 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-6:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-6 {display: flex;}',
        'input.mqmathpanel-tabselector-7:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-7 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-7:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-7 {display: flex;}',
        'input.mqmathpanel-tabselector-8:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-8 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-8:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-8 {display: flex;}',
        'input.mqmathpanel-tabselector-9:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-9 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-9:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-9 {display: flex;}',
        'input.mqmathpanel-tabselector-10:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-10 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-10:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-10 {display: flex;}',
        'input.mqmathpanel-tabselector-11:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-11 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-11:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-11 {display: flex;}',
        'input.mqmathpanel-tabselector-12:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-12 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-12:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-12 {display: flex;}',
        'input.mqmathpanel-tabselector-13:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-13 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-13:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-13 {display: flex;}',
        'input.mqmathpanel-tabselector-14:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-14 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-14:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-14 {display: flex;}',
        'input.mqmathpanel-tabselector-15:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-15 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-15:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-15 {display: flex;}',
        'input.mqmathpanel-tabselector-16:checked ~ .mqmathpanel-tablist .mqmathpanel-tabitem-16 {z-index: 3; border-top-width: 3px; padding-bottom: 2px; margin-bottom: -2px; margin-top: -2px; background-color: #eee;;}',
        'input.mqmathpanel-tabselector-16:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-16 {display: flex;}',
        '.mqmathpanel-tablist svg {width: 20px; height: 20px;}',
        '.mqmathpanel-symbolbutton {display: inline-block; padding: 2px; width: 20px; height: 20px; text-align: center;}'
    ].join('\n')
    
    MathPanel.prototype.defaults = {
        configs: {},
        categories: {
            basic: {
                name: 'basic',
                weight: 5,
                icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" viewBox="0 0 30 30" class="mini-icon mini-icon-symbols-basic"><path stroke="none" fill="black" d="M5 9 l4 -1 c2 -0.5 2.4 0 3 2 l1 5 l3 -4 c3 -4 4 -3 5 -2 c1 1 1 3 -2 2 c-2 -1 -2 0 -3 1 l-3 4 l2 9 c1 2 2 2 5 -2 l0.5 0.5 c-5 6 -7 4 -8 2 l-1 -7 l-5 7 c-2 2 -3 2 -5 1 c-1 -2 2 -3 4 -1 l5.8 -8 l-1.5 -6 c-0.7 -2 -1 -2 -4.5 -1.5z m19 2 h3.5 l0.2 -1 h0.5 l-0.5 2 h-5.5 c2 -3.7 5.4 -3.9 4.6 -7.5 c-0.6 -1.6 -3 -1 -3.5 0 a0.7 0.7 0 1 1 -0.5 0.5 c0 -3 5 -3 5 0 c0.3 2 -1 3 -3 5z"></path></svg>',
                buttons: [
                    {
                        name: 'frac',
                        action: 'cmd',
                        text: '\\frac',
                        icon: '/'
                    },
                    {
                        name: 'centerdot',
                        action: 'write',
                        text: '\\cdot',
                        icon: '&sdot;'
                    },
                    {
                        name: 'sqroot',
                        action: 'cmd',
                        text: '\\sqrt',
                        icon: '&radic;'
                    },
                    {
                        name: '3rdroot',
                        action: 'cmd',
                        text: '\\nthroot[3]',
                        icon: '&#x221b;'
                    },
                    {
                        name: 'nthroot',
                        action: 'cmd',
                        text: '\\nthroot',
                        icon: '<sup>n</sup>&radic;'
                    },
                    {
                        name: 'sup',
                        action: 'cmd',
                        text: '^',
                        icon: '<span style="font-family: serif; font-style: italic;">x<sup>n</sup></span>'
                    },
                    {
                        name: 'sub',
                        action: 'cmd',
                        text: '_',
                        icon: '<span style="font-family: serif; font-style: italic;">x<sub>n</sub></span>'
                    },
                    {
                        name: 'bar',
                        action: 'cmd',
                        text: '\\bar',
                        icon: '<span style="border-top: 1px solid black; line-height: 65%; display: inline-block; font-family: serif; font-style: italic;">x</span>'
                    },
                    {
                        name: 'underline',
                        action: 'cmd',
                        text: '\\underline',
                        icon: '<span style="text-decoration: underline; font-family: serif; font-style: italic;">x</span>'
                    }
                ]
            },
            relations: {
                name: 'relations',
                weight: 10,
                icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" viewBox="0 0 30 30" class="mini-icon mini-icon-symbols-relations"><path stroke="none" fill="black" d="M5 6 h20 v2 h-20z m0 6 h20 v2 h-20z m0 6 h20 v2 h-20z"></path></svg>',
                buttons: [
                    {
                        name: 'equal',
                        action: 'cmd',
                        text: '= ',
                        icon: '='
                    },
                    {
                        name: 'lessthan',
                        action: 'cmd',
                        text: '\\lt',
                        icon: '&lt;'
                    },
                    {
                        name: 'greaterthan',
                        action: 'cmd',
                        text: '\\gt',
                        icon: '&gt;'
                    },
                    {
                        name: 'lessorequalwith',
                        action: 'cmd',
                        text: '\\leq',
                        icon: '&le;'
                    },
                    {
                        name: 'greaterorequalwith',
                        action: 'cmd',
                        text: '\\geq',
                        icon: '&ge;'
                    },
                    {
                        name: 'notequal',
                        action: 'cmd',
                        text: '\\neq',
                        icon: '&ne;'
                    },
                    {
                        name: 'approx',
                        action: 'cmd',
                        text: '\\approx',
                        icon: '&asymp;'
                    },
                    {
                        name: 'leftimp',
                        action: 'cmd',
                        text: '\\Leftarrow',
                        icon: '&lArr;'
                    },
                    {
                        name: 'rightimp',
                        action: 'cmd',
                        text: '\\Rightarrow',
                        icon: '&rArr;'
                    },
                    {
                        name: 'equivalent',
                        action: 'cmd',
                        text: '\\iff',
                        icon: '&hArr;'
                    },
                    {
                        name: 'divides',
                        action: 'cmd',
                        text: '\\mid',
                        icon: '|'
                    },
                    {
                        name: 'parallel',
                        action: 'cmd',
                        text: '\\parallel',
                        icon: '&parallel;'
                    },
                    {
                        name: 'nonparallel',
                        action: 'cmd',
                        text: '\\nparallel',
                        icon: '&nparallel;'
                    }
                ]
            },
            arrows: {
                name: 'arrows',
                weight: 20,
                icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" viewBox="0 0 30 30" class="mini-icon mini-icon-symbols-relations"><path stroke="none" fill="black" d="M2 15 l7 -7 l1 1 l-3 3 h16 l-3 -3 l1 -1 l7 7 l-7 7 l-1 -1 l3 -3 h-16 l3 3 l-1 1z m2 0 l1 1 h20 l1 -1 l-1 -1 h-20z"></path></svg>',
                buttons: [
                    {
                        name: 'leftarrow',
                        action: 'cmd',
                        text: '\\leftarrow',
                        icon: '&#x2190;'
                    },
                    {
                        name: 'rightarrow',
                        action: 'cmd',
                        text: '\\rightarrow',
                        icon: '&#x2192;'
                    },
                    {
                        name: 'uparrow',
                        action: 'cmd',
                        text: '\\uparrow',
                        icon: '&#x2191;'
                    },
                    {
                        name: 'downarrow',
                        action: 'cmd',
                        text: '\\downarrow',
                        icon: '&#x2193;'
                    },
                    {
                        name: 'Leftarrow',
                        action: 'cmd',
                        text: '\\Leftarrow',
                        icon: '&#x21d0;'
                    },
                    {
                        name: 'Rightarrow',
                        action: 'cmd',
                        text: '\\Rightarrow',
                        icon: '&#x21d2;'
                    },
                    {
                        name: 'Uparrow',
                        action: 'cmd',
                        text: '\\Uparrow',
                        icon: '&#x21d1;'
                    },
                    {
                        name: 'Downarrow',
                        action: 'cmd',
                        text: '\\Downarrow',
                        icon: '&#x21d3;'
                    },
                    {
                        name: 'updownarrow',
                        action: 'cmd',
                        text: '\\updownarrow',
                        icon: '&#x2195;'
                    },
                    {
                        name: 'leftrightarrow',
                        action: 'cmd',
                        text: '\\leftrightarrow',
                        icon: '&#x2194;'
                    },
                    {
                        name: 'Updownarrow',
                        action: 'cmd',
                        text: '\\Updownarrow',
                        icon: '&#x21d5'
                    },
                    {
                        name: 'Leftrightarrow',
                        action: 'cmd',
                        text: '\\Leftrightarrow',
                        icon: '&#x21d4;'
                    },
                    {
                        name: 'nwarrow',
                        action: 'cmd',
                        text: '\\nwarrow',
                        icon: '&#x2196;'
                    },
                    {
                        name: 'nearrow',
                        action: 'cmd',
                        text: '\\nearrow',
                        icon: '&#x2197;'
                    },
                    {
                        name: 'searrow',
                        action: 'cmd',
                        text: '\\searrow',
                        icon: '&#x2198;'
                    },
                    {
                        name: 'swarrow',
                        action: 'cmd',
                        text: '\\swarrow',
                        icon: '&#x2199;'
                    }
                ]
            },
            numbersets: {
                name: 'numbersets',
                weight: 30,
                icon: '&#x2115;',
                buttons: [
                    {
                        name: 'natural',
                        action: 'cmd',
                        text: '\\mathbb{N}',
                        icon: '&#x2115;'
                    },
                    {
                        name: '',
                        action: 'cmd',
                        text: '',
                        icon: ''
                    },
                    {
                        name: '',
                        action: 'cmd',
                        text: '',
                        icon: ''
                    }
                ]
            },
            greeks: {
                name: 'greeks',
                weight: 40,
                icon: '&alpha;',
                buttons: [
                    {
                        name: 'alpha',
                        action: 'cmd',
                        text: '\\alpha',
                        icon: '&alpha;'
                    },
                    {
                        name: 'beta',
                        action: 'cmd',
                        text: '\\beta',
                        icon: '&beta;'
                    },
                    {
                        name: 'gamma',
                        action: 'cmd',
                        text: '\\gamma',
                        icon: '&gamma;'
                    },
                    {
                        name: 'delta',
                        action: 'cmd',
                        text: '\\delta',
                        icon: '&delta;'
                    },
                    {
                        name: 'epsilon',
                        action: 'cmd',
                        text: '\\epsilon',
                        icon: '&epsilon;'
                    },
                    {
                        name: 'zeta',
                        action: 'cmd',
                        text: '\\zeta',
                        icon: '&zeta;'
                    },
                    {
                        name: 'eta',
                        action: 'cmd',
                        text: '\\eta',
                        icon: '&eta;'
                    },
                    {
                        name: 'theta',
                        action: 'cmd',
                        text: '\\theta',
                        icon: '&theta;'
                    },
                    {
                        name: 'vartheta',
                        action: 'cmd',
                        text: '\\vartheta',
                        icon: '&#x03d1;'
                    },
                    {
                        name: 'iota',
                        action: 'cmd',
                        text: '\\iota',
                        icon: '&iota;'
                    },
                    {
                        name: 'kappa',
                        action: 'cmd',
                        text: '\\kappa',
                        icon: '&kappa;'
                    },
                    {
                        name: 'lambda',
                        action: 'cmd',
                        text: '\\lambda',
                        icon: '&lambda;'
                    },
                    {
                        name: 'mu',
                        action: 'cmd',
                        text: '\\mu',
                        icon: '&mu;'
                    },
                    {
                        name: 'nu',
                        action: 'cmd',
                        text: '\\nu',
                        icon: '&nu;'
                    },
                    {
                        name: 'xi',
                        action: 'cmd',
                        text: '\\xi',
                        icon: '&xi;'
                    },
                    {
                        name: 'pi',
                        action: 'cmd',
                        text: '\\pi',
                        icon: '&pi;'
                    },
                    {
                        name: 'rho',
                        action: 'cmd',
                        text: '\\rho',
                        icon: '&rho;'
                    },
                    {
                        name: 'sigma',
                        action: 'cmd',
                        text: '\\sigma',
                        icon: '&sigma;'
                    },
                    {
                        name: 'tau',
                        action: 'cmd',
                        text: '\\tau',
                        icon: '&tau;'
                    },
                    {
                        name: 'upsilon',
                        action: 'cmd',
                        text: '\\upsilon',
                        icon: '&upsilon;'
                    },
                    {
                        name: 'phi',
                        action: 'cmd',
                        text: '\\phi',
                        icon: '&#x1d719;'
                    },
                    {
                        name: 'varphi',
                        action: 'cmd',
                        text: '\\varphi',
                        icon: '&phi;'
                    },
                    {
                        name: 'chi',
                        action: 'cmd',
                        text: '\\chi',
                        icon: '&chi;'
                    },
                    {
                        name: 'psi',
                        action: 'cmd',
                        text: '\\psi',
                        icon: '&psi;'
                    },
                    {
                        name: 'omega',
                        action: 'cmd',
                        text: '\\omega',
                        icon: '&omega;'
                    }
                ]
            },
            greekscaps: {
                name: 'Greeks',
                weight: 40,
                icon: '&Gamma;',
                buttons: [
                    {
                        name: 'Alpha',
                        action: 'cmd',
                        text: 'A',
                        icon: '&Alpha;'
                    },
                    {
                        name: 'Beta',
                        action: 'cmd',
                        text: 'B',
                        icon: '&Beta;'
                    },
                    {
                        name: 'Gamma',
                        action: 'cmd',
                        text: '\\Gamma',
                        icon: '&Gamma;'
                    },
                    {
                        name: 'Delta',
                        action: 'cmd',
                        text: '\\Delta',
                        icon: '&Delta;'
                    },
                    {
                        name: 'Epsilon',
                        action: 'cmd',
                        text: 'E',
                        icon: '&Epsilon;'
                    },
                    {
                        name: 'Zeta',
                        action: 'cmd',
                        text: '\\zeta',
                        icon: '&zeta;'
                    },
                    {
                        name: 'Eta',
                        action: 'cmd',
                        text: 'H',
                        icon: '&Eta;'
                    },
                    {
                        name: 'Theta',
                        action: 'cmd',
                        text: '\\Theta',
                        icon: '&Theta;'
                    },
                    {
                        name: 'Iota',
                        action: 'cmd',
                        text: 'I',
                        icon: '&Iota;'
                    },
                    {
                        name: 'Kappa',
                        action: 'cmd',
                        text: 'K',
                        icon: '&Kappa;'
                    },
                    {
                        name: 'Lambda',
                        action: 'cmd',
                        text: '\\Lambda',
                        icon: '&Lambda;'
                    },
                    {
                        name: 'Mu',
                        action: 'cmd',
                        text: 'M',
                        icon: '&Mu;'
                    },
                    {
                        name: 'Nu',
                        action: 'cmd',
                        text: 'N',
                        icon: '&Nu;'
                    },
                    {
                        name: 'Xi',
                        action: 'cmd',
                        text: '\\Xi',
                        icon: '&Xi;'
                    },
                    {
                        name: 'Pi',
                        action: 'cmd',
                        text: '\\Pi',
                        icon: '&Pi;'
                    },
                    {
                        name: 'Rho',
                        action: 'cmd',
                        text: 'P',
                        icon: '&Rho;'
                    },
                    {
                        name: 'Sigma',
                        action: 'cmd',
                        text: '\\Sigma',
                        icon: '&Sigma;'
                    },
                    {
                        name: 'Tau',
                        action: 'cmd',
                        text: 'T',
                        icon: '&Tau;'
                    },
                    {
                        name: 'Upsilon',
                        action: 'cmd',
                        text: '\\Upsilon',
                        icon: '&Upsilon;'
                    },
                    {
                        name: 'Phi',
                        action: 'cmd',
                        text: '\\Phi',
                        icon: '&Phi;'
                    },
                    {
                        name: 'Chi',
                        action: 'cmd',
                        text: 'X',
                        icon: '&Chi;'
                    },
                    {
                        name: 'Psi',
                        action: 'cmd',
                        text: '\\Psi',
                        icon: '&Psi;'
                    },
                    {
                        name: 'Omega',
                        action: 'cmd',
                        text: '\\Omega',
                        icon: '&Omega;'
                    }
                ]
            },
            brackets: {
                name: 'backets',
                weight: 50,
                icon: '',
                buttons: [
                    
                ]
            },
            functions: {
                name: 'functions',
                weight: 60,
                icon: '',
                buttons: [
                    
                ]
            },
            dots: {
                name: 'dots',
                weight: 70,
                icon: '',
                buttons: [
                    
                ]
            },
            sets: {
                name: 'sets',
                weight: 80,
                icon: '&#x2286;',
                buttons: [
                    {
                        name: 'isin',
                        action: 'cmd',
                        text: '\\in',
                        icon: '&isin;'
                    },
                    {
                        name: 'isni',
                        action: 'cmd',
                        text: '\\ni',
                        icon: '&ni;'
                    },
                    {
                        name: 'notin',
                        action: 'cmd',
                        text: '\\notin',
                        icon: '&notin;'
                    },
                    {
                        name: 'empty',
                        action: 'cmd',
                        text: '\\emptyset',
                        icon: '&empty;'
                    },
                    {
                        name: 'subset',
                        action: 'cmd',
                        text: '\\subset',
                        icon: '&#x2282;'
                    },
                    {
                        name: 'supset',
                        action: 'cmd',
                        text: '\\supset',
                        icon: '&#x2283;'
                    },
                    {
                        name: 'subseteq',
                        action: 'cmd',
                        text: '\\subseteq',
                        icon: '&#x2286;'
                    },
                    {
                        name: 'supseteq',
                        action: 'cmd',
                        text: '\\supseteq',
                        icon: '&#x2287;'
                    },
                    {
                        name: 'union',
                        action: 'cmd',
                        text: '\\cup',
                        icon: '&#x222a;'
                    },
                    {
                        name: 'intersection',
                        action: 'cmd',
                        text: '\\cap',
                        icon: '&#x2229;'
                    },
                    {
                        name: '',
                        action: 'cmd',
                        text: '',
                        icon: ''
                    },
                    {
                        name: '',
                        action: 'cmd',
                        text: '',
                        icon: ''
                    }
                ]
            }
        }
    }
    
    /**
     * jQuery plugin for MathArray
     */
    var mamethods = {
        init: function(options) {
            return this.each(function() {
                var element = new MathPanel(this, options);
            })
        },
        
        destroy: function(options) {
            return this.each(function() {
                $(this).trigger('destroy');
            })
        }
    };
    
    $.fn[PLUGIN_NAME] = function(options) {
        if (!options || typeof(options) === 'object') {
            return mamethods.init.call(this, options);
        } else if (mamethods[options]) {
            var args = Array.prototype.slice.call(arguments, 1);
            return mamethods[options].apply(this, args);
        } else {
            $.error('Method ' + options + ' doesn\'t exist for ' + PLUGIN_NAME + ' plugin.' );
        }
    }
    
})(window, jQuery);