const win = nw.Window.get();
const config = require('./src/config');
const Media = require('./src/Media');
const functions = require('./src/functions');
new Vue({
	el: '#app',
	data: {
		flexItems: [],
		output: '',
		isFullScreen: true,
		defwidth: 1280
	},
	methods: {
		minimize: function(){
			win.minimize();
		},
		wintoggle: function(){
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
		winclose: function(){
			win.close();
		},
		chosefile: function(e){
			let vue = this,
				files = e.target.files,
				len,
				file,
				infostr;
			if(files && (len = files.length)){
				for(let i=0; i<len; i++){
					(function(file){
						let itemO = {
							path: file.path,
							name: file.name,
							size: functions.sizemat(file.size),
							width: 0,
							height: 0,
							duration: 0,
							extend: file.name.slice(file.name.lastIndexOf('.')+1),
							progress: 0,
							editable: false,

							toname: 'fup-'+file.name,
							tosize: 0,
							towidth: vue.defwidth,
							toheight: vue.defwidth*0.6525,
							maxtime: 0,
							curtime: 0,
							starttime: 0,
							endtime: 0
						};
						vue.flexItems.push(itemO);

						Media.info(itemO.path, function(md) {
							itemO.width = md.width;
							itemO.height = md.height;
							itemO.duration = md.duration;
							itemO.towidth = itemO.width > vue.defwidth ? vue.defwidth : itemO.width;
							itemO.toheight = Math.round(itemO.towidth * (itemO.height/itemO.width) );
							itemO.maxtime = md.duration;
							itemO.endtime = md.duration;
							
							if(/^video\//.test(file.type)){
								Media.previewBase64(itemO.path, function(database64){
									itemO.path = database64;
								});
							}
						});

					})(files[i]);
				}
			}
		},
		chosedir: function(e){
            this.output = config.ui.saveas + (e.target.files[0].path || '');
        },
        flexItemFn: function(index, str){
        	let item = this.flexItems[index];
        	switch(str){
        		case 'del': this.flexItems.splice(index,1); break;
        		case 'edit': item.editable = !item.editable; break;
        		case 'setstart': item.starttime = item.curtime; break;
        		case 'setend': item.endtime = item.curtime; break;
        		case 'convert': console.log(item.starttime, item.endtime); break;
        	}
        },
        startConvert: function(){
        	console.log('start');
        	
        }
	},
	filters: {
		timemat: function(t){
			return functions.timemat(t*1000);
		}
	}
});