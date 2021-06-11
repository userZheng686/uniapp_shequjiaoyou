'use strict';
exports.main = async (event, context) => {
	let res = {};
	res = await uniCloud.deleteFile({
		fileList:[event.fileID]
	})
	
	//返回数据给客户端
	return res
};
