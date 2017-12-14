var Component = function (options) {
	//@TODO...
	//add other options
	if (!options.el) {
		throw new Error('el must be a not empty string');
	}
	this.id = '';
	this.initVComponent(options.el);
}
Component.prototype.initVComponent = function (el) {
	//TODO
	//According to dom to generate a virtual node
	var reg = /^#(\S+)/;
	var self = this;
	if (!reg.test(el)) {
		throw new Error('el must be id of element');
	}
	self.id = el.match(reg)[1];
	function recursive (node) {
		var vnode = {
			tag: '',
			props: {},
			children: []
		}
		if (node.nodeName == '#text') {
			vnode.tag = '#text';
			vnode.content = node.nodeValue;
			return vnode;
		}
		vnode.tag = node.nodeName;
		var childs = node.childNodes;
		var attrs = node.attributes;
		for (var i = 0; i < attrs.length; i++) {
			vnode.props[attrs[i].nodeName] = attrs[i].nodeValue;
		};
		for (var i = 0; i < childs.length; i++) {
			vnode.children.push(recursive(childs[i]));
		};
		return vnode;
	}
	self.vnode = recursive(document.getElementById(self.id));

}
/*
 * [diff]
 * @param  {old virtual} oldVNode 
 * @param  {new virtual node} newVNode
 * @return {patches}
 * D delete opreate
 * I insert opreate
 * S substitute opreate
 * PROP props change
 * S-TEXT
 */
function diff (oldVNode, newVNode) {
	if (typeof oldVNode == 'undefined') {
		throw new Error('missing the first parameter');
	}
	if (typeof newVNode == 'undefined') {
		throw new Error('missing the second parameter');
	}
	var patches = [];
	var walker = {index: 0}
	diffWalk(oldVNode, newVNode, patches, walker);
	return patches;
}
function diffWalk (oldVNode, newVNode, patches, walker) {
	if (oldVNode.tag != newVNode.tag) {
		//if tag of old root vnode different from tag of new root vnode
		patches[walker.index] = [{
			type: 'S',
			from: oldVNode,
			to: newVNode
		}];
		return patches;
	} else {
		var patch;
		if (oldVNode.tag == '#text' && newVNode.tag == '#text') {
			if (oldVNode.content != newVNode.content) {
				patch = {
					type: 'S-TEXT',
					node: oldVNode,
					content: newVNode.content
				};
			}
			insertPatch(patches, walker.index, patch);
		} else if (oldVNode.tag != '#text' && newVNode.tag == '#text') {
			patch = {
				type: 'S',
				from: oldVNode,
				to: newVNode,
			};
			insertPatch(patches, walker.index, patch);
		} else if (oldVNode.tag == '#text' && newVNode.tag != '#text') {
			patch = {
				type: 'S',
				from: oldVNode,
				to: newVNode,
			};
			insertPatch(patches, walker.index, patch);
		} else {
			//diff props
			var patch = diffProps(oldVNode, newVNode);
			insertPatch(patches, walker.index, patch);
			diffChildren(oldVNode.children, newVNode.children, patches, walker);
		}
	}
}
function insertPatch (patches, index, patch) {
	if (patch && isArray(patches[index])) {
		patches[index].push(patch);
	}else if (patch && !isArray(patches[index])) {
		patches[index] = [];
		patches[index].push(patch);
	}
	else if (!patch && !isArray(patches[index])) {
		patches[index] = void undefined;
	}
}
/**
 * [diffChildren]
 * @param  {array of old virtual child} oldChildren 
 * @param  {array of new virtual child} newChildren 
 * @param  {[]} patches
 */
function diffChildren (oldChildren, newChildren, patches, walker) {
	var listDiff = diffList(oldChildren, newChildren);
	var notAlter = listDiff.notAlter;
	var moves = listDiff.patches;;
	if (oldChildren.length) {
		for (var i = 0; i < oldChildren.length; i++) {
			walker.index++;
			if (moves[i]) {
				//if moves[i] exsit
				patches[walker.index] = moves[i];
			}
			if (notAlter[i]) {
				diffWalk(oldChildren[notAlter[i].oldIndex], newChildren[notAlter[i].newIndex], patches, walker);
			}
		};
	}else {
		walker.index++;
		if (moves[i]) {
			//if moves[i] exsit
			patches[walker.index] = moves[i];
		}
		if (notAlter[i]) {
			diffWalk(oldChildren[notAlter[i].oldIndex], newChildren[notAlter[i].newIndex], patches, walker.index);
		}
	}
}

/**
 * [diffProps description]
 * @param  {old virtual node} oldVNode [description]
 * @param  {new virtual node} newVNode [description]
 * @return {diff props}          [description]
 */
function diffProps (oldVNode, newVNode) {
	var type = 'PROP';
	var patches = [];
	var oldProps = oldVNode.props;
	var newProps = newVNode.props;
	var allProps = Object.keys(Object.assign({}, oldProps, newProps));
	for (var i = 0; i < allProps.length; i++) {
		if (!oldProps[allProps[i]] && newProps[allProps[i]]) {
			patches.push({
				type: 'I',
				prop: allProps[i],
				value: newProps[allProps[i]]
			})
		} else if (oldProps[allProps[i]] && !newProps[allProps[i]]) {
			patches.push({
				type: 'D',
				prop: allProps[i],
				value: oldProps[allProps[i]]
			})
		} else {
			if (oldProps[allProps[i]] != newProps[allProps[i]]) {
				patches.push({
					type: 'S',
					prop: allProps[i],
					value: newProps[allProps[i]]
				})
			}
		}
	};
	if (patches.length) {
		return {
			type: type,
			patches: patches
		}
	}
}

function diffList (oldList, newList) {
	//check if old list has key
	var oldKeys = keySet(oldList);
	var newKeys = keySet(newList);
	var M = oldKeys.length;
	var N = newKeys.length;
	var notAlter = []; // the nodes not alter
	var D = [];
	var patches = []; //list move patches
	//init
	for (var i = 0; i <= M; i++) {
		D[i] = [];
		D[i][0] = i;
	};
	for (var i = 0; i <= N; i++) {
		D[0][i] = i;
	};

	for (var i = 1; i <= M; i++) {
		for (var j = 1; j <= N; j++) {
			if (oldKeys[i - 1] == newKeys[j - 1] && oldList[i - 1].tag == newList[j - 1].tag) {
				D[i][j] = Math.min.apply(null, [D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1]]);
			} else {
				D[i][j] = Math.min.apply(null, [D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + 2]);
			}
		};
	};
	//calcuate patch
	function calcuPatch(m, n) {
		var nextM, nextN;
		var type, from, to, oldIndex, newIndex, min;
		if (m == 0 || n == 0) {
			return;
		}
		if (oldKeys[m - 1] == newKeys[n - 1]) {
			min = D[m - 1][n - 1];
			nextM = m - 1;
			nextN = n - 1;
			type = 'N';
		}
		if (D[m][n] == D[m - 1][n - 1] + 2) {
			if (D[m - 1][n] < min || min === undefined) {
				min = D[m - 1][n - 1];
				nextM = m - 1;
				nextN = n - 1;
				type = 'S';
				from = oldList[m - 1];
				to = newList[n - 1];
			}
		}
		if (D[m][n] == D[m - 1][n] + 1) {
			if (D[m - 1][n] < min || min === undefined) {
				min = D[m - 1][n];
				nextM = m - 1;
				nextN = n;
				type = 'D';
				from = oldList[m - 1];
				to = null;		
			}
		}
		if (D[m][n] == D[m][n - 1] + 1) {
			if (D[m][n - 1] < min || min === undefined) {
				nextM = m;
				nextN = n - 1;
				type = 'I';
				from = null;
				to = newList[n - 1];
			}
		}
		oldIndex = m - 1;
		newIndex = n - 1;
		if (type != 'N') {
			patches.push({
				type: type,
				from: from,
				to: to,
				index: oldIndex
			});	
		}else {
			notAlter.push({
				oldIndex: oldIndex,
				newIndex: newIndex
			});
		}
		calcuPatch(nextM, nextN);
	}
	calcuPatch(M, N);
	//get not alter vnode
	//arrange pathces and notAlter
	var currentPatches = {};
	var currentNotAlter = {};
	patches.reverse().forEach(function (item) {
		if (!currentPatches[item.index]) {
			currentPatches[item.index] = [];
			currentPatches[item.index].push(item);
		}else {
			currentPatches[item.index].push(item);
		}
	});
	notAlter.reverse().forEach(function (item) {
		currentNotAlter[item.oldIndex] = item;
	})
	return {
		patches: currentPatches,
		notAlter: currentNotAlter
	}
}
function keySet (items) {
	var set = [];
	for (var i = 0; i < items.length; i++) {
		var key = getKey(items[i]);
		set.push(key);
	};
	return set;
}
function getKey (item) {
	if (item.key) {
		return item.key;
	}
	return void 666;
}
function isArray (o) {
	return Array.isArray ? Array.isArray(o) : Object.prototype.toString.call(o) == '[object Array]';
}
/**
 * applyPatches function
 * @param  {old virtual node} oldVNode
 * @param  {array  of patch} patches
 */
function toApplyPaches (oldNode, patches) {
	var walker = {index: 0};
	dfsApplyWalk(oldNode, patches, walker);
}
function dfsApplyWalk (oldNode, patches, walker) {
	//if paches[walker.index]
	var childs = oldNode.childNodes;
	var step = 0;
	if (patches[walker.index]) {
		patches[walker.index].forEach(function (patch) {
			step += applyPatch(oldNode, patch);
		});
	}
	walker.index++;
	if (childs) {
		for (var i = 0, len = childs.length; i < len; i++) {
			i += dfsApplyWalk(childs[i], patches, walker);
			//update len;
			len = childs.length;
		};
	}
	return step;
}
function applyPatch (oldNode, patch) {
	switch (patch.type) {
		case 'I':
			var ele = renderElement(patch.to);
			oldNode.parentNode.insertBefore(ele, oldNode);
			return 1;
		case 'D':
			oldNode.parentNode.removeChild(oldNode);
			return -1;
		case 'S':
			var newNode = renderElement(patch.to);
			oldNode.replaceNode(newNode, oldNode);
			return 0;
		case 'S-TEXT':
			oldNode.textContent = patch.content;
			return 0;
		case 'PROP':
			setProps(oldNode, patch.patches);
			return 0;
		default: 
			throw new Error('type is error')
	}

}
/**
 * [renderElement]
 * @param  {virtual node} vNode
 * @return {DOM}
 */
function renderElement (vNode) {
	var ele;
	if (vNode.tag != '#text') {
		ele = document.createElement(vNode.tag);
	}else {
		ele = document.createTextNode(vNode.content)
	}
	for (var prop in vNode.props) {
		ele.setAttribute(prop, vNode.props[prop]);
	}
	vNode.children.forEach(function (child) {
		ele.appendChild(renderElement(child));
	});
	return ele;
}
/**
 * [setProps]
 * @param {old dom} oldNode
 * @param {props patches} propPatches
 */
function setProps (oldNode, propPatches) {
	propPatches.forEach(function (patch) {
		switch (patch.type) {
			case 'S': 
				oldNode.setAttribute(patch.prop, patch.value);
				break;
			case 'I':
				oldNode.setAttribute(patch.prop, patch.value);
				break;
			case 'D':
				oldNode.removeAttribute(patch.prop);
				break;
			default:
				throw new Error('prop type is error');
		}
	});
}
