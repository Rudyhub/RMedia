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
record = (x=0, y=0, w=screen.availWidth, h=screen.availHeight)=>{
	let errmsg = '', ffmpeg, isFull, cammand = ['-f','gdigrab','-framerate','25'];

	if(x < 0) x = 0;
	if(y < 0) y = 0;
	if(w > screen.width) w = screen.width;
	if(h > screen.height) h = screen.height;
	if(w < screen.availWidth || h < screen.availHeight) cammand.push('-offset_x', x, '-offset_y', y, '-video_size', w+'x'+h);
	if(w%2 !== 0) w--;
	if(h%2 !== 0) h--;

	cammand.push('-i', 'desktop', '-q', '1', '-s', w+'x'+h, '-y', config.appRoot+'tmp/tmp_record.mpg');

	ffmpeg = childprocess.spawn(config.ffmpegRoot+'/ffmpeg.exe', cammand);

	ffmpeg.stderr.on('data',(err)=>{
		errmsg = err.toString();
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
compress = (path)=>{
	path = path || config.appRoot+'tmp/tmp_record.mpg';
	let dialog = utils.dialog('完成：','<p>录制完成，正在优化和压缩处理...</p>'),
		ffmpeg = childprocess.spawn(config.ffmpegRoot+'/ffmpeg.exe',
			['-i',path,
			'-b:v','2048k',
			'-y',
			config.output.folder + '/' + utils.datemat() + '.mp4'
		]),
		dialogBody = dialog.el.querySelector('.dialog-body');

	ffmpeg.stderr.on('data', (stderr)=>{
		dialogBody.innerHTML = stderr.toString();
	});
	ffmpeg.once('close', (a,b)=>{
		if(a === 0){
			dialog.remove();
		}else{
			dialogBody.insertAdjacentHtml('beforeEnd', '<b>有错误： code='+a+' exit='+b+'</b>');
		}
	});
	ffmpeg.once('error', (err)=>{
		dialogBody.insertAdjacentHtml('beforeEnd', '<b>有错误：'+err+'</b>');
	});
};

module.exports = ()=>{
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
	}, (childWin)=>{
		let childDoc = childWin.window.document,
			ffmpeg = null;
		function startFn(e){
			childDoc.removeEventListener('keyup', startFn);
	        if(e.keyCode === 32){
	            winHide();
	            ffmpeg =  record(childWin.x, childWin.y, childWin.width, childWin.height);
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
				compress();
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
};