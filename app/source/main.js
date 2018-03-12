const win = nw.Window.get(),
    version = require('./version'),
    config = require('./config'),
    Media = require('./Media'),
    utils = require('./utils'),
    capture = require('./capture'),
    Vue = require('./vue.min'),
    shortcut = require('./shortcut'),

    videoEl = document.createElement('video'),
    inputEl = document.createElement('input'),
    outputEl = document.createElement('input'),
    logoInput = document.createElement('input'),
    canvas = document.createElement('canvas');

win.on('loaded',()=>{
    win.width = screen.availWidth;
    win.height = screen.availHeight;
    win.x = win.y = 0;
    win.show();
});

function listItems(files){
    let i = 0,
        item,
        key,
        tobitv,
        tobita;
    if(files.length){
        for(key in vue.items){
            window.URL.revokeObjectURL(vue.items[key].thumb);
            vue.$delete(vue.items, key);
        }
        recycle(files[0]);
        function recycle(file){
            item = {
                path: file.path,
                thumb: '',
                canplay: !!videoEl.canPlayType(file.type),
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
                tofps: 0,

                split: false,
                achannel: '',
                aclayout: 0,
                vchannel: ''
            };

            vue.$set(vue.items, key = Object.keys(vue.items).length, item);
            // Media.meta(file.path);
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
                        utils.dialog.callback = null;
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

shortcut({inputEl, outputEl, listItems});

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
            sizeLimit: 0
        },
        toolbar: {
            drop: 0,
            toggle: {
                lock: 1,
                alpha: 1
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
        framestep: 2
	},
    created(){
        inputEl.type = outputEl.type = logoInput.type = 'file';
        inputEl.multiple = true;
        outputEl.nwdirectory = true;

        inputEl.addEventListener('change', (e)=>{
            vue.dropMenuClose('chosefile');
            listItems(inputEl.files);
        });
        inputEl.addEventListener('cancel', ()=>{
            vue.dropMenuClose('chosefile');
        });

        outputEl.addEventListener('change', ()=>{
            vue.dropMenuClose('chosedir');
            vue.output = outputEl.files[0].path || '';
        });
        outputEl.addEventListener('cancel', ()=>{
            vue.dropMenuClose('chosedir');
        });

        logoInput.addEventListener('change', ()=>{
            if(/^image\/[\w-]+$/i.test(logoInput.files[0].type)){
                let activeIndex = logoInput.dataset.activeIndex,
                    logoPath = logoInput.files[0].path,
                    img = new Image();
                img.onload = ()=>{
                    if(activeIndex === 'all'){
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
                    utils.dialog.show = true;
                    utils.dialog.title = '错误！';
                    utils.dialog.body = '<p>微调发生错误！</p>';
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
            item.towidth = item.width > config.output.width ? config.output.width : item.width;
            item.toheight = parseInt(item.towidth * item.scale);
            item.tofps = item.fps;
        },
        zoomItemFn(e){
            vue.viewWidth = win.width * parseFloat(e.currentTarget.value);
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
                case 'chosefile': inputEl.value = ''; inputEl.click(); break;
                case 'chosedir': outputEl.click(); break;
                case 'pdf2pic':
                    nw.Window.open('plugins/pdf2pic/pdf2pic.html',{
                        id: 'pdf2pic',
                        position: 'center',
                        new_instance: false,
                        focus: true,
                        frame: false,
                        width: win.width*.8,
                        height: win.height*.8
                    });
                break;
            }
        },
        convertFn(e){
            let item, bita, bitv, w, h, total, output, cammand, keys, len, i, target;

            target = e.currentTarget;
            target.dataset.stopAll = 0;
            if(Media.ffmpeg !== null){
                utils.dialog.show = true;
                utils.dialog.title = '<i class="icon icon-question"></i>';
                utils.dialog.body = '<p>文件正在处理，如果中止，不能确保已输出的部分是正常的，是否中止？</p>';
                utils.dialog.setBtn('中止当前','中止全部','取消');
                utils.dialog.callback = function(code){
                    utils.dialog.callback = null;
                    if(code === 0 || code === 1){
                        Media.ffmpeg.stdin.write('q\n');
                        Media.ffmpeg.signalCode = '主动中止，' + this.innerText;
                        vue.isStarted = false;
                        target.dataset.stopAll = code;
                    }
                }
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
                bita = item.bita < config.output.bita ? item.bita : config.output.bita;
                bitv = Math.round(item.quality*(item.bitv+item.bita)/100 - bita);
                w = item.towidth;
                h = item.toheight;
                total = item.endTime - item.startTime;
                output = vue.output + '\\' + item.toname + '.' + item.toformat;
                cammand = [];
                //如果是分离音视频
                if(item.split){
                    if(item.vchannel && item.achannel){
                        if(item.startTime > 0) cammand.push('-ss', item.startTime);
                        if(total > 0) cammand.push('-t', total);

                        cammand.push('-i', item.path, '-map', item.vchannel, '-pix_fmt', 'yuv420p');

                        if(w && h){
                            if(w%2 !== 0) w--;
                            if(h%2 !== 0) h--;
                            cammand.push('-s', w+'x'+h);
                        }

                        cammand.push(output);

                        achannel = item.achannel.replace(':','.');
                        if(item.aclayout === 2){
                            cammand.push('-map_channel', achannel+'.0', vue.output + '\\' + item.toname + '_1.mp3',
                                '-map_channel', achannel+'.1', vue.output + '\\' + item.toname + '_2.mp3');
                        }else{
                            cammand.push('-map', item.achannel, vue.output + '\\' + item.toname + '.mp3');
                        }
                    }else{
                        utils.dialog.show = true;
                        utils.dialog.body = '<p>文件“'+item.path+'”不支持分离！</p>';
                    }
                }else{
                    //如果是序列图
                    if(item.series){
                        if(item.type !== 'image'){
                            utils.dialog.show = true;
                            utils.dialog.title = '警告！';
                            utils.dialog.body = '<p>选择只有图片才支持“序列”选项，文件：“'+item.path+'”不是图片文件。</p>';
                            return;
                        }
                        if(item.toformat !== 'gif' && !Media.is(item.toformat, 'video')){
                            utils.dialog.show = true;
                            utils.dialog.title = '警告！';
                            utils.dialog.body = '<p>序列图只能转为视频或动图(gif)，您当前选择的输出格式“'+item.toformat+'”不被支持</p>';
                            return;
                        }
                        let reg = new RegExp('(\\d+)\\.'+item.format+'$','i'),
                            match = reg.exec(item.path);
                        if(match && match[1]){
                            cammand.push('-r', 25, '-i', item.path.replace(reg, function($0,$1){
                                return '%0'+$1.length+'d.'+item.format;
                            }));
                        }else{
                            utils.dialog.show = true;
                            utils.dialog.title = '错误！';
                            utils.dialog.body = `<p>序列图不满足条件！</p>
                            <p>序列图名称必须是有规律、等长度、末尾带序列化数字的名称。</p>
                            <p>如：001.png、002.png、003.png... 或 img01.png、img02.png、img03.png...</p>
                            <p>然后只需要选择第一张图片即可</p>`;
                        }
                    }else{
                       //图片不能输出为音频
                        if(item.type === 'image' && Media.is(item.toformat, 'audio')){
                            utils.dialog.show = true;
                            utils.dialog.title = '错误！';
                            utils.dialog.body = '<p>文件：“'+item.path+'”，图像文件无法输出为音频！</p>';
                            return;
                        }
                        //音频不能输出为图片
                        if(item.type === 'audio' && (Media.is(item.toformat, 'image') || item.cover) ){
                            utils.dialog.show = true;
                            utils.dialog.title = '错误！';
                            utils.dialog.body = '<p>文件：“'+item.path+'”，音频文件无法输出为图像</p>';
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
                    }
                    //比例
                    if(w && h){
                        if(w%2 !== 0) w--;
                        if(h%2 !== 0) h--;
                        cammand.push('-s', w+'x'+h);
                    }

                    if(Media.is(item.toformat, 'video')) cammand.push('-pix_fmt','yuv420p');
                    cammand.push('-preset', vue.batchParams.speed, output);
                }
                
                //只允许输出为视频文件时可输出预览图
                if(item.cover && Media.is(item.toformat, 'video')){
                    w = item.coverWidth;
                    h = w * item.scale;
                    if(w%2 !== 0) w--;
                    if(h%2 !== 0) h--;
                    if(item.coverTime > 0) cammand.push('-ss', item.coverTime - item.startTime);
                    cammand.push('-vframes', 1, '-s', w+'x'+h,vue.output+'\\'+item.toname+'.jpg');
                }

                item.progress = 0;
                vue.isStarted = true;

                Media.convert({
                    cammand,
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
                                    utils.dialog.callback = null;
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
                });
            }
        },
        spriteFn(code){
            if(typeof code !== 'string'){
                vue.dropMenuClose('sprite');
                if(code === -1 || !Object.keys(vue.items).length) return;
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

                Media.canvasToFile(vue.output+'\\sprite.png', canvas.toDataURL('image/png'), utils.dialog);
            }else if(code === 'align'){
                alignFn( parseInt(arguments[1].target.value) );
            }else if(code == 'matrix'){
                vue.sprite.align = parseInt(arguments[1].target.value);
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
                            if(vue.batchParams.sizeLimit < item.size){
                                item.quality = quality;
                            }else{
                                item.quality = 100;
                            }
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
            };
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
                        utils.dialog.callback = null;
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
                        start();
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
                }
                capture.start(output, vue.capParams);
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
                case 'firstAid':
                    utils.dialog.show = true;
                    utils.dialog.title = '严重提示！';
                    utils.dialog.body = '<p>为了避免失误操作，必须谨慎选择是否真的启用急救，不到万不得已，请不要轻易启用！当然，它也可以强制中止正在处理的程序。</p>';
                    utils.dialog.setBtn('启用','关闭');
                    utils.dialog.callback = function(code){
                        utils.dialog.callback = null;
                        if(code === 0){
                            Media.killAll();
                        }
                        target.classList.remove('active-1');
                    }
                break;
                case 'helpBook':
                    nw.Shell.openExternal(vue.app.documentation);
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
                    if(item.currentTime < item.startTime || item.currentTime > item.endTime ){
                        utils.dialog.show = true;
                        utils.dialog.title = '注意';
                        utils.dialog.body = '<p>取预览图的位置必须是在截取时间'+utils.timemat(item.startTime*1000)+'到'+utils.timemat(item.endTime*1000)+'</p>';
                        utils.dialog.callback = ()=>{
                            utils.dialog.callback = null;
                            item.coverTime = item.currentTime > item.startTime ? item.endTime : item.startTime;
                            item.currentTime = item.coverTime;
                            if(item.canplay){
                                vue.$refs['id'+index][0].currentTime = item.currentTime;
                            }else if(item.type === 'video'){
                                vue.getThumb(item);
                            }
                        }
                    }else{
                        item.coverTime = item.currentTime;
                    }
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
                    utils.menu.show = true;
                    utils.menu.x = e.x;
                    utils.menu.y = e.y;
                    let menu = [{html: item.logo ? '替换':'添加',name:'add'}];
                    if(item.logo){
                        menu.push({html:'删除',name:'delete'},{html:'快速定位 <i class="icon icon-point-right"></i>',submenu:[
                            {html:'左上',name:'lt'},
                            {html:'右上',name:'rt'},
                            {html:'中心',name:'c'},
                            {html:'左下',name:'lb'},
                            {html:'右下',name:'rb'}
                        ]});
                    } 
                    menu.push({html:'关闭菜单',name:'close'});
                    utils.menu.setItem(...menu);
                    utils.menu.callback = (name)=>{
                        switch(name){
                            case 'add':
                                logoInput.value = '';
                                logoInput.click();
                            break;
                            case 'delete':
                                item.logo = '';
                            break;
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
                            case 'lt':
                                item.logoX = 1;
                                item.logoY = 2;
                            break;
                            case 'rt':
                                item.logoX = 99 - item.logoSize;
                                item.logoY = 2;
                            break;
                            case 'c':
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

document.title = vue.app.window.title;
//check update
version(vue.app.documentation, vue.app.version, utils.dialog);