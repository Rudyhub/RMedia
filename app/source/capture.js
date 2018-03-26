const win = nw.Window.get(),
config = require('./config'),
{spawn} = require('child_process'),
utils = require('./utils'),
fs = require('fs');

let CAP_LOG_TEMP_FILE = utils.path(config.temp+'\\cap_log_temp_file.temp');

const capture = {
	ffmpeg: null,
	audioDevices(fn){
		if(typeof fn === 'function'){
			let lines, line, list, ffmpeg, error = null;

			list = [];

			ffmpeg = spawn(config.ffmpegPath, ['-hide_banner','-list_devices','true','-f','dshow','-i','dummy']);
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
	areaWin: null,
	setArea(initWidth, initHeight, fn){
		if(typeof fn !== 'function' || capture.areaWin !== null) return false;
		nw.Window.open('./capture.html',{
			id: 'capture',
		    position: 'center',
		    transparent: true,
		    new_instance: false,
		    frame: false,
		    focus: true,
		    width: initWidth,
		    height: initHeight,
		    always_on_top: true
		}, (childWin)=>{
			capture.areaWin = childWin;
			let childDoc = childWin.window.document;
			let onEnter = (e)=>{
				//on Enter
				if(e.keyCode === 13){
					childDoc.removeEventListener('keyup',onEnter);
					fn(childWin.x, childWin.y, childWin.width, childWin.height);
					childWin.close();
					capture.areaWin = null;
				}
				//on Esc
				else if(e.keyCode === 27){
					childDoc.removeEventListener('keyup',onEnter);
					childWin.close();
					capture.areaWin = null;
				}
			};
			childDoc.addEventListener('keyup', onEnter);
		});
	},
	progress: null,
	complete: null,
	shortcut: new nw.Shortcut({  
	    key: 'F2',
	    active : function(){
	        if(!capture.ffmpeg) return;
	        capture.end();
	        capture.back();
	    },  
	    failed : function(err){
	        if(!/Unable\s+to\s+unregister\s+the\s+hotkey/i.test(err.message)){
		        capture.end();
		        capture.back();
	        	utils.dialog.show = true;
	        	utils.dialog.body = '<p>无法使用F2停止录制，因为快捷与其他软件冲突。</p>';
	        }
	    }  
	}),
	go(){
		win.moveTo(-screen.width-50, 0);
		nw.App.registerGlobalHotKey(this.shortcut);
	},
	back(){
		win.focus();
		win.maximize();
		nw.App.unregisterGlobalHotKey(this.shortcut);
	},
	end(){
		if(this.ffmpeg){
			this.ffmpeg.stdin.end('q\n');
			this.ffmpeg = null;
		}
	},
	start(output, o){
		let ffmpeg, cammand, line, log, error, isComplete, sw, sh, w, h, scale, rw, rh;
		//删除日志文件
		try{
			fs.unlinkSync(CAP_LOG_TEMP_FILE);
		}catch(err){}
		error = null;
		isComplete = false;
		sw = screen.width;
		sh = screen.height;
		//如果是全屏
		if(o.mode === 0 || o.mode === 2) scale = sh / sw;
		//如果有视频
		if(o.mode !== 4){
			cammand = ['-hide_banner', '-r', o.fps, '-f','gdigrab', '-i', 'desktop', '-rtbufsize', '2048M', '-vcodec', 'libx264', '-b:v', o.bitv+'k', '-pix_fmt', 'yuv420p', '-profile:v', 'high','-y', output];
		}
		//如果有音频
		if(o.mode === 0 || o.mode === 1){
			cammand.splice(9, 0, '-f','dshow','-i','audio='+o.audioDevice, '-acodec', 'aac', '-b:a', o.bita+'k');
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
		checkOutput();
		function checkOutput(){
			fs.access(output, (err)=>{
				if(!err){
					win.show();
					utils.dialog.show = true;
					utils.dialog.body = `<p>输出的文件：${output}已存在或不可访问</p><p>请选择检查后重试、覆盖已存在、或不处理。</p>`;
					utils.dialog.setBtn('覆盖','重试','取消');
					utils.dialog.callback = function(code){
						
						if(code === 0){
							begin();
						}else if(code === 1){
							checkOutput();
						}
					}
				}else{
					begin();
				}
			});
		}
		function begin(){
			log = fs.createWriteStream(CAP_LOG_TEMP_FILE, {
				flags: 'a',  
				encoding: 'utf-8',  
				mode: '0666'
			});

			capture.go();
			ffmpeg = spawn(config.ffmpegPath, cammand);
			ffmpeg.stderr.on('data', (stderr)=>{
				line = stderr.toString();
				if(typeof capture.progress === 'function' && (line = /time=\s*([\d\:\.]*?)\s+/i.exec(line)) ){
					capture.progress(line[1]);
				}
				log.write('<p>'+stderr.toString()+'</p>');
			});
			ffmpeg.once('close', (a, b)=>{
				if(a !== 0){
					error = new Error('<p>录制失败：</p><p>'+fs.readFileSync(CAP_LOG_TEMP_FILE,'utf-8')+'</p>');
					error.code = 1;
				}
				complete();
			});
			ffmpeg.once('error', ()=>{
				if(!error){
					error = new Error('<p>启动失败：</p><p>'+fs.readFileSync(CAP_LOG_TEMP_FILE,'utf-8')+'</p>');
					error.code = 2;
				}
				complete();
			});
			capture.ffmpeg = ffmpeg;
		}
		function complete(){
			capture.back();
			if(!isComplete && (typeof capture.complete === 'function')){
				capture.complete(error);
				isComplete = true;
			}
			log.end();
		}
	}
};

module.exports = capture;