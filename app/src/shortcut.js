module.exports = (o)=>{
	let docListener = document.addEventListener;
	docListener('keyup',function(e){
		if(e.ctrlKey){
			if(e.key === 'o'){
				o.inputEl.value = '';
				o.inputEl.click();
			}else if(e.key === 's'){
				o.inputEl.value = '';
				o.outputEl.click();
			}
		}
	});
	docListener('dragover', function(e){
		e.preventDefault();
	});
	docListener('drop', function(e){
		o.listItems(e.dataTransfer.files);
		e.preventDefault();
	});
};