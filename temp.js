(function (global, mold) {
	//CommonJs
	if (typeof module.exports == 'object' && exports) {
		module.exports = mold;
	}else if (typeof define == 'function' && define.amd) {
		define([], function () {
			return mold;
		});	
	}
	//browser or node
	global.Mold = mold;
})
(this, (function(exports) {
	var Scan = function(template) {
		this.tmpl = template; //当前模板
		this.tail = template; //表示剩余未扫描的
		this.pos = 0; //表示当前扫描到的位置
	}
	//返回从初始位置到当前扫描到的位置之间的字符串
	Scan.prototype.scanUtil = function(re) {
		var index = this.tail.search(re);
		if (index == -1) {
			return null;
		}
		var trace = this.tail.substring(0, index);
		this.tail = this.tail.substr(index, this.tail.length);
		this.pos = this.pos + trace.length;
		return trace;
	}
	Scan.prototype.isFinish = function() {
		return !startReg.test(this.tail);
	}
	Scan.prototype.scanTo = function(regex) {
		this.tail = this.tail.substr(2, this.tail.length);
		this.pos = this.pos + 2;
	}

	//process context
	var Path = function(data) {
			this.root = data;
			this.cache = {};
		}
		//find the attr of context
	Path.prototype.find = function(attr) {
			var reg = /[^\.]+?\.[^\.]+?/g;
			var result, lastIndex = 0;
			var attrName, ctx = this.root;
			//if this.cache[attr] is exit
			if (this.cache.hasOwnProperty(attr)) {
				return this.cache[attr];
			}
			//if match is not null
			while ((reg.exec(attr))) {
				attrName = attr.substring(lastIndex, reg.lastIndex - 2)
				lastIndex = reg.lastIndex - 1;
				if (typeof ctx[attrName] == 'object' && !!ctx[attrName]) {
					ctx = ctx[attrName];
					continue;
				}
				throw new Error(attr + ' at ' + lastIndex + ' is not valid');
			}
			this.cache[attr] = ctx[attr.substring(lastIndex, attr.length)];
			result = this.cache[attr];
			return result;
		}
		/**
		 * [temp description]
		 * 输入一个html模板,对字符串模板进行处理
		 * @param  {html template} template [description]
		 * @return {string}          [description]
		 */
	var startReg = /\{\{/,
		endReg = /\}\}/,
		insideReg = /(\/|#each\s+|#if\s+|#)/;
	var parse = function(template) {
		var sections = [];
		var tokens = [];
		var scan = new Scan(template);
		var message = '',
			errMsg = '';

		function cropped(inside) {
			var l = inside.length;
			var matches = inside.match(insideReg);
			//if mathces is null
			if (!matches) {
				return {
					type: 'name',
					value: inside
				}
			}
			//candidate type
			var type = matches[1].trim();
			var v = inside.substring(matches[1].length, l)
			if (type == '#each') {
				return {
					type: '#each',
					value: v
				}
			} else if (type == '#if') {
				return {
					type: '#if',
					value: v
				}
			} else if (type == '#') {
				return {
					type: '#',
					value: v
				}
			} else {
				return {
					type: '/',
					value: v
				}
			}
		}
		while (!scan.isFinish()) {
			var start = scan.pos;
			var value = scan.scanUtil(startReg);
			tokens.push(['text', value, start, start + 1]);

			var curPos = scan.pos;

			scan.scanTo(startReg);
			var inside = scan.scanUtil(endReg);
			scan.scanTo(endReg);
			if (!inside) {
				throw new Error('the mustache is not closed at pos: ' + curPos);
			}
			inside = inside.trim();
			//stamp is candidate token to add
			var stamp = cropped(inside);
			if (stamp.type != '/') {
				var token = [stamp.type, stamp.value, curPos, curPos + 1];
				tokens.push(token);
				if (token[0] != 'name') {
					sections.push(token);
				}
			} else {
				//type is '/'
				var preToken = sections.pop();
				var token = [stamp.type, stamp.value, curPos, curPos + 1];
				if (typeof preToken == 'undefined') {
					throw new Error('token at ' + token[2] + ' is not match;')
				}
				errMsg = '';
				//if stamp.value is each
				if (stamp.value == 'each' || stamp.value == 'if') {
					preToken[0] == ('#' + stamp.value) ? (tokens.push(token) && (preToken[3] = curPos)) : errMsg += (stamp.value + ' token at ' + preToken[3] + ' is not match ' + curPos);
				} else {
					(preToken[1] == stamp.value && preToken[0] == '#') ? (tokens.push(token) && (preToken[3] = curPos)) : errMsg += ('token at ' + preToken[3] + ' is not match ' + curPos);
				}

			}

			if (!!errMsg) {
				//if errMsg is not '', throw errMsg
				throw new Error(errMsg);
			}

		}
		if (sections.length) {
			message = '';
			for (var i = 0; i < sections.length; i++) {
				message += 'the token at ' + sections[i][3] + ' doesn\'t close' + '; ';
			};
			throw new Error(message);
		}

		tokens.push(['text', template.substring(scan.pos, template.length), scan.pos, scan.pos + 1]);
		return modifiedTokens(tokens);
	}

	//deal nested tokens
	function modifiedTokens(tokens) {
		var modifiedTokens = [];
		var aido = {};
		for (var i = 0; i < tokens.length; i++) {
			if (tokens[i][0] == 'name' || tokens[i][0] == 'text') {
				modifiedTokens.push(tokens[i]);
				continue;
			}
			if (!aido[tokens[i][2]]) {
				aido[tokens[i][3]] = true;
				modifiedTokens.push(tokens[i]);
			}
		};
		return nestedTokens(modifiedTokens);
	}
	//modified tokens to nested tokens
	function nestedTokens(tokens) {
		var nestedTokens = [0, 0, 0, tokens[tokens.length - 1][2] + tokens[tokens.length - 1][1].length - 1, []];
		var stages = [];
		stages.push(nestedTokens);
		var end = stages.length - 1;
		for (var i = 0; i < tokens.length; i++) {
			if (tokens[i][2] < stages[end][3]) {
				if (tokens[i][0] == 'name' || tokens[i][0] == 'text') {
					stages[end][4].push(tokens[i]);
					continue;
				}
				tokens[i][4] = [];
				stages[end][4].push(tokens[i]);
				stages.push(tokens[i]);
				end++;
			} else {
				end--;
				stages[end][4].push(tokens[i]);
			}
		}
		return nestedTokens[4];
	}

	//render template
	function renderTemplate(tokens, data) {
		if (!isObj(data) && typeof data != 'function') {
			throw new Error('data argument' + ' is not object or function');
		}
		if (typeof data == 'function') {
			var newData = isObj(data);
			if (isObj(newData)) {
				return renderTemplate(tokens, newData);
			}
			throw new Error('returnValue of ' + data.name + ' is not object');
		}
		var path = (data instanceof Path) ? data : new Path(data);
		//let data mix in tokens
		var htmlString = '';
		for (var i = 0; i < tokens.length; i++) {
			if (tokens[i][0] == 'text') {
				htmlString += tokens[i][1];
			} else if (tokens[i][0] == 'name') {
				!!path.find(tokens[i][1]) ? htmlString += path.find(tokens[i][1]) : htmlString += '';
			} else if (tokens[i][0] == '#each') {
				//exchange context
				htmlString += renderSection(tokens[i], path);
			} else if (tokens[i][0] == '#if') {
				//if tokens[i][1] is truthy
				if (!!path.find(tokens[i][1])) {
					htmlString += renderTemplate(tokens[i][4], data);
				}
			} else {
				htmlString += renderSection(tokens[i], path);
			}
		};
		return htmlString;

	}
	//justice o is array
	function isArray(o) {
		return Array.isArray ? Array.isArray(o) : Object.prototype.toString.call(o) == '[object Array]';
	}
	//justice o is object
	function isObj(o) {
		return !!(typeof o == 'object' && !!o);
	}
	//render section '#''
	function renderSection(token, path) {
		var ctx = path.find(token[1]);
		var buffer = '',
			result;
		if (typeof ctx == 'object' && !!ctx) {
			if (isArray(ctx)) {
				for (var i = 0; i < ctx.length; i++) {
					buffer += renderTemplate(token[4], ctx[i]);
				};
				return buffer;
			}
			return renderTemplate(token[4], ctx);
		} else if (typeof ctx == 'function') {
			result = ctx();
			if (typeof result == 'object') {
				if (isArray(result)) {
					for (var i = 0; i < ctx.length; i++) {
						buffer += renderTemplate(token[4], ctx[i]);
					};
					return buffer;
				}
				return renderTemplate(token[4], ctx);
			}
			throw new Error(token[1] + ' is a function but not return a object or a array');
		}

		throw new Error('tokens[1] is not function or object')
	}
	
	return {
		render: function(template, data) {
			var nestedTokens = parse(template);
			var result = renderTemplate(nestedTokens, data);
			console.log(result);
		}
	};
})());
