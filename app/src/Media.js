const config = require('./config');
const ffmpeg = config.ffmpeg();
const childprocess = require('child_process');
/*
const fs = require('fs');
function dimg(){
    let c = document.createElement('canvas');
    let cv = c.getContext('2d');
    let img = new window.Image();
    let qli = 0.5;
    img.src = './source/icon_128X128.png';
    img.onload = function(){
        c.width = img.width;
        c.height = img.height;
        cv.drawImage(img, 0, 0, img.width, img.height);
        // let newimg = document.getElementById('test');
        let data = c.toDataURL('image/png',qli);
        // newimg.src = data;
        data = data.replace(/^data:image\/\w+;base64,/, '');
        console.log(data.length);
        data = new Buffer(data, 'base64');

        fs.writeFile('C:/users/administrator/desktop/'+qli+'.png',data,function(err){
            console.log(err);
        });
    };
}
*/
// dimg();
module.exports = {
    info: function(url,success, fail){
        if(!success) return;
        ffmpeg.ffprobe(url, function(err, data){
            if(err){
                if(fail) fail(err);
            }else {
                try{
                    let stm = data.streams,
                        a, v, o;
                    for(let i=0; i<stm.length; i++){
                        if(stm[i]['codec_type'] === 'video'){
                            v = stm[i];
                        }else if(stm[i]['codec_type'] === 'audio'){
                            a = stm[i];
                        }
                    }
                    
                    o = {
                        duration: parseFloat(data.format.duration) || 0,
                        size: data.format.size,
                        bit: data.format['bit_rate']
                    };
                    if(v){
                        o.width = v.width;
                        o.height = v.height;
                        o.bitv = v['bit_rate'];
                    }
                    if(a){
                        o.bita = a['bit_rate'];
                    }
                    if(success) success(o, data);
                }catch (err){
                    if(fail) fail(err);
                }
            }
        });
    },
    previewBase64: function(url, success, fail){
        if(!success) return;
        let p = ffmpeg(url).outputOptions(['-ss 1', '-y', '-f image2', '-t 1']).noAudio().size('320x?').pipe().on('data',function(chunk){
            success( 'data:image/png;base64,'+btoa(String.fromCharCode.apply(null,chunk)) );
        });
        if(fail) p.on('error', fail);
    },
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
    },
    convert: function(url){
        let q = 23;

        let ls = childprocess.spawn(ffmpegPath+'ffmpeg.exe',['-i',url,'-hide_banner','-q','3000','-preset','slow','-y','c:/Users/wwp/desktop/'+q+'.jpg']);
        // let ls = childprocess.spawn(ffmpegPath+'ffmpeg.exe',['-i',url,'-hide_banner','-b:v', '3000k','-bufsize','3000k','-c:v','libx264','-preset','slow','-y','c:/Users/wwp/desktop/'+q+'.mp4']);
        // ls.stdout.on('data', function (d) {
        //     // console.log(d);
        // });
        ls.stderr.on('data', errfn);
        function errfn(d){
            console.log(d.toString());
        }
        ls.on('exit',function fn() {
            ls.off('data',errfn);
            ls.off('exit', fn);
        });
    }
};