const win = nw.Window.get();
const config = require('./src/config');
const Media = require('./src/Media');
const functions = require('./src/functions');
new Vue({
	el: '#app',
	data: {
		flexItems: [],
		ui: config.ui,
		output: '',
		isFullScreen: true
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
					file = files[i];
					Media.info(file.path, function(md) {
						infostr = '文件：' + md.name +
							'<br>大小：' + functions.sizemat(md.size) +
							'<br>尺寸：' + md.width + '*' + md.height +
							'<br>时长：' + functions.timemat(md.duration*1000);
					    vue.flexItems.push({
							progress: 0,
							fileinfo: infostr
						});
					});
				}
			}
		},
		chosedir: function(e){
            this.output = config.ui.saveas + (e.target.files[0].path || '');
        },
        flexItemFn: function(e){
        	this.flexItems.splice(e,1);
        },
        startConvert: function(){
        	console.log('start');
        	
        }
	}
});