const win = nw.Window.get(),
config = require('./config'),
utils = require('./utils'),
{spawn} = require('child_process'),
fs = require('fs');

const capture = {
	ffmpeg: null,
	audioDevices(fn){
		if(typeof fn === 'function'){
			let lines, line, list, ffmpeg, error = null;

			list = [];

			ffmpeg = spawn(config.ffmpegRoot+'\\ffmpeg.exe', ['-hide_banner','-list_devices','true','-f','dshow','-i','dummy']);
			ffmpeg.stderr.on('data', (stderr)=>{
				lines += stderr.toString();
			});
			ffmpeg.once('exit', (a,b)=>{
				lines = lines.split(/\n+/);
				while(line = lines[0]){
					lines.splice(0,1);
					if(/DirectShow\s+audio\s+devices/i.test(line)) break;
				}
				while(line = lines[0]){
					lines.splice(0,1);
					if(/\[dshow[^\]]*?\]/i.test(line)){
						list.push( line.slice(line.indexOf('\"')+1, line.lastIndexOf('\"')) );
					}
				}
				if(!list.length){
					error = new Error('获取录音设备失败，当前计算机没有可用的录音设备或者未开启，请查看帮助文档。');
				}
				fn(error, list);
			});
			ffmpeg.once('error',(err)=>{
				if(!error) fn(err, list);
			});
			this.ffmpeg = ffmpeg;
		}
	},
	setArea(initWidth, initHeight, fn){
		if(typeof fn !== 'function') return false;
		nw.Window.open('html/capture.html',{
		    id: 'cutscreen',
		    position: 'center',
		    transparent: true,
		    new_instance: false,
		    frame: false,
		    focus: true,
		    width: initWidth,
		    height: initHeight,
		    always_on_top: true
		}, (childWin)=>{
			let childDoc = childWin.window.document;
			let onEnter = (e)=>{
				//on Enter
				if(e.keyCode === 13){
					childDoc.removeEventListener('keyup',onEnter);
					fn(childWin.x, childWin.y, childWin.width, childWin.height);
					childWin.close();
				}
				//on Esc
				else if(e.keyCode === 27){
					childDoc.removeEventListener('keyup',onEnter);
					childWin.close();
				}
			}
			childDoc.addEventListener('keyup', onEnter);
		});
	},
	progress: null,
	complete: null,
	go(){
		win.moveTo(-screen.width-50, 0);
	},
	back(){
		win.maximize();
	},
	shortcut(key,fail){
		let self = this;
		try{
			document.removeEventListener('keyup', keyupFn);
		}catch(err){}

		document.addEventListener('keyup', keyupFn);
		function keyupFn(e){
			if(e.keyCode === 113 || e.keyCode === 27){
				document.removeEventListener('keyup',keyupFn);
				self.back();
				self.end();
			}
		}
	},
	end(){
		if(this.ffmpeg){
			this.ffmpeg.stdin.end('q\n');
		}
	},
	start(output, o){
		let ffmpeg, cammand, line, log, error, isComplete, complete, sw, sh, w, h, scale, rw, rh;
		log = [];
		error = null;
		isComplete = false;
		sw = screen.width;
		sh = screen.height;
		//如果是全屏
		if(o.mode === 0 || o.mode === 2) scale = sh / sw;
		//如果有视频
		if(o.mode !== 4){
			cammand = ['-hide_banner', '-r', o.fps, '-f','gdigrab', '-i', 'desktop', '-vcodec', 'libx264', '-b:v', o.bitv+'k', '-pix_fmt', 'yuv420p', '-profile:v', 'high','-y', output];
		}
		//如果有音频
		if(o.mode === 0 || o.mode === 1){
			cammand.splice(7, 0, '-f','dshow','-i','audio='+o.audioDevice, '-acodec', 'aac', '-b:a', o.bita+'k');
		}
		//如果不是全屏
		if(o.mode === 1 || o.mode === 3){
			w = o.width;
			h = o.height;
			scale = h / w;
			//不能超出屏幕
			if((w + o.x) > sw) w = sw - o.x;
			if((h + o.y) > sh) h = sh - o.y;
			//不能为单数
			if(w % 2 !== 0) w--;
			if(h % 2 !== 0) h--;

			cammand.splice(3, 0, '-offset_x', o.x,'-offset_y', o.y,'-video_size', w+'x'+h);
		}
		//缩放匹配宽度上限
		if(scale){
			rw = o.widthLimit;
			rh = Math.round(rw * scale);
			if(rw % 2 !== 0) rw--;
			if(rh % 2 !== 0) rh--;
			cammand.splice(cammand.length - 2, 0, '-s', rw+'x'+rh);
		}
		//如果只有音频
		if(o.mode === 4){
			cammand = ['-hide_banner', '-f', 'dshow', '-i', 'audio='+o.audioDevice, '-b:a', o.bita+'k', '-y', output];
		}

		complete = ()=>{
			capture.back();
			if(!isComplete && (typeof capture.complete === 'function')){
				capture.complete(error);
				isComplete = true;
			}
		};

		fs.access(output, (err)=>{
			if(!err){
				error = new Error('<p>输出的文件：'+output+'已存在或不可访问，请选择其他输出目录或者在菜单的“批处理设置”中修改名称后重试</p>');
				error.code = 3;
				complete();
			}else{
				capture.shortcut();
				capture.go();
				ffmpeg = spawn(config.ffmpegRoot + '\\ffmpeg.exe', cammand);
				ffmpeg.stderr.on('data', (stderr)=>{
					line = stderr.toString();
					if(typeof capture.progress === 'function' && (line = /time=\s*([\d\:\.]*?)\s+/i.exec(line)) ){
						capture.progress(line[1]);
					}
					log.push(stderr.toString());
				});
				ffmpeg.once('close', (a, b)=>{
					if(a !== 0){
						error = new Error('<p>录制失败：</p><p>'+log.join('</p><p>')+'</p>');
						error.code = 1;
					}
					complete();
				});
				ffmpeg.once('error', ()=>{
					if(!error){
						error = new Error('<p>启动失败：</p><p>'+log.join('</p><p>')+'</p>');
						error.code = 2;
					}
					complete();
				});
				this.ffmpeg = ffmpeg;
			}
		});
	}
}

module.exports = capture;