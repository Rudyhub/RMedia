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
        this.matrix = [0,0,0,0];
        this.limit = [0,0];
        this.points = points;
        this[0] = box;
        this.el = null;
        this.scale = 0;
        ScaleControl.bindEvent(this);
    }
    bind(el){
        if(el && el.nodeType === 1){
            this.matrix[0] = el.offsetLeft;
            this.matrix[1] = el.offsetTop;
            this.matrix[2] = el.offsetWidth;
            this.matrix[3] = el.offsetHeight;
            if(this.el !== el){
                if(this.el) this.el.removeAttribute('bind-scale-control');
                this.scale = el.offsetHeight / el.offsetWidth;
            }
            el.setAttribute('bind-scale-control','');
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
        this.matrix[0] = this.matrix[1] = this.matrix[2] = this.matrix[3] = 0;
        if(this[0].parentNode)
            this[0].parentNode.removeChild(this[0]);
    }
    contains(target){
        return this[0].contains(target);
    }
    move(curX,curY,moveLimitX,moveLimitY){
        if(curX >= 0 && curX <= moveLimitX){
            this.matrix[0] = curX;
        }
        if(curY >=0 && curY <= moveLimitY){
            this.matrix[1] = curY;
        }
    }
    changeX(curX, x, w){
        if(curX >= 0 && curX <= x+w){
            this.matrix[0] = curX;
            this.matrix[2] = w + x - curX;
        }
    }
    changeY(curY, y, h){
        if(curY >= 0 && curY <= y+h){
            this.matrix[1] = curY;
            this.matrix[3] = h + y - curY;
        }
    }
    changeW(curW, x){
        if(curW >= 0 && curW <= this.limit[0] - x){
            this.matrix[2] = curW;
        }
    }
    changeH(curH, y){
        if(curH >= 0 && curH <= this.limit[1] - y){
            this.matrix[3] = curH;
        }
    }
    static bindEvent(_this){
        let target, w, h, x, y, curW, curH, curX, curY, startX, startY, isWhich, moveLimitX, moveLimitY,
            box = _this[0],
            points = _this.points;

        function moveHandler(e){
            curX = x + e.clientX - startX;
            curY = y + e.clientY - startY;
            curW = w + e.clientX - startX;
            curH = h + e.clientY - startY;

            if(isWhich[4]){
                _this.move(curX, curY, moveLimitX, moveLimitY);
            }else{
                if(isWhich[0]){
                    _this.changeX(curX, x, w);
                    _this.changeY(curY, y, h);
                }
                else if(isWhich[1]){
                    _this.changeY(curY, y, h);
                }
                else if(isWhich[2]){
                    _this.changeY(curY, y, h);
                    _this.changeW(curW, x);
                }
                else if(isWhich[3]){
                    _this.changeX(curX, x, w);
                }
                else if(isWhich[5]){
                    _this.changeW(curW, x);
                }
                else if(isWhich[6]){
                    _this.changeX(curX, x, w);
                    _this.changeH(curH, y);
                }
                else if(isWhich[7]){
                    _this.changeH(curH, y);
                }
                else if(isWhich[8]){
                    _this.changeW(curW, x);
                    _this.changeH(curH, y);
                }
                if(e.shiftKey){
                    _this.matrix[3] = Math.round(_this.matrix[2] * _this.scale);
                }
            }

            _this.el.style.left = box.style.left = _this.matrix[0] + 'px';
            _this.el.style.top = box.style.top = _this.matrix[1] + 'px';
            _this.el.style.width = box.style.width = _this.matrix[2] + 'px';
            _this.el.style.height = box.style.height = _this.matrix[3] + 'px';
        }

        function upHandler(){
            document.body.classList.remove('scale-control-unselect');
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            if(ScaleControl.onChangeEnd){
                ScaleControl.onChangeEnd(_this);
            }
        }

        _this[0].addEventListener('mousedown', function (e) {
            target = e.target;
            document.body.classList.add('scale-control-unselect');

            w = _this.el.offsetWidth;
            h = _this.el.offsetHeight;
            x = _this.el.offsetLeft;
            y = _this.el.offsetTop;
            startX = e.clientX;
            startY = e.clientY;

            moveLimitX = _this.limit[0] - _this.el.offsetWidth;
            moveLimitY = _this.limit[1] - _this.el.offsetHeight;

            isWhich = [
                target === points.topLeft,
                target === points.topCenter,
                target === points.topRight,

                target === points.midLeft,
                target === points.midCenter,
                target === points.midRight,

                target === points.bottomLeft,
                target === points.bottomCenter,
                target === points.bottomRight
            ];

            document.addEventListener('mousemove', moveHandler, false);
            document.addEventListener('mouseup', upHandler, false);
        });
    }
}
module.exports = ScaleControl;