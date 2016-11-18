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
            panel.mqdata.lastmq = lastmq = $(this);
            if (lastmq.is('.mq-math-mode')) {
                panel.mqdata.mqfield = MQ.MathField(this);
            } else if (lastmq.is('.mq-text-mode')) {
                panel.mqdata.mqfield = MQ.TextField(this);
            };
            var pos = panel.getPosition(lastmq);
            var height = lastmq.height();
            var pwidth = panel.place.width();
            var htmlwidth = $('html').width();
            var maxx = htmlwidth - pwidth;
            panel.showPanel();
            panel.place.css({'top': Math.max(0, (pos.top + height + 50)) + 'px', 'left': Math.max(0, Math.min(maxx, pos.left)) + 'px'});
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
            var postkeys = button.postkeys;
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
                case 'template':
                    var selection = $(mqel.el()).find('textarea').val();
                    var repltext = text.replace(/@@@@/g, selection);
                    mqel.write(repltext);
                    break;
                default:
                    break;
            };
            if (postkeys) {
                mqel.keystroke(postkeys);
            }
        };
    };
    
    MathPanel.prototype.getPosition = function(elem) {
        var xpos = 0;
        var ypos = 0;
        var offset;
        while (elem[0].tagName !== 'HTML') {
            offset = elem.offset();
            xpos += offset.left;
            ypos += offset.top;
            
            elem = elem.offsetParent();
        };
        return {top: ypos, left: xpos};
    };
    
    MathPanel.prototype.styles = [
        '.mqmathpanel {display: none; position: absolute; top: 500px; left: 130px; max-width: 500px; opacity: 0.3; transition: opacity 0.5s, top 0.2s 0.5s, left 0.2s 0.5s;}',
        '.mqmathpanel:hover {opacity: 1;}',
        '.mqmathpanel.mqmathpanel-visible {display: block;}',
        '.mqmathpanel-tablist {list-style: none; display: flex; flex-flow: row nowrap; margin: 0 4px; padding: 2px;}',
        '.mqmathpanel-categoryset {position: relative; list-style: none; display: none; flex-flow: row wrap; margin: 0; padding: 2px; background-color: #eee; border-radius: 5px;}',
        'input.mqmathpanel-tabselector, input.mqmathpanel-selector {display: none;}',
        '.mqmathpanel-symbolitem {cursor: pointer; border-radius: 4px; width: 34px; height: 34px; border: 1px solid transparent; text-align: center; padding: 0; margin: 0 2px;}',
        '.mqmathpanel-symbolitem:hover {background-color: rgba(255,255,255,0.5); border: 1px solid #777;}',
        '.mqmathpanel-tablist svg {width: 20px; height: 20px;}',
        '.mqmathpanel-symbolbutton {display: inline-block; padding: 2px; width: 30px; height: 30px; line-height: 30px; text-align: center;}',
        //'input.mqmathpanel-tabselector:checked + .mqmathpanel-categorybutton {background-color: red; display: inline-block;}',
        //'input.mqmathpanel-selector:checked + .mqmathpanel-categoryset {display: flex;}',
        '.mqmathpanel-palette-wrapper {margin-top: -2px; background-color: #eee; border: 1px solid #666; border-radius: 4px; background-color: #ddd; box-shadow: 2px 2px 8px rgba(0,0,0,0.5); }',
        ///////////////////////////////////////////////
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
        'input.mqmathpanel-tabselector-16:checked ~ .mqmathpanel-palette-wrapper .mqmathpanel-categoryset-16 {display: flex;}'
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
                        name: 'plus',
                        action: 'cmd',
                        text: '+',
                        icon: '+'
                    },
                    {
                        name: 'minus',
                        action: 'cmd',
                        text: '-',
                        icon: '–'
                    },
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
                        name: 'plusminus',
                        action: 'cmd',
                        text: '\\pm',
                        icon: '&pm;'
                    },
                    {
                        name: 'minusplus',
                        action: 'cmd',
                        text: '\\mp',
                        icon: '&#x2213;'
                    },
                    {
                        name: 'oplus',
                        action: 'cmd',
                        text: '\\oplus',
                        icon: '&oplus;'
                    },
                    {
                        name: 'otimes',
                        action: 'cmd',
                        text: '\\otimes',
                        icon: '&otimes;'
                    },
                    {
                        name: 'times',
                        action: 'cmd',
                        text: '\\times',
                        icon: '&times;'
                    },
                    {
                        name: 'div',
                        action: 'cmd',
                        text: '\\div',
                        icon: '&div;'
                    },
                    {
                        name: 'asterisk',
                        action: 'cmd',
                        text: '\\ast',
                        icon: '&lowast;'
                    },
                    {
                        name: 'sqroot',
                        action: 'cmd',
                        text: '\\sqrt',
                        icon: '&radic;'
                    },
                    {
                        name: '3rdroot',
                        action: 'template',
                        text: '\\nthroot[3]{@@@@}',
                        icon: '&#x221b;',
                        postkeys: 'Left'
                    },
                    {
                        name: 'nthroot',
                        action: 'template',
                        text: '\\nthroot[]{@@@@}',
                        icon: '<sup>n</sup>&radic;',
                        postkeys: 'Shift-Left Left Right'
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
                        name: 'vector',
                        action: 'cmd',
                        text: '\\vec',
                        icon: '<span style="border-top: 1px solid black; line-height: 65%; display: inline-block; font-family: serif; font-style: italic;">x</span>'
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
                icon: '&equiv;',
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
                    },
                    {
                        name: 'perpendicular',
                        action: 'cmd',
                        text: '\\perp',
                        icon: '&perp;'
                    },
                    {
                        name: 'sim',
                        action: 'cmd',
                        text: '\\sim',
                        icon: '&sim;'
                    },
                    {
                        name: 'simeq',
                        action: 'cmd',
                        text: '\\simeq',
                        icon: '&simeq;'
                    },
                    {
                        name: 'cong',
                        action: 'cmd',
                        text: '\\cong',
                        icon: '&cong;'
                    },
                    {
                        name: 'equiv',
                        action: 'cmd',
                        text: '\\equiv',
                        icon: '&equiv;'
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
                        name: 'mapsto',
                        action: 'cmd',
                        text: '\\mapsto',
                        icon: '&#8614;'
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
                        text: '\\N',
                        icon: '&#x2115;'
                    },
                    {
                        name: 'integers',
                        action: 'cmd',
                        text: '\\Z',
                        icon: '&#8484;'
                    },
                    {
                        name: 'rationals',
                        action: 'cmd',
                        text: '\\Q',
                        icon: '&#8474;'
                    },
                    {
                        name: 'reals',
                        action: 'cmd',
                        text: '\\R',
                        icon: '&#8477;'
                    },
                    {
                        name: 'complexes',
                        action: 'cmd',
                        text: '\\C',
                        icon: '&#8450;'
                    },
                    {
                        name: 'hamiltonian',
                        action: 'cmd',
                        text: '\\H',
                        icon: '&#8461;'
                    },
                    {
                        name: 'primes',
                        action: 'cmd',
                        text: '\\primes',
                        icon: '&#8473;'
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
                        name: 'varsigma',
                        action: 'cmd',
                        text: '\\varsigma',
                        icon: '&#x03c2;'
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
                    },
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
                icon: '{&#x25ab;}',
                buttons: [
                    {
                        name: 'parentheses',
                        action: 'cmd',
                        text: '(',
                        icon: '(&#x25ab;)'
                    },
                    {
                        name: 'braces',
                        action: 'cmd',
                        text: '{',
                        icon: '{&#x25ab;}'
                    },
                    {
                        name: 'squarebackets',
                        action: 'cmd',
                        text: '[',
                        icon: '[&#x25ab;]'
                    },
                    {
                        name: 'anglebrackets',
                        action: 'cmd',
                        text: '\\langle',
                        icon: '<span style="font-size: 70%;">&#x3008;</span>&#x25ab;<span style="font-size: 70%;">&#x3009;</span>'
                    },
                    {
                        name: 'abs',
                        action: 'cmd',
                        text: '|',
                        icon: '|&#x25ab;|'
                    },
                    {
                        name: 'floor',
                        action: 'template',
                        text: '\\lfloor @@@@ \\rfloor',
                        icon: '&lfloor;&#x25ab;&rfloor;'
                    },
                    {
                        name: 'leftbrace',
                        action: 'cmd',
                        text: '\\lbrace',
                        icon: '{'
                    },
                    {
                        name: 'rightbrace',
                        action: 'cmd',
                        text: '\\rbrace',
                        icon: '}'
                    },
                    {
                        name: 'leftbracket',
                        action: 'cmd',
                        text: '\\lbrack',
                        icon: '['
                    },
                    {
                        name: 'rightbracket',
                        action: 'cmd',
                        text: '\\rbrack',
                        icon: ']'
                    },
                    {
                        name: 'leftfloor',
                        action: 'cmd',
                        text: '\\lfloor',
                        icon: '&lfloor;'
                    },
                    {
                        name: 'rightfloor',
                        action: 'cmd',
                        text: '\\rfloor',
                        icon: '&rfloor;'
                    },
                    {
                        name: 'leftceil',
                        action: 'cmd',
                        text: '\\lceil',
                        icon: '&lceil;'
                    },
                    {
                        name: 'rightceil',
                        action: 'cmd',
                        text: '\\rceil',
                        icon: '&rceil;'
                    }
                ]
            },
            functions: {
                name: 'functions',
                weight: 60,
                icon: '<span style="font-style: italic;">f(x)</span>',
                buttons: [
                    {
                        name: 'sin',
                        action: 'template',
                        text: '\\sin \\left(@@@@\\right)',
                        icon: 'sin',
                        postkeys: 'Left'
                    },
                    {
                        name: 'cos',
                        action: 'template',
                        text: '\\cos \\left(@@@@\\right)',
                        icon: 'cos',
                        postkeys: 'Left'
                    },
                    {
                        name: 'tan',
                        action: 'template',
                        text: '\\tan \\left(@@@@\\right)',
                        icon: 'tan',
                        postkeys: 'Left'
                    },
                    {
                        name: 'arcsin',
                        action: 'template',
                        text: '\\arcsin \\left(@@@@\\right)',
                        icon: '<span style="font-size: 70%;">arcsin</span>',
                        postkeys: 'Left'
                    },
                    {
                        name: 'arccos',
                        action: 'template',
                        text: '\\arccos \\left(@@@@\\right)',
                        icon: '<span style="font-size: 70%;">arccos</span>',
                        postkeys: 'Left'
                    },
                    {
                        name: 'arctan',
                        action: 'template',
                        text: '\\arctan \\left(@@@@\\right)',
                        icon: '<span style="font-size: 70%;">arctan</span>',
                        postkeys: 'Left'
                    },
                    {
                        name: 'log',
                        action: 'template',
                        text: '\\log \\left(@@@@\\right)',
                        icon: 'log',
                        postkeys: 'Left'
                    },
                    {
                        name: 'ln',
                        action: 'template',
                        text: '\\ln \\left(@@@@\\right)',
                        icon: 'ln',
                        postkeys: 'Left'
                    },
                    {
                        name: 'lg',
                        action: 'template',
                        text: '\\lg \\left(@@@@\\right)',
                        icon: 'lg',
                        postkeys: 'Left'
                    },
                    {
                        name: 'min',
                        action: 'template',
                        text: '\\min \\left(@@@@\\right)',
                        icon: 'min',
                        postkeys: 'Left'
                    },
                    {
                        name: 'max',
                        action: 'template',
                        text: '\\max \\left(@@@@\\right)',
                        icon: 'max',
                        postkeys: 'Left'
                    }
                ]
            },
            dots: {
                name: 'dots',
                weight: 70,
                icon: '&#x22ef;',
                buttons: [
                    {
                        name: 'cdot',
                        action: 'cmd',
                        text: '\\cdot',
                        icon: '&middot;'
                    },
                    {
                        name: 'bullet',
                        action: 'cmd',
                        text: '\\bullet',
                        icon: '&bull;'
                    },
                    {
                        name: 'circ',
                        action: 'cmd',
                        text: '\\circ',
                        icon: '&#x25e6;'
                    },
                    {
                        name: 'dots',
                        action: 'cmd',
                        text: '\\dots',
                        icon: '&hellip;'
                    },
                    {
                        name: 'cdots',
                        action: 'cmd',
                        text: '\\cdots',
                        icon: '&#x22ef;'
                    },
                    {
                        name: 'vdots',
                        action: 'cmd',
                        text: '\\vdots',
                        icon: '&#x22ee;'
                    },
                    {
                        name: 'ddots',
                        action: 'cmd',
                        text: '\\ddots',
                        icon: '&#x22f1;'
                    },
                    {
                        name: 'therefore',
                        action: 'cmd',
                        text: '\\therefore',
                        icon: '&there4;'
                    },
                    {
                        name: 'because',
                        action: 'cmd',
                        text: '\\because',
                        icon: '&because;'
                    }
                ]
            },
            bigs: {
                name: 'bigs',
                weight: 73,
                icon: '&Sigma;',
                buttons: [
                    {
                        name: 'sum',
                        action: 'cmd',
                        text: '\\sum',
                        icon: '&Sigma;'
                    },
                    {
                        name: 'product',
                        action: 'cmd',
                        text: '\\prod',
                        icon: '&prod;'
                    },
                    {
                        name: 'coprod',
                        action: 'cmd',
                        text: '\\coprod',
                        icon: '&#x2210;'
                    },
                    {
                        name: 'integral',
                        action: 'cmd',
                        text: '\\int',
                        icon: '&int;'
                    },
                    {
                        name: 'ointegral',
                        action: 'cmd',
                        text: '\\oint',
                        icon: '&#x222e;'
                    }
                ]
            },
            logic: {
                name: 'logic',
                weight: 75,
                icon: '&and;',
                buttons: [
                    {
                        name: 'and',
                        action: 'cmd',
                        text: '\\land',
                        icon: '&and;'
                    },
                    {
                        name: 'or',
                        action: 'cmd',
                        text: '\\lor',
                        icon: '&or;'
                    },
                    {
                        name: 'not',
                        action: 'cmd',
                        text: '\\neg',
                        icon: '&not;'
                    },
                    {
                        name: 'forall',
                        action: 'cmd',
                        text: '\\forall',
                        icon: '&forall;'
                    },
                    {
                        name: 'exists',
                        action: 'cmd',
                        text: '\\exists',
                        icon: '&exist;'
                    },
                    {
                        name: 'notexists',
                        action: 'cmd',
                        text: '\\nexists',
                        icon: '&#x2204;'
                    },
                    {
                        name: 'top',
                        action: 'cmd',
                        text: '\\top',
                        icon: '&#x22a4;'
                    },
                    {
                        name: 'bottom',
                        action: 'cmd',
                        text: '\\bot',
                        icon: '&#x22a5;'
                    },
                    {
                        name: 'vdash',
                        action: 'cmd',
                        text: '\\vdash',
                        icon: '&#x22a2;'
                    },
                    {
                        name: 'dashv',
                        action: 'cmd',
                        text: '\\dashv',
                        icon: '&#x22a3;'
                    },
                    {
                        name: 'models',
                        action: 'cmd',
                        text: '\\models',
                        icon: '&#8872;'
                    }
                ]
            },
            sets: {
                name: 'sets',
                weight: 80,
                icon: '&#x2286;',
                buttons: [
                    {
                        name: 'setminus',
                        action: 'cmd',
                        text: '\\setminus',
                        icon: '\\'
                    },
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
                    // MathQuill converts \niton to \not \ni, which converts to \neg \ni. This is not wanted!
                    //{
                    //    name: 'niton',
                    //    action: 'cmd',
                    //    text: '\\niton',
                    //    icon: '&#x220c;'
                    //},
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
                    //{
                    //    name: 'nsub',
                    //    action: 'cmd',
                    //    text: '\\nsub',
                    //    icon: '&nsub;'
                    //},
                    //{
                    //    name: 'nsup',
                    //    action: 'cmd',
                    //    text: '\\nsup',
                    //    icon: '&nsup;'
                    //},
                    //{
                    //    name: 'nsube',
                    //    action: 'cmd',
                    //    text: '\\nsube',
                    //    icon: '&nsube;'
                    //},
                    //{
                    //    name: 'nsupe',
                    //    action: 'cmd',
                    //    text: '\\nsupe',
                    //    icon: '&nsupe;'
                    //},
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
                    }
                ]
            },
            symbols: {
                name: 'symbols',
                weight: 90,
                icon: '&infin;',
                buttons: [
                    {
                        name: 'infinity',
                        action: 'cmd',
                        text: '\\infty',
                        icon: '&infin;'
                    },
                    {
                        name: 'degree',
                        action: 'cmd',
                        text: '\\degree',
                        icon: '&deg;'
                    },
                    {
                        name: 'nabla',
                        action: 'cmd',
                        text: '\\nabla',
                        icon: '&nabla;'
                    },
                    {
                        name: 'partial',
                        action: 'cmd',
                        text: '\\part',
                        icon: '&part;'
                    },
                    {
                        name: 'hbar',
                        action: 'cmd',
                        text: '\\hbar',
                        icon: '&#8463;'
                    },
                    {
                        name: 'real',
                        action: 'cmd',
                        text: '\\Re',
                        icon: '&real;'
                    },
                    {
                        name: 'imaginary',
                        action: 'cmd',
                        text: '\\Im',
                        icon: '&image;'
                    },
                    {
                        name: 'alef',
                        action: 'cmd',
                        text: '\\alef',
                        icon: '&alefsym;'
                    },
                    {
                        name: 'wp',
                        action: 'cmd',
                        text: '\\wp',
                        icon: '&#8472;'
                    },
                    {
                        name: 'angle',
                        action: 'cmd',
                        text: '\\angle',
                        icon: '&ang;'
                    },
                    {
                        name: 'measuredangle',
                        action: 'cmd',
                        text: '\\measuredangle',
                        icon: '&#x2221;'
                    },
                    {
                        name: 'clubsuit',
                        action: 'cmd',
                        text: '\\clubsuit',
                        icon: '&clubs;'
                    },
                    {
                        name: 'diamondsuit',
                        action: 'cmd',
                        text: '\\diamondsuit',
                        icon: '&#9826;'
                    },
                    {
                        name: 'heartsuit',
                        action: 'cmd',
                        text: '\\heartsuit',
                        icon: '&#9825;'
                    },
                    {
                        name: 'spadesuit',
                        action: 'cmd',
                        text: '\\spadesuit',
                        icon: '&spades;'
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