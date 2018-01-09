const win = nw.Window.get();
const utils = require('./utils');
let curwin = null;

document.onkeyup = (e)=>{
	if(e.keyCode === 70){
		win.maximize();
	}
}
module.exports = {
	hide(){
		win.moveTo(-win.width-50, 0);
	},
	show(){
		win.maximize();
	},
	help(parentNode){
		// return utils.dialog('使用说明：',
		// `<p><span>系统原因可能会导致边框显示不正常，你可以双击顶部工具条，此时边框会适配显示屏大小，并且变正常了，再双击可以回到原来大小，也可以自己拖拽边框到指定的大小。</span></p>
		// <p><b>操作推荐使用快捷键</b></p>
		// <p>
		// 	【开始/停止】 == 【F2】<br/>
		// 	【全屏】 == 【alt+F】<br/>
		// 	【帮助】 == 【F1】
		// </p>`, null, null, parentNode);
		console.log('help');
	},
	toggle(){
		if(curwin) {
			curwin.close(true);
			curwin = null;
			return false;
		}

		let context = this;
		nw.Window.open('html/screencap.html',{
		    id: 'cutscreen',
		    position: 'center',
		    transparent: true,
		    new_instance: false,
		    frame: false,
		    focus: true,
		    width: 1280,
		    height: 720,
		    always_on_top: true
		}, (win)=>{
			curwin = win;
			win.on('close', ()=>{
				win.close(true);
				curwin = win = null;
			});
			win.on('loaded', ()=>{
				let doc = win.window.document;
				doc.getElementById('explain').innerHTML = `
				<h2>提示：</h2>
				<p>系统支持度和系统主题支持度原因，偶尔窗口显示不正常，可以忽略它，只需要把窗口边框调整到截取的位置即可，因为录制的时候窗口是隐藏的，不会影响录制结果。</p>
				<h2>操作推荐使用快捷键：</h2>
				<p>
					【开始/停止】 == 【F2】<br/>
					【全屏录制】 == 【alt+F】<br/>
					【帮助】 == 【F1】
				</p>`;

				doc.getElementById('menu').onchange = function(){
					switch(this.value){
						case '1':
							context.start();
							win.hide();
							console.log(0)
							break;
						case '2':
							context.stop();
							break;
						case '3':
							context.full();
							break;
						case '4':
							context.help();
					}
				};
			});
		});
	},
	start(){
		console.log('start');
	},
	stop(){
		console.log('stop');
	},
	full(){
		console.log('full');
	},
	info(){
		let o = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};
		if(curwin){
			o.x = curwin.x;
			o.y = curwin.y;
			o.w = curwin.width;
			o.h = curwin.height;
		}
		return o;
	}
}