'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	
	let res = {};
	res = await db.collection('uni-id-article-category').get();
	
	
	//event为客户端上传的参数
	console.log('event : ', event)
	
	//返回数据给客户端
	return res
};
