const fs = require('fs'),
childprocess = require('child_process'),
config = require('./config'),

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
}
module.exports = {
    metadata(url,success,fail){
        let ext = url.slice(url.lastIndexOf('.')+1),
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
                if(config.formats.image.indexOf(json.ext) !== -1){
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