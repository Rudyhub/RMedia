const win = nw.Window.get();
const config = require('./src/config');
const Media = require('./src/Media');
const functions = require('./src/functions');

new Vue({
	el: '#app',
	data: {
		items: [],
		output: config.output.folder,
		isFullScreen: true,
		defwidth: config.output.width,
		dropSlidedown: false,
		nameAll: '',
		widthLimit: 1280,
		heightLimit: 720,
		sizeLimit: '',
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
		}
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

							toname: 'fup-'+file.name,
							tosize: 0,
							towidth: vue.defwidth,
							toheight: Math.round(vue.defwidth*0.5625),
							toformat: extend,
							toformats: [],
							curtime: 0,
							starttime: 0,
							endtime: 0
						};
						vue.items.push(itemO);
						console.log(itemO);
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
        itemFn(index, str){
        	let item = this.items[index];
        	switch(str){
        		case 'del': this.items.splice(index,1); break;
        		case 'edit': item.editable = !item.editable; break;
        		case 'lock': item.lock = !item.lock; break;
        		case 'setstart': item.starttime = item.curtime; break;
        		case 'setend': item.endtime = item.curtime; break;
        		case 'curtime':
        			if(item.mediaType !== 'image'){
        				Media.seek(item.path, item.curtime, function(source){
	        				item.source = source;
	        			});
        			}
        			break;
        		case 'convert':
        			let cammand = ['-b:v '+item.tosize*8/item.duration, '-y'];
        			Media.convert(item.path, {
        				params: cammand,
        				success: function(){
        					console.log('success',arguments);
        				},
        				progress: function(p){
        					console.log(p.percent);
        				},
        				complete: function(){
        					console.log('complete',arguments);
        				}
        			})
        			/*
        			let pv = 0, r = 225, g = 0;
        			let tt = setInterval(function(){
        				if(pv>=100) clearInterval(tt);
        				pv++;
        				item.progress = pv + '%';
        				if(g < 150){
        					g += 3;
        				}else{
        					r -= 3;
        				}
        				item.progressColor = 'rgba('+r+','+g+',0,0.5)';
        			},100);
        			console.log(item.starttime, item.endtime);
        			*/
        			break;
        	}
        },
        itemInputFn(e,index,attr){
        	let tmp = parseFloat(e.target.innerHTML) || 0;
        	switch(attr){
        		case 'tosize': 
        			this.items[index][attr] = (tmp/100)*this.items[index]['size'];
        			break;
        		case 'toname':
        			this.items[index][attr] = e.target.innerHTML;
        			break;
        		default:
        			this.items[index][attr] = tmp;
        	}
        },
        gotoSetAll(){
        	this.dropSlidedown = !this.dropSlidedown;
        },
        startConvert(){
        	
        	console.log(this.items);
        	
        }
	},
	filters: {
		timemat(t){
			return functions.timemat(t*1000);
		},
		sizemat(val,attr){
			if(attr === 'size'){
				return functions.sizemat(val);
			}else{
				let tmp = parseFloat(val);
				if(tmp){
					console.log(tmp);
					return functions.sizemat(tmp);
				}
			}
			return 'auto';
		}
	}
});
