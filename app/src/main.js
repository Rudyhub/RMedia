const win = nw.Window.get();
const config = require('./config');
const Media = require('./Media');
const utils = require('./utils');
const capture = require('./capture');
const videoEl = document.createElement('video');

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
            editable: 0,
            showAlpha: 0,
            lock: 1
        },
        active: {
            mainSubmenu: ''
        },
        mediaIcon: {
            image: 'icon-image',
            video: 'icon-video-camera',
            audio: 'icon-headphones'
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
                i = 0,
                item,
                key;
            vue.toolbar[name] = !vue.toolbar[name];
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
                case 'chosefile':
                {
                    let files = target.files;
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
                                editable: vue.toolbar.editable,
                                alpha: vue.toolbar.showAlpha,
                                bitv: 0,
                                bita: 0,
                                type: '',

                                duration: 0,
                                starttime: 0,
                                endtime: 0,
                                currentTime: 0,
                                covertime: 0,

                                name: file.name,
                                toname: file.name.slice(0, file.name.lastIndexOf('.')),

                                size: file.size,
                                tosize: file.size,

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

                                    item.duration = json.duration;
                                    item.endtime = json.duration;

                                    item.tosize = (item.bitv+item.bita)*1000*item.duration/8;

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
                }
                break;
                case 'chosedir':
                {
                    vue.output = target.files[0].path || '';
                }
                break;
                case 'editable':
                {
                    for(key in vue.items){
                        item = vue.items[key];
                        i++;
                        if(item.lock){
                            item.editable = vue.toolbar.editable;
                        }
                    }
                }
                break;
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
                    //convert all
                }
                break;    
                case 'showAlpha':
                {
                    vue.showAlpha = !vue.showAlpha;
                }
            }
        },
        mainSubmenuFn(e,name){
            let target, panel;
            vue.active.mainSubmenu = name;
            switch(name){
                case 'vtogif':
                    break;
                case 'giftov':
                    break;
                case 'ptogif':
                    break;
                case 'vtoa':
                    break;
                case 'capture':
                    break;
                case 'firstAid':
                    utils.dialog('警告：','<p>为了避免失误操作，必须谨慎选择是否真的启用急救，不到万不得已，请不要轻易启用！</p>',['启用','关闭'],(code)=>{
                        if(code === 0){
                            Media.killAll((msg)=>{
                                utils.dialog('提示：','<p>所有可能的错误程序已被清除！<br>详细：'+msg+'</p>');
                            });
                        }
                    });
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
                        item,
                        key,
                        n = 0;
                    vue.active.mainSubmenu = 0;
                    vue.batchParams.widthLimit = parseInt(vue.$refs.widthLimitEl.value) || 0;
                    vue.batchParams.heightLimit = parseInt(vue.$refs.heightLimitEl.value) || 0;
                    vue.batchParams.sizeLimit = sizeLimit*1024*1024;
                    for( key in vue.items){
                        item = vue.items[key];
                        if(item.lock){
                            item.toname = utils.namemat(vue.batchParams.nameAll, ++n) +'.'+ item.format;
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
                step = (1/item.fps)*vue.tunstep,
                tmptime;
        	switch(str){
        		case 'del':
                {
                    vue.$delete(vue.items, index);
                }
                break;
        		case 'edit':
                {
                    item.editable = !item.editable;
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
                    item.starttime = item.currentTime;
                    if(item.starttime > item.endtime){
                        item.endtime = item.starttime;
                    }
                }
                break;
                case 'setend':
                {
                    if(item.currentTime < item.starttime){
                        item.starttime = item.currentTime;
                    }
                    item.endtime = item.currentTime;
                }
                break;
                case 'setcover':
                {
                    item.covertime = item.currentTime;
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
        },
        convert(index){
            if(Media.ffmpeg){
                utils.dialog('禁止：',
                    '<p>转码程序正在进行，如果不是错误，请不要选择“强行中断”！</p>',
                    ['关闭','强行中断'],
                    function(code){
                        if(code === 1){
                            Media.ffmpeg.kill();
                        }
                    });
                return;
            }
            /*
            情况分析：
                1.图片->图片: 
                2.gif->视频: 可添加音频
                3.视频->视频:
                4.视频->gif: 
                5.视频->音频: 
                6.视频->图片:
            */
            let i = index === -1 ? 0 : index,
                seek = 0,
                duration = 0,
                cammand,
                thumbCmd,
                output;
            function loop(item){
                if(item.hide){
                    i++;
                    if(vue.items[i]) loop(vue.items[i]);
                    return;
                }
                
                if(item.type === 'image'){
                    output = vue.output +'/' + item.toname +'.'+ item.toformat;
                    Media.compressImg({
                        input: item.path,
                        quality: item.size ? (item.tosize/item.size).toFixed(2) : .8,
                        output: output,
                        complete: (percent)=>{
                            item.progress = percent + '%';
                        }
                    });
                }else{
                    /*
                    duration = item.endtime - item.starttime;
                    if(duration > 0){
                        Media.convert({
                            input: item.path,
                            seek: seek,
                            duration: duration,
                            cammand: cammand,
                            output: vue.output +'/'+ item.toname + '.' + item.toformat,
                            thumbCmd: thumbCmd,
                            progress(percent){
                                item.progress = percent + '%';
                            },
                            complete(code,msg){
                                if(code === 0){
                                    item.progress = '100%';
                                    if(index === -1){
                                        i++;
                                        if(vue.items[i]) loop(vue.items[i]);
                                    }
                                }else{
                                    utils.dialog('退出：','<p>'+msg+'</p>');
                                    item.progress = '';
                                }
                            }
                        });
                    }*/
                }
                /*
                if(item.type === 'image' && !/\.gif$/i.test(item.path)){
                    seek = 0,
                    duration = 0;
                    cammand = '';
                    thumbCmd = '';
                }else{
                    seek = item.starttime;
                    duration = item.endtime - item.starttime;
                    if(duration > 0){
                        cammand = '-b:v|'+item.bitv+'k|-b:a|'+item.bita+'k|-preset|'+vue.speedLevel;
                        thumbCmd = '|'+(item.cover ? '-ss|'+item.cover+'|' : '')+'-vframes|1|-f|image2|'+vue.output +'/'+ item.toname + '.jpg';
                    }else{
                        // cammand = 
                        thumbCmd = '';
                    }
                }
                Media.convert({
                    input: item.path,
                    seek: seek,
                    duration: duration,
                    cammand: cammand,
                    output: vue.output +'/'+ item.toname + '.' + item.toformat,
                    thumbCmd: thumbCmd,
                    progress(percent){
                        item.progress = percent + '%';
                    },
                    complete(code,msg){
                        if(code === 0){
                            item.progress = '100%';
                            if(index === -1){
                                i++;
                                if(vue.items[i]) loop(vue.items[i]);
                            }
                        }else{
                            utils.dialog('退出：','<p>'+msg+'</p>');
                            item.progress = '';
                        }
                    }
                });
                */
            };
            if(vue.items[i])
            loop(vue.items[i]);
        }
	},
	filters: {
		timemat(t){
			return utils.timemat(t*1000);
		},
		sizemat(val,attr){
			if(attr === 'size'){
				return utils.sizemat(val);
			}else if(typeof attr === 'number'){
                return Math.round(parseFloat(val/attr)*100) + '%';
            }else{
				let tmp = parseFloat(val).toFixed(2);
				if(tmp){
					return utils.sizemat(tmp);
				}
			}
			return 'auto';
		},
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