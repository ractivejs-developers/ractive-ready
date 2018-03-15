'use strict';

import {
	arrayReplaceWithNamedKeys, 
	arrayGetNamedKeys, 
	arrayIndexedKeys, 
	isPromise,
	stringify
} from './helpers';

export function keychain() {
    const name = this.component ? '.' + this.component.name : '';
    return ( ! this.parent || this.parent === this.root) ? name : this.parent.keychain() + name;
}

export function wait(promise, key) {
    const promises = (this._promises || (this._promises = []));
    return (isPromise(promise)) && ((key && (promises[key] = promise)) || promises.push(promise));
}

export function ready(callback) {

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