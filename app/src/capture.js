const win = nw.Window.get(),
config = require('./config'),
utils = require('./utils'),
childprocess = require('child_process'),
winShow = ()=>{
	win.maximize();
},
winHide = ()=>{
	win.moveTo(-win.width-50, 0);
},
recorders = (fn)=>{
	if(typeof fn === 'function'){
		let lines, line, list, ffmpeg;

		if(list = window.localStorage.getItem('audioDevice')){
			list = JSON.parse(list);
			if(list.length){
				fn(list);
				return;
			}
		}

		list = [];

		ffmpeg = childprocess.spawn(config.ffmpegRoot+'/ffmpeg.exe', ['-hide_banner','-list_devices','true','-f','dshow','-i','dummy']);
		ffmpeg.stderr.on('data', (stderr)=>{
			lines += stderr.toString();
		});
		ffmpeg.once('close', (a,b)=>{
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
			window.localStorage.setItem('audioDevice', JSON.stringify(list));
			fn(list);
			ffmpeg.kill();
			ffmpeg = null;
		});
	}
},
record = (audioDevice, x=0, y=0, w=screen.availWidth, h=screen.availHeight, fps=30)=>{
	let errmsg = '', ffmpeg, isFull, cammand = ['-hide_banner','-f','gdigrab', '-framerate', fps];

	if(x < 0) x = 0;
	if(y < 0) y = 0;
	if(w > screen.width) w = screen.width;
	if(h > screen.height) h = screen.height;
	if(w < screen.availWidth || h < screen.availHeight) cammand.push('-offset_x', x, '-offset_y', y, '-video_size', w+'x'+h);


	cammand.push('-i', 'desktop');

	if(audioDevice) cammand.push('-f','dshow','-i','audio='+audioDevice);

	cammand.push('-q', '1', '-y', config.appRoot+'tmp/tmp_record.mpg');

	ffmpeg = childprocess.spawn(config.ffmpegRoot+'/ffmpeg.exe', cammand);

	ffmpeg.stderr.on('data',(err)=>{
		errmsg += err.toString();
		err = null;
	});
	ffmpeg.once('close', (a,b)=>{
		if(a === 1){
			winShow();
			utils.dialog('错误：','<p>错误信息： code : '+a+'<br>info: '+b+'<br>detail:'+errmsg+'</p>');
		}
	});
	ffmpeg.once('error', (err)=>{
		winShow();
		utils.dialog('错误：','<p>错误信息： '+errmsg+'</p>');
	});
	return ffmpeg;
},
compress = (o)=>{
	let dialog = utils.dialog('完成：','<p>录制完成，正在优化和压缩处理...<span class="percent"></span></p>'),
		ffmpeg = null,
		cammand = ['-hide_banner','-i', config.appRoot+'tmp/tmp_record.mpg'],
		dialogBody = dialog.el.querySelector('.percent'),
		duration = 0,
		curtime = 0,
		linestr = '',
		errmsg = '';

	if(o.bitv) cammand.push('-b:v', o.bitv+'k');
	if(o.bita) cammand.push('-b:a', o.bita+'k');

	if(o.width && o.w > o.width){
		o.h = Math.round((o.h/o.w)*o.width);
		o.w = o.width;
	}
	if(o.w%2 !== 0) o.w--;
	if(o.h%2 !== 0) o.h--;

	cammand.push('-s', o.w+'x'+o.h, '-y', config.output.folder + '/' + utils.datemat() + '.mp4');

	ffmpeg = childprocess.spawn(config.ffmpegRoot+'/ffmpeg.exe',cammand);

	ffmpeg.stderr.on('data', (stderr)=>{
		linestr = stderr.toString();
		errmsg += linestr;
		if(!duration) duration = utils.timemat(linestr.match(/duration:\s*([\d\:\.]*?),/i)[1]);
		curtime = utils.timemat(linestr.match(/time=([\d\:\.]*?)\s+/)[1]);
		dialogBody.innerHTML = Math.round((curtime/duration)*100)+'%';
	});
	ffmpeg.once('close', (a,b)=>{
		if(a === 0){
			dialog.remove();
		}else{
			dialogBody.innerHTML = '<br>有错误： code='+a+'<br>exit='+b+'<br>detail:'+errmsg;
		}
	});
	ffmpeg.once('error', ()=>{
		dialogBody.innerHTML = '<b>有错误：'+errmsg+'</b>';
	});
};

module.exports = {
	recorders,
	setArea(o){
		nw.Window.open('html/capture.html',{
		    id: 'cutscreen',
		    position: 'center',
		    transparent: true,
		    new_instance: false,
		    frame: false,
		    focus: true,
		    width: 1280,
		    height: 720,
		    always_on_top: true
		}, (childWin)=>{
			let childDoc = childWin.window.document,
				ffmpeg = null;
			o.w = childWin.width;
			o.h = childWin.height;
			function startFn(e){
				childDoc.removeEventListener('keyup', startFn);
		        if(e.keyCode === 32){
		            winHide();
		            ffmpeg =  record(o.audioDevice, childWin.x, childWin.y, o.w, o.h, o.fps);
		            childWin.close(true);
		            childWin = null;
		            document.addEventListener('keyup', stopFn);
		        }
		    }
		    function stopFn(e){
	        	document.removeEventListener('keyup',stopFn);
	        	if(e.keyCode === 32){
	        		winShow();
	        		ffmpeg.stdin.write('q\n');
					ffmpeg.kill();
					ffmpeg = null;
					compress(o);
	        	}
	        }
			childDoc.addEventListener('keyup', startFn);

			childWin.once('close', ()=>{
				childDoc.removeEventListener('keyup', startFn);
				document.removeEventListener('keyup', stopFn);
				childWin.close(true);
				childWin = null;
			});
		});
	}
};