class ScaleControl {
    constructor(){
        let box = document.createElement('div'),
            points = {
                topLeft: box.cloneNode(),
                topCenter: box.cloneNode(),
                topRight: box.cloneNode(),
                midLeft: box.cloneNode(),
                midCenter: box.cloneNode(),
                midRight: box.cloneNode(),
                bottomLeft: box.cloneNode(),
                bottomCenter: box.cloneNode(),
                bottomRight: box.cloneNode()
            },
            test = /[A-Z]/g;

        box.className = 'scale-control';

        for(let k in points){
            points[k].className = 'scale-control-point scale-control-' + k.replace(test, function($0){
                return '-'+$0.toLowerCase();
            });
            box.appendChild(points[k]);
        }
        this.matrix = [0,0,0,0,0,0];
        this.limit = [0,0];
        this.points = points;
        this[0] = box;
        this.el = null;
        ScaleControl.bindEvent(this);
    }
    bind(el){
        if(el && el.nodeType === 1){
            this.matrix[0] = el.offsetLeft;
            this.matrix[1] = el.offsetTop;
            this.matrix[2] = el.offsetWidth;
            this.matrix[3] = el.offsetHeight;
            if(this.el !== el){
                this.matrix[4] = el.offsetWidth;
                this.matrix[5] = el.offsetHeight;
            }
            this.el = el;
            el.parentNode.appendChild(this[0]);

            this[0].style.top = el.offsetTop + 'px';
            this[0].style.left = el.offsetLeft + 'px';
            this[0].style.width = el.offsetWidth + 'px';
            this[0].style.height = el.offsetHeight + 'px';

            this.limit[0] = el.parentNode.offsetWidth;
            this.limit[1] = el.parentNode.offsetHeight;

            el.draggable = false;
        }
    }
    unbind(){
        this.matrix[0] = this.matrix[1] = this.matrix[2] = this.matrix[3] = this.matrix[4] = this.matrix[5] = 0;
        if(this[0].parentNode)
            this[0].parentNode.removeChild(this[0]);
    }
    contains(target){
        return this[0].contains(target);
    }
    static bindEvent(_this){
        let w, h, pX, pY, startX, startY, endX, endY, isX, isY, isMove, isLeft, isTop, limitW, limitH, right, bottom, moveLimitX, moveLimitY,
            box = _this[0],
            points = _this.points;

        function moveHandler(e){
            if(isMove){
                _this.matrix[0] = pX + e.clientX - startX;
                _this.matrix[1] = pY + e.clientY - startY;
                if(_this.matrix[0] > moveLimitX){
                    _this.matrix[0] = moveLimitX;
                }
                if(_this.matrix[1] > moveLimitY){
                    _this.matrix[1] = moveLimitY;
                }
            }else{
                if(isX){
                    if(isLeft){
                        _this.matrix[0] = pX + e.clientX - startX;
                        _this.matrix[2] = w - e.clientX + startX;
                    }else{
                        _this.matrix[2] = w + e.clientX - startX;
                    }
                }
                if(isY){
                    if(isTop){
                        _this.matrix[1] = pY + e.clientY - startY;
                        _this.matrix[3] = h - e.clientY + startY;
                    }else{
                        _this.matrix[3] = h + e.clientY - startY;
                    }
                }
                if(e.shiftKey){
                    _this.matrix[3] = box.offsetWidth * (_this.matrix[5] / _this.matrix[4]);
                }
            }

            if(_this.matrix[0] < 0) {
                _this.matrix[0] = 0;
                _this.matrix[2] = limitW;
            }else if(_this.matrix[0] > limitW){
                _this.matrix[0] = limitW;
            }else if(_this.matrix[2] > right){
                _this.matrix[2] = right;
            }
            if(_this.matrix[1] < 0) {
                _this.matrix[1] = 0;
                _this.matrix[3] = limitH;
            }else if(_this.matrix[1] > limitH){
                _this.matrix[1] = limitH;
            }else if(_this.matrix[3] > bottom){
                _this.matrix[3] = bottom
            }

            _this.el.style.left = box.style.left = _this.matrix[0] + 'px';
            _this.el.style.top = box.style.top = _this.matrix[1] + 'px';
            _this.el.style.width = box.style.width = _this.matrix[2] + 'px';
            _this.el.style.height = box.style.height = _this.matrix[3] + 'px';
        }

        function upHandler(){
            _this.el.classList.remove('scale-control-unselect');
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        }

        _this[0].addEventListener('mousedown', function (e) {
            let target = e.target;
            _this.el.classList.add('scale-control-unselect');

            w = box.offsetWidth;
            h = box.offsetHeight;
            pX = box.offsetLeft;
            pY = box.offsetTop;
            startX = e.clientX;
            startY = e.clientY;
            endX = startX;
            endY = startY;
            isX = false;
            isY = false;
            isMove = false;
            isLeft = false;
            isTop = false;
            limitW = box.offsetLeft + box.offsetWidth;
            limitH = box.offsetTop + box.offsetHeight;
            right = _this.limit[0] - box.offsetLeft;
            bottom = _this.limit[1] - box.offsetTop;
            moveLimitX = _this.limit[0] - box.offsetWidth;
            moveLimitY = _this.limit[1] - box.offsetHeight;

            if(target === points.topCenter || target === points.bottomCenter){
                isX = false;
                isY = true;
            }else if(target === points.midLeft || target === points.midRight){
                isX = true;
                isY = false;
            }else{
                isX = true;
                isY = true;
            }

            isMove = target === points.midCenter;
            isLeft = target === points.topLeft || target === points.midLeft || target === points.bottomLeft;
            isTop = target === points.topLeft || target === points.topCenter || target === points.topRight;

            document.addEventListener('mousemove', moveHandler, false);
            document.addEventListener('mouseup', upHandler, false);
        });
    }
}
module.exports = ScaleControl;