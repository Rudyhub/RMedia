const win = nw.Window.get();
    config = require('./config'),
    Media = require('./Media'),
    utils = require('./utils'),
    capture = require('./capture'),
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
                    function convert(){

                    }
                    break;
                    case 'vtogif':
                    //type == video && toformat == gif
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
                    //format == gif && toformat is video
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
                    //type = image queue && toformat === gif
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
                    //type == video && toformat is audio
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