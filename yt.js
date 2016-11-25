var yts = {};

yts.option = {
    timeoutBuild: 500,
    timeoutRemove: 1000,
    lastClick: 0
};

yts.elements = {
    menu : null,
    speedMenu: null,
    slider: null,
    sliderLabel: null
};

yts.modules = [
    'setting',
    'i18'
];

/*************************************
 *          TRANSLATION              *
 ************************************/
yts.i18 = {};

yts.i18.dic = {
    pl: {
        'Speed': 'Szybkość',
        'Annotation': 'Adnotacje',
        'Settings': 'Ustawienia'
    },
    en: {
        'Speed': 'Speed',
        'Annotation': 'Annotation',
        'Settings': 'Settings'
    },
    de: {
        'Speed' : 'Geschwindigkeit',
        'Annotation': '',
        'Settings': 'Einstellungen'
    },
    fr:{
        'Speed':'Vitesse',
        'Annotation':'',
        'Settings':'Paramètres'
    }
};

yts.i18.opt = {
    lang: 'en',
    default: 'en',
    map:{
        pl: 'pl',
        pl_pl: 'pl',
        en: 'en',
        en_gb: 'en',
        de: 'de',
        fr: 'fr'
    }
};

yts.i18.init = function () {
    yts.i18.opt.lang = yts.i18.getLang();
};

yts.i18.getLang = function () {
    var lang = yts.i18.filter(yts.setting.get('lang'));
    if(lang !== '' && yts.i18.isAllow(lang)){
        return yts.i18.map(lang);
    }

    lang = yts.i18.filter(yts.dom.get('html').getAttribute('lang'));
    if(lang !== '' && yts.i18.isAllow(lang)){
        return yts.i18.map(lang);
    }

    return yts.i18.opt.default;
};

yts.i18.isAllow = function (lang) {
    return yts.i18.opt.map.hasOwnProperty(lang);
};

yts.i18.t = function (pattern) {
    if(yts.i18.dic[yts.i18.opt.lang].hasOwnProperty(pattern)){
        return yts.i18.dic[yts.i18.opt.lang][pattern];
    }
    else {
        return pattern;
    }
};

yts.i18.filter = function (lang) {
    return lang ? lang.replace('-', '_').toLowerCase() : '';
};

yts.i18.map = function (lang) {
    return  yts.i18.opt.map[lang]
};


/*************************************
 *          INIT                     *
 ************************************/
yts.init = function () {
    yts.player.update();
    yts.modules.forEach(function (module) {
        yts[module].init();
    });
    yts.option.lastClick = (new Date()).getTime();
    yts.dom.event(document, "spfdone", yts.player.update);
    yts.menu.reopen();
    yts.buildApp();
};

yts.buildApp = function () {
    yts.elements.menu = yts.dom.get('.ytp-panel-menu');
    if (yts.elements.menu !== null) {
        setTimeout(yts.menu.removeDefaultSpeed, yts.option.timeoutRemove);

        yts.menu.build();
        yts.annot.init();
    }
    else {
        setTimeout(yts.buildApp, yts.option.timeoutBuild);
    }
};


/*************************************
 *          MENU                    *
 ************************************/
yts.menu = {};

yts.menu.build = function () {
    yts.slider.build();

    var speedMenu = yts.dom.new('div', {
        'className': 'ytp-menuitem'
    });

    var right = yts.dom.new('div', {
        'className': 'ytp-menuitem-content'
    });

    yts.elements.sliderLabel = yts.dom.new('div', {
        'className': 'ytp-menuitem-label'
    });

    yts.slider.updateLabel(1);
    speedMenu.appendChild(yts.elements.sliderLabel);
    speedMenu.appendChild(right.appendChild(yts.elements.slider));
    yts.elements.menu.appendChild(speedMenu);
    yts.menu.event();
};

yts.menu.event = function () {
    yts.elements.menu.addEventListener('click', yts.menu.click);
};

yts.menu.removeDefaultSpeed = function(){
    var switchers = yts.dom.getOpt(".ytp-menuitem", {role:'menuitemcheckbox'});
    switchers[switchers.length-1].nextElementSibling.style.display = 'none';
};

yts.menu.reopen = function () {
    var settings_button = yts.dom.get(".ytp-settings-button");
    settings_button.click();
    settings_button.click();
};

yts.menu.click = function () {
    yts.option.lastClick = (new Date()).getTime();
};

/*************************************
 *          SLIDER                   *
 ************************************/
yts.slider = {};

yts.slider.build = function () {
    yts.elements.slider = yts.dom.new('input', {
        'className': '',
        'type': 'range',
        'min': 0.5,
        'max': 4,
        'step': 0.1,
        'value': 1
    });
    yts.dom.event(yts.elements.slider, 'change', yts.slider.change);
    yts.dom.event(yts.elements.slider, 'input', yts.slider.move);
};

yts.slider.move = function (event) {
    yts.slider.updateLabel(event.target.value);
};

yts.slider.change = function (event) {
    yts.player.duration(event.target.value);
};

yts.slider.updateLabel = function (val) {
    yts.elements.sliderLabel.innerHTML = yts.i18.t('Speed') + ': ' + parseFloat(val).toFixed(1);
};


/*************************************
 *          PLAYER                   *
 ************************************/
yts.player = {};

yts.player.update = function(){
    yts.elements.player = yts.dom.get('.html5-main-video');

};
yts.player.duration = function(value){
    yts.elements.player.playbackRate = value;
};


/*************************************
 *          ANNOTATION               *
 ************************************/
yts.annot = {};
yts.annot.init = function(){
    if(yts.setting.get('annot') !== 'on'){
        yts.observer.init(yts.elements.menu, yts.annot.change);
    }
};

yts.annot.change = function (mutation) {
    if(mutation.type == "attributes" && mutation.target.getAttribute('role')=="menuitemcheckbox"){
        yts.annot.switchOff();
    }
};

yts.annot.switchOff = function(){
    var switchers = yts.dom.getOpt(".ytp-menuitem", {role:'menuitemcheckbox'});
    if(switchers.length == 2){
        setTimeout(function (switcher) {
                if((new Date()).getTime() - yts.option.lastClick > 1000 &&
                    switcher.getAttribute('aria-checked') == "true"){
                    switcher.click();
                }
            },
            500,
            switchers[1]
        );
    }
};

yts.annot.switchOffAlways = function(){
    yts.setting.set('annot', 'off');
    yts.annot.switchOff();
};

yts.annot.switchOn = function(){
    yts.setting.set('annot', 'on');
};



/*************************************
 *          COOKIE                   *
 ************************************/
yts.cookie ={};

yts.cookie.set = function (name, value, days) {
    days = days || 366;
    var d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

yts.cookie.get = function (name) {
    name += "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
};


/************************************
*                DOM                *
************************************/
yts.dom = {};

yts.dom.event = function (obj, event, callback) {
    obj.addEventListener(event, callback);
};

yts.dom.new = function (tag, option) {
    var element = document.createElement(tag);
    for (var param in option) {
        element[param] = option[param];
    }
    return element;
};

yts.dom.get = function (tselector, all) {
    all = all || false;
    var type = tselector.substring(0, 1);
    var selector = tselector.substring(1);
    var elements;
    if (type == "#") {
        return document.getElementById(selector);
    }
    else if (type == ".") {
        elements = document.getElementsByClassName(selector);
    }
    else{
        elements = document.querySelectorAll(tselector);
    }

    if (all) {
        return elements;
    }
    else {
        return elements.length ? elements[0] : null;
    }
};

yts.dom.getOpt = function(selector, option){
    var el = yts.dom.get(selector, true);
    var pass = [];
    var correct;
    for(var i =0; i< el.length; i++){
        correct = true;
        for(var prop in option){
            if(!yts.dom.has(el[i], prop, option[prop])){
                correct = false;
                break;
            }
        }
        if(correct){
            pass.push(el[i]);
        }
    }
    return pass;
};

yts.dom.has = function (elem, key, val) {
    if(elem.hasAttribute(key)){
        var attr = elem.getAttribute(key);
        if(val !== null){
            return attr == val;
        }
        return true;
    }
    return false;
};


/*************************************
 *          MENU OBSERVER            *
 ************************************/
yts.observer= {};

yts.observer.obj = null;

yts.observer.get = function () {
    return window.MutationObserver || window.WebKitMutationObserver;
};

yts.observer.init = function (element, callback) {
    var MutationObserver = yts.observer.get();
    if( MutationObserver ){
        var obs = new MutationObserver(function(mutations, observer){
            callback(mutations[0]);
        });

        obs.observe( element, {
            childList: true,
            subtree: true,
            attributes:true,
            characterData:true,
            attributeOldValue:true,
            characterDataOldValue:true
        });
    }
};


/*************************************
 *          SETTINGS                 *
 ************************************/
yts.setting = {};

yts.setting.settings = null;
yts.setting.init = function(){
    var cookie = yts.cookie.get('yts_s');
    yts.setting.settings = JSON.parse(cookie == '' ? '{}' : cookie);
};
yts.setting.set = function(key, val){
    yts.setting.settings[key] = val;
    yts.cookie.set('yts_s', JSON.stringify(yts.setting.settings));
};
yts.setting.get = function(kay){
    return yts.setting.settings.hasOwnProperty(kay) ?
        yts.setting.settings[kay] : null;
};


yts.init();