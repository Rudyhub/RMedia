const win = nw.Window.get();
const config = require('./src/config');
const Media = require('./src/Media');
const utils = require('./src/utils');
const video = document.createElement('video');
video.className = 'item-preview-img';
video.controls = true;

new Vue({
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
        isConverting: false,
        alpha: false
	},
	methods: {
		minimize(){
			win.minimize();
		},
		wintoggle(){
			let w = screen.availWidth, h = screen.availHeight;
            if(win.width < w){
                win.width = w;
                win.height = h;
                win.x = 0;
                win.y = 0;
                this.isFullScreen = true;
            }else{
                win.width = w*.8;
                win.height = h*.8;
                win.x = w*.1;
                win.y = h*.1;
                this.isFullScreen = false;
            }
		},
		winclose(){
			win.close();
		},
		chosefile(e){
			let vue = this,
				files = e.target.files,
				i = 0;
			if(files && files.length){
				recycle(files[0]);
				function recycle(file){
					let itemO = {
							id: i,
							path: file.path,
                            thumb: config.appRoot+'css/loading.gif',
                            playing: false,
							name: file.name,
							size: file.size,
							lock: false,
							width: 0,
							height: 0,
							duration: 0,
							format: '',
							progress: 0,
							progressColor: '',
							editable: false,
                            fps: 0,

							toname: file.name,
							tosize: 0,
							towidth: vue.defwidth,
							toheight: Math.round(vue.defwidth*0.5625),
							toformat: '',
							starttime: 0,
							endtime: 0
						};
					vue.items.push(itemO);
					Media.info({
						url: file.path,
						success: (json)=>{
                            itemO.format = json.ext;
							itemO.width = json.width;
							itemO.height = json.height;
							itemO.duration = json.duration;
                            itemO.endtime = json.duration;
							itemO.type = json.type;
                            itemO.towidth = itemO.width > vue.defwidth ? vue.defwidth : itemO.width;
                            itemO.toheight = json.width ? Math.round(itemO.towidth * (itemO.height/itemO.width) ) : 0;
                            itemO.fps = json.fps;
                            itemO.toformat = config.output.format[ itemO.type ];
                            itemO.bitv = parseFloat(json.bitv) || 0;
                            itemO.bita = parseFloat(json.bita) || 0;
                            itemO.thumb = json.thumb;
							i++;
							if(files[i]) recycle(files[i]);
						},
						fail: (err)=>{
							alert('文件：“'+file.name+'”不支持！错误信息：'+err);
							vue.items.splice(vue.items.length-1, 1);
							i++;
							if(files[i]) recycle(files[i]);
						}
					});
				}
			}
		},
		chosedir(e){
            this.output = e.target.files[0].path || '';
        },
        itemFn(e, index, str){
        	let vue = this,
        		item = vue.items[index],
                tmptime;
        	switch(str){
        		case 'del':
                    vue.items.splice(index,1);
                    break;
        		case 'edit':
                    item.editable = !item.editable;
                    break;
        		case 'lock':
                    item.lock = !item.lock;
                    break;
        		case 'towidth':
        			item.towidth = parseInt(e.target.value) || 0;
        			item.toheight = Math.round((item.height / item.width) * item.towidth);
        			break;
        		case 'toheight':
        			item.toheight = parseInt(e.target.value) || 0;
        			item.towidth = Math.round(item.toheight / (item.height / item.width));
        			break;
        		case 'setstart': 
                    item.starttime = video.currentTime;
        			break;
        		case 'setend':
                    item.endtime = video.currentTime;
        			break;
        	}
        },
        alphaFn(){
            this.alpha = !this.alpha;
        },
        play(e, index){
            let item = this.items[index];
            e.target.parentNode.append(video);
            for(var i=0, len=this.items.length; i<len; i++){
                this.items[i].playing = false;
            }
            item.playing = true;
            video.src = item.path;
            try{
            	video.play();
            }catch(err){
            	//需要转码
            }
        },
        convert(index){
            console.log(this.items);
        	/*
            if(this.isConverting) return;
            this.isConverting = true;
            
            let vue = this,
                items = index === -1 ? vue.items : [vue.items[index]];
            cv(items[0]);
            function cv(item){
                item.rotating = true;
                item.progress = 0;
                item.progressColor = '';

                let r = 255, g = 0, cuttime = item.endtime - item.starttime, tosize = null,
                options = {
                    input: item.path,
                    ss: item.starttime,
                    duration: cuttime,
                    output: vue.output +'/'+ item.toname + '.' + item.toformat,
                    progress: function(percent){
                        if(cuttime <= 0 || !cuttime){
                            percent = 100;
                            r = 60;
                            b = 150;
                        }
                        if(g < 150){
                            g = Math.round( percent * 3.5 );
                        }else{
                            r = 255 - Math.round( (percent - g/3.5) * 3.5);
                        }
                        item.progress = Math.round(percent) + '%';
                        item.progressColor = 'rgba('+r+','+g+',0,0.5)';
                    },
                    error: function(e){
                        item.rotating = false;
                        alert('发生了错误：' + e.message);
                    },
                    complete: function(){
                        item.rotating = false;
                    }
                };
                
                switch(item.type){
                    case 'video':
                        options.size = item.towidth + ':' + item.toheight;
                        if(cuttime === 0){
                            //to create image from a frame
                            options.cammand = '-vframes 1';
                        }else{
                            options.cammand = '-b:v '+item.tosize*8/item.duration+' -preset '+vue.speedLevel;
                        }
                        Media.convert(options);
                        break;
                    case 'audio':
                        if(cuttime > 0){
                            cammand = '-preset '+vue.speedLevel;
                            Media.convert(options);
                        }
                        break;
                    case 'image':
                        ;
                    break;
                }
            }
            */
        },
        nameAllFn(e){
        	this.nameAll = e.target.value;
        	let len = this.items.length, i = 0, n = 0;
        	for(; i < len; i++){
        		if(this.items[i].lock){
        			this.items[i].toname = utils.namemat(this.nameAll, ++n);
        		}
        	}
        },
        sizeLimitFn(e){
        	this.sizeLimit = e.target.value;
        	let len = this.items.length, i = 0, n = 0;
        	for(; i < len; i++){
        		if(this.items[i].lock){
        			n = utils.sizemat(e.target.value, true);
        			this.items[i].tosize = n < this.items[i].size ? n : this.items[i].size;
        		}
        	}
		},
		whLimitFn(e,n){
			this[n+'Limit'] = parseInt(e.target.value);
			let len = this.items.length, i = 0;
        	for(; i < len; i++){
        		if(this.items[i].lock){
        			this.items[i]['to'+n] = this[n+'Limit'] < this.items[i][n] ? this[n+'Limit'] : this.items[i][n];
        		}
        	}
		},
        gotoSetAll(){
        	this.dropSlidedown = !this.dropSlidedown;
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
	}
});
