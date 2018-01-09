const win = nw.Window.get();
const config = require('./config');
const Media = require('./Media');
const utils = require('./utils');
const screencap = require('./screencap');
const showThumb = (item)=>{
    if(!item) return;
    Media.thumb({
        input: item.path,
        time: item.currentTime,
        success(src){
            item.video.poster = src;
        },
        fail(){
            console.log(arguments);
        }
    });
};
const vue = new Vue({
	el: '#app',
	data: {
		items: [],
		output: config.output.folder,
		isFullScreen: true,
		defwidth: config.output.width,
		dropSlidedown: false,
		nameAll: 'fup',
		widthLimit: 1280,
		heightLimit: 720,
		sizeLimit: 0,
		speeds: {
			ultrafast: '无敌快',
			superfast: '超级快',
			veryfast: '非常快',
			faster: '比较快',
			fast: '正常快',
			medium: '普通',
			slow: '正常慢',
			slower: '比较慢',
			veryslow: '非常慢',
			placebo: '超级慢'
		},
        speedLevel: 'slow',
        mediaIcon: {
            image: 'icon-image',
            video: 'icon-video-camera',
            audio: 'icon-headphones'
        },
        alpha: false,
        tunstep: 2
	},
	methods: {
		minimize(){
			win.minimize();
		},
		wintoggle(){
			let w = screen.availWidth, h = screen.availHeight;
            if(win.width < w || win.height < h){
                win.maximize();
                vue.isFullScreen = true;
            }else{
                win.resizeTo(w*.8, h*.8);
                vue.isFullScreen = false;
            }
		},
		winclose(){
			win.close(true);
            win = null;
		},
		chosefile(e){
			let files = e.target.files,
				i = 0;
			if(files && files.length){
				recycle(files[0]);
				function recycle(file){
                    let item = {
							path: file.path,
                            hide: false,
                            video: null,
                            canplay: false,
                            playing: false,
                            progress: 0,
							name: file.name,
							size: file.size,
							lock: false,
							width: 0,
							height: 0,
							duration: 0,
							format: '',
							editable: false,
                            fps: 0,
                            currentTime: 0,
							toname: file.name,
							tosize: 0,
							towidth: vue.defwidth,
							toheight: Math.round(vue.defwidth*0.5625),
							toformat: '',
							starttime: 0,
							endtime: 0,
                            cover: 0,
                            bitv: 0,
                            bita: 0
						},
                        video = document.createElement('video');

                    video.className = 'item-preview-img';
                    video.src = file.path;
                    video.poster = config.loadingGif;
                    item.video = video;
                    item.canplay = !!video.canPlayType(file.type);
                    video.ontimeupdate = ()=>{
                        item.currentTime = video.currentTime;
                    };
                    video.onplay = ()=>{
                        item.playing = true;
                    };
                    video.onpause = ()=>{
                        item.playing = false;
                    }
					vue.items.push(item);
					Media.info({
						url: file.path,
						success: (json)=>{
                            item.format = json.ext;
							item.width = json.width;
							item.height = json.height;
							item.duration = json.duration;
                            item.endtime = json.duration;
                            item.corver = json.duration/2;
							item.type = json.type;
                            item.towidth = item.width > vue.defwidth ? vue.defwidth : item.width;
                            item.toheight = json.width ? Math.round(item.towidth * (item.height/item.width) ) : 0;
                            item.fps = json.fps;
                            item.toformat = config.output.format[ item.type ];
                            item.video.poster = json.thumb;
                            item.bitv = json.bitv && json.bitv <= config.output.bitv ? json.bitv : config.output.bitv;
                            item.bita = json.bita && json.bita <= config.output.bita ? json.bita : config.output.bita;
                            item.tosize = (item.bitv+item.bita)*1000*item.duration/8;
							i++;
							if(files[i]) recycle(files[i]);
						},
						fail: (err)=>{
                            utils.dialog('提示：',
                            '<p><span>文件：“'+file.name+'”可能不支持！错误信息：'+err+'。是否保留以尝试转码？</span></p>',
                            ['是','否'],
                            (code)=>{
                                if(code === 1) item.hide = true;
                                i++;
                                if(files[i]) recycle(files[i]);
                            });
						}
					});
				}
			}
		},
		chosedir(e){
            vue.output = e.target.files[0].path || '';
        },
        itemFn(e, index, str){
        	let item = vue.items[index],
                target = e.target,
                step = (1/item.fps)*vue.tunstep,
                tmptime;
        	switch(str){
        		case 'del':
                    item.hide = true;
                    if(item.canplay)
                    item.video.pause();
                    break;
        		case 'edit':
                    item.editable = !item.editable;
                    break;
        		case 'lock':
                    item.lock = !item.lock;
                    break;
                case 'currentTime':
                    if(item.canplay){
                        item.video.pause();
                    }
                    item.currentTime = parseFloat(target.value);
                    break;
                case 'timeSlide':
                    if(item.canplay){
                        item.video.currentTime = item.currentTime;
                    }else{
                        showThumb(item);
                    }
                    break;
                case 'prevFrame':
                    if(item.currentTime > step){
                        item.currentTime -= step;
                    }else{
                        item.currentTime = 0;
                    }
                    if(item.canplay){
                        item.video.pause();
                        item.video.currentTime = item.currentTime;
                    }else{
                        showThumb(item);
                    }
                    break;
                case 'nextFrame':
                    if(item.currentTime < item.duration - step){
                        item.currentTime += step;
                    }else{
                        item.currentTime = item.duration;
                    }
                    if(item.canplay){
                        item.video.pause();
                        item.video.currentTime = item.currentTime;
                    }else{
                        showThumb(item);
                    }
                    break;
                case 'setstart':
                    item.starttime = item.currentTime;
                    if(item.starttime > item.endtime){
                        item.endtime = item.starttime;
                    }
                    break;
                case 'setend':
                    if(item.currentTime < item.starttime){
                        item.starttime = item.currentTime;
                    }
                    item.endtime = item.currentTime;
                    break;
                case 'cover':
                    item.cover = item.currentTime;
                    break;
        		case 'towidth':
        			item.towidth = parseInt(target.value) || 0;
        			item.toheight = Math.round((item.height / item.width) * item.towidth);
        			break;
        		case 'toheight':
        			item.toheight = parseInt(target.value) || 0;
        			item.towidth = Math.round(item.toheight / (item.height / item.width));
        			break;
        	}
        },
        alphaFn(){
            vue.alpha = !vue.alpha;
        },
        openCutScreen(e){
            if(e.ctrlKey){
                // document.documentElement.style.transform = 'scale(1)';
                // win.restore();
            }else{
                screencap.hide();
            }
        },
        firstAid(){
            utils.dialog('警告：','<p><span>为了避免失误操作，你必须谨慎选择是否真的启用急救?</span></p>',['启用','关闭'],(code)=>{
                if(code === 0){
                    Media.killAll((msg)=>{
                        utils.dialog('提示：','<p><span>所有可能的错误程序已被清除！</span><br>详细：'+msg+'</p>');
                    });
                }
            });
        },
        play(e, index){
            let item = vue.items[index];
            if(!item.canplay) return;
            if(item.video.paused){
                item.video.play();
            }else{
                item.video.pause();
            }
        },
        convert(index){
            if(Media.ffmpeg){
                utils.dialog('禁止：',
                    '<p><span>转码程序正在进行，如果不是错误，请不要选择“强行中断”！</span></p>',
                    ['关闭','强行中断'],
                    function(code){
                        if(code === 1){
                            Media.ffmpeg.kill();
                        }
                    });
                return;
            }

            let i = index === -1 ? 0 : index,
                seek = 0,
                duration = 0,
                cammand = '';
            function loop(item){
                if(item.hide){
                    i++;
                    if(vue.items[i]) loop(vue.items[i]);
                    return;
                }

                if(item.type === 'image' && !/\.gif$/i.test(item.path)){
                    seek = 0,
                    duration = 0;
                    cammand = '';
                }else{
                    seek = item.starttime;
                    duration = item.endtime - item.starttime;
                    if(!duration){
                        //视频转图片
                        cammand = '-vframes|1';
                        seek = item.cover;
                    }else if(duration < 0){
                        //错误情况：起点大于终点
                        utils.dialog('错误操作：','<p><span>设置的终点不能在起点之前。</span></p>');
                        return;
                    }else{
                        cammand = '-b:v|'+item.bitv+'k|-b:a|'+item.bita+'k|-preset|'+vue.speedLevel;
                    }
                }
                Media.convert({
                    input: item.path,
                    seek: seek,
                    duration: duration,
                    cammand: cammand,
                    output: vue.output +'/'+ item.toname + '.' + item.toformat,
                    progress(percent){
                        item.progress = percent + '%';
                    },
                    complete(code,msg){
                        if(code !== 0){
                            utils.dialog('Oh no！','<p>发生了错误！错误详情：'+msg+'</p>');
                            item.progress = '';
                        }else{
                            item.progress = '100%';
                            if(index === -1){
                                i++;
                                if(vue.items[i]) loop(vue.items[i]);
                            }
                        }
                    }
                });
            };
            if(vue.items[i])
            loop(vue.items[i]);
        },
        nameAllFn(e){
        	vue.nameAll = e.target.value;
        	let len = vue.items.length, i = 0, n = 0;
        	for(; i < len; i++){
        		if(vue.items[i].lock){
        			vue.items[i].toname = utils.namemat(vue.nameAll, ++n);
        		}
        	}
        },
        sizeLimitFn(e){
        	vue.sizeLimit = e.target.value;
        	let len = vue.items.length, i = 0, n = 0;
        	for(; i < len; i++){
        		if(vue.items[i].lock){
        			n = utils.sizemat(e.target.value, true);
        			vue.items[i].tosize = n < vue.items[i].size ? n : vue.items[i].size;
        		}
        	}
		},
		whLimitFn(e,n){
			vue[n+'Limit'] = parseInt(e.target.value);
			let len = vue.items.length, i = 0;
        	for(; i < len; i++){
        		if(vue.items[i].lock){
        			vue.items[i]['to'+n] = vue[n+'Limit'] < vue.items[i][n] ? vue[n+'Limit'] : vue.items[i][n];
        		}
        	}
		},
        gotoSetAll(){
        	vue.dropSlidedown = !vue.dropSlidedown;
        }
	},
	filters: {
		timemat(t){
			return utils.timemat(t*1000);
		},
		sizemat(val,attr){
			if(attr === 'size'){
				return utils.sizemat(val);
			}else{
				let tmp = parseFloat(val).toFixed(2);
				if(tmp){
					return utils.sizemat(tmp);
				}
			}
			return 'auto';
		}
	},
    directives: {
        child: {
            bind(el, binding){
                el.innerHTML = '';
                el.appendChild(binding.value);
            }
        }
    }
});