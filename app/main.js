const win = nw.Window.get();
let ui = {
	title: '多媒体处理器',
	open: '打开',
	save: '保存',
	start: '开始',
	nosave: '未选择输出目录',
	saveas: '输出的目录是：'
}
new Vue({
	el: '#app',
	data: {
		ui: ui,
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
		chosedir: function(e){
            this.output = ui.saveas + (e.target.files[0].path || '');
        }
	}
});