const win = nw.Window.get(),
    config = require('./config'),
    Media = require('./Media'),
    utils = require('./utils'),
    capture = require('./capture'),
    Vue = require('./vue.min'),
    shortcut = require('./shortcut'),
    crypto = require('crypto'),
    appInfo = Object.freeze(nw.App.manifest),

    inputEl = document.createElement('input'),
    outputEl = document.createElement('input'),
    logoInput = document.createElement('input'),
    canvas = document.createElement('canvas');

//init
require('./version');
require('./directives');
require('./components');
document.title = appInfo.window.title;
win.maximize();
win.show();

const vue = new Vue({
	el: '#app',
	data: {
        app: Object.freeze(nw.App.manifest),
		output: config.output.folder,
        items: {},
        viewWidth: screen.availWidth * .19,
        viewScale: .5625,
        isStarted: false,
		winToggle: true,
        batchParams: {
            speed: 'slow',
            nameAll: nw.App.manifest.name,
            widthLimit: config.output.width,
            heightLimit: config.output.height,
            sizeLimit: 0,
            logo: ''
        },
        toolbar: {
            drop: 0,
            toggle: {
                lock: 1,
                alpha: 1
            },
            x: 0,
            y: 0
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
        sprite: {
            preview: false,
            align: 1,
            items: [],
            listCss: '',
            itemCss: '',
            imgCss: ''
        },
        framestep: 2
	},
	methods: {
        reItem(item){
            let tobitv = item.bitv <= config.output.bitv ? item.bitv : config.output.bitv,
                tobita = item.bita <= config.output.bita ? item.bita : config.output.bita,
                quality = (tobitv+tobita)/(item.bitv+item.bita)*100;

            item.quality = quality ? quality.toFixed(2) : 100;
            item.toname = vue.batchParams.nameAll+'_'+item.name.slice(0, -item.format.length-1);
            item.toformat = item.type !== 'image' || !/(jpg|png|gif|jpeg|ico|webp|bmp)/i.test(item.format) ?  config.output.format[item.type] : item.format;
            item.startTime = 0;
            item.endTime = item.duration;
            item.cover = false;
            item.coverTime = 0;
            item.towidth = item.width > config.output.width ? config.output.width : item.width;
            item.toheight = parseInt(item.towidth * item.scale);
            item.tofps = item.fps;
            item.totype = utils.type(item.toformat);
            item.logoStart = 0;
            item.logoEnd = item.duration;
        },
        zoomItemFn(e){
            vue.viewWidth = win.width * parseFloat(e.currentTarget.value);
        },
        toolbarFn(e){
            let target = e.currentTarget,
                name = target.name,
                item,
                key;

            if(vue.toolbar.drop === name){
                vue.toolbar.drop = '';
            }else{
                vue.toolbar.drop = name;
                vue.toolbar.x = e.x;
                vue.toolbar.y = e.y+30;
            }

            switch(name){
                case 'chosefile': inputEl.value = ''; inputEl.click(); break;
                case 'chosedir': outputEl.click(); break;
                case 'pdf2pic':
                    nw.Window.open('plugins/pdf2pic/pdf2pic.html',{
                        id: 'pdf2pic',
                        position: 'center',
                        new_instance: false,
                        focus: true,
                        frame: false,
                        width: Math.round(win.width*.8),
                        height: Math.round(win.height*.8)
                    });
                break;
                case 'concat':
                {
                    let tmpType,
                        items = [],
                        output = vue.output+'\\'+vue.batchParams.nameAll;
                    //检查是否被允许
                    for(key in vue.items){
                        item = vue.items[key];
                        if(item.lock){
                            if(!tmpType) tmpType = item.type;
                            if(item.type !== tmpType || item.type === 'image'){
                                utils.dialog.show = true;
                                utils.dialog.body = '所选文件“'+item.path+'”不可拼接！音、视频不能混合拼接，且不支持图片。';
                                return false;
                            }else{
                                items.push(item);
                            }
                        }
                    }
                    if(tmpType === 'video'){
                        output += '.mp4';
                    }else{
                        output += '.mp3';
                    }
                    if(items.length > 1){
                        if(utils.has(output)){
                            utils.dialog.show = true;
                            utils.dialog.body = '文件“'+output+'”已存在，是否覆盖？';
                            utils.dialog.setBtn('覆盖','否');
                            utils.dialog.callback = (code)=>{
                                if(code === 0) Media.concat(tmpType, items, output);
                            }
                        }else{
                            Media.concat(tmpType, items, output);
                        }
                    }else{
                        utils.dialog.show = true;
                        utils.dialog.body = '无法拼接，要实现拼接至少两个文件。';
                    }
                }
                    break;
                case 'mix':
                {
                    let tmpType,
                        items = [],
                        output = vue.output+'\\'+vue.batchParams.nameAll;
                    for(key in vue.items){
                        item = vue.items[key];
                        if(item.lock){
                            if(!tmpType && item.type === 'video') tmpType = item.type;
                            if(item.type === 'image') {
                                utils.dialog.show = true;
                                utils.dialog.body = '所选文件“' + item.path + '”不可混合，不支持图片。';
                                return false;
                            }
                            items.push(item);
                        }
                    }
                    if(!tmpType) tmpType = 'audio';
                    if(tmpType === 'video'){
                        output += '.mp4';
                    }else{
                        output += '.mp3';
                    }
                    if(items.length > 1){
                        if(utils.has(output)){
                            utils.dialog.show = true;
                            utils.dialog.body = '文件“'+output+'”已存在，是否覆盖？';
                            utils.dialog.setBtn('覆盖','否');
                            utils.dialog.callback = (code)=>{
                                if(code === 0) Media.mix(tmpType, items, output);
                            }
                        }else{
                            Media.mix(tmpType, items, output);
                        }
                    }else{
                        utils.dialog.show = true;
                        utils.dialog.body = '无法拼接，要实现拼接至少两个文件。';
                    }
                }
                    break;
                case 'firstAid':
                    utils.dialog.show = true;
                    utils.dialog.title = '严重提示！';
                    utils.dialog.body = '<p>为了避免失误操作，必须谨慎选择是否真的启用急救，不到万不得已，请不要轻易启用！当然，它也可以强制中止正在处理的程序。</p>';
                    utils.dialog.setBtn('启用','关闭');
                    utils.dialog.callback = function(code){
                        if(code === 0){
                            Media.killAll();
                        }
                        target.classList.remove('active-1');
                    };
                    break;
                case 'helpBook':
                    nw.Shell.openExternal(appInfo.documentation);
                    break;
            }
        },
        convertFn(e){
            let total, command, keys, len, i, target, options;

            target = e.currentTarget;
            target.dataset.stopAll = 0;
            if(Media.ffmpeg !== null){
                utils.dialog.show = true;
                utils.dialog.title = '<i class="icon icon-question"></i>';
                utils.dialog.body = '<p>文件正在处理，如果中止，不能确保已输出的部分是正常的，是否中止？</p>';
                utils.dialog.setBtn('中止当前','中止全部','取消');
                utils.dialog.callback = function(code){

                    if(code === 0 || code === 1){
                        Media.end('主动中止，' + this.innerText);
                        vue.isStarted = false;
                        target.dataset.stopAll = code;
                    }
                };
                return false;
            }

            keys = Object.keys(vue.items);
            len = keys.length;
            i = 0;

            if(len){
                recycle(vue.items[ keys[i] ]);
            }else{
                utils.dialog.show = true;
                utils.dialog.title = '哦嚯！';
                utils.dialog.body = '<p>哦嚯！没有输入任何文件。</p>';
            }

            function recycle(item){
                command = Media.command(item, vue.output);
                total = item.endTime - item.startTime;
                options = {
                    command: command.cmd,
                    progress(t){
                        if(total){
                            item.progress = Math.round((t/total)*100);
                        }else{
                            item.progress = 50;
                        }
                        win.setProgressBar((i/len) + (1/len) * (item.progress/100));
                    },
                    complete(code, msg){
                        vue.isStarted = false;
                        //防止在处理过程中进行删除操作的情况
                        keys = Object.keys(vue.items);
                        len = keys.length;
                        if(code === 0){
                            item.progress = 100;
                            i++;
                            if(keys[i] && target.dataset.stopAll != 1){
                                recycle(vue.items[ keys[i] ]);
                            }else{
                                msg = msg || '全部完成';
                                win.setProgressBar(-1);
                                utils.dialog.show = true;
                                utils.dialog.title = '<i class="icon icon-grin2" style="color:#f5b018;"></i> 完成！';
                                utils.dialog.body = `<p>${msg}！接下来选择如何处理已完成？</p>`;
                                utils.dialog.setBtn('移除','保留');
                                utils.dialog.callback = function(code){
                                    
                                    for(let key in vue.items){
                                        if(code === 0 && vue.items[key].progress){
                                            window.URL.revokeObjectURL(vue.items[key].thumb);
                                            vue.$delete(vue.items, key);
                                        }else{
                                            vue.items[key].progress = 0;
                                        }
                                    }
                                }
                            }
                        }else{
                            win.setProgressBar(-1);
                            utils.dialog.show = true;
                            utils.dialog.title = '失败！';
                            utils.dialog.body = '<p>失败原因：'+msg+'</p>';
                            item.progress = 0;
                        }
                    }
                };

                item.progress = 0;
                vue.isStarted = true;

                if(command.error){
                    utils.dialog.show = true;
                    utils.dialog.body = command.error.message;
                    if(command.error.code === 1){
                        utils.dialog.title = '错误！';
                    }else if(command.error.code === 2){
                        utils.dialog.title = '文件已存在！';
                        utils.dialog.setBtn('覆盖','否');
                        utils.dialog.callback = (c)=>{
                            if(c===0) Media.convert(options);
                            else vue.isStarted = false;
                        }
                    }
                }else{
                    Media.convert(options);
                }
            }
        },
        spriteFn(code){
            if(typeof code !== 'string'){
                vue.toolbar.drop = '';
                if(code === -1 || !Object.keys(vue.items).length) return;
                let spriteList = document.getElementById('sprite-list'),
                    items = spriteList.querySelectorAll('.sprite-item'),
                    len = items.length,
                    i = 0,
                    x = 0, y = 0, w = 0, h = 0,
                    item, img, ctx;

                canvas.width = spriteList.offsetWidth;
                canvas.height = spriteList.offsetHeight;
                ctx = canvas.getContext('2d');

                for(; i < len;  i++){
                    item = items[i];
                    img = item.querySelector('img');
                    x = item.offsetLeft + img.offsetLeft + utils.css(img,'borderLeftWidth') + utils.css(img,'paddingLeft');
                    y = item.offsetTop + img.offsetTop + utils.css(img,'borderTopWidth') + utils.css(img,'paddingTop');
                    w = img.offsetWidth - utils.css(img,'borderLeftWidth') - utils.css(img,'borderRightWidth') - utils.css(img,'paddingLeft') - utils.css(img,'paddingRight');
                    h = img.offsetHeight - utils.css(img,'borderTopWidth') - utils.css(img,'borderBottomWidth') - utils.css(img,'paddingTop') - utils.css(img,'paddingBottom');
                    ctx.drawImage(img, x, y, w, h);
                }

                utils.canvasToFile(vue.output+'\\sprite.png', canvas.toDataURL('image/png'), utils.dialog);
            }else if(code === 'align'){
                alignFn( parseInt(arguments[1].target.value) );
            }else if(code === 'matrix'){
                vue.sprite.align = parseInt(arguments[1].target.value);
                alignFn( parseInt(vue.$refs.spriteAlign.value) );
            }
            function alignFn(val){
                if(vue.sprite.align === 1){
                    vue.sprite.listCss = '';
                    switch(val){
                        case 2: vue.sprite.itemCss = 'vertical-align: middle;'; break;
                        case 3: vue.sprite.itemCss = 'vertical-align: bottom;'; break;
                        default: vue.sprite.itemCss = 'vertical-align: top;';
                    }
                }else if(vue.sprite.align === 2){
                    vue.sprite.itemCss = '';
                    switch(val){
                        case 2:
                            vue.sprite.listCss = 'white-space: normal;text-align: center;';
                        break;
                        case 3:
                            vue.sprite.listCss = 'white-space: normal;text-align: right;';
                        break;
                        case 4:
                            vue.sprite.listCss = 'white-space: normal;';
                            vue.sprite.itemCss = 'width: 100%;';
                            vue.sprite.imgCss = 'width: 100%;';
                        break;
                        default:
                            vue.sprite.listCss = 'white-space: normal;text-align: left;';
                    }
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

                    if(wl) vue.batchParams.widthLimit = wl;
                    if(hl) vue.batchParams.heightLimit = hl;
                    if(sizeLimit) vue.batchParams.sizeLimit = sizeLimit*1024*1024;

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
                            if(sizeLimit && vue.batchParams.sizeLimit < item.size){
                                item.quality = quality;
                            }else{
                                item.quality = 100;
                            }
                            item.toname = utils.namemat(vue.batchParams.nameAll, ++n);
                        }
                    }
                    vue.toolbar.drop = '';
                }
                break;
                case 1:
                {
                    for( key in vue.items) vue.reItem(vue.items[key]);
                    vue.toolbar.drop = '';
                }
                break;
                default:
                    vue.toolbar.drop = '';
            }
        },
        logoFn(name, val, index){
            if(name === 'add'){
                logoInput.dataset.activeIndex = index;
                logoInput.value = '';
                logoInput.click();
            }else{
                if(index){
                    calc(vue.items[index]);
                }else{
                    for(let key in vue.items) calc(vue.items[key]);
                }
            }
            
            /*位置推算：
                目的：要求出logo高度与item(图/视频)的高度比(设为：Hs);
                已知：logo宽度与item宽度比item.logoSize(设为：A); logo宽高比item.logoScale(设为：B); item宽高比item.scale(设为：C);
                设： item宽、高分别为 W1、 H1，logo宽高分别为 W2、H2;
                求：Hs，即(H2/H1)。
                解：
                    因: A = W2/W1; B = H2/W2; C = H1/W1;
                    故: H1 = W1*C; H2 = W2*B;
                    推导: Hs = H2/H1
                        = (W2*B) / (W1*C)
                        = (W2/W1) * (B/C)
                        = A * (B/C);
                套入：Hs = item.logoSize * (item.logoScale / item.scale);
            */
            function calc(item){
                switch(name){
                    case 'size':
                        item.logoSize = val;
                        break;
                    case 'left':
                        item.logoX = (100-item.logoSize) * (val/100);
                        break;
                    case 'top':
                        item.logoY = (100 - item.logoSize * (item.logoScale / item.scale)) * (val /100);
                        break;
                    case 'del':
                        item.logo  = '';
                        break;
                    case 'start':
                        item.logoStart = item.currentTime;
                        break;
                    case 'end':
                        item.logoEnd = item.currentTime;
                        break;
                }
            }

        },
        nameAllFn(code){
            if(code === -1) return;

            let output, n;
            n = 0;
            i = 0;
            k = Object.keys(vue.items)[0];
            item = vue.items[k];
            
            if(item){
                recycle(item)
            }else{
                utils.dialog.show = true;
                utils.dialog.body = '<p>没有输入任何文件！</p>';
            }
            function recycle(item){
                k = Object.keys(vue.items)[++n];
                if(item.lock){
                    i++;
                    output = vue.output +'\\'+ utils.namemat(vue.batchParams.nameAll, i) +'.'+ item.format;
                    if(code === 1){
                        Media.rename(item.path, output, oneComplete);
                    }else if(code === 2){
                        Media.copyFile(item.path, output, oneComplete);
                    }
                }
            }
            function oneComplete(err){
                item = vue.items[k];
                if(err){
                    utils.dialog.show = true;
                    utils.dialog.title = '错误！';
                    utils.dialog.body = `<p>有文件重命名失败！</p>
                    <details class="dialog-details">
                        <summary>详细错误</summary>
                        <p>${err.toString()}</p>
                    </details>`;
                    utils.dialog.setBtn('继续','退出');
                    utils.dialog.callback = function(c){
                        
                        if(c === 0){
                            if(item){
                                recycle(item);
                            }else{
                                allComplete();
                            }
                        }
                    }
                }else{
                    if(item){
                        recycle(item);
                    }else{
                        allComplete();
                    }
                }
            }
            function allComplete(){
                utils.dialog.show = true;
                utils.dialog.title = '结束！';
                utils.dialog.body = '<p>输出目录：'+vue.output+', 可前往查看序列化重命名结果。</p>';
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
                            utils.dialog.show = true;
                            utils.dialog.title = '失败！';
                            utils.dialog.body = '<p>'+err+'</p>';
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
                case 0: start(); break;
            }
            function start(){
                if(params.mode !== 4 && params.fps > 60){
                    utils.dialog.show = true;
                    utils.dialog.body = '<p>帧速率不能超过 60</p>';
                    return;
                }
                if(params.mode !== 2 && params.mode !== 3 && !params.audioDevice){
                    utils.dialog.show = true;
                    utils.dialog.body = '<p>无可用于录制音频的设备，请检测设备或查看帮助文档。</p>';
                    return;
                }
                output = vue.output + '\\'+vue.batchParams.nameAll;
                if(params.mode === 4){
                    output += '.mp3';
                }else{
                    output += '.mp4';
                }

                // capture.progress = (time)=>{}

                capture.complete = (err)=>{
                    utils.dialog.show = true;
                    if(err){
                        utils.dialog.title = '失败！';
                        utils.dialog.body = `<p>错误码：${err.code}</p>
                        <details class="dialog-details">
                            <summary>详细错误</summary>
                            <p>${err.message}</p>
                        </details>`;
                    }else{
                        utils.dialog.title = '完成！';
                        utils.dialog.body = '<p>输出位置：'+output+'</p>';
                    }
                };
                capture.start(output, vue.capParams);
            }
            if(code === 0 || code === -1){
                vue.toolbar.drop = '';
            }
        },
        videoFn(e, index, type){
            let item = vue.items[index],
                video = vue.$refs['id'+index][0];
            if(!item) return;
            switch(type){
                case 'timeupdate':
                    item.currentTime = video.currentTime;
                    break;
                case 'play':
                    item.playing = true;
                    break;
                case 'pause':
                    item.playing = false;
                    break;
                default:
                    if(!item.canplay) return;
                    video.currentTime = item.currentTime;
                    if(video.paused){
                        video.play();
                    }else{
                        video.pause();
                    }
            }
        },
        itemFn(e, index, str){
            let item = vue.items[index],
                target = e.target,
                step;

            switch(str){
                case 'del':
                {
                    window.URL.revokeObjectURL(vue.items[index].thumb);
                    vue.$delete(vue.items, index);
                }
                break;
                case 'delAll':
                {
                    for(let key in vue.items){
                        window.URL.revokeObjectURL(vue.items[key].thumb);
                        vue.$delete(vue.items, key);
                    }
                }
                break;
                case 'lock': item.lock = !item.lock; break;
                case 'lockAll': 
                {
                    vue.toolbar.toggle.lock = !vue.toolbar.toggle.lock;
                    for(let key in vue.items){
                        vue.items[key].lock = vue.toolbar.toggle.lock;
                    }
                }
                break;
                case 'alpha': item.alpha = !item.alpha; break;
                case 'alphaAll':
                {
                    vue.toolbar.toggle.alpha = !vue.toolbar.toggle.alpha;
                    for(let key in vue.items){
                        vue.items[key].alpha = vue.toolbar.toggle.alpha;
                    }
                }
                break;
                case 'reset': vue.reItem(item); break;
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
                        Media.useThumb(item);
                    }
                }
                break;
                case 'prevFrame':
                {
                    step = (1/item.fps)*vue.framestep;
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
                        Media.useThumb(item);
                    }
                }
                break;
                case 'nextFrame':
                {
                    step = (1/item.fps)*vue.framestep;
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
                        Media.useThumb(item);
                    }
                }
                break;
                case 'setstart':
                {
                    item.startTime = item.currentTime;
                    if(item.startTime > item.endTime) item.endTime = item.startTime;

                    if(item.logoStart < item.startTime) item.logoStart = item.startTime;

                    if(item.logoEnd < item.logoStart) item.logoEnd = item.logoStart;
                }
                break;
                case 'setend':
                {
                    item.endTime = item.currentTime;
                    if(item.endTime < item.startTime) item.startTime = item.endTime;

                    if(item.logoEnd > item.endTime) item.logoEnd = item.endTime;

                    if(item.logoStart > item.logoEnd) item.logoStart = item.logoEnd;
                }
                break;
                case 'setcover':
                {
                    if(item.currentTime < item.startTime || item.currentTime > item.endTime ){
                        utils.dialog.show = true;
                        utils.dialog.title = '注意';
                        utils.dialog.body = '<p>取预览图的位置必须是在截取时间'+utils.timemat(item.startTime*1000)+'到'+utils.timemat(item.endTime*1000)+'</p>';
                        utils.dialog.callback = ()=>{
                            
                            item.coverTime = item.currentTime > item.startTime ? item.endTime : item.startTime;
                            item.currentTime = item.coverTime;
                            if(item.canplay){
                                vue.$refs['id'+index][0].currentTime = item.currentTime;
                            }else if(item.type === 'video'){
                                Media.useThumb(item);
                            }
                        }
                    }else{
                        item.coverTime = item.currentTime;
                    }
                }
                break;
                case 'toformat':
                {
                    item.toformat = target.value;
                    item.totype = utils.type(item.toformat);
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
                break;
                case 'logo':
                {
                    logoInput.dataset.activeIndex = index;
                    switch (e.target.dataset.name){
                        case 'add':
                            logoInput.value = '';
                            logoInput.click();
                            break;
                        case 'del':
                            item.logo = '';
                            break;
                        case 'start':
                            item.logoStart = item.currentTime;
                            if(item.logoEnd < item.logoStart) item.logoEnd = item.logoStart;
                            break;
                        case 'end':
                            item.logoEnd = item.currentTime;
                            if(item.logoEnd < item.logoStart) item.logoStart = item.logoEnd;
                            break;
                        case 'lt':
                            item.logoX = 1;
                            item.logoY = 2;
                            break;
                        case 'rt':
                            item.logoX = 99 - item.logoSize;
                            item.logoY = 2;
                            break;
                        case 'ct':
                            item.logoX = (99 - item.logoSize)/2;
                            item.logoY = (98 - item.logoSize * (item.logoScale / item.scale))/2;
                            break;
                        case 'lb':
                            item.logoX = 1;
                            item.logoY = 98 - item.logoSize * (item.logoScale / item.scale);
                            break;
                        case 'rb':
                            item.logoX = 99 - item.logoSize;
                            item.logoY = 98 - item.logoSize * (item.logoScale / item.scale);
                            break;
                    }
                }
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
    }
});

function listItems(files){
    let i = 0,
        item,
        hex,
        key;
    if(files.length){
        recycle(files[0]);
        function recycle(file){
            item = {
                path: file.path,
                thumb: '',
                canplay: false,
                playing: 0,
                progress: 0,
                lock: vue.toolbar.toggle.lock,
                alpha: vue.toolbar.toggle.alpha,
                type: '',
                series: false,
                logo: '',
                logoX: 1,
                logoY: 2,
                logoScale: 0,
                logoSize: 12,
                logoStart: 0,
                logoEnd: 0,

                duration: 0,
                startTime: 0,
                endTime: 0,
                currentTime: 0,
                coverTime: 0,
                cover: false,
                coverWidth: 480,

                name: file.name,
                toname: '',

                bitv: 0,
                bita: 0,

                size: (parseInt(file.size) || 0),
                quality: 0,

                scale: 0,
                width: 0,
                towidth: 0,
                height: 0,
                toheight: 0,

                format: '',
                toformat: '',

                fps: 0,
                tofps: 0,

                split: false,
                achannel: '',
                aclayout: 0,
                vchannel: ''
            };

            hex = crypto.createHash('md5');
            hex.update(file.path);
            key = hex.digest('base64');
            vue.$set(vue.items, key, item);

            Media.info({
                input: file.path,
                success: (json)=>{
                    item.thumb = json.thumb;
                    item.type = json.type;

                    item.duration = json.duration;

                    item.bitv = json.bitv || json.bit;
                    item.bita = json.bita;

                    item.scale = (json.height / json.width) || vue.viewScale;
                    item.width = json.width;
                    item.height = json.height;

                    item.format = json.ext;
                    item.canplay = (/(mp4|mp3|ogg|mpeg|mkv|wav|webm)/i.test(json.ext));
                    item.fps = json.fps;

                    item.achannel = json.achannel;
                    item.aclayout = json.aclayout;
                    item.vchannel = json.vchannel;

                    vue.reItem(item);

                    i++;
                    if(files[i]) recycle(files[i]);
                },
                fail: (err)=>{
                    utils.dialog.show = true;
                    utils.dialog.body = `<p>文件：“${file.name}”可能不支持！是否保留以尝试转码？</p>
                    <details class="dialog-details">
                        <summary>详细错误</summary>
                        <p>${err}</p>
                    </details>`;
                    utils.dialog.setBtn('是','否');
                    utils.dialog.callback = function(code){

                        if(code === 1){
                            window.URL.revokeObjectURL(vue.items[key].thumb);
                            vue.$delete(vue.items, key);
                        }
                        i++;
                        if(files[i]) recycle(files[i]);
                    };
                }
            });
        }
    }
}


inputEl.type = outputEl.type = logoInput.type = 'file';
inputEl.multiple = true;
outputEl.nwdirectory = true;

inputEl.addEventListener('change', (e)=>{
    vue.toolbar.drop = '';
    listItems(inputEl.files);
});
inputEl.addEventListener('cancel', ()=>{
    vue.toolbar.drop = '';
});

outputEl.addEventListener('change', ()=>{
    vue.toolbar.drop = '';
    vue.output = outputEl.files[0].path || '';
});
outputEl.addEventListener('cancel', ()=>{
    vue.toolbar.drop = '';
});

logoInput.addEventListener('change', ()=>{
    if(/^image\/[\w-]+$/i.test(logoInput.files[0].type)){
        let activeIndex = logoInput.dataset.activeIndex,
            logoPath = logoInput.files[0].path,
            img = new Image();
        img.onload = ()=>{
            if(!activeIndex){
                vue.batchParams.logo = logoPath;
                for(let key in vue.items){
                    if(vue.items[key].lock){
                        vue.items[key].logo = logoPath;
                        vue.items[key].logoScale = img.height / img.width;
                    }
                }
            }else{
                vue.items[activeIndex].logo = logoPath;
                vue.items[activeIndex].logoScale = img.height / img.width;
            }
            img.onload = null;
            img = null;
        };
        img.src = logoPath;
    }
});

shortcut({inputEl, outputEl, listItems});

