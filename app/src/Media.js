const config = require('./config'),
fs = require('fs'),
childprocess = require('child_process'),
//html支持的格式
formats = {
    image: ['jpg','jpeg','png','gif','webp','svg','ico','bmp','jps','mpo'],
    video: ['mp4','ogg','webm'],
    audio: ['aac','mp3','wav']
},
//需要转码为html支持的格式
otherFormats = {
    image: ['tga','psd','iff','pbm','pcx','tif'],
    video: ['ts','flv','mkv','rm','mov','wmv','avi','rmvb'],
    audio: ['wma','mid']
},
images = formats.image.concat( otherFormats.image ),
videos = formats.video.concat( otherFormats.video ),
audios = formats.audio.concat( otherFormats.audio );

function getThumb(url,options){
    let size = options.scale ? options.scale : '320:-1',
    time = options.time ? ' -ss '+options.time : '',
    vframes = options.time ? ' -vframes 1' : '',
    extend = options.format || 'png',
    format = (extend === 'jpg' || extend === 'jpeg' ) ? 'image2' : (extend === 'png' ? 'apng' : 'gif'), 
    thumb = config.appRoot+'cache/thumb';
    let ffmpeg = childprocess.exec(config.ffmpegRoot+'/ffmpeg.exe'+time+' -i "'+url+'"'+vframes+' -vf "scale='+size+'" -y  -f '+format+' "'+thumb+'"',(err)=>{
        if(!err){
            let data = [],
            len = 0,
            rs = fs.createReadStream(thumb);
            rs.on('data', function(chunk){
                data.push(chunk);
                len += chunk.length;
            });
            rs.on('end', function(){
                if(typeof options.success === 'function'){
                    options.success( 'data:image/'+extend+';base64,' + Buffer.concat(data, len).toString('base64') );
                }
            });
            if(typeof options.error === 'function'){
                rs.on('error', options.error);
            }
        }
    });
}
function getInfo(url,options){
    let ffmpeg,
    extend = url.slice(url.lastIndexOf('.')+1),
    streamtype = audios.indexOf( extend ) !== -1 ? 'a' : 'v',
    ffprobe = childprocess.exec(config.ffmpegRoot+'/ffprobe.exe -hide_banner -print_format json -show_format -show_streams -select_streams '+streamtype+' -i "'+url+'"',(err,stdout,stderr)=>{
        if(err){
            if(typeof options.error === 'function') options.error(err);
        }else{
            let data = JSON.parse(stdout),
                streams = data.streams,
                o = {
                    extend: extend,
                    size: data.format.size,
                    bit: parseFloat(data.format['bit_rate'])
                };
            if(images.indexOf(extend) !== -1){
                o.source = url;
                o.mediaType = 'image';
                o.width = streams[0].width;
                o.height = streams[0].height;
                o.bitv = streams[0]['bit_rate'];
                o.toformats = images;
                if(otherFormats.image.indexOf(extend) !== -1){
                    getThumb(url,{
                        success: (base64) => {
                            o.source = base64;
                            options.success(o);
                        }
                    });
                }else{
                    options.success(o);
                }
            }else{
                o.mediaType = streams[0].codec_type;
                o.duration = data.format.duration;
                if(o.mediaType === 'video'){
                    o.width = streams[0].width;
                    o.height = streams[0].height;
                    o.bitv = streams[0]['bit_rate'];
                    o.toformats = videos.concat(audios,images);
                    getThumb(url,{
                        time: o.duration / 2,
                        success: (base64) => {
                            o.source = base64;
                            options.success(o);
                        }
                    });
                }else if(o.mediaType === 'audio'){
                    o.bita = streams[0]['bit_rate'];
                    o.toformats = audios;
                    o.source = config.audioThumb;
                    options.success(o);
                }
            }
        }
    });
}

//use for convert one video file
function convert(o){
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
    ffmpeg = childprocess.spawn(config.ffmpegRoot+'/ffmpeg.exe',cammand);
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
}

module.exports = {
    info: getInfo,
    seek: getThumb,
    convert: convert,
    finalImg: function(url, type, quality, fn){
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