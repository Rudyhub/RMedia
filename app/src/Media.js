const config = require('./config'),
ffmpeg = require('fluent-ffmpeg'),
//html支持的格式
formats = {
    image: ['png','jpg','jpeg','png','gif','webp','svg','ico','bmp','jps','mpo'],
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

ffmpeg.setFfmpegPath(config.ffmpegRoot + 'ffmpeg.exe');
ffmpeg.setFfprobePath(config.ffmpegRoot +'ffprobe.exe');
function getInfo(url,options){
    let extend, success, fail, size = '320x?';
    if(typeof options === 'object'){
        success = options.success;
        fail = options.fail;
        size = options.size ? options.size : size;
    }else if(typeof options === 'function'){
        success = options;
    }
    options = null;

    if(typeof success !== 'function') return;

    extend = url.slice(url.lastIndexOf('.')+1);

    ffmpeg.ffprobe(url, function(err, data){
        if(err){
            if(fail) fail(err);
        }else {
            let stm = data.streams,
                o = {
                    extend: extend,
                    size: data.format.size,
                    bit: parseFloat(data.format['bit_rate'])
                };
            if(images.indexOf(extend) !== -1){
                o.source = url;
                o.width = stm[0].width;
                o.height = stm[0].height;
                o.bitv = stm[0]['bit_rate'];
                o.toformats = images;
                o.mediaType = 'image';

                if(otherFormats.image.indexOf(extend) !== -1){
                    ffmpeg(url).outputOptions(['-f image2','-y']).noAudio().size(size).pipe().on('data',function(chunk){
                        o.source = 'data:image/png;base64,'+btoa(String.fromCharCode.apply(null,chunk));
                        success(o);
                    }).on('error', function(){
                        success(o);
                    });
                }else{
                    success(o);
                }
            }else{
                o.duration = data.format.duration;
                for(let i=0; i<stm.length; i++){
                    if(stm[i]['codec_type'] === 'video'){
                        o.width = stm[i].width;
                        o.height = stm[i].height;
                        o.bitv = parseFloat(stm[i]['bit_rate']);
                    }else if(stm[i]['codec_type'] === 'audio'){
                        o.bita = parseFloat(stm[i]['bit_rate']);
                    }
                }
                if(videos.indexOf(extend) !== -1){
                    o.mediaType = 'video';
                    o.toformats = videos.concat(audios);
                    ffmpeg(url).seekInput(o.duration/2).outputOptions(['-vframes 1','-an','-f image2', '-y']).size(size).pipe().on('data',function(chunk){
                        o.source = 'data:image/png;base64,'+btoa(String.fromCharCode.apply(null,chunk));
                        success(o);
                    }).on('error', function(){
                        success(o);
                    });
                }else if(audios.indexOf(extend) !== -1){
                    o.mediaType = 'audio';
                    o.toformats = audios;
                    o.source = config.audioThumb;
                    success(o);
                }else{
                    success(o);
                }
            }
        }
    });
}


module.exports = {
    info: getInfo,
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