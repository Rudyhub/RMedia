module.exports = (o)=>{
	document.addEventListener('keyup',function(e){
		switch(e.key){
			case 'o':{
				if(e.ctrlKey){
					o.inputEl.click();
				}
			}
			break;
			case 's':{
				if(e.ctrlKey){
					o.outputEl.click();
				}
			}
		}
	});
	document.addEventListener('dragover', function(e){
		e.preventDefault();
	});
	document.addEventListener('drop', function(e){
		o.listItems(e.dataTransfer.files);
		e.preventDefault();
	});

	//capture shortcut
	nw.App.registerGlobalHotKey(new nw.Shortcut({  
	    key: 'F2',
	    active : function(){
	        if(!o.capture.ffmpeg) return;
	        o.capture.back();
	        o.capture.end();
	        o.capture.ffmpeg = null;
	        o.win.focus();
	    },  
	    failed : function(err){
	        if(!/Unable\s+to\s+unregister\s+the\s+hotkey/i.test(err.message)){
	            alert('用于录制屏幕的快捷'+this.key+'冲突！可通过获取焦点后按F2达到同样的目的'); 
	        }
	    }  
	})); 
};