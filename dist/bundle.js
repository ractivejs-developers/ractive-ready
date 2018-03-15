'use strict';

function arrayReplaceWithNamedKeys(arr, keys) {
	let cloneArr = arr.slice(),
		buff = cloneArr.splice(cloneArr.length - keys.length)
						.reduce((acc, curr, i) => {
							acc[keys[i]] = curr;
							return acc;
						}, {});
	cloneArr.forEach((item, i) => {
		buff[i] = item;
	});
	return buff;
}

function arrayGetNamedKeys(arr) {
	return Array.isArray(arr) && Object.keys(arr).filter(k => isNaN(parseInt(k)));
}

function arrayIndexedKeys(arr) {
	return Array.isArray(arr) && Object.keys(arr).map(k => arr[k]);
}

function isPromise(val) {
	return !!val && (val instanceof Promise ||
		((typeof val === 'object' || typeof val === 'function') && typeof val.then === 'function'));
}

function stringify(val) {
	if (typeof val === 'string') {
		return val;
	}
	let refs = [];
	return JSON.stringify(val, (k, v) => {
		if (typeof v === 'object' && v !== null) {
			if (refs.includes(v)) return;
			refs.push(v);
		}
		return v;
	});
}

function resolveWithValue(method) {
	if (typeof method !== 'function') {
		throw new TypeError("Setter is undefined. Please, make sure that you use resolveWithValue() properly.");
	}
    return function(...args) {
		let val = args.slice(typeof args[0] !== 'object' && 1);
	 	(val.length > 1 && typeof val[val.length - 1] === 'object') && val.pop();
		(val.length === 1) && (val = val[0]);
		return method.apply(this, args).then(() => val);
    };
}

function keychain() {
    const name = this.component ? '.' + this.component.name : '';
    return ( ! this.parent || this.parent === this.root) ? name : this.parent.keychain() + name;
}

function wait(promise, key) {
    const promises = (this._promises || (this._promises = []));
    return (isPromise(promise)) && ((key && (promises[key] = promise)) || promises.push(promise));
}

function ready(callback) {

    const childComponents = this.findAllComponents().filter(c => ( ! c.parent || c.parent === this)),
        childComponentsNames = childComponents.map(c => c.component.name),
        childPromises = childComponents.map(c => c.ready()),
        selfPromisesNames = arrayGetNamedKeys(this._promises || []),
        selfPromises = arrayIndexedKeys(this._promises || []),
        allPromises = selfPromises.concat(childPromises);

    delete this._promises;
    this._promises = [];

    return Promise.all(allPromises.map(p => p.catch(e => null)))
                .then((res) => {
                    const allNames = selfPromisesNames.concat(childComponentsNames),
                        data = JSON.parse(stringify(arrayReplaceWithNamedKeys(res, allNames)));

                    if (typeof callback === 'function') {
                        callback.call(this, null, data);
                    }
                    if (this === this.root) {
                        this.fire('ready', {}, null, data);
                    }

                    return data;
                })
                .catch((err) => {
                    if (typeof callback === 'function') {
                        callback.call(this, err, null);
                    }
                    if (this === this.root) {
                        this.fire('ready', {}, err, null);
                    }

                    throw err;
                });
}

var index = (options = {}) => ({ proto }) => {

	if (options.resolveWithValue) {
		proto.set = resolveWithValue(proto.set);
		proto.push = resolveWithValue(proto.push);
		proto.unshift = resolveWithValue(proto.unshift);
		proto.add = resolveWithValue(proto.add);
		proto.subtract = resolveWithValue(proto.subtract);
		proto.reset = resolveWithValue(proto.reset);
	}

	proto.wait = wait;	
	proto.ready = ready;
	proto.keychain = keychain;
};

module.exports = index;
