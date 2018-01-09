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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

const cwd = process.cwd();
const appRoot = cwd + '\\';
module.exports = {
	appRoot: appRoot,
	ffmpegRoot: appRoot + 'plugins\\ffmpeg',
	audioThumb: appRoot + 'css/audio.jpg',
	loadingGif: appRoot + 'css/loading.gif',
	icon: appRoot + 'css/icon.png',
	output: {
		folder: process.env.USERPROFILE+'/desktop',
		width: 1280,
		bitv: 1024,
		bita: 128,
		format: {
			image: 'jpg',
			video: 'mp4',
			audio: 'mp3'
		}
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
        if(typeof time === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(time)){
            t = time.split(':');
            return (parseInt(t[0]*3600) + parseInt(t[1]*60) + parseInt(t[2])) * 1000;
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
    dialog(title, msg, btns, fn, context){
        let div = document.createElement('div'),
            parentNode = context || document.body,
            html;
        div.className = 'dialog';
        html = `<div class="dialog-title">${title}<i class="icon icon-cross"></i></div>
            <div class="dialog-body">${msg}</div>
            <div class="dialog-footer">`;
            
        if(btns){
            for( let i=0; i<btns.length; i++){
                html += '<button name="'+i+'">'+btns[i]+'</button>';
            }
        }
        
        html += '</div>';
        div.innerHTML = html;
        div.addEventListener('click',function(e){
            if(/^icon\s+icon-\w+$/.test(e.target.className)){
                if(fn) fn.call(e.target,-1);
                parentNode.removeChild(div);
                return;
            }else if(e.target.hasAttribute('name')){
                if(fn) fn.call(e.target, parseInt(e.target.name));
                parentNode.removeChild(div);
            }
        });
        parentNode.appendChild(div);
        return div;
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
/***/ (function(module, exports, __webpack_require__) {

const win = nw.Window.get();
const config = __webpack_require__(0);
const Media = __webpack_require__(3);
const utils = __webpack_require__(1);
const screencap = __webpack_require__(6);
const showThumb = (item)=>{
    if(!item) return;
    Media.thumb({
        input: item.path,
        time: item.currentTime,
        success(src){
            item.video.poster = src;
        },
        fail(){
            console.log(arguments);
        }
    });
};
const vue = new Vue({
	el: '#app',
	data: {
		items: [],
		output: config.output.folder,
		isFullScreen: true,
		defwidth: config.output.width,
		dropSlidedown: false,
		nameAll: 'fup',
		widthLimit: 1280,
		heightLimit: 720,
		sizeLimit: 0,
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
        speedLevel: 'slow',
        mediaIcon: {
            image: 'icon-image',
            video: 'icon-video-camera',
            audio: 'icon-headphones'
        },
        alpha: false,
        tunstep: 2
	},
	methods: {
		minimize(){
			win.minimize();
		},
		wintoggle(){
			let w = screen.availWidth, h = screen.availHeight;
            if(win.width < w || win.height < h){
                win.maximize();
                vue.isFullScreen = true;
            }else{
                win.resizeTo(w*.8, h*.8);
                vue.isFullScreen = false;
            }
		},
		winclose(){
			win.close(true);
            win = null;
		},
		chosefile(e){
			let files = e.target.files,
				i = 0;
			if(files && files.length){
				recycle(files[0]);
				function recycle(file){
                    let item = {
							path: file.path,
                            hide: false,
                            video: null,
                            canplay: false,
                            playing: false,
                            progress: 0,
							name: file.name,
							size: file.size,
							lock: false,
							width: 0,
							height: 0,
							duration: 0,
							format: '',
							editable: false,
                            fps: 0,
                            currentTime: 0,
							toname: file.name,
							tosize: 0,
							towidth: vue.defwidth,
							toheight: Math.round(vue.defwidth*0.5625),
							toformat: '',
							starttime: 0,
							endtime: 0,
                            cover: 0,
                            bitv: 0,
                            bita: 0
						},
                        video = document.createElement('video');

                    video.className = 'item-preview-img';
                    video.src = file.path;
                    video.poster = config.loadingGif;
                    item.video = video;
                    item.canplay = !!video.canPlayType(file.type);
                    video.ontimeupdate = ()=>{
                        item.currentTime = video.currentTime;
                    };
                    video.onplay = ()=>{
                        item.playing = true;
                    };
                    video.onpause = ()=>{
                        item.playing = false;
                    }
					vue.items.push(item);
					Media.info({
						url: file.path,
						success: (json)=>{
                            item.format = json.ext;
							item.width = json.width;
							item.height = json.height;
							item.duration = json.duration;
                            item.endtime = json.duration;
                            item.corver = json.duration/2;
							item.type = json.type;
                            item.towidth = item.width > vue.defwidth ? vue.defwidth : item.width;
                            item.toheight = json.width ? Math.round(item.towidth * (item.height/item.width) ) : 0;
                            item.fps = json.fps;
                            item.toformat = config.output.format[ item.type ];
                            item.video.poster = json.thumb;
                            item.bitv = json.bitv && json.bitv <= config.output.bitv ? json.bitv : config.output.bitv;
                            item.bita = json.bita && json.bita <= config.output.bita ? json.bita : config.output.bita;
                            item.tosize = (item.bitv+item.bita)*1000*item.duration/8;
							i++;
							if(files[i]) recycle(files[i]);
						},
						fail: (err)=>{
                            utils.dialog('提示：',
                            '<p><span>文件：“'+file.name+'”可能不支持！错误信息：'+err+'。是否保留以尝试转码？</span></p>',
                            ['是','否'],
                            (code)=>{
                                if(code === 1) item.hide = true;
                                i++;
                                if(files[i]) recycle(files[i]);
                            });
						}
					});
				}
			}
		},
		chosedir(e){
            vue.output = e.target.files[0].path || '';
        },
        itemFn(e, index, str){
        	let item = vue.items[index],
                target = e.target,
                step = (1/item.fps)*vue.tunstep,
                tmptime;
        	switch(str){
        		case 'del':
                    item.hide = true;
                    if(item.canplay)
                    item.video.pause();
                    break;
        		case 'edit':
                    item.editable = !item.editable;
                    break;
        		case 'lock':
                    item.lock = !item.lock;
                    break;
                case 'currentTime':
                    if(item.canplay){
                        item.video.pause();
                    }
                    item.currentTime = parseFloat(target.value);
                    break;
                case 'timeSlide':
                    if(item.canplay){
                        item.video.currentTime = item.currentTime;
                    }else{
                        showThumb(item);
                    }
                    break;
                case 'prevFrame':
                    if(item.currentTime > step){
                        item.currentTime -= step;
                    }else{
                        item.currentTime = 0;
                    }
                    if(item.canplay){
                        item.video.pause();
                        item.video.currentTime = item.currentTime;
                    }else{
                        showThumb(item);
                    }
                    break;
                case 'nextFrame':
                    if(item.currentTime < item.duration - step){
                        item.currentTime += step;
                    }else{
                        item.currentTime = item.duration;
                    }
                    if(item.canplay){
                        item.video.pause();
                        item.video.currentTime = item.currentTime;
                    }else{
                        showThumb(item);
                    }
                    break;
                case 'setstart':
                    item.starttime = item.currentTime;
                    if(item.starttime > item.endtime){
                        item.endtime = item.starttime;
                    }
                    break;
                case 'setend':
                    if(item.currentTime < item.starttime){
                        item.starttime = item.currentTime;
                    }
                    item.endtime = item.currentTime;
                    break;
                case 'cover':
                    item.cover = item.currentTime;
                    break;
        		case 'towidth':
        			item.towidth = parseInt(target.value) || 0;
        			item.toheight = Math.round((item.height / item.width) * item.towidth);
        			break;
        		case 'toheight':
        			item.toheight = parseInt(target.value) || 0;
        			item.towidth = Math.round(item.toheight / (item.height / item.width));
        			break;
        	}
        },
        alphaFn(){
            vue.alpha = !vue.alpha;
        },
        openCutScreen(e){
            if(e.ctrlKey){
                // document.documentElement.style.transform = 'scale(1)';
                // win.restore();
            }else{
                screencap.hide();
            }
        },
        firstAid(){
            utils.dialog('警告：','<p><span>为了避免失误操作，你必须谨慎选择是否真的启用急救?</span></p>',['启用','关闭'],(code)=>{
                if(code === 0){
                    Media.killAll((msg)=>{
                        utils.dialog('提示：','<p><span>所有可能的错误程序已被清除！</span><br>详细：'+msg+'</p>');
                    });
                }
            });
        },
        play(e, index){
            let item = vue.items[index];
            if(!item.canplay) return;
            if(item.video.paused){
                item.video.play();
            }else{
                item.video.pause();
            }
        },
        convert(index){
            if(Media.ffmpeg){
                utils.dialog('禁止：',
                    '<p><span>转码程序正在进行，如果不是错误，请不要选择“强行中断”！</span></p>',
                    ['关闭','强行中断'],
                    function(code){
                        if(code === 1){
                            Media.ffmpeg.kill();
                        }
                    });
                return;
            }

            let i = index === -1 ? 0 : index,
                seek = 0,
                duration = 0,
                cammand = '';
            function loop(item){
                if(item.hide){
                    i++;
                    if(vue.items[i]) loop(vue.items[i]);
                    return;
                }

                if(item.type === 'image' && !/\.gif$/i.test(item.path)){
                    seek = 0,
                    duration = 0;
                    cammand = '';
                }else{
                    seek = item.starttime;
                    duration = item.endtime - item.starttime;
                    if(!duration){
                        //视频转图片
                        cammand = '-vframes|1';
                        seek = item.cover;
                    }else if(duration < 0){
                        //错误情况：起点大于终点
                        utils.dialog('错误操作：','<p><span>设置的终点不能在起点之前。</span></p>');
                        return;
                    }else{
                        cammand = '-b:v|'+item.bitv+'k|-b:a|'+item.bita+'k|-preset|'+vue.speedLevel;
                    }
                }
                Media.convert({
                    input: item.path,
                    seek: seek,
                    duration: duration,
                    cammand: cammand,
                    output: vue.output +'/'+ item.toname + '.' + item.toformat,
                    progress(percent){
                        item.progress = percent + '%';
                    },
                    complete(code,msg){
                        if(code !== 0){
                            utils.dialog('Oh no！','<p>发生了错误！错误详情：'+msg+'</p>');
                            item.progress = '';
                        }else{
                            item.progress = '100%';
                            if(index === -1){
                                i++;
                                if(vue.items[i]) loop(vue.items[i]);
                            }
                        }
                    }
                });
            };
            if(vue.items[i])
            loop(vue.items[i]);
        },
        nameAllFn(e){
        	vue.nameAll = e.target.value;
        	let len = vue.items.length, i = 0, n = 0;
        	for(; i < len; i++){
        		if(vue.items[i].lock){
        			vue.items[i].toname = utils.namemat(vue.nameAll, ++n);
        		}
        	}
        },
        sizeLimitFn(e){
        	vue.sizeLimit = e.target.value;
        	let len = vue.items.length, i = 0, n = 0;
        	for(; i < len; i++){
        		if(vue.items[i].lock){
        			n = utils.sizemat(e.target.value, true);
        			vue.items[i].tosize = n < vue.items[i].size ? n : vue.items[i].size;
        		}
        	}
		},
		whLimitFn(e,n){
			vue[n+'Limit'] = parseInt(e.target.value);
			let len = vue.items.length, i = 0;
        	for(; i < len; i++){
        		if(vue.items[i].lock){
        			vue.items[i]['to'+n] = vue[n+'Limit'] < vue.items[i][n] ? vue[n+'Limit'] : vue.items[i][n];
        		}
        	}
		},
        gotoSetAll(){
        	vue.dropSlidedown = !vue.dropSlidedown;
        }
	},
	filters: {
		timemat(t){
			return utils.timemat(t*1000);
		},
		sizemat(val,attr){
			if(attr === 'size'){
				return utils.sizemat(val);
			}else{
				let tmp = parseFloat(val).toFixed(2);
				if(tmp){
					return utils.sizemat(tmp);
				}
			}
			return 'auto';
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(4),
childprocess = __webpack_require__(5),
config = __webpack_require__(0),

getProgress = (line,duration)=>{
    let times = line.match(/time=\s*([\d\.:]+)\s+/i),
        time = 0
        percent = 0;
    if(times){
        let timesplit = times[1].split(':');
        time = ( parseFloat(timesplit[0])*3600 + parseFloat(timesplit[1])*60 + parseFloat(timesplit[2]) )*1000;
        if(duration){
            percent = Math.round(100*time/(duration*1000));
        }else{
            percent = 100;
        }
    }
    return percent;
};
module.exports = {
    //第一个子数组为html支持的格式，第二个需要转码
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
            status = true;
        let ffmpeg = childprocess.exec(config.ffmpegRoot+'/ffmpeg.exe -hide_banner -i "'+url+'" -vframes 1 -f null -', (err,stdout, stderr)=>{
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
                console.error('error: '+a, b);
            }
        }).once('error', (err)=>{
            try{
                ffmpeg.kill();
            }catch(e){}
            if(status && fail){
                status = false;
                fail(err);
            }
            console.error(err);
        });
    },
    thumb(o){
        let w = o.width || 480,
            h = o.height || 270,
            format = o.format === 'jpg' ? 'image2' : (o.format === 'gif' ? 'gif': 'apng'),
            status = true,
            ffmpeg,
            thumb;
        ffmpeg = childprocess.exec(config.ffmpegRoot+'/ffmpeg.exe -ss '+(o.time || '00:00:00')+' -i "'+o.input+'" -vframes 1 -s '+w+'x'+h+' -y  -f '+format+' "'+config.appRoot+'cache/thumb"',(err,stdout,stderr)=>{
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
    info(options){
        let self = this,
        o = {
            url: options.url || '',
            scale:  options.scale || '320:-1',
            time: options.time || 0,
            format: options.format || 'png',
            success: options.success || null,
            fail: options.fail || null
        };
        if(!o.url) {
            alert('无效媒体文件地址!');
            return;
        }
        if(!o.success) return;
        self.metadata(o.url,(json)=>{
            json.thumb = '';
            if(json.type === 'audio'){
                json.thumb = config.audioThumb;
                o.success(json);
            }else{
                if(self.is(json.ext,'image')){
                    json.thumb = o.url;
                    o.success(json);
                }else{
                    self.thumb({
                        input: o.url,
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
    ffmpeg: null,
    killAll(fn){
        childprocess.exec('TASKKILL /F /IM ffmpeg.exe', (err,stdout, stderr)=>{
            if(fn) fn(stderr.toString());
        });
    },
    convert(o){
        let self = this,
            cammand = '-hide_banner|'+(o.seek ? '-ss|'+o.seek+'|' : '')+'-i|'+o.input+'|'+(o.cammand || '')+(o.duration ? '|-t|'+o.duration : '')+'|-y|'+o.output,
            errmsg = '';
        if(self.ffmpeg){
            o.complete(2,'有视频解转码尚未完成，是否中止？');
            return;
        }
        self.ffmpeg = childprocess.spawn(config.ffmpegRoot+'/ffmpeg.exe', cammand.split(/\|+/));
        self.ffmpeg.stderr.on('data', (stderr)=>{
            errmsg = stderr.toString();
            o.progress( getProgress(errmsg, o.duration) );
        });
        self.ffmpeg.once('close', function(a,b){
            self.ffmpeg.kill();
            self.ffmpeg = null;
            if(a === 0){
                o.complete(0, o.output);
            }else{
                o.complete(1, '错误退出：'+errmsg);
            }
        });
        self.ffmpeg.on('error', function(){
            self.ffmpeg.kill();
            self.ffmpeg = null;
            o.complete(3, '子进程错误：'+err.toString());
        });
    },
    preview(o){
        let self = this,
            w = 320,
            h = Math.round(o.scale*w);
        if(self.ffmpeg){
            o.complete(2,'有视频解转码尚未完成，是否中止？');
            return;
        }
        h = h%2 !== 0 ? h+1 : h;
        o.output = config.appRoot+'tmp/tmp.mp4';
        o.cammand = '-preset|ultrafast|-s|'+w+'x'+(h%2 != 0 ? h+1 : h)+'|-b:v|512k';
        self.convert(o);
    },
    compressImg(o){
        let c = document.createElement('canvas'), cv = c.getContext('2d'), img = new window.Image(), data;

        img.src = o.input;
        console.log(img);
        img.addEventListener('load', function loaded(){
            img.removeEventListener('load', loaded);
            c.width = img.width;
            c.height = img.height;
            cv.drawImage(img, 0, 0, img.width, img.height);
            data = c.toDataURL((o.mime || 'image/jpg'), (o.quality || .9));
            fs.writeFileSync(o.output, data);
            c = null;
            cv = null;
            img = null;
            data = null;
        });
    }
};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

const win = nw.Window.get();
const utils = __webpack_require__(1);
let curwin = null;

document.onkeyup = (e)=>{
	if(e.keyCode === 70){
		win.maximize();
	}
}
module.exports = {
	hide(){
		win.moveTo(-win.width-50, 0);
	},
	show(){
		win.maximize();
	},
	help(parentNode){
		// return utils.dialog('使用说明：',
		// `<p><span>系统原因可能会导致边框显示不正常，你可以双击顶部工具条，此时边框会适配显示屏大小，并且变正常了，再双击可以回到原来大小，也可以自己拖拽边框到指定的大小。</span></p>
		// <p><b>操作推荐使用快捷键</b></p>
		// <p>
		// 	【开始/停止】 == 【F2】<br/>
		// 	【全屏】 == 【alt+F】<br/>
		// 	【帮助】 == 【F1】
		// </p>`, null, null, parentNode);
		console.log('help');
	},
	toggle(){
		if(curwin) {
			curwin.close(true);
			curwin = null;
			return false;
		}

		let context = this;
		nw.Window.open('html/screencap.html',{
		    id: 'cutscreen',
		    position: 'center',
		    transparent: true,
		    new_instance: false,
		    frame: false,
		    focus: true,
		    width: 1280,
		    height: 720,
		    always_on_top: true
		}, (win)=>{
			curwin = win;
			win.on('close', ()=>{
				win.close(true);
				curwin = win = null;
			});
			win.on('loaded', ()=>{
				let doc = win.window.document;
				doc.getElementById('explain').innerHTML = `
				<h2>提示：</h2>
				<p>系统支持度和系统主题支持度原因，偶尔窗口显示不正常，可以忽略它，只需要把窗口边框调整到截取的位置即可，因为录制的时候窗口是隐藏的，不会影响录制结果。</p>
				<h2>操作推荐使用快捷键：</h2>
				<p>
					【开始/停止】 == 【F2】<br/>
					【全屏录制】 == 【alt+F】<br/>
					【帮助】 == 【F1】
				</p>`;

				doc.getElementById('menu').onchange = function(){
					switch(this.value){
						case '1':
							context.start();
							win.hide();
							console.log(0)
							break;
						case '2':
							context.stop();
							break;
						case '3':
							context.full();
							break;
						case '4':
							context.help();
					}
				};
			});
		});
	},
	start(){
		console.log('start');
	},
	stop(){
		console.log('stop');
	},
	full(){
		console.log('full');
	},
	info(){
		let o = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};
		if(curwin){
			o.x = curwin.x;
			o.y = curwin.y;
			o.w = curwin.width;
			o.h = curwin.height;
		}
		return o;
	}
}

/***/ })
/******/ ]);