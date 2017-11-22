const win = nw.Window.get();
const config = require('./src/config');
const Media = require('./src/Media');
const functions = require('./src/functions');
new Vue({
	el: '#app',
	data: {
		flexItems: [],
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
					Media.info(file.path, function(md,data) {
					    vue.flexItems.push({
					    	name: md.name.slice( md.name.lastIndexOf('\\')+1 ),
					    	size: functions.sizemat(md.size),
					    	pixel: md.width + ' * ' + md.height,
					    	duration: functions.timemat(md.duration*1000),
							progress: 0
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