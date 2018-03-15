'use strict';

export function arrayReplaceWithNamedKeys(arr, keys) {
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

export function arrayGetNamedKeys(arr) {
	return Array.isArray(arr) && Object.keys(arr).filter(k => isNaN(parseInt(k)));
}

export function arrayIndexedKeys(arr) {
	return Array.isArray(arr) && Object.keys(arr).map(k => arr[k]);
}

export function isPromise(val) {
	return !!val && (val instanceof Promise ||
		((typeof val === 'object' || typeof val === 'function') && typeof val.then === 'function'));
}

export function stringify(val) {
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

export function resolveWithValue(method) {
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