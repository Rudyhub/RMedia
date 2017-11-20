const fs = require('fs'),
	path = require('path');
function copy( origin, target ){
	if(!origin || !target) throw 'Error: Need two parameters';
	origin = origin.replace(/\/+$/g,'');
	target = target.replace(/\/+$/g,'');
	fs.stat(origin, function(err, stats){
		if(!err && stats.isFile()){
			if( mkdirsSync( target ) ){
				fs.createReadStream( origin ).pipe( fs.createWriteStream( target+'/'+path.basename(origin) ) );
			}
		}else{
		    fs.readdir( origin, function( err, paths ){
		        if( err ){
		            throw err;
		        }
		        paths.forEach(function( dir ){
		        	let osrc = origin + '/' + dir,
		        		tsrc = target + '/' + dir;
		        	fs.stat(osrc, function(err, src){
		        		if(!err){
		        			if(src.isFile()){
		        				if( mkdirsSync( path.dirname(tsrc) ) ){
		        					fs.createReadStream( osrc ).pipe( fs.createWriteStream( tsrc ) );
		        				}
		        			}else if(src.isDirectory()){
		        				fs.mkdir(tsrc, function(){
		        					copy(osrc, tsrc);
		        				});
		        			}
		        		}
		        	});
		        });
		    });
    	}
	});
}

function mkdirsSync(dirpath, mode) { 
    try{
        if (!fs.existsSync(dirpath)) {
            let pathtmp;
            dirpath.split(/[/\\]/).forEach(function (dirname) {
                if (pathtmp) {
                    pathtmp = path.join(pathtmp, dirname);
                }else {
                    pathtmp = dirname;
                }
                if (!fs.existsSync(pathtmp)) {
                    if (!fs.mkdirSync(pathtmp, mode)) return false;
                }
            });
        }
        return true; 
    }catch(e){
        log.error("create director fail! path=" + dirpath +" errorMsg:" + e);        
        return false;
    }
}
module.exports = copy;