/**
 * [Promise description]
 * @param {Function} fn [description]
 */

var Promise = function (fn) {
	if(typeof fn !== 'function') {
		throw new Error('argument is not a function');
	}
	this.status = 'pending';

	var deffereds = [];
	
	this.value = null;
	this.constructor = Promise;
	var self = this;
	
	fn(resolve, reject);

	this.then = function (onFulfilled, onRejected) {
		return new this.constructor(function (resolve, reject) {
			var handler = new Handler(onFulfilled, onRejected, resolve, reject);
			handle(handler);
		});
	}
	
	function resolve (fn) {
		if(typeof fn == 'object' && typeof fn.then == 'function') {
			//如果传入的是Promise
			doResolve(fn);
			return;
		}
		else if(typeof fn == 'function') {

		}
		
		self.status = 'resolved';
		self.value = fn;
		process.bind(self)();
	}
		
	function doResolve (promise, resolve, reject) {
		promise.then(function () {
			resolve(this.value);
		}, function () {
			reject(this.error);
		})
	}

	function reject (error) {
		this.status = 'rejected';
		this.err = error;
	}

	function handle (handler) {
		if(self.status == 'resolved') {
			handler.onFulfilled(this.value);
		}
		if(self.status == 'rejected') {
			handler.onRejected(this.error)
		}
		if(self.status == 'pending') {
			deffereds.push(handler);
		}
	}
	function process () {
		if(this.status == 'resolved') {
			console.log(deffereds)
			for (var i = 0; i < deffereds.length; i++) {
				deffereds[i].onFulfilled(this.value);
			};
			return;
		}
		if(this.status == 'rejected') {
			for (var i = 0; i < deffereds.length; i++) {
				deffereds[i].onRejected(this.error);
			};
			return;
		}
	}
	function Handler (onFulfilled, onRejected, resolve, reject) {
		this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
     	this.onRejected = typeof onRejected === "function" ? onRejected : null;
		this.resolve = resolve;
		this.reject = reject;
	}
	// this.catch = function () {

	// }

	
};

Promise.prototype = {
}

/**
 * [race description]
 * @param  {[]} promises [description]
 * @return {[promise]}   [description]
 */
Promise.race = function (promises) {

};

/**
 * [race description]
 * @param  {[]} promises [description]
 * @return {[promise]}   [description]
 */
Promise.all = function (promises) {

}

/**
 * [race description]
 * @param  {[]} promises [description]
 * @return {[promise]}   [description]
 */
Promise.resolve = function (thenable) {

}
