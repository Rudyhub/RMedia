{
let canvas = Symbol('canvas');
let context2d = Symbol('context2d');
let loadVideo = Symbol('loadVideo');
let video = Symbol('video');
let loadAudio = Symbol('loadAudio');
let controller = Symbol('controller');
let addStyle = Symbol('addStyle');
class Media{
    constructor(src){
        this.src = src;
        this.el = document.createElement('div');
        this.width = 0;
        this.height = 0;
        this[canvas] = document.createElement('canvas');
        this[context2d] = this[canvas].getContext('2d');
        this.el.appendChild( this[canvas] );

        this.el.className = 'fm';
        this[canvas].className = 'fm-canvas';

        this[ loadVideo ]();
    }
    [controller](media){
        let that = this,
            c = document.createElement('div'),
            play, cur, dur, slider, vswitch, vslider;
        c.className = 'fm-control';
        c.innerHTML =
            `<div class="fm-play-bar">
                <input f-media="play" class="fm-play-btn" title="play" type="checkbox">
            </div>
            <div class="fm-time-bar">
                <span f-media="current" class="fm-time">00:00:00</span>
                <span class="fm-time">-</span>
                <span f-media="duration" class="fm-time">00:00:00</span>
            </div>
            <div class="fm-slider-bar">
                <input f-media="slider" class="fm-slider" title="time" type="range" value="0">
            </div>
            <div class="fm-volume-bar">
                <div class="fm-volume-horn">
                    <div class="fm-volume-horn-inner">
                        <input f-media="horn" class="fm-volume-horn-checkbox" title="close volume" type="checkbox">
                        <div class="fm-volume-horn-rect"></div>
                        <div class="fm-volume-horn-trg"></div>
                        <div class="fm-volume-horn-oval"></div>
                        <div class="fm-volume-horn-disabled"></div>
                    </div>
                </div>
                <input f-media="volume-slider" class="fm-volume-slider" title="volume" type="range" max="1" step="0.1">
            </div>`;

        play = c.querySelector('[f-media=play]');
        cur = c.querySelector('[f-media=current]');
        dur = c.querySelector('[f-media=duration]');
        slider = c.querySelector('[f-media=slider]');
        vswitch = c.querySelector('[f-media=horn]');
        vslider = c.querySelector('[f-media=volume-slider');

        that.el.appendChild(c);

        play.addEventListener('click',function () {
            if(media.paused){
                media.play();
            }else{
                media.pause();
            }
        },false);

        let curv;
        vswitch.addEventListener('click',function(){
            if(this.checked){
                curv = vslider.value;
                media.volume = 0;
                vslider.value = 0;
            }else{
                media.volume = curv;
                vslider.value = curv;
            }
        });

        vslider.addEventListener('input', function(){
            media.volume = this.value;
        });

        return {cur, dur, slider};
    }
    [addStyle](w, h){
        let head = document.head,
            title = head.querySelector('title'),
            style = document.createElement('style'),
            oldStyle = document.getElementById('fm-style');
        style.id = 'fm-style';
        style.innerText = '.fm{width:'+w+'px;height'+h+'px;}';
        if(oldStyle){
            head.removeChild( oldStyle );
        }
        try {
           head.insertBefore(style, title[0].nextSibling);
        }catch(err){
            head.insertBefore(style, head.childNodes[0]);
        }
    }
    [loadAudio](){
        let that = this,
            aud = document.createElement('audio');
        aud.src = that.src;
        that[canvas].width = 1280;
        that[canvas].height = 720;
        that.currentTime = 0;
        that.duration = 0;
        that.on('loadedmetadata',function fn(){
            that.off('loadedmetadata', fn, false);
            that.duration = aud.duration;
        }, false);
    }
    [loadVideo](){
        let that = this,
            cv2d = that[ context2d ],
            vd = that[video] = document.createElement('video'),
            w = 0,
            h = 0,
            timer, ctrls;

        ctrls = that[controller](vd);

        vd.src = that.src;

        that.on('loadedmetadata',function fn(){
            that.off('loadedmetadata', fn, false);
            w = that[canvas].width = that[video].videoWidth;
            h = that[canvas].height = that[video].videoHeight;
            that[addStyle](w, h);
            ctrls.slider.max = vd.duration;
            ctrls.slider.step = 1/vd.duration;
            ctrls.dur.innerText = Fns.timemat(vd.duration*1000);
        },false);

        function play(){
            ctrls.slider.value = vd.currentTime;
            ctrls.cur.innerText = Fns.timemat(vd.currentTime*1000);
            cv2d.drawImage(vd, 0, 0, w, h);
            timer = window.requestAnimationFrame(play);
        }
        // ctrls.slider.addEventListener('mousedown',function(){
        //     vd.pause();
        //     window.cancelAnimationFrame(timer);
        // },false);
        ctrls.slider.addEventListener('input',function(){
            vd.currentTime = Number(this.value);
            ctrls.cur.innerText = Fns.timemat(vd.currentTime*1000);
        },false);
        that.on('play', play, false);
        that.on('pause', function(){
            window.cancelAnimationFrame(timer);
        }, false);
        that.on('ended', function endfn() {
            that.off('ended', endfn, false);
            window.cancelAnimationFrame(timer);
        },false);
    }
    on(type, fn, bool){
        this[video].addEventListener(type,fn.bind(this), bool);
    }
    off(type, fn, bool){
        this[video].removeEventListener(type,fn.bind(this), bool);
    }
    fire(type){
        try{
            this[video][type]();
        }catch (err){}
    }
    static toString(){
        return 'Media(){ [ native code ] }';
    }
}
    // let md = new Media('source/ok.mp4');
    // let md = new Media('http://assets.wenweipo.com/video/mv/2017/10/17/20171017v1.mp4');
    // let md = new Media('source/a.mp3');
    // document.getElementById('edit-window-file').appendChild(md.el);

// md.on('canplay',function(){
//     md.fire('play');
// },false);

}
