'use strict';

import { wait, ready, keychain } from './methods';
import { resolveWithValue } from './helpers';

export default (options = {}) => ({ proto }) => {

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