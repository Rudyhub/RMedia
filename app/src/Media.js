const fs = require('fs'),
stream = require('stream'),
childprocess = require('child_process'),
config = require('./config');
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
    info(options){
        let o = {
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
        this.metadata(o.url,(json)=>{
            json.thumb = '';
            if(json.type === 'audio'){
                json.thumb = config.audioThumb;
                o.success(json);
            }else{
                if(config.formats.image.indexOf(json.ext) !== -1){
                    json.thumb = o.url;
                    o.success(json);
                }else{
                    let time = '', format = o.format, status = true;
                    if(json.type === 'video'){
                        time = o.time ? ' -ss '+o.time : ' -ss '+(json.duration / 2);
                    }
                    switch(o.format){
                        case 'jpg': format = 'image2'; break;
                        case 'gif': format = 'gif'; break;
                        default: format = 'apng';
                    }
                    let ffmpeg = childprocess.exec(config.ffmpegRoot+'/ffmpeg.exe'+time+' -i "'+o.url+'" -vframes 1 -vf "scale='+o.scale+'" -y  -f '+format+' "'+config.appRoot+'cache/thumb"',(err,stdout,stderr)=>{
                        if(!err){
                            let thumb = fs.readFileSync(config.appRoot+'cache/thumb');
                            json.thumb = window.URL.createObjectURL(new Blob([thumb], {type:'image/'+o.format}));
                            thumb = null;
                        }else{
                            if(status && o.fail){
                                status = false;
                                o.fail(err);
                            }
                        }
                    }).once('close', (a,b)=>{
                        if(a === 0){
                            o.success(json);
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
                }
            }
        }, o.fail);
    },
    convert(o){
        let cammand = [],
            ffmpeg;
        if(o.ss){
            cammand.push('-ss',o.ss);
        }
        cammand.push('-hide_banner','-i',o.input);
        if(o.cammand){
            cammand = cammand.concat(o.cammand.split(/\s+/));
        }
        if(o.duration){
            cammand.push('-t',o.duration);
        }
        if(o.size && /^\d+:-?\d+$/.test(o.size)){
            cammand.push('-vf','scale='+o.size);
        }
        cammand.push('-y',o.output);
        let ffmpeg = childprocess.spawn(config.ffmpegRoot+'/ffmpeg.exe',cammand);
        if(typeof o.progress === 'function'){
            ffmpeg.stderr.on('data', (stderr)=>{
                let line = stderr.toString(),
                    times = line.match(/time=\s*([\d\.:]+)\s+/i),
                    time = 0
                    percent = 0;    
                if(times){
                    let timesplit = times[1].split(':');
                    time = ( parseFloat(timesplit[0])*3600 + parseFloat(timesplit[1])*60 + parseFloat(timesplit[2]) )*1000;
                    if(o.duration){
                        percent = Math.round(100*time/(o.duration*1000));
                    }else{
                        percent = 100;
                    }
                    o.progress(percent);
                }
            });
        }
        ffmpeg.on('exit', function(a,b){
            if(a === 0){
                if(typeof o.progress === 'function') o.progress(100);
                if(typeof o.success === 'function') o.success();
            }else{
                if(typeof o.error === 'function') o.error(b);
            }
            if(typeof o.complete === 'function'){
                o.complete(a,b);
            }
        });
        ffmpeg.on('error', function(e,a,b){
            if(typeof o.error === 'function') o.error(e, a, b);
        });
    },
    ffmpeg: null,
    killAll(){
        childprocess.exec('TASKKILL /F /IM ffmpeg.exe', (err,stdout, stderr)=>{
            console.log(stderr);
        });
    },
    decode(url){
        let ffmpeg = childprocess.spawn(config.ffmpegRoot+'/ffmpeg.exe',['-re','-ss','0','-i',url,'-r','5','-vf','scale=320:-1','-y','-f','image2','pipe:null'],[null,'pipe','inhert']);
        let wstream = stream.Writable();
        wstream.write = (chunk)=>{
            console.log(chunk.toString('base64'));
        }
        ffmpeg.stdout.pipe(wstream);
        ffmpeg.stderr.on('data',(e)=>{
            console.log(e.toString());
        });
    },
    play(url,time,callback){
        if(this.ffmpeg){
            this.ffmpeg.kill();
        }
        this.ffmpeg = childprocess.spawn(config.ffmpegRoot+'/ffmpeg.exe',['-ss',time,'-i', url,'-b:v','96k','-vf','scale=320:-1','-f','hls','-hls_playlist_type', 'event', config.appRoot+'cache/list.m3u8']);
        let isStarted = false;
        this.ffmpeg.stderr.on('data', (stderr)=>{
            if(!isStarted) {
                isStarted = true;
                callback(config.appRoot+'cache/list.m3u8');
            }
        });
        this.ffmpeg.on('error',()=>{
            console.log('启动子进程失败。');
        });
    },
    finalImg(url, type, quality, fn){
        let c = document.createElement('canvas');
        let cv = c.getContext('2d');
        let img = new window.Image();
        img.src = url;
        img.addEventListener('load', function loaded(){
            img.removeEventListener('load', loaded);
            c.width = img.width;
            c.height = img.height;
            cv.drawImage(img, 0, 0, img.width, img.height);
            console.log(type);
            let data = c.toDataURL(type, quality);
            if(fn) fn( new Buffer(data.replace(/^data:image\/\w+;base64,/, ''), 'base64'), data);
            c = null;
            cv = null;
            img = null;
            data = null;
        });
    }
};