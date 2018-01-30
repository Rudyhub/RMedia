/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

const cwd = process.cwd();
const appRoot = cwd + '\\';
module.exports = {
	appInfo: {
		version: '1.0',
		author: 'mystermangit',
		homepage: 'https://github.com/mystermangit/fupconvert',
	},
	appRoot: appRoot,
	ffmpegRoot: appRoot + 'plugins\\ffmpeg',
	audioThumb: appRoot + 'css\\audio.jpg',
	loadingGif: appRoot + 'css\\loading.gif',
	icon: appRoot + 'css\\icon.png',
	logPath: appRoot + 'cache\\log.txt',
	output: {
		folder: process.env.USERPROFILE+'\\desktop',
		width: 1280,
		height: 720,
		bitv: 1024,
		bita: 128,
		fps: 25,
		format: {
			image: 'jpg',
			video: 'mp4',
			audio: 'mp3'
		},
		speeds: {
			ultrafast: '无敌快',
			superfast: '超级快',
			veryfast: '非常快',
			faster: '比较快',
			fast: '正常快',
			medium: '普通',
			slow: '正常慢',
			slower: '比较慢',
			veryslow: '非常慢',
			placebo: '超级慢'
		},
		speedLevel: 'slow'
	}
}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = {
    timemat(time){
        let t,
            mat = (n) => {
                return n < 10 ? '0'+n : n;
            };
        if(typeof time === 'string' && /^\d{2}:\d{2}:\d{2}([\.\d]*)$/.test(time)){
            t = time.split(':');
            return (parseInt(t[0]*3600) + parseInt(t[1]*60) + parseFloat(t[2])) * 1000;
        }else if(typeof time === 'number'){
            if(isNaN(time)) return '00:00:00';
            t = time / 1000;
            let h = Math.floor( t/3600 );
            let m = Math.floor( (t%3600) / 60 );
            let s = Math.floor( t%60 );
            return mat(h) + ':' + mat(m) + ':' + mat(s);
        }else{
            return "error time";
        }
    },
    datemat(time){
        let date;
        if(typeof time === 'number'){
            date = new Date(time);
        }else if(typeof time === 'string'){
            return new Date(time).getTime();
        }else{
            date = new Date();
        }
        return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
    },
    sizemat(b, flag){
        if(!flag){
            if(b < 1024) return b + ' B';
            let size = b/1024,
                fixed = arguments[1] || 2;
            if(size < 1024){
                return size.toFixed(fixed) + ' KB';
            }else{
                return (size/1024).toFixed(fixed) + ' MB';
            }
        }else{
            if(/^[\d\.]+\s*KB$/.test(b)){
                return parseFloat(b)*1024;
            }else if(/^[\d\.]+\s*MB$/.test(b)){
                return parseFloat(b)*1024*1024;
            }else{
                return parseFloat(b);
            }
        }
    },
    namemat(str,n){
        if(/\d+$/g.test(str)){
            return str.replace(/\d+$/g, function(a){
                return (parseInt('1'+a) + n).toString().slice(1);
            });
        }
        return str + (100 + n).toString().slice(1);
    },
    qualitymat(bitv, bita, duration, size){
        return (((bitv+bita)*1000*duration/8/size)*100).toFixed(2);
    },
    dialog(title, msg, btns, fn, context){
        let div = document.createElement('div'),
            parentNode = context || document.body,
            html;
        div.className = 'dialog';
        html = `<div class="dialog-title">${title}<i class="icon icon-cross dialog-close"></i></div>
            <div class="dialog-body">${msg}</div>
            <div class="dialog-footer">`;
            
        if(btns){
            for( let i=0; i<btns.length; i++){
                html += '<button class="dialog-btn" name="'+i+'">'+btns[i]+'</button>';
            }
        }
        
        html += '</div>';
        div.innerHTML = html;
        function eventFn(e){
            if(/dialog-close/.test(e.target.className)){
                div.removeEventListener('click', eventFn);
                if(fn) fn.call(e.target,-1);
                parentNode.removeChild(div);
                return;
            }else if(/dialog-btn/.test(e.target.className)){
                div.removeEventListener('click', eventFn);
                if(fn) fn.call(e.target, parseInt(e.target.name));
                parentNode.removeChild(div);
            }
        }
        div.addEventListener('click', eventFn);
        parentNode.appendChild(div);
        return {
            el: div,
            remove(){
                parentNode.removeChild(div);
                div.removeEventListener('click', eventFn);
            }
        };
    },
    draggable(node, dragnode){
        let sx = 0,
            sy = 0,
            ol = node.offsetLeft,
            ot = node.offsetTop;
        dragnode.addEventListener('mousedown', function(e){
            e.preventDefault();
            sx = e.clientX;
            sy = e.clientY;
            ol = node.offsetLeft;
            ot = node.offsetTop;
            dragnode.addEventListener('mousemove', moveFn, false);
            document.addEventListener('mouseup', endFn, false);
        }, false);
        function moveFn(e){
            e.preventDefault();
            node.style.left = (e.clientX - sx + ol) + 'px';
            node.style.top = (e.clientY - sy + ot) + 'px';
        }
        function endFn() {
            dragnode.removeEventListener('mousemove', moveFn, false);
            document.removeEventListener('mouseup', endFn, false);
        }
    }
};


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

const win = nw.Window.get();
    config = __webpack_require__(0),
    Media = __webpack_require__(5),
    utils = __webpack_require__(1),
    capture = __webpack_require__(6),
    videoEl = document.createElement('video'),
    inputEl = document.createElement('input'),
    outputEl = document.createElement('input');

win.on('loaded',()=>{
    win.width = screen.availWidth;
    win.height = screen.availHeight;
    win.x = win.y = 0;
    win.show();
});

const showThumb = (item)=>{
    if(!item) return;
    Media.thumb({
        input: item.path,
        time: item.currentTime,
        success(src){
            item.thumb = src;
        },
        fail(){
            console.log(arguments);
        }
    });
};


const vue = new Vue({
	el: '#app',
	data: {
        appInfo: config.appInfo,
		output: config.output.folder,
        items: {}, 
		winToggle: true,
        batchParams: {
            speed: 'slow',
            nameAll: 'fup00',
            widthLimit: config.output.width,
            heightLimit: config.output.height,
            sizeLimit: 0
        },
        toolbar: {
            mainSubmenu: 0,
            showAlpha: 0,
            lock: 1
        },
        active: {
            mainSubmenu: ''
        },
        capParams: {
            mode: 0,
            bitv: config.output.bitv,
            bita: config.output.bita,
            widthLimit: config.output.width,
            width: screen.width,
            height: screen.height,
            x: 0,
            y: 0,
            fps: config.output.fps,
            audioDevices: [],
            audioDevice: ''
        },
        tunstep: 2
	},
    created(){
        inputEl.type = outputEl.type = 'file';
        inputEl.multiple = true;
        outputEl.nwdirectory = true;
        inputEl.addEventListener('change', (e)=>{
            let target = e.target,
                files = target.files,
                i = 0,
                item,
                key;
            if(files.length){
                for(key in vue.items) vue.$delete(vue.items, key);
                recycle(files[0]);
                function recycle(file){
                    item = {
                        path: file.path,
                        thumb: config.loadingGif,
                        canplay: !!videoEl.canPlayType(file.type),
                        playing: 0,
                        progress: 0,
                        lock: vue.toolbar.lock,
                        alpha: vue.toolbar.showAlpha,
                        bitv: 0,
                        bita: 0,
                        type: '',
                        series: false,

                        duration: 0,
                        startTime: 0,
                        endTime: 0,
                        currentTime: 0,
                        coverTime: 0,
                        cover: false,

                        name: file.name,
                        toname: file.name.slice(0, file.name.lastIndexOf('.')),

                        size: file.size,
                        quality: 0,

                        scale: 0,
                        width: 0,
                        towidth: 0,
                        height: 0,
                        toheight: 0,

                        format: '',
                        toformat: '',

                        fps: 0,
                        tofps: 0
                    };

                    vue.$set(vue.items, key = Object.keys(vue.items).length, item);

                    Media.info({
                        input: file.path,
                        success: (json)=>{
                            item.thumb = json.thumb;
                            item.bitv = json.bitv <= config.output.bitv ? json.bitv : config.output.bitv;
                            item.bita = json.bita <= config.output.bita ? json.bita : config.output.bita;
                            item.type = json.type;

                            item.duration = item.endTime = json.duration;

                            item.quality = utils.qualitymat(item.bitv, item.bita, item.duration, item.size);
                            
                            item.scale = json.height / json.width;
                            item.width = item.towidth = json.width;
                            item.height = item.toheight = json.height;

                            item.format = json.ext;
                            item.toformat = Media.is(item.format, item.type) ? item.format : config.output.format[ item.type ];

                            item.fps = json.fps;
                            item.tofps = json.fps;

                            i++;
                            if(files[i]) recycle(files[i]);
                        },
                        fail: (err)=>{
                            utils.dialog('提示：',
                            '<p>文件：“'+file.name+'”可能不支持！错误信息：'+err+'。是否保留以尝试转码？</p>',
                            ['是','否'],
                            (code)=>{
                                if(code === 1) vue.$delete(vue.items, key);
                                i++;
                                if(files[i]) recycle(files[i]);
                            });
                        }
                    });
                }
            }
        });

        outputEl.addEventListener('change', (e)=>{
            vue.output = e.target.files[0].path || '';
        });
    },
	methods: {
        titlebarFn(name){
            switch(name){
                case 'min':
                {
                    win.minimize();
                }
                break;
                case 'toggle':
                {
                    let w = screen.width * .8,
                        h = Math.round(w * .5625),
                        x = (screen.width - w) / 2,
                        y = (screen.height - h) / 2;
                    if(vue.winToggle = !vue.winToggle){
                        win.maximize();
                    }else{
                        win.moveTo(x, y);
                        win.resizeTo(w, h);
                    }
                }
                break;
                case 'close':
                {
                    win.close(true);
                    win = null;
                }
            }
        },
        toolbarFn(e,name){
            let target = e.target,
                key;

            if(name !== 'mainSubmenu') vue.toolbar.mainSubmenu = '';
            if(vue.toolbar.hasOwnProperty(name)){
                vue.toolbar[name] = !vue.toolbar[name];
            }
            switch(name){
                case 'mainSubmenu':
                {
                    let mainSubmenu = vue.$refs.mainSubmenu;
                    vue.active.mainSubmenu = 1;
                    if(target.tagName !== 'BUTTON'){
                        target = target.parentNode;
                    }
                    mainSubmenu.style.top = (target.offsetTop + target.offsetHeight)+ 'px';
                    mainSubmenu.style.left = target.offsetLeft + 'px';
                }
                break;
                case 'chosefile': inputEl.click(); break;
                case 'chosedir': outputEl.click(); break;
                case 'lock':
                {
                    for(key in vue.items) vue.items[key].lock = vue.toolbar.lock;
                }
                break;
                case 'clear':
                {
                    for(key in vue.items) vue.$delete(vue.items, key);
                }
                break;
                case 'convert':
                {
                    for(key in vue.items){
                        console.log(vue.items[key].name);
                    }
                }
                break;    
                case 'showAlpha': vue.showAlpha = !vue.showAlpha;
            }
        },
        mainSubmenuFn(e,name){
            let target, panel, i = 0, item;
            vue.active.mainSubmenu = name;
            if(name === 'firstAid'){
                utils.dialog('警告：','<p>为了避免失误操作，必须谨慎选择是否真的启用急救，不到万不得已，请不要轻易启用！</p>',['启用','关闭'],(code)=>{
                    if(code === 0){
                        Media.killAll((msg)=>{
                            utils.dialog('提示：','<p>所有可能的错误程序已被清除！<br>详细：'+msg+'</p>');
                        });
                    }
                });
            }else{
                item = vue.items[ Object.keys(vue.items)[i] ];
                switch(name){
                    case 'convert':
                    {

                    }
                    break;
                    case 'vtogif':
                    function vtogif(){
                        if(item.type === 'video'){
                            let w = item.towidth%2 === 0 ? item.towidth : item.towidth - 1,
                                h = item.toheight%2 === 0 ? item.toheight : item.toheight - 1,
                                t = item.endTime - item.startTime,
                                cammand = ['-i', item.path, '-s', w+'x'+h, '-y', vue.output+'\\'+item.toname + '.gif'];
                            if(item.endTime < item.duration && t > 0) cammand.unshift('-t', t);
                            if(item.startTime > 0) cammand.unshift('-ss', item.startTime);

                            Media.convert({
                                cammand,
                                progress(cur){
                                    item.progress = (cur / t)*100;
                                },
                                complete(code, msg){
                                    if(code !== 0){
                                        utils.dialog('失败','<p>'+msg+'</p>');
                                    }else{
                                        item.progress = 100;
                                    }

                                    item = vue.items[ Object.keys(vue.items)[++i] ];
                                    if(item) vtogif(item);
                                }
                            });
                        }
                    }
                    vtogif();
                    break;
                    case 'giftov':
                    function giftov(){
                        if(item.format === 'gif'){
                            let w = item.towidth%2 === 0 ? item.towidth : item.towidth - 1,
                                h = item.toheight%2 === 0 ? item.toheight : item.toheight - 1;

                            Media.convert({
                                cammand: ['-i', item.path, '-s', w+'x'+h, '-pix_fmt', 'yuv420p', '-y', vue.output+'\\'+item.toname + '.mp4'],
                                progress(){
                                    item.progress = 50;
                                },
                                complete(code, msg){
                                    if(code !== 0){
                                        utils.dialog('失败','<p>'+msg+'</p>');
                                    }else{
                                        item.progress = 100;
                                        item = vue.items[ Object.keys(vue.items)[++i] ];
                                        if(item) giftov(item);
                                    }
                                }
                            });
                        }
                    }
                    giftov();
                    break;
                    case 'ptogif':
                    function ptogif(){
                        let reg,
                            d,
                            input,
                            w = item.towidth%2 === 0 ? item.towidth : item.towidth - 1,
                            h = item.toheight%2 === 0 ? item.toheight : item.toheight - 1;
                        if(item){
                            reg = new RegExp('(\\d+)\\.'+item.format+'$','i');
                            d = reg.exec(item.path);
                            if(d && d[1]){
                                input = item.path.replace(reg, function($0,$1){
                                    return '%0'+$1.length+'d.'+item.format;
                                });
                                Media.convert({
                                    cammand: ['-r', 25,'-i', input, '-s', w+'x'+h, '-y', vue.output+'\\'+item.toname + '.gif'],
                                    progress(){
                                        item.progress = 50;
                                    },
                                    complete(code, msg){
                                        if(code !== 0){
                                            utils.dialog('失败','<p>'+msg+'</p>');
                                        }else{
                                            item.progress = 100;
                                            item = vue.items[ Object.keys(vue.items)[++i] ];
                                            if(item) ptogif(item);
                                        }
                                    }
                                });
                            }else{
                                utils.dialog('失败：',
                                    `<p>系列图不满足条件！</p>
                                    <p>系列图名称必须是有规律、等长度、末尾带系列化数字的名称。</p>
                                    <p>如：001.png、002.png、003.png... 或 img01.png、img02.png、img03.png...</p>
                                    <p>然后只需要选择第一张图片即可</p>`);
                            }
                        }
                    }
                    ptogif();     
                    break;
                    case 'vtoa':
                    function vtoa(){
                        if(item.bita > 0){
                            let t = item.endTime - item.startTime,
                                cammand = ['-i', item.path, '-vn', '-b:a', item.bita+'k', '-y', vue.output+'\\'+item.toname + '.mp3'];

                            if(item.endTime < item.duration && t > 0) cammand.unshift('-t', t);
                            if(item.startTime > 0) cammand.unshift('-ss', item.startTime);
                            Media.convert({
                                cammand,
                                progress(cur){
                                    item.progress = (cur / t)*100;
                                },
                                complete(code, msg){
                                    if(code !== 0){
                                        utils.dialog('失败','<p>'+msg+'</p>');
                                    }else{
                                        item.progress = 100;
                                        item = vue.items[ Object.keys(vue.items)[++i] ];
                                        if(item) vtoa(item);
                                    }
                                }
                            });
                        }
                    }
                    vtoa();
                    break;  
                }
            }
            
        },
        batchParamsFn(e,name){
            let target = e.target,
                val = parseInt(target.value) || 0;
            switch(name){
                case 'widthLimit':
                {
                    target.value = val > config.output.width ? config.output.width : val;
                }
                break;
                case 'heightLimit':
                {
                    target.value = val > config.output.height ? config.output.height : val;
                }
                break;
                case 0:
                {
                    let sizeLimit = parseFloat(vue.$refs.sizeLimitEl.value) || 0,
                        wl = parseInt(vue.$refs.widthLimitEl.value) || 0,
                        hl = parseInt(vue.$refs.heightLimitEl.value) || 0,
                        scale = hl / wl,
                        quality,
                        item,
                        key,
                        n = 0;
                    vue.active.mainSubmenu = 0;
                    vue.batchParams.widthLimit = wl;
                    vue.batchParams.heightLimit = hl;
                    vue.batchParams.sizeLimit = sizeLimit*1024*1024;

                    for( key in vue.items){
                        item = vue.items[key];
                        if(item.lock){
                            if(item.scale > scale){
                                item.toheight = hl;
                                item.towidth = hl / item.scale;
                            }else{
                                item.towidth = wl;
                                item.toheight = wl * item.scale;
                            }
                            quality = (vue.batchParams.sizeLimit / item.size * 100).toFixed(2);
                            if(quality < item.quality) item.quality = quality;
                            item.toname = utils.namemat(vue.batchParams.nameAll, ++n);
                        }
                    }
                }
                break;
                case -1:
                {
                    vue.active.mainSubmenu = 0;
                }
            }
        },
        nameAllFn(code){
            vue.active.mainSubmenu = 0;
            if(code === -1) return;

            let nameAllCallback, recycle, output, n;
                n = 0;
                i = 0;
                k = Object.keys(vue.items)[0];
                item = vue.items[k];
                
                nameAllCallback = (err)=>{
                    item = vue.items[k];
                    if(err){
                        utils.dialog('警告：','有文件重命名失败，详细错误：'+err.toString(),['关闭'], ()=>{
                            if(item) recycle(item);
                        });
                    }else{
                        if(item) recycle(item);
                    }
                };
                recycle = (item)=>{
                    k = Object.keys(vue.items)[++n];
                    if(item.lock){
                        i++;
                        output = vue.output +'\\'+ utils.namemat(vue.batchParams.nameAll, i) +'.'+ item.format;
                        if(code === 1){
                            Media.rename(item.path, output, nameAllCallback);
                        }else if(code === 2){
                            Media.copyFile(item.path, output, nameAllCallback);
                        }
                    }
                };
                if(item){
                    recycle(item)
                }else{
                    utils.dialog('失败：','没有输入文件！');
                }
        },
        captureFn(e,code){
            let params = vue.capParams,
                output;
            switch(code){
                case 1:
                {
                    params.mode = parseInt(e.target.value);
                }
                break;
                case 2:
                {
                    capture.audioDevices((err, list)=>{
                        if(err){
                            utils.dialog('失败：','<p>'+err+'</p>');
                        }else{
                            let i = 0, len, devices = params.audioDevices;
                            len = list.length;
                            devices.splice(0, devices.length);
                            for(; i<len; i++){
                                if(i%2 === 0){
                                    devices.push(list[i]);
                                }
                            }
                            params.audioDevice = devices[0];
                        }
                    });
                }
                break;
                case 3:
                {
                    capture.setArea(640, 360, (x, y, w, h)=>{
                        params.x = x;
                        params.y = y;
                        params.width = w;
                        params.height = h;
                    });
                }
                break;
                case 0:
                {
                    if(params.mode !== 4 && params.fps > 60){
                        utils.dialog('提示：','<p>帧速率不能超过 60</p>');
                        return;
                    }
                    if(params.mode !== 2 && params.mode !== 3 && !params.audioDevice){
                        utils.dialog('提示：','<p>无可用于录制音频的设备，请检测设备或查看帮助文档。</p>');
                        return;
                    }
                    output = vue.output + '\\'+vue.batchParams.nameAll;
                    if(params.mode === 4){
                        output += '.mp3';
                    }else{
                        output += '.mp4';
                    }
                    capture.progress = (time)=>{
                        console.log(time);
                    }
                    capture.complete = (err)=>{
                        if(err) utils.dialog('失败：','<p>错误码：'+err.code+'</p>'+err.message);
                    }
                    capture.start(output, vue.capParams);
                }
                break;
                case -1:
                {
                    vue.active.mainSubmenu = '';
                }
            }
        },
        itemFn(e, index, str){
        	let item = vue.items[index],
                target = e.target,
                step,
                tmptime;
        	switch(str){
        		case 'del':
                {
                    vue.$delete(vue.items, index);
                }
                break;
        		case 'lock':
                {
                    item.lock = !item.lock;
                }
                break;
                case 'alpha':
                {
                    item.alpha = !item.alpha;
                }
                break;
                case 'reset':
                {
                    item.toname = item.name.slice(0, -item.format.length-1);
                    item.toformat = Media.is(item.format, item.type) ? item.format : config.output.format[ item.type ];
                    item.quality = utils.qualitymat(item.bitv, item.bita, item.duration, item.size);
                    item.startTime = 0;
                    item.endTime = item.duration;
                    item.cover = false;
                    item.coverTime = 0;
                    item.towidth = item.width;
                    item.toheight = item.height;
                }
                break;
                case 'currentTime':
                {
                    vue.$refs['id'+index][0].pause();
                    item.currentTime = parseFloat(target.value);
                }
                break;
                case 'timeSlide':
                {
                    if(item.canplay){
                        vue.$refs['id'+index][0].currentTime = item.currentTime;
                    }else if(item.type === 'video'){
                        showThumb(item);
                    }
                }
                break;
                case 'prevFrame':
                {
                    step = (1/item.fps)*vue.tunstep;
                    if(item.currentTime > step){
                        item.currentTime -= step;
                    }else{
                        item.currentTime = 0;
                    }
                    if(item.canplay){
                        let video = vue.$refs['id'+index][0];
                        video.pause();
                        video.currentTime = item.currentTime;
                    }else if(item.type === 'video'){
                        showThumb(item);
                    }
                }
                break;
                case 'nextFrame':
                {
                    step = (1/item.fps)*vue.tunstep;
                    if(item.currentTime < item.duration - step){
                        item.currentTime += step;
                    }else{
                        item.currentTime = item.duration;
                    }
                    if(item.canplay){
                        let video = vue.$refs['id'+index][0];
                        video.pause();
                        video.currentTime = item.currentTime;
                    }else if(item.type === 'video'){
                        showThumb(item);
                    }
                }
                break;
                case 'setstart':
                {
                    item.startTime = item.currentTime;
                    if(item.startTime > item.endTime){
                        item.endTime = item.startTime;
                    }
                }
                break;
                case 'setend':
                {
                    if(item.currentTime < item.startTime){
                        item.startTime = item.currentTime;
                    }
                    item.endTime = item.currentTime;
                }
                break;
                case 'setcover':
                {
                    item.coverTime = item.currentTime;
                }
                break;
        		case 'towidth':
                {
        			item.towidth = parseInt(target.value) || 0;
                    item.toheight = Math.round(item.towidth * item.scale);
        		}
                break;
        		case 'toheight':
                {
        			item.toheight = parseInt(target.value) || 0;
                    item.towidth = Math.round(item.toheight / item.scale);
        		}
        	}
        },
        videoFn(e, index, type){
            let item = vue.items[index],
                video = e.target;
            switch(type){
                case 'timeupdate':
                    item.currentTime = video.currentTime;
                    break;
                case 'play':
                    item.playing = true;
                    break;
                case 'pause':
                    item.playing = false;
            }
        },
        play(e, index){
            let item = vue.items[index],
                video;
            if(!item.canplay) return;
            video = vue.$refs['id'+index][0];
            video.currentTime = item.currentTime;
            if(video.paused){
                video.play();
            }else{
                video.pause();
            }
        }
	},
	filters: {
		timemat(t){
			return utils.timemat(t*1000);
		},
		sizemat: utils.sizemat,
        mathRound(val){
            return Math.round(val);
        },
        viewNamemat(val){
            let html = '', i = 1;
            for(; i<4; i++){
                html += utils.namemat(val, i)+'.mp4 、 ';
            }
            html += '...'
            return html;
        }
	},
    directives: {
        child: {
            bind(el, binding){
                el.innerHTML = '';
                el.appendChild(binding.value);
            }
        }
    }
});

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(2),
childprocess = __webpack_require__(3),
config = __webpack_require__(0),
utils = __webpack_require__(1);

module.exports = {
    ffmpeg: null,
    //第一个子数组为支持直接预览的格式，第二个需要转码
    formats: {
        image: [['jpg','jpeg','png','gif','webp','svg','ico','bmp','jps','mpo'],['tga','psd','iff','pbm','pcx','tif']],
        video: [['mp4','ogg','webm'],['ts','flv','mkv','rm','mov','wmv','avi','rmvb']],
        audio: [['aac','mp3','wav','mpeg'],['wma','mid']]
    },
    is(ext,name,bool){
        if(!bool){
            return this.formats[name][0].indexOf(ext) !== -1;
        }
        return this.formats[name][0].indexOf(ext) !== -1 && this.formats[name][1].indexOf(ext) !== -1;
    },
    metadata(url,success,fail){
        let ext = url.slice(url.lastIndexOf('.')+1).toLowerCase(),
            json = {
                duration: 0,
                bit: 0,
                bitv: 0,
                bita: 0,
                width: 0,
                height: 0,
                fps: 0,
                ext: ext,
                type: null
            },
            status = true,

            ffmpeg = childprocess.exec(config.ffmpegRoot+'\\ffmpeg.exe -hide_banner -i "'+url+'" -vframes 1 -f null -', (err,stdout, stderr)=>{
                // console.log(stderr.toString());
            let lines = stderr.split(/\n/), i = 0, len = lines.length, line, match;

            for(; i < len; i++){
                line = lines[i].trim();
                if(/(^stream\s*mapping)|(^output)/i.test(line)) break;
                if( match = /^duration\s*:\s*([\s\S]*?)\s*,[\s\S]*?bitrate\s*:\s*([\d\.]+)\s*kb\/s$/i.exec( line ) ){
                    let times = match[1].toString().split(':');
                    json.duration = parseInt(times[0])*3600 + parseInt(times[1])*60 + parseFloat(times[2]);
                    json.bit = parseFloat(match[2]);
                }
                else if(match = /^stream[\s\S]*?video\s*:\s*([\s\S]*?)$/i.exec( line )){
                    let size, fps, bitv;
                    if( size = /,\s*(\d+)x(\d+)/i.exec(match[1]) ){
                        json.width = parseFloat(size[1]);
                        json.height = parseFloat(size[2]);
                    }
                    if( fps = /,\s*([\d\.]+)\s*fps\s*,/i.exec(match[1]) ){
                        json.fps = parseFloat(fps[1]);
                    }
                    if( bitv = /,\s*([\d\.]+)\s*kb\/s/i.exec(match[1]) ){
                        json.bitv = parseFloat(bitv[1]);
                    }
                }
                else if(match = /^stream[\s\S]*?audio\s*:[\s\S]*?([\d\.]+)\s*kb\/s/i.exec( line ) ){
                    json.bita = parseFloat(match[1]);
                }
            }

            if(json.width > 0 && json.height > 0){
                if(json.fps === 0 || json.ext === 'gif'){
                    json.type = 'image';
                    if(json.ext !== 'gif') json.duration = 0;
                }else{
                    json.type = 'video'; 
                }
            }else if(json.bita > 0){
                json.type = 'audio';
            }

            if(json.bit <= 0){
                json.bit = json.bita + json.bitv;
            }

        }).once('close',(a,b)=>{
            if(a === 0){
                if(success) success(json);
            }else{
                if(status && fail){
                    status = false;
                    fail(a,b);
                }
            }
        }).once('error', (err)=>{
            try{
                ffmpeg.kill();
            }catch(e){}
            if(status && fail){
                status = false;
                fail(err);
            }
        });
    },
    thumb(o){
        let wmax = o.widthLimit || 480,
            w = o.width || wmax,
            h = o.height || wmax*.5625,
            format = o.format === 'jpg' ? 'image2' : (o.format === 'gif' ? 'gif': 'apng'),
            status = true,
            ffmpeg,
            thumb;
        if(w > wmax){
            h = Math.round((o.height/o.width)*wmax);
            w = Math.round(wmax);
        }
        if(h%2 !== 0) h--;
        if(w%2 !== 0) w--;
        ffmpeg = childprocess.exec(config.ffmpegRoot+'\\ffmpeg.exe -ss '+(o.time || '00:00:00')+' -i "'+o.input+'" -vframes 1 -s '+w+'x'+h+' -y  -f '+format+' "'+config.appRoot+'cache/thumb"',(err,stdout,stderr)=>{
            if(!err){
                let tmp = fs.readFileSync(config.appRoot+'cache/thumb');
                thumb = window.URL.createObjectURL(new Blob([tmp], {type:'image/'+o.format}));
                tmp = null;
            }else{
                if(status && o.fail){
                    status = false;
                    o.fail(err);
                }
            }
        }).once('close', (a,b)=>{
            if(a === 0){
                o.success(thumb);
            }else{
                if(status && o.fail){
                    status = false;
                    o.fail(a,b);
                }
            }
        }).once('error', (e)=>{
            try{
                ffmpeg.kill();
            }catch(e){}
            if(status && o.fail){
                status = false;
                o.fail(e);
            }
        });
    },
    info(o){
        let self = this;
        if(!o.input) {
            utils.dialog('地址错误：','<p>无效媒体文件地址!</p>');
            return;
        }
        if(!o.success) return;
        self.metadata(o.input,(json)=>{
            json.thumb = '';
            if(json.type === 'audio'){
                json.thumb = config.audioThumb;
                o.success(json);
            }else{
                if(self.is(json.ext,'image')){
                    json.thumb = o.input;
                    o.success(json);
                }else{
                    self.thumb({
                        widthLimit: o.widthLimit,
                        format: o.format,
                        input: o.input,
                        width: json.width,
                        height: json.height,
                        success(thumb){
                            json.thumb = thumb;
                            o.success(json);
                        },
                        fail(a,b){
                            o.fail(a,b);
                        }
                    });
                }
            }
        }, o.fail);
    },
    killAll(fn){
        childprocess.exec('TASKKILL /F /IM ffmpeg.exe', (err,stdout, stderr)=>{
            if(fn) fn(stderr.toString());
        });
    },
    onExists(file, stderr, stdin){
        let self = this;
        self.exitCode = 0;
        if(/File[\s\S]*?already[\s\S]*?exists[\s\S]*?Overwrite[\s\S]*?\[y\/N\]/i.test(stderr.toString())){
            utils.dialog(
                '提示：',
                '<p>文件：'+file+'已存在，是否覆盖？<p>',
                ['覆盖','退出'],
                (code)=>{
                    if(code === 0){
                        stdin.write('y\n');
                    }else{
                        stdin.write('N\n');
                    }
                    self.exitCode = 1;
                });
        }
    },
    convert(o){
        let self = this,
            ffmpeg,
            line;

        if(!o.cammand) return;
        if(!o.cammand.length) return;
        o.cammand.unshift('-hide_banner');

        ffmpeg = childprocess.spawn(config.ffmpegRoot+'\\ffmpeg.exe', o.cammand);
        ffmpeg.stderr.on('data', (stderr)=>{
            if(o.progress){
                line = stderr.toString();
                line = /time=\s*([\d\:\.]+)?/.exec(line);
                if(line) o.progress( utils.timemat(line[1]) / 1000 );
            }
        });
        ffmpeg.once('close', (a, b)=>{
            if(o.complete) o.complete(a, (a !== 0) ? '处理失败 ' + b : b);
        });
        ffmpeg.once('error', (err)=>{
            if(o.complete) o.complete(2, '启动失败 '+err);
        });
    },
    exitCode: 0,
    compressImg(o){
        let self = this,
            w = 0,
            h = 0;
        self.metadata(o.input, (json)=>{
            w = json.width;
            h = json.height;
            if(w > config.output.width){
                h = Math.round(config.output.width*h/w);
                w = config.output.width;
            }

            o.complete(0);

            self.ffmpeg = childprocess.spawn(config.ffmpegRoot+'/ffmpeg.exe', ['-hide_banner','-i', o.input, '-s', w+'x'+h, '-compression_level', Math.round((1-o.quality)*100), o.output]);
            self.ffmpeg.stderr.on('data', (stderr)=>{
                self.onExists(o.output, stderr, self.ffmpeg.stdin);
            });
            self.ffmpeg.once('close',(a,b)=>{
                self.ffmpeg.kill();
                self.ffmpeg = null;
                if(a === 0){
                    o.complete(100);
                }else{
                    if(self.exitCode === 0) return;
                    utils.dialog('失败：','<p>压缩失败！</p>');
                }
            });
            self.ffmpeg.once('error',()=>{
                self.ffmpeg.kill();
                self.ffmpeg = null;
                utils.dialog('失败：','<p>错误！</p>');
            });
        }, (msg)=>{
            utils.dialog('失败：','<p>获取媒体元数据信息失败！</p>');
        });
    },
    rename(oldname, newname, callback){
        fs.access(newname, (err)=>{
            if(!err){
                callback('文件【'+newname+'】'+'已存在!');
            }else{
                fs.rename(oldname, newname, callback);
            }
        });
    },
    copyFile(oldname, newname, callback){
        fs.access(newname, (err)=>{
            if(!err){
                callback('文件【'+newname+'】'+'已存在!');
            }else{
                fs.copyFile(oldname, newname, callback);
            }
        });
    }
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

const win = nw.Window.get(),
config = __webpack_require__(0),
utils = __webpack_require__(1),
{spawn} = __webpack_require__(3),
fs = __webpack_require__(2);

const capture = {
	ffmpeg: null,
	audioDevices(fn){
		if(typeof fn === 'function'){
			let lines, line, list, ffmpeg, error = null;

			list = [];

			ffmpeg = spawn(config.ffmpegRoot+'\\ffmpeg.exe', ['-hide_banner','-list_devices','true','-f','dshow','-i','dummy']);
			ffmpeg.stderr.on('data', (stderr)=>{
				lines += stderr.toString();
			});
			ffmpeg.once('exit', (a,b)=>{
				lines = lines.split(/\n+/);
				while(line = lines[0]){
					lines.splice(0,1);
					if(/DirectShow\s+audio\s+devices/i.test(line)) break;
				}
				while(line = lines[0]){
					lines.splice(0,1);
					if(/\[dshow[^\]]*?\]/i.test(line)){
						list.push( line.slice(line.indexOf('\"')+1, line.lastIndexOf('\"')) );
					}
				}
				if(!list.length){
					error = new Error('获取录音设备失败，当前计算机没有可用的录音设备或者未开启，请查看帮助文档。');
				}
				fn(error, list);
			});
			ffmpeg.once('error',(err)=>{
				if(!error) fn(err, list);
			});
			this.ffmpeg = ffmpeg;
		}
	},
	setArea(initWidth, initHeight, fn){
		if(typeof fn !== 'function') return false;
		nw.Window.open('html/capture.html',{
		    id: 'cutscreen',
		    position: 'center',
		    transparent: true,
		    new_instance: false,
		    frame: false,
		    focus: true,
		    width: initWidth,
		    height: initHeight,
		    always_on_top: true
		}, (childWin)=>{
			let childDoc = childWin.window.document;
			let onEnter = (e)=>{
				//on Enter
				if(e.keyCode === 13){
					childDoc.removeEventListener('keyup',onEnter);
					fn(childWin.x, childWin.y, childWin.width, childWin.height);
					childWin.close();
				}
				//on Esc
				else if(e.keyCode === 27){
					childDoc.removeEventListener('keyup',onEnter);
					childWin.close();
				}
			}
			childDoc.addEventListener('keyup', onEnter);
		});
	},
	progress: null,
	complete: null,
	go(){
		win.moveTo(-screen.width-50, 0);
	},
	back(){
		win.maximize();
	},
	shortcut(key,fail){
		let self = this;
		try{
			document.removeEventListener('keyup', keyupFn);
		}catch(err){}

		document.addEventListener('keyup', keyupFn);
		function keyupFn(e){
			if(e.keyCode === 113 || e.keyCode === 27){
				document.removeEventListener('keyup',keyupFn);
				self.back();
				self.end();
			}
		}
	},
	end(){
		if(this.ffmpeg){
			this.ffmpeg.stdin.end('q\n');
		}
	},
	start(output, o){
		let ffmpeg, cammand, line, log, error, isComplete, sw, sh, w, h, scale, rw, rh;
		//删除日志文件
		try{
			fs.unlinkSync(config.logPath);
		}catch(err){}
		error = null;
		isComplete = false;
		sw = screen.width;
		sh = screen.height;
		//如果是全屏
		if(o.mode === 0 || o.mode === 2) scale = sh / sw;
		//如果有视频
		if(o.mode !== 4){
			cammand = ['-hide_banner', '-r', o.fps, '-f','gdigrab', '-i', 'desktop', '-rtbufsize', '2048M', '-vcodec', 'libx264', '-b:v', o.bitv+'k', '-pix_fmt', 'yuv420p', '-profile:v', 'high','-y', output];
		}
		//如果有音频
		if(o.mode === 0 || o.mode === 1){
			cammand.splice(9, 0, '-f','dshow','-i','audio='+o.audioDevice, '-acodec', 'aac', '-b:a', o.bita+'k');
		}
		//如果不是全屏
		if(o.mode === 1 || o.mode === 3){
			w = o.width;
			h = o.height;
			scale = h / w;
			//不能超出屏幕
			if((w + o.x) > sw) w = sw - o.x;
			if((h + o.y) > sh) h = sh - o.y;
			//不能为单数
			if(w % 2 !== 0) w--;
			if(h % 2 !== 0) h--;

			cammand.splice(3, 0, '-offset_x', o.x,'-offset_y', o.y,'-video_size', w+'x'+h);
		}
		//缩放匹配宽度上限
		if(scale){
			rw = o.widthLimit;
			rh = Math.round(rw * scale);
			if(rw % 2 !== 0) rw--;
			if(rh % 2 !== 0) rh--;
			cammand.splice(cammand.length - 2, 0, '-s', rw+'x'+rh);
		}
		//如果只有音频
		if(o.mode === 4){
			cammand = ['-hide_banner', '-f', 'dshow', '-i', 'audio='+o.audioDevice, '-b:a', o.bita+'k', '-y', output];
		}
		checkOutput();
		function checkOutput(){
			fs.access(output, (err)=>{
				if(!err){
					utils.dialog(
					'提示：',
					`<p>输出的文件：${output}已存在或不可访问，是否覆盖？</p>`,
					['覆盖','重试','取消'],
					(code)=>{
						if(code === 0){
							begin();
						}else if(code === 1){
							checkOutput();
						}
					});
				}else{
					begin();
				}
			});
		}
		function begin(){
			log = fs.createWriteStream(config.logPath, {  
				flags: 'a',  
				encoding: 'utf-8',  
				mode: 0666
			});
			capture.shortcut();
			capture.go();
			ffmpeg = spawn(config.ffmpegRoot + '\\ffmpeg.exe', cammand);
			ffmpeg.stderr.on('data', (stderr)=>{
				line = stderr.toString();
				if(typeof capture.progress === 'function' && (line = /time=\s*([\d\:\.]*?)\s+/i.exec(line)) ){
					capture.progress(line[1]);
				}
				log.write('<p>'+stderr.toString()+'</p>');
			});
			ffmpeg.once('close', (a, b)=>{
				if(a !== 0){
					error = new Error('<p>录制失败：</p><p>'+fs.readFileSync(config.logPath,'utf-8')+'</p>');
					error.code = 1;
				}
				complete();
			});
			ffmpeg.once('error', ()=>{
				if(!error){
					error = new Error('<p>启动失败：</p><p>'+fs.readFileSync(config.logPath,'utf-8')+'</p>');
					error.code = 2;
				}
				complete();
			});
			capture.ffmpeg = ffmpeg;
		}
		function complete(){
			capture.back();
			if(!isComplete && (typeof capture.complete === 'function')){
				capture.complete(error);
				isComplete = true;
			}
			log.end();
		}
	}
}

module.exports = capture;

/***/ })
/******/ ]);