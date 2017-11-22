module.exports = {
    timemat: function(time){
        let t,
            mat = (n) => {
                return n < 10 ? '0'+n : n;
            };
        if(typeof time === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(time)){
            t = time.split(':');
            return (parseInt(t[0]*3600) + parseInt(t[1]*60) + parseInt(t[2])) * 1000;
        }else if(typeof time === 'number'){
            if(isNaN(time)) return '00:00:00';
            t = time / 1000;
            let h = Math.floor( t/3600 );
            let m = Math.floor( (t%3600) / 60 );
            let s = Math.floor( t%60 );
            return mat(h) + ':' + mat(m) + ':' + mat(s);
        }else{
            return "error time";
        }
    },
    sizemat: function(b){
        if(b < 1024) return size + ' B';
        let size = b/1024,
            fixed = arguments[1] || 2;
        if(size < 1024){
            return size.toFixed(fixed) + ' KB';
        }else{
            return (size/1024).toFixed(fixed) + ' MB';
        }
    },
    hasClass: function(node, className){
        return node.className.split(/\s+/).indexOf(className) !== -1;
    },
    addClass: function(node, className) {
        if(!this.hasClass(node, className)){
            node.className += ' '+ className;
        }
    },
    removeClass: function(node, className) {
        if(this.hasClass(node, className)){
            node.className = node.className.replace(new RegExp('\\s*'+className+'\\s*', 'g'), '');
        }
    },
    toggle: function(node, className) {
        if(this.hasClass(node, className)){
            this.removeClass(node, className);
        }else{
            this.addClass(node, className);
        }
    },
    draggable: function(node, dragnode){
        let sx = 0,
            sy = 0,
            ol = node.offsetLeft,
            ot = node.offsetTop;
        dragnode.addEventListener('mousedown', function(e){
            e.preventDefault();
            sx = e.clientX;
            sy = e.clientY;
            ol = node.offsetLeft;
            ot = node.offsetTop;
            dragnode.addEventListener('mousemove', moveFn, false);
            document.addEventListener('mouseup', endFn, false);
        }, false);
        function moveFn(e){
            e.preventDefault();
            node.style.left = (e.clientX - sx + ol) + 'px';
            node.style.top = (e.clientY - sy + ot) + 'px';
        }
        function endFn() {
            dragnode.removeEventListener('mousemove', moveFn, false);
            document.removeEventListener('mouseup', endFn, false);
        }
    }
};
