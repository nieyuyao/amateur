/**
 * [stringify description]
 * @param  {[object]} o
 * @param  {[function(k, v) {}]}
 * @return {[json]}
 */
JSON.stringify = function (o, replacer) {
	var oJSON = undefined;
	var fn = replacer || function (k ,v) {return v;};
	//处理o
	var obj = fn('', o);
	//如果obj为number或者null,直接返回
	if ( typeof obj == 'number' || (typeof obj == 'object' && !obj) ) {
		var oJSON = '';
		return oJSON += ('' + obj);
	}
	else if ( typeof obj == 'string' ) {
		var oJSON = '';
		return oJSON += ('"' + obj + '"');
	}
	else if (typeof obj == 'function') {
		return oJSON;
	}
	//如果o为数组
	else if ( Object.prototype.toString.call(obj) == '[object Array]' ) {
		var oJSON = '[';
		for (var key in obj) {
			var res = fn(key, obj[key]);
			//如果fn(key, obj[key])返回的是
			if ( typeof res == 'undefined'
				|| typeof res == 'function' || res == null) {
				oJSON += (null + ',');
			} else if ( typeof res == 'string' ) {
				oJSON += (('"' + res + '"') + ',');
			} else if ( typeof res == 'number' || typeof res == 'boolean') {
				oJSON += (res + ',');
			} else {
				oJSON += JSON.stringify(res, fn) + ',';
			}
		}
		oJSON = oJSON.slice(0, oJSON.length - 1);
		oJSON += ']';
	}
	/////////
	//o为对象 
	//只遍历自己的属性,不遍历原型链上的属性//
	/////////
	else if ( Object.prototype.toString.call(obj) == '[object Object]' ) {
		var oJSON = '{';
		var keys = Object.getOwnPropertyNames(obj);
		for ( var i in keys ) {
			var res = fn(keys[i], obj[keys[i]]);
			if ( typeof res == 'string' ) {
				oJSON += (('"' + keys[i] + '":') + (('"' + res + '"') + ','));
			}
			else if ( typeof res == 'number'|| typeof res == 'boolean' || (!res && typeof res == 'object' )) {
				oJSON += (('"' + keys[i] + '":') + (res + ','));
			}
			else if (typeof res == 'object') {
				oJSON += (('"' + keys[i] + '":') + JSON.stringify(res, fn) + ',');
			}
			
		}
		oJSON = oJSON.slice(0, oJSON.length - 1);
		oJSON += '}';
	}

	return oJSON;
}
