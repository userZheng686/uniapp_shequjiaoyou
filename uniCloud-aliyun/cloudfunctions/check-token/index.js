'use strict';
const uniID = require('uni-id')
exports.main = async (event, context) => {
	let res = await uniID.checkToken(event.token,{
		needUserInfo : true
	})
	return res;
};
