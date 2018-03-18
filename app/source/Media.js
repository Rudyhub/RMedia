const childprocess = require('child_process'),
config = require('./config'),
utils = require('./utils'),
fs = require('fs');

//用于暂存单帧base64数据的临时文件，即预览图数据来源。
let THUMB_TEMP_FILE = 'rmedia.temp';
fs.writeFileSync(THUMB_TEMP_FILE,'');

nw.process.on('exit',()=>{
    fs.unlinkSync(THUMB_TEMP_FILE);
});

module.exports = {
    ffmpeg: null,
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
                type: null,
                vchannel: '',
                achannel: '',
                aclayout: 0
            },
            status = true,

            ffmpeg = childprocess.exec(config.ffmpegPath+' -hide_banner -i "'+url+'" -vframes 1 -f null -', (err,stdout, stderr)=>{
            let lines = stderr.split(/\n/), i = 0, len = lines.length, line, match;
            for(; i < len; i++){
                line = lines[i].trim();
                if(/(^stream\s*mapping)|(^output)/i.test(line)) break;
                if( match = /^duration\s*:\s*([\s\S]*?)\s*,[\s\S]*?bitrate\s*:\s*([\d\.]+)\s*kb\/s$/i.exec( line ) ){
                    let times = match[1].toString().split(':');
                    json.duration = parseInt(times[0])*3600 + parseInt(times[1])*60 + parseFloat(times[2]);
                    json.bit = parseFloat(match[2]);
                }
                else if(match = /^stream\s+#(\d+:\d+)[\s\S]*?video\s*:\s*([\s\S]*?)$/i.exec( line )){
                    let size, fps, bitv;
                    json.vchannel = match[1];
                    if( size = /,\s*(\d+)x(\d+)/i.exec(match[2]) ){
                        json.width = parseFloat(size[1]);
                        json.height = parseFloat(size[2]);
                    }
                    if( fps = /,\s*([\d\.]+)\s*fps\s*,/i.exec(match[2]) ){
                        json.fps = parseFloat(fps[1]);
                    }
                    if( bitv = /,\s*([\d\.]+)\s*kb\/s/i.exec(match[2]) ){
                        json.bitv = parseFloat(bitv[1]);
                    }
                }
                else if(match = /^stream\s+#(\d+:\d+)[\s\S]*?audio\s*:\s*([\s\S]*?)$/i.exec( line ) ){
                    let aclayout, bita;
                    json.achannel = match[1];
                    if(aclayout = /stereo|mono/i.exec(match[2]) ){
                        json.aclayout = aclayout[0] == 'stereo' ? 2 : 1;
                    }
                    if(bita = /,\s*([\d\.]+)\s*kb\/s/i.exec(match[2]) ){
                        json.bita = parseFloat(bita[1]);
                    }
                }
            }

            if(json.width > 0 && json.height > 0){
                if(json.fps === 0 || json.ext === 'gif'){
                    json.type = 'image';
                    json.duration = 0;
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

        ffmpeg = childprocess.exec(config.ffmpegPath+(o.time ? ' -ss '+o.time: '')+' -i "'+o.input+'" -vframes 1 -s '+w+'x'+h+' -y  -f '+format+' "'+THUMB_TEMP_FILE+'"',(err,stdout,stderr)=>{
            if(!err){
                thumb = window.URL.createObjectURL(new Blob([fs.readFileSync(THUMB_TEMP_FILE)], {type:'image/'+o.format}));
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
    useThumb(item){
        if(!item) return;
        this.thumb({
            input: item.path,
            time: item.currentTime,
            success(src){
                item.thumb = src;
            },
            fail(){
                utils.dialog.show = true;
                utils.dialog.title = '错误！';
                utils.dialog.body = '无法生成预览。';
            }
        });
    },
    info(o){
        let self = this;
        if(!o.input) {
            utils.dialog.show = true;
            utils.dialog.title = '地址错误：';
            utils.dialog.body = '<p>无效媒体文件地址!</p>';
            return;
        }
        if(!o.success) return;
        self.metadata(o.input,(json)=>{
            json.thumb = '';
            if(json.type === 'audio'){
                json.thumb = config.audioThumb;
                o.success(json);
            }else{
                if(utils.usableType(json.ext,'image')){
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
        if(this.ffmpeg) this.ffmpeg.signalCode = '强制退出所有';
        childprocess.exec('TASKKILL /F /IM ffmpeg.exe', (err,stdout, stderr)=>{
            if(fn) fn(stderr.toString());
        });
    },
    end(signalCode){
        if(this.ffmpeg){
            this.ffmpeg.stdin.write('q\n');
            this.ffmpeg.signalCode = signalCode;
        }
    },
    cammand(item, outFolder){
        let bita, bitv, w, h, total, outPath, result, exists;

        bita = item.bita < config.output.bita ? item.bita : config.output.bita;
        bitv = Math.round(item.quality*(item.bitv+item.bita)/100 - bita);
        w = Math.round(item.towidth);
        h = Math.round(item.toheight);
        total = item.endTime - item.startTime;
        outPath = utils.path(outFolder + '\\' + item.toname);
        result = {
            error: null,
            cmd: []
        };
        exists = [];

        //时间
        if(item.startTime > 0) result.cmd.push('-ss', item.startTime);
        if(total > 0 && item.endTime !== item.duration) result.cmd.push('-t', total);

        //输入
        if(item.type === 'image' && item.series){
            if(item.totype === 'image' && item.toformat !== 'gif'){
                result.error = new Error(`在文件“${item.path}”选中了序列图，所以输出格式必须是视频或gif。请选好后再继续？`);
                result.error.code = 1;
                return result;
            }
            let reg = new RegExp('(\\d+)\\.'+item.format+'$','i'),
                match = reg.exec(item.path);
            if(match && match[1]){
                result.cmd.push('-r', 25, '-i', item.path.replace(reg, function($0,$1){
                    return '%0'+$1.length+'d.'+item.format;
                }));
            }else{
                result.error = new Error(`<p>选中了序列图，但输入的文件“${item.path}”不符合！</p>
                <p>序列图名称必须是有规律、等长度、末尾带序列化数字的名称。</p>
                <p>如：001.png、002.png、003.png... 或 img01.png、img02.png、img03.png...</p>
                <p>然后只需要选择第一张图片即可</p>`);
                result.error.code = 1;
                return result;
            }
        }else{
            result.cmd.push('-i', item.path);
        }

        //1.判断输入文件是否存在，有中途被转移或删除的情况
        if(!utils.has(item.path)){
            result.error = new Error('输入文件“'+item.path+'”不存在，可能文件路径被更改或文件被删除。');
            result.error.code = 1;
            return result;
        }

        //如果输出音频
        if(item.totype === 'audio'){
            if(item.achannel){
                if(bita) result.cmd.push('-ab', bita+'k');
                if(item.split && item.aclayout > 1){
                    //2.判断如果文件已存在，把已存在的暂存到exists中，方便枚举到error中，外部可用以提示是否覆盖。以下同里
                    if(utils.has(outPath+'_left.mp3')) exists.push('_left.mp3');
                    if(utils.has(outPath+'_right.mp3')) exists.push('_right.mp3');

                    result.cmd.push('-map_channel', item.achannel.replace(':','.')+'.0', outPath+'_left.mp3', '-map_channel', item.achannel.replace(':','.')+'.1', outPath+'_right.mp3');
                    return result;
                }
                if(item.type !== 'audio') result.cmd.push('-vn');
                //2...
                if(utils.has(outPath+'.'+item.toformat)) exists.push('.'+item.toformat);

                result.cmd.push(outPath+'.'+item.toformat);
                return result;
            }
            result.error = new Error(`输入的文件“${item.path}”无音频数据或者无法解析音频数据。`);
            result.error.code = 1;
            return result;
        }

        //尺寸
        if(w>0 && h>0){
            if(w%2 !== 0) w--;
            if(h%2 !== 0) h--;

            let filters = '[0:v]scale='+w+':'+h;
            //如果有水印
            if(item.logo && !item.series){
                //1...
                if(!utils.has(item.logo)){
                    result.error = new Error('输入文件“'+item.path+'”不存在，可能文件路径被更改或文件被删除。');
                    result.error.code = 1;
                    return result;
                }

                result.cmd.push('-i', item.logo);

                let lw = Math.round(item.logoSize/100 * w),
                    lh = Math.round(lw * item.logoScale),
                    lt = Math.round(item.logoY/100 * h),
                    ll = Math.round(item.logoX/100 * w),
                    st = item.logoEnd>item.logoStart ? item.logoStart-item.startTime : 0,
                    et = item.logoEnd>item.logoStart ? item.logoEnd-item.startTime : 0;
                if(st > 0) ll = 'if(gte(t,'+Math.round(st)+'),'+ll+',NAN)';
                if(st > 0 && et > 0) lt = 'if(lte(t,'+Math.round(et)+'),'+lt+',NAN)';
                filters += '[media];[1:v]scale='+lw+':'+lh+'[logo];[media][logo]overlay=\''+ll+'\':\''+lt+'\'';
            }
            result.cmd.push('-filter_complex', filters);
        }

        //如果输出视频
        if(item.totype === 'video'){
            if(item.type === 'video'){
                if(bitv) result.cmd.push('-vb', bitv+'k');
            }
            if(item.type !== 'image'){
                if(bita) result.cmd.push('-ab', bita+'k');
            }
            if(item.type !== 'audio') result.cmd.push('-pix_fmt', 'yuv420p');

            if(item.split){
                if(item.vchannel) result.cmd.push('-map', item.vchannel);

                result.cmd.push(outPath+'.'+item.toformat);

                if(item.achannel){
                    if(item.aclayout > 1){
                        //2...
                        if(utils.has(outPath+'_left.mp3')) exists.push('_left.mp3');
                        if(utils.has(outPath+'_right.mp3')) exists.push('_right.mp3');
                        result.cmd.push('-map_channel', item.achannel.replace(':','.')+'.0', outPath+'_left.mp3', '-map_channel', item.achannel.replace(':','.')+'.1', outPath+'_right.mp3');
                    }else{
                        //2...
                        if(utils.has(outPath+'.'+item.toformat)) exists.push('.mp3');
                        result.cmd.push('-map', item.achannel, outPath+'.mp3');
                    }
                }
            }else{
                //2...
                if(utils.has(outPath+'.'+item.toformat)) exists.push('.'+item.toformat);
                result.cmd.push(outPath +'.'+ item.toformat);
            }
        }
        
        //如果输出图片
        if(item.totype === 'image'){
            //2...
            if(utils.has(outPath+'.'+item.toformat)) exists.push('.'+item.toformat);
            result.cmd.push(outPath +'.'+ item.toformat);
        }

        //如果有预览图
        if(item.cover && !item.series){
            w = item.coverWidth;
            h = Math.round(w * item.scale);
            if(w%2 !== 0) w--;
            if(h%2 !== 0) h--;

            result.cmd.push('-map', item.vchannel);
            if(item.coverTime > 0) result.cmd.push('-ss', item.coverTime - item.startTime);
            if(item.duration > 0) result.cmd.push('-vframes', 1);
            //2...
            if(utils.has(outPath+'.'+item.toformat)) exists.push('_thumb.jpg');
            result.cmd.push('-s', w+'x'+h, outPath+'_thumb.jpg');
        }

        //如果文件已存在，枚举所有
        if(exists.length){
            let i = 0, len = exists.length, msg = '<p><b>输出的以下文件已存在：</b></p><ol>';
            for(; i<len; i++){
                msg += `<li>${outPath+exists[i]}</li>`;
            }
            msg += '</ol>';
            result.error = new Error(msg);
            result.error.code = 2;
        }
        exists = null;
        return result;
    },
    convert(o){
        let self = this,
            line,
            ffmpeg;

        if(!o.cammand) return;
        if(!o.cammand.length) return;

        o.cammand.unshift('-hide_banner','-y');

        ffmpeg = childprocess.spawn(config.ffmpegPath, o.cammand);
        ffmpeg.stderr.on('data', (stderr)=>{
            line = stderr.toString().trim();
            if(o.progress){
                line = /time=\s*([\d\:\.]+)?/.exec(line);
                if(line) o.progress( utils.timemat(line[1]) / 1000 );
            }
        });
        ffmpeg.once('close', (a, b)=>{
            self.ffmpeg = null;
            if(o.complete) o.complete(a, b);
        });
        ffmpeg.once('error', (err)=>{
            self.ffmpeg = null;
            if(o.complete) o.complete(2, '启动失败 '+err);
        });
        self.ffmpeg = ffmpeg;
    }
};