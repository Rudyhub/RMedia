const win = nw.Window.get();
const config = require('./src/config');
const Media = require('./src/Media');
const utils = require('./src/utils');

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
		speedLevel: 'medium'
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
				len,
				file,
				infostr;
			if(files && (len = files.length)){
				for(let i=0; i<len; i++){
					(function(file){
						let extend = file.name.slice(file.name.lastIndexOf('.')+1),
						itemO = {
							path: file.path,
							source: config.appRoot+'css/loading.gif',
							name: file.name,
							size: file.size,
							lock: false,
							width: 0,
							height: 0,
							duration: 0,
							format: extend,
							progress: 0,
							progressColor: '',
							editable: false,

							toname: file.name,
							tosize: 0,
							towidth: vue.defwidth,
							toheight: Math.round(vue.defwidth*0.5625),
							toformat: extend,
							toformats: [],
							curtime: 0,
							starttime: 0,
							endtime: 0,
							icon: 'file-empty',
							rotating: false
						};
						vue.items.push(itemO);
						Media.info(file.path, function(md) {
							itemO.source = md.source;
							itemO.width = md.width || 0;
							itemO.height = md.height || 0;
							itemO.duration = parseFloat(md.duration) || 0;
							itemO.towidth = itemO.width > vue.defwidth ? vue.defwidth : itemO.width;
							itemO.toheight = md.width ? Math.round(itemO.towidth * (itemO.height/itemO.width) ) : 0;
							itemO.endtime = itemO.duration;
							itemO.toformats = md.toformats;
							itemO.mediaType = md.mediaType;
							itemO.toformat = config.output.format[itemO.mediaType];
							itemO.toname = vue.nameAll +'-'+ itemO.name +'.'+ itemO.toformat;
							switch(itemO.mediaType){
								case 'image': itemO.icon = 'icon-image'; break;
								case 'video': itemO.icon = 'icon-video-camera'; break;
								case 'audio': itemO.icon = 'icon-headphones'; break;
							}
							// itemO.bitv = parseFloat(md.bitv) || 0;
							// itemO.bita = parseFloat(md.bita) || 0;
						});
					})(files[i]);
				}
			}
		},
		chosedir(e){
            this.output = e.target.files[0].path || '';
        },
        itemFn(index, str, e){
        	let that = this,
        		item = that.items[index];
        	switch(str){
        		case 'del': that.items.splice(index,1); break;
        		case 'edit': item.editable = !item.editable; break;
        		case 'lock': item.lock = !item.lock; break;
        		case 'setstart': item.starttime = item.curtime; break;
        		case 'setend': item.endtime = item.curtime; break;
        		case 'curtime':
        			if(e){
        				item.curtime = parseFloat(e.target.value);
        			}
        			if(item.mediaType === 'video'){
        				Media.seek(item.path, item.curtime, function(source){
	        				item.source = source;
	        			});
        			}
        			break;
        		case 'convert':
        			item.rotating = !item.rotating;

        			/*
        			if(!that.output){
        				alert('请选择输出目录!');
        				return;
        			}
        			/*
        			let cammand = ['-b:v '+item.tosize*8/item.duration];
        			

        			let r = 255, g = 0;
        			Media.convert({
        				cammand: cammand,
        				input: item.path,
        				output: +,
        				progress: function(prog){
        					if(g < 150){
        						g = Math.round( prog.percent * 3.5 );
        					}else{
        						r = 255 - Math.round((prog.percent - g/3.5) * 3.5);
        					}
        					item.progress = Math.round(prog.percent) + '%';
        					item.progressColor = 'rgba('+r+','+g+',0,0.5)';
        				}
        			});*/
        			break;
        	}
        },
        nameAllFn(e){
        	this.nameAll = e.target.value;
        	let len = this.items.length, i = 0, n = 0;
        	for(; i < len; i++){
        		if(this.items[i].lock){
        			this.items[i].toname = utils.namemat(this.nameAll, ++n) +'.'+ this.items[i].toformat;
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
        },
        startConvert(){
        	
        	console.log(this.sizeLimit, this.items);
        	
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
				let tmp = parseFloat(val);
				if(tmp){
					return utils.sizemat(tmp);
				}
			}
			return 'auto';
		}
	}
});
