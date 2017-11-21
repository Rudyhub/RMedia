const win = nw.Window.get();
const config = require('./src/config');

new Vue({
	el: '#app',
	data: {
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
			
			// flexItems.splice(0, this.flexItems.length);

			// let files = e.target.files,
			// 	len,
			// 	file;
			// if(files && (len = files.length)){
			// 	for(let i=0; i<len; i++){
			// 		file = files[i];
			// 		flexItems.push(`
			// 			<div class="flex-close" data-itemid="`+flexItems.length+`">&times;</div>
			// 			<div class="flex-item-preview">
			// 				<canvas></canvas>
			// 			</div>
			// 			<div class="flex-item-fileinfo">名称：`+file.name+`<br>大小：`+file.size+`<br>尺寸：1280*720</div>
			// 			<div class="flex-item-progress hide">
			// 				<progress value="0" max="100"></progress>
			// 			</div>
			// 		`);
			// 	}
			// }
		},
		chosedir: function(e){
            this.output = config.ui.saveas + (e.target.files[0].path || '');
        },
        startConvert: function(){
        	console.log('start');
        	
        }
	}
});