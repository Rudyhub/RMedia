/**
 * 私有化一些变量
 */
const start = Symbol('start');
const cache = Symbol('cache');
const removeAttr = Symbol('removeAttr');
const listenOn = Symbol('listenOn');
const listenModel = Symbol('listenModel');
const listout = Symbol('listout');
const observe = Symbol('observe');

const cacheNodes = {};
let ObserveData = null;

/**
 * 监听ObserveData,只监听第一维
 */
class Fup{
    constructor(obj){
        if(!obj || (typeof obj !== 'object')){
            throw (' Parameter error: Parameter is unsupported! Constructor accept an object like "{ data:{} }"');
        }
        ObserveData = obj;
        Fup[start]();
        Fup[listout]();
    }

    /**
     * 查找过滤到需要的元素，并保存起来
     * 可以像vue一样，在html设置id，然后在ObserveData.el上写id选择器
     * 如果不写，则从body开始
     */
    static [start](){
        let fup = document.querySelector(ObserveData.el) || document.querySelector('body'),
            nodes = fup.querySelectorAll('*'),
            len = nodes.length,
            i = 0,
            tmp,
            tmpa;
        for(; i<len; i++){
            tmp = nodes[i].attributes;
            for(let n=0, nlen=tmp.length; n<nlen; n++){
                //事件的监听
                if(/f-on/i.test(tmp[n].name)){
                    Fup[listenOn](
                        nodes[i],
                        tmp[n].value,
                        tmp[n].name.replace('f-on-','').split('-')
                    );
                }

                //如果未给 data 数据模型，则跳过f-model和f-bind的绑定
                if(!ObserveData.data || !ObserveData.data.hasOwnProperty(tmp[n].value)) continue;

                //属性的绑定
                if( /f-bind/i.test(tmp[n].name) ){
                    tmpa = tmp[n].name.replace('f-bind-','').split('-');
                    for(let m=0, mlen=tmpa.length; m<mlen; m++){
                        if(tmpa[m] === 'text'){
                            tmpa[m] = 'innerText';
                        }else if(tmpa[m] === 'html'){
                            tmpa[m] = 'innerHTML';
                        }
                    }
                    Fup[cache]( tmp[n].value, {
                        node: nodes[i],
                        attrs: tmpa
                    });

                }
                //数据模型的绑定
                if( /f-model/i.test(tmp[n].name) ){
                    Fup[cache]( tmp[n].value, {
                        node: nodes[i],
                        attrs: ['value']
                    });
                    Fup[listenModel](
                        nodes[i],
                        tmp[n].value
                    );
                }
            }
        }
        //删除f-这些乱七八糟的属性
        Fup[removeAttr](nodes,len);
    }

    /**
     * 保存
     * @param {String} name
     * @param {Object} dataObj
     */
    static [cache](name,dataObj){
        if(!cacheNodes[ name ]){
            cacheNodes[ name ] = [ dataObj ];
        }else{
            cacheNodes[ name ].push( dataObj );
        }
    }

    /**
     * 保存完成后，删除这些个杂七九八的属性
     * @param {NodeList} nodes
     * @param {int} len
     */
    static [removeAttr](nodes,len){
        let tmp;
        for(let i=0; i<len; i++){
            tmp = nodes[i].attributes;
            for(let n=0, nlen=tmp.length; n<nlen; n++){
                try{
                    if( /f-/i.test(tmp[n].name) ){
                        nodes[i].removeAttribute(tmp[n].name);
                    }
                }catch (err){}
            }
        }
    }

    /**
     * 事件监听，针对 f-on-eventTpye元素的 ObserveData.methods上的方法
     * @param {Node} node
     * @param {function} handle
     * @param {Array} events
     */
    static [listenOn](node, handle, events){
        if(ObserveData.methods && ObserveData.methods[ handle ] && (typeof ObserveData.methods[ handle ] === 'function') ){
            for(let i=0, len=events.length; i<len; i++){
                node.addEventListener(events[i], fn, false);
            }
            function fn(e) {
                ObserveData.methods[ handle ].bind(ObserveData)( this, e );
            }
        }
    }

    /**
     * 监听Model元素
     * @param {Node} node
     * @param {String} name
     */
    static [listenModel](node, name){
        if(ObserveData.data && ObserveData.data.hasOwnProperty( name )){
            let hasFilter = ObserveData.filters && (typeof ObserveData.filters[ name ] === 'function');

            if( hasFilter ){
                node.value = ObserveData.filters[ name ].bind(ObserveData)(ObserveData.data[ name ], 'o');
            }else{
                node.value = ObserveData.data[ name ];
            }
            node.addEventListener('input',fn, false);
            node.addEventListener('change',fn, false);

            function fn() {
                ObserveData.data[ name ] = node.value;
            }
        }
    }

    /**
     * 开始枚举ObserveData.data进行监控
     */
    static [listout](){
        if(ObserveData.data){
            for(let k in ObserveData.data){
                if(cacheNodes.hasOwnProperty(k) && ObserveData.data.hasOwnProperty(k) ){
                    Fup[observe](
                        cacheNodes[k],
                        k,
                        (ObserveData.filters && typeof ObserveData.filters[ k ] === 'function')
                    );
                }
            }
        }
    }

    /**
     * 监控
     * @param {Array|Object} nodes
     * @param {String} name
     * @param {boolean} hasFilter
     */
    static [observe]( nodes, name, hasFilter){
        let len = nodes.length,
            tempval = ObserveData.data[ name ],
            result;
        Object.defineProperty(ObserveData.data, name, {
            set: function (val) {
                if (tempval === val) return;
                for(let i=0; i<len; i++){
                    let attrs = nodes[i].attrs;
                    for (let n = 0, nlen = attrs.length; n < nlen; n++) {
                        result = hasFilter ? ObserveData.filters[name].bind(ObserveData)(val, 'o') : val;
                        switch (attrs[n]){
                            case 'append':
                                nodes[i].node.appendChild( result );
                                break;
                            default:
                                nodes[i].node[ attrs[n] ] = result;
                        }
                    }
                }
                tempval = val;
            },
            get: function () {
                return tempval;
            }
        });
    }

    /**
     * @returns {string}
     */
    static toString(){
        return 'Fup () { [native code] }';
    }
}

module.exports = Fup;