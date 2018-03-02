const win = nw.Window.get();
    config = require('./config'),
    Media = require('./Media'),
    utils = require('./utils'),
    capture = require('./capture'),
    Vue = require('./vue.min'),

    videoEl = document.createElement('video'),
    inputEl = document.createElement('input'),
    outputEl = document.createElement('input'),
    canvas = document.createElement('canvas');

win.on('loaded',()=>{
    win.width = screen.availWidth;
    win.height = screen.availHeight;
    win.x = win.y = 0;
    win.show();
});


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
            drop: 0,
            toggle: {
                lock: 1,
                alpha: 0
            }
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
        toformats: ['mp4','webm','ogg','mp3','jpg','png','gif','jpeg','webp','ico','bmp'],
        framestep: 2,
        dialog: {
            show: false,
            title: '',
            body: '',
            btns: [],
            callback: null
        }
	},
    created(){
        inputEl.type = outputEl.type = 'file';
        inputEl.multiple = true;
        outputEl.nwdirectory = true;
        inputEl.addEventListener('change', (e)=>{
            vue.dropMenuClose('chosefile');
            let target = e.target,
                files = target.files,
                i = 0,
                item,
                key,
                tobitv,
                tobita;
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
                        lock: vue.toolbar.toggle.lock,
                        alpha: vue.toolbar.toggle.alpha,
                        type: '',
                        series: false,

                        duration: 0,
                        startTime: 0,
                        endTime: 0,
                        currentTime: 0,
                        coverTime: 0,
                        cover: false,
                        coverWidth: 480,

                        name: file.name,
                        toname: file.name.slice(0, file.name.lastIndexOf('.')),

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
                        tofps: 0
                    };

                    vue.$set(vue.items, key = Object.keys(vue.items).length, item);

                    Media.info({
                        input: file.path,
                        success: (json)=>{
                            item.thumb = json.thumb;
                            item.type = json.type;

                            item.duration = json.duration;

                            item.bitv = json.bitv || json.bit;
                            item.bita = json.bita;

                            item.scale = json.height / json.width;
                            item.width = json.width;
                            item.height = json.height;

                            item.format = json.ext;
                            item.fps = json.fps;

                            vue.reItem(item);
                            i++;
                            if(files[i]) recycle(files[i]);
                        },
                        fail: (err)=>{
                            vue.dialog.show = true;
                            vue.dialog.body = `<p>文件：“${file.name}”可能不支持！是否保留以尝试转码？</p>
                            <details class="dialog-details">
                                <summary>详细错误</summary>
                                <p>${err}</p>
                            </details>`;
                            vue.dialog.btns.push('是','否');
                            vue.dialog.callback = function(code){
                                if(code === 1) vue.$delete(vue.items, key);
                                i++;
                                if(files[i]) recycle(files[i]);
                            };
                        }
                    }, vue.dialog);
                }
            }
        });

        outputEl.addEventListener('change', (e)=>{
            vue.dropMenuClose('chosedir');
            vue.output = e.target.files[0].path || '';
        });
        inputEl.addEventListener('cancel', ()=>{
            vue.dropMenuClose('chosefile');
        });
        outputEl.addEventListener('cancel', ()=>{
            vue.dropMenuClose('chosedir');
        });
    },
	methods: {
        // common function
        dropMenuClose(name){
            vue.toolbar.drop = '';
            try{
                vue.$refs[name].classList.remove('zoom-in');
            }catch(err){}
        },
        getThumb(item){
            if(!item) return;
            Media.thumb({
                input: item.path,
                time: item.currentTime,
                success(src){
                    item.thumb = src;
                },
                fail(){
                    vue.dialog.show = true;
                    vue.dialog.title = '错误！';
                    vue.dialog.body = '<p>微调发生错误！</p>';
                }
            });
        },
        reItem(item){
            let tobitv = item.bitv <= config.output.bitv ? item.bitv : config.output.bitv;
                tobita = item.bita <= config.output.bita ? item.bita : config.output.bita,
                quality = (tobitv+tobita)/(item.bitv+item.bita)*100;

            item.quality = quality ? quality.toFixed(2) : 100;
            item.toname = item.name.slice(0, -item.format.length-1);
            item.toformat = Media.is(item.format, item.type) ? item.format : config.output.format[item.type];
            item.startTime = 0;
            item.endTime = item.duration;
            item.cover = false;
            item.coverTime = 0;
            item.towidth = item.width;
            item.toheight = item.height;
            item.tofps = item.fps;
        },
        //event function
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
        toolbarFn(e){
            let target = e.currentTarget,
                name = target.name,
                classList = target.classList,
                dropMenu = vue.$refs[name],
                prevMenu,
                key;

            if(name !== vue.toolbar.drop){
                if(prevMenu = vue.$refs[vue.toolbar.drop]) prevMenu.classList.remove('zoom-in');
            }
            vue.toolbar.drop = name;

            if(dropMenu){
                dropMenu.classList.toggle('zoom-in');
                dropMenu.style.top = (target.offsetTop + target.offsetHeight)+ 'px';
                dropMenu.style.left = target.offsetLeft + 'px';
                if(!dropMenu.classList.contains('zoom-in')) vue.toolbar.drop = '';
            }
            switch(name){
                case 'chosefile': inputEl.click(); break;
                case 'chosedir': outputEl.click(); break;
            }
        },
        convertFn(){
            if(Media.ffmpeg !== null){
                vue.dialog.show = true;
                vue.dialog.title = '警告！';
                vue.dialog.body = '<p>文件正在处理，请勿重复点击。</p>';
                return false;
            }

            let item, bita, bitv, w, h, total, output, cammand,
                keys = Object.keys(vue.items),
                i = 0;

            if(keys[i]){
                recycle(vue.items[ keys[i] ]);
            }else{
                vue.dialog.show = true;
                vue.dialog.title = '警告！';
                vue.dialog.body = '<p>没有输入任何文件！</p>';
            }

            function recycle(item){
                bita = item.bita < config.output.bita ? item.bita : config.output.bita;
                bitv = Math.round(item.quality*(item.bitv+item.bita)/100 - bita);
                w = item.towidth;
                h = item.toheight;
                total = item.endTime - item.startTime;
                output = vue.output + '\\' + item.toname + '.' + item.toformat;
                cammand = [];
                //如果是序列图
                if(item.series){
                    if(item.type !== 'image'){
                        vue.dialog.show = true;
                        vue.dialog.title = '警告！';
                        vue.dialog.body = '<p>选择只有图片才支持“序列”选项，文件：“'+item.path+'”不是图片文件。</p>';
                        return;
                    }
                    if(item.toformat !== 'gif' && !Media.is(item.toformat, 'video')){
                        vue.dialog.show = true;
                        vue.dialog.title = '警告！';
                        vue.dialog.body = '<p>序列图只能转为视频或动图(gif)，您当前选择的输出格式“'+item.toformat+'”不被支持</p>';
                        return;
                    }
                    let reg = new RegExp('(\\d+)\\.'+item.format+'$','i'),
                        match = reg.exec(item.path);
                    if(match && match[1]){
                        cammand.push('-y','-r', 25, '-i', item.path.replace(reg, function($0,$1){
                            return '%0'+$1.length+'d.'+item.format;
                        }));

                        if(w%2 !== 0) w--;
                        if(h%2 !== 0) h--;
                        cammand.push('-s',w+'x'+h);

                        if(item.toformat !== 'gif') cammand.push('-pix_fmt','yuv420p');
                        cammand.push(output);
                    }else{
                        vue.dialog.show = true;
                        vue.dialog.title = '错误！';
                        vue.dialog.body = `<p>序列图不满足条件！</p>
                        <p>序列图名称必须是有规律、等长度、末尾带序列化数字的名称。</p>
                        <p>如：001.png、002.png、003.png... 或 img01.png、img02.png、img03.png...</p>
                        <p>然后只需要选择第一张图片即可</p>`;
                    }
                }else{
                   //图片不能输出为音频
                    if(item.type === 'image' && Media.is(item.toformat, 'audio')){
                        vue.dialog.show = true;
                        vue.dialog.title = '错误！';
                        vue.dialog.body = '<p>文件：“'+item.path+'”，图像文件无法输出为音频！</p>';
                        return;
                    }
                    //音频不能输出为图片
                    if(item.type === 'audio' && (Media.is(item.toformat, 'image') || item.cover) ){
                        vue.dialog.show = true;
                        vue.dialog.title = '错误！';
                        vue.dialog.body = '<p>文件：“'+item.path+'”，音频文件无法输出为图像</p>';
                        return;
                    }

                    if(item.startTime > 0) cammand.push('-ss', item.startTime);
                    if(item.path) cammand.push('-i', item.path);

                    //输出为单图时
                    if(Media.is(item.toformat, 'image') && item.toformat !== 'gif'){
                        cammand.push('-vframes',1);
                    }
                    //输出为其他时
                    else{
                        if(item.endTime < item.duration) cammand.push('-t', total);
                        if(bitv) cammand.push('-b:v', bitv+'k');
                        if(bita) cammand.push('-b:a', bita+'k');
                    }
                    
                    if(w && h){
                        if(w%2 !== 0) w--;
                        if(h%2 !== 0) h--;
                        cammand.push('-s', w+'x'+h);
                    }

                    if(Media.is(item.toformat, 'video')) cammand.push('-pix_fmt','yuv420p');

                    cammand.push('-preset', vue.batchParams.speed, '-y', output); 
                }
                

                //只允许输出为视频文件时可输出预览图
                if(item.cover && !Media.is(item.toformat, 'image')){
                    w = item.coverWidth;
                    h = w * item.scale;
                    if(w%2 !== 0) w--;
                    if(h%2 !== 0) h--;
                    if(item.coverTime > 0) cammand.push('-ss', item.coverTime - item.startTime);
                    cammand.push('-vframes', 1, '-s', w+'x'+h,vue.output+'\\'+item.toname+'.jpg');
                }

                item.progress = 0;
                Media.convert({
                    cammand,
                    progress(t){
                        if(total){
                            item.progress = Math.round((t/total)*100);
                        }else{
                            item.progress = 50;
                        }
                    },
                    complete(code, msg){
                        if(code === 0){
                            item.progress = 100;
                            i++;
                            if(keys[i]) recycle(vue.items[ keys[i] ]);
                        }else{
                            vue.dialog.show = true;
                            vue.dialog.title = '失败！';
                            vue.dialog.body = '<p>失败原因：'+msg+'</p>';
                            item.progress = 0;
                        }
                    }
                });
            }
        },
        spriteFn(code){
            
            if(typeof code !== 'string'){
                vue.dropMenuClose('sprite');
                if(code === -1) return;
                let spriteList = document.getElementById('sprite-list'),
                    items = spriteList.querySelectorAll('.sprite-item'),
                    imgs = spriteList.querySelectorAll('img'),
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

                Media.canvasToFile(vue.output+'\\sprite.png', canvas.toDataURL('image/png'), vue.dialog);
            }else if(code === 'align'){
                alignFn( parseInt(arguments[1].target.value) );
                
            }else if(code == 'matrix'){
                vue.sprite.align = parseInt(arguments[1].target.value);
                console.log(vue.sprite.align);
                alignFn( parseInt(vue.$refs.spriteAlign.value) );
            }
            function alignFn(val){
                if(vue.sprite.align == 1){
                    vue.sprite.listCss = '';
                    switch(val){
                        case 2: vue.sprite.itemCss = 'vertical-align: middle;'; break;
                        case 3: vue.sprite.itemCss = 'vertical-align: bottom;'; break;
                        default: vue.sprite.itemCss = 'vertical-align: top;';
                    }
                }else if(vue.sprite.align == 2){
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
                    vue.dropMenuClose('batch');
                }
                break;
                case 1:
                {
                    for( key in vue.items) vue.reItem(vue.items[key]);
                    vue.dropMenuClose('batch');
                }
                break;
                default:
                    vue.dropMenuClose('batch');
            }
            
        },
        nameAllFn(code){
            vue.dropMenuClose('batch');
            if(code === -1) return;

            let output, n;
            n = 0;
            i = 0;
            k = Object.keys(vue.items)[0];
            item = vue.items[k];
            
            if(item){
                recycle(item)
            }else{
                vue.dialog.show = true;
                vue.dialog.body = '<p>没有输入任何文件！</p>';
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
            };
            function oneComplete(err){
                item = vue.items[k];
                if(err){
                    vue.dialog.show = true;
                    vue.dialog.title = '错误！';
                    vue.dialog.body = `<p>有文件重命名失败！</p>
                    <details class="dialog-details">
                        <summary>详细错误</summary>
                        <p>${err.toString()}</p>
                    </details>`;
                    vue.dialog.btns.push('继续','退出');
                    vue.dialog.callback = function(c){
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
                vue.dialog.show = true;
                vue.dialog.title = '结束！';
                vue.dialog.body = '<p>输出目录：'+vue.output+', 可前往查看序列化重命名结果。</p>';
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
                            vue.dialog.show = true;
                            vue.dialog.title = '失败！';
                            vue.dialog.body = '<p>'+err+'</p>';
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
                        vue.dialog.show = true;
                        vue.dialog.body = '<p>帧速率不能超过 60</p>';
                        return;
                    }
                    if(params.mode !== 2 && params.mode !== 3 && !params.audioDevice){
                        vue.dialog.show = true;
                        vue.dialog.body = '<p>无可用于录制音频的设备，请检测设备或查看帮助文档。</p>';
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
                        vue.dialog.show = true;
                        if(err){
                            vue.dialog.title = '失败！';
                            vue.dialog.body = `<p>错误码：${err.code}</p>
                            <details class="dialog-details">
                                <summary>详细错误</summary>
                                <p>${err.message}</p>
                            </details>`;
                        }else{
                            vue.dialog.title = '完成！';
                            vue.dialog.body = '<p>输出位置：'+output+'</p>';
                        }
                    }
                    capture.start(output, vue.capParams, vue.dialog);
                }
                break;
            }
            if(code === 0 || code === -1){
                vue.dropMenuClose('capture');
            }
        },
        helpFn(e){
            let target = e.currentTarget,
                name = target.name;

            vue.dropMenuClose('help');

            switch(name){
                case 'pdf2pic':
                    nw.Window.open('plugins/pdf2pic/pdf2pic.html',{
                        position: 'center',
                        new_instance: false,
                        focus: true,
                        frame: false,
                        width: win.width,
                        height: win.height
                    });
                break;
                case 'firstAid':
                    vue.dialog.show = true;
                    vue.dialog.title = '严重提示！';
                    vue.dialog.body = '<p>为了避免失误操作，必须谨慎选择是否真的启用急救，不到万不得已，请不要轻易启用！当然，它也可以强制中止正在处理的程序。</p>';
                    vue.dialog.btns.push('启用','关闭');
                    vue.dialog.callback = function(code){
                        if(code === 0){
                            Media.killAll();
                        }
                        target.classList.remove('active-1');
                    }
                break;
                case 'helpBook':
                    nw.Shell.openExternal(config.appInfo.helpUrl);
                break;
            }
        },
        videoFn(e, index, type){
            let item = vue.items[index],
                video = vue.$refs['id'+index][0];
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
                step,
                tmptime;

            switch(str){
                case 'del': vue.$delete(vue.items, index); break;
                case 'delAll':
                {
                    for(let key in vue.items) vue.$delete(vue.items, key);
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
                        vue.getThumb(item);
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
                        vue.getThumb(item);
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
                        vue.getThumb(item);
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
        dialogFn(e, code){
            vue.dialog.show = false;
            vue.dialog.title = '';
            vue.dialog.body = '';
            vue.dialog.btns.length = 0;
            if(typeof vue.dialog.callback === 'function'){
                vue.dialog.callback.call(e.currentTarget,code);
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
Media.dialog = vue.dialog;