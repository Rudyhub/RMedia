const gui = require('nw.gui');
const win = gui.Window.get();
const sourcePath = process.cwd() + '/app/source/';
const Fns = require('../src/functions');
const Fup = require('../src/Fup');
const Media = require('../src/Media');

function getItemHtml(type, label, index, filename, sizes, width, height, quality){
    let s1 = (sizes[0]/1024),
        s2 = (sizes[1]/1024),
        unit = 'KB';
    if(type !== 'image'){
        s1 = s1/1024;
        s2 = s2/1024;
        unit = 'MB';
    }

    return `<div class="flex-item">
        <div class="file-show">`+label+`</div>
        <ul class="file-info" data-fupid="`+ index +`">
            <li><i>名称：</i>`+filename+`</li>
            <li><i>大小：</i>` + (!s1 ? '未知' : (s1.toFixed(2) + unit ) )+ `</li>
            `+(type !== 'audio'? ('<li><i>尺寸：</i>'+ width + ' x ' + height + '</li>') : '')+`
            <li><i>压缩率：</i>` + (quality ? quality : '默认') +`</li>
            <li><i>预估压缩后大小：</i>` + (!s2 ? '未知' : (s2.toFixed(2) + unit) ) + `</li>
        </ul>
    </div>`;
}

new Fup({
    data:{
        output: '',
        list: ''
    },
    infoList: [],
    methods:{
        chosefile: function(el){
            let files = el.files;
            //clear before add
            this.infoList.splice(0, this.infoList.length);
            this.data.list = '';

            if(files && files.length){
                let that = this, i = 0, index = 0, info, type, label;
                function recycle(file){
                    if(!file) return false;

                    type = file.type.slice(0,5);
                    if(!/image|video|audio/.test(type)){
                        recycle(files[++i]);
                        return false;
                    }
                    info = {
                        path: file.path,
                        quality: 75,
                        size: file.size
                    };
                    Media.info(info.path, function(md){
                        switch (type){
                            case 'image':
                                info.width = md.width;
                                info.height = md.height;
                                label = '<img src="'+info.path+'">';
                                break;
                            case 'video':
                                info.width = md.width;
                                info.height = md.height;
                                info.duration = md.duration;
                                info.bit = md.bit;
                                info.bitv = md.bitv;
                                info.bita = md.bita;
                                info.start = 0;
                                info.end = info.duration;
                                label = '<img src="'+sourcePath+'audio.jpg">';
                                break;
                            case 'audio':
                                info.duration = md.duration;
                                info.bit = md.bit;
                                info.start = 0;
                                info.end = info.duration;
                                label = '<img src="'+sourcePath+'audio.jpg">';
                        }
                        if(file.type === 'image/jpeg'){
                            Media.finalImg(info.path, file.type, info.quality/100, function(buff){
                                that.data.list += getItemHtml(type, label, index++, file.name, [file.size, buff.length], info.width, info.height);
                                that.infoList[index] = info;
                                recycle( files[++i] );
                            });
                        }else{
                            that.data.list += getItemHtml(type, label, index++, file.name, [file.size, 0], info.width, info.height);
                            that.infoList[index] = info;
                            recycle( files[++i] );
                        }
                    }, function(err){
                        console.log(err);
                        recycle( files[++i] );
                    });
                }
                recycle(files[i]);
            }
        },
        chosedir: function(el){
            this.data.output = '输出的目录是：'+el.files[0].path;
        },
        minimize: function(){
            win.minimize();
        },
        wintoggle: function (el) {
            let w = screen.availWidth, h = screen.availHeight;
            if(win.width < w){
                win.width = w;
                win.height = h;
                win.x = 0;
                win.y = 0;
                Fns.addClass(el, 'full');
            }else{
                win.width = w*.8;
                win.height = h*.8;
                win.x = w*.1;
                win.y = h*.1;
                Fns.removeClass(el, 'full');
            }
        },
        winclose: function(){
            win.close();
        },
        zoomInItem: function(el,e){

        }
    }
});
