const fs = require('fs'),
childprocess = require('child_process'),
config = require('./config'),
utils = require('./utils');

module.exports = {
    ffmpeg: null,
    //第一个子数组为支持直接预览的格式，第二个需要转码
    formats: {
        image: [['jpg','jpeg','png','gif','webp','ico','bmp','jps','mpo'],['tga','psd','iff','pbm','pcx','tif']],
        video: [['mp4','ogg','webm'],['ts','flv','mkv','rm','mov','wmv','avi','rmvb']],
        audio: [['mp3','wav','mpeg'],['wma','mid']]
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
        ffmpeg = childprocess.exec(config.ffmpegPath+' -ss '+(o.time || '00:00:00')+' -i "'+o.input+'" -vframes 1 -s '+w+'x'+h+' -y  -f '+format+' "'+config.cacheThumb+'"',(err,stdout,stderr)=>{
            if(!err){
                let tmp = fs.readFileSync(config.cacheThumb);
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
    info(o, dialog){
        let self = this;
        if(!o.input) {
            dialog.show = true;
            dialog.title = '地址错误：';
            dialog.body = '<p>无效媒体文件地址!</p>';
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
    convert(o){
        let self = this,
            ffmpeg,
            line;

        if(!o.cammand) return;
        if(!o.cammand.length) return;
        o.cammand.unshift('-hide_banner');
        ffmpeg = childprocess.spawn(config.ffmpegPath, o.cammand);
        ffmpeg.stderr.on('data', (stderr)=>{
            if(o.progress){
                line = stderr.toString();
                line = /time=\s*([\d\:\.]+)?/.exec(line);
                if(line) o.progress( utils.timemat(line[1]) / 1000 );
            }
        });
        ffmpeg.once('close', (a, b)=>{
            self.ffmpeg = null;
            if(o.complete) o.complete(a, (a !== 0) ? '处理失败 ' + b : b);
        });
        ffmpeg.once('error', (err)=>{
            self.ffmpeg = null;
            if(o.complete) o.complete(2, '启动失败 '+err);
        });
        self.ffmpeg = ffmpeg;
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
    },
    canvasToFile(path, data, dialog){
        fs.writeFile(path, data.replace(/^data:image\/\w+;base64,/, ''), 'base64', (err)=>{
            if(err){
                dialog.show = true;
                dialog.title = '失败！';
                dialog.body = '<p>错误信息：'+err.message+'</p>';
            }else{
                dialog.show = true;
                dialog.title = '成功！';
                dialog.body = '<p>文件输出位置：'+path+'</p>';
            }
        });
    },
    writeFile: fs.writeFile
};