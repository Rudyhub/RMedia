const fs = require('fs'),
path = require('path'),
Vue = require('./vue.min'),
formats = {
    image: [['jpg','jpeg','png','gif','webp','ico','bmp','jps','mpo'],['tga','psd','iff','pbm','pcx','tif']],
    video: [['mp4','ogg','webm','mpeg','mkv'],['ts','flv','rm','mov','wmv','avi','rmvb']],
    audio: [['mp3','wav','mpeg'],['wma','mid']]
};

module.exports = {
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
    canvasToFile(url, data, dialog){
        fs.writeFile(url, data.replace(/^data:image\/\w+;base64,/, ''), 'base64', (err)=>{
            if(err){
                dialog.show = true;
                dialog.title = '失败！';
                dialog.body = '<p>错误信息：'+err.message+'</p>';
            }else{
                dialog.show = true;
                dialog.title = '成功！';
                dialog.body = '<p>文件输出位置：'+url+'</p>';
            }
        });
    },
    path(p){
        if(typeof p === 'boolean'){
            return path;
        }
        return path.normalize(p);
    },
    type(format){
        let types = ['audio','image','video'],
            i = types.length;
        for(; i--;){
            if(formats[types[i]][0].includes(format) || formats[types[i]][1].includes(format)) return types[i];
        }
    },
    usableType(ext, name){
        return formats[name][0].includes(ext);
    },
    has(url){
        return fs.existsSync(url);
    },
    timemat(time){
        let t;
        if(typeof time === 'string' && /^\d{2}:\d{2}:\d{2}([\.\d]*)$/.test(time)){
            t = time.split(':');
            return (parseInt(t[0]*3600) + parseInt(t[1]*60) + parseFloat(t[2])) * 1000;
        }else if(typeof time === 'number'){
            if(isNaN(time)) return '00:00:00';
            t = time / 1000;
            let h = Math.floor( t/3600 ).toString(),
                m = Math.floor( (t%3600) / 60 ).toString(),
                s = Math.floor( t%60 ).toString();
            return h.padStart(2,0) + ':' + m.padStart(2,0) + ':' + s.padStart(2,0);
        }else{
            return "error time";
        }
    },
    datemat(time){
        let date;
        if(typeof time === 'number'){
            date = new Date(time);
        }else if(typeof time === 'string'){
            return new Date(time).getTime();
        }else{
            date = new Date();
        }
        return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
    },
    sizemat(b, flag){
        if(!flag){
            if(b < 1024) return b + ' B';
            let size = b/1024,
                fixed = arguments[1] || 2;
            if(size < 1024){
                return size.toFixed(fixed) + ' KB';
            }else{
                return (size/1024).toFixed(fixed) + ' MB';
            }
        }else{
            if(/^[\d\.]+\s*KB$/.test(b)){
                return parseFloat(b)*1024;
            }else if(/^[\d\.]+\s*MB$/.test(b)){
                return parseFloat(b)*1024*1024;
            }else{
                return parseFloat(b);
            }
        }
    },
    namemat(str,n){
        if(/\d+$/g.test(str)){
            return str.replace(/\d+$/g, function(a){
                return (parseInt('1'+a) + n).toString().slice(1);
            });
        }
        return str + (100 + n).toString().slice(1);
    },
    css(node, name){
        return parseFloat(window.getComputedStyle(node)[name]);
    },
    dialog: new Vue({
        el: '#dialog',
        data: {
            show: false,
            title: '',
            body: '',
            btns: []
        },
        methods: {
            setBtn(){
                this.btns.splice(0, this.btns.length);
                this.btns.push(...arguments);
            },
            dialogFn(e, code){
                this.show = false;
                this.title = '';
                this.body = '';
                this.btns.splice(0, this.btns.length);
                if(typeof this.callback === 'function'){
                    this.callback.call(e.currentTarget, code);
                }
            }
        }
    }),
    menu: new Vue({
        el: '#contextmenu',
        data: {
            show: false,
            x: 0,
            y: 0,
            items: []
        },
        methods: {
            setItem(){
                this.items.splice(0, this.items.length);
                this.items.push(...arguments);
            },
            contextmenuFn(e){
                let target = e.target;
                if(!target.hasAttribute('data-name')) return false;
                this.show = false;
                this.items.splice(0, this.items.length);
                if(typeof this.callback === 'function'){
                    this.callback.call(target, target.dataset.name);
                    this.callback = null;
                    this.x = this.y = 0;
                }
            }
        }
    })
};
