'use strict';
const db = uniCloud.database()
const dbcmd = db.command
exports.main = async (event, context) => {
	let res = {};
	switch(event.action){
		case 'getAllCategory' : {
			res = await getAllCategory(event,context)
			break;
		};
		case 'getHotCategory' : {
			res = await getHotCategory(event,context)
			break;
		};
		case 'getHotTopicList' : {
			res = await getHotTopicList(event,context)
			break;
		};
		case 'getHotAdvertise' : {
			res = await getHotAdvertise(event,context)
			break;
		};
		case 'getCategoryTopicListFirst' : {
			res = await getCategoryTopicListFirst(event,context)
			break;
		};
		case 'getCategoryTopicListSecond' : {
			res = await getCategoryTopicListSecond(event,context)
			break;
		}
	}

	//返回数据给客户端
	return res
};

// 获取所有分类
const getAllCategory =  async (event,context) => {
	let res = {};
	res = await db.collection('uni-id-topic-category').get()
	return res
}

// 获取热门分类
const getHotCategory = async (event,context) => {
	let res = {};
	res = await db.collection('uni-id-topic-category').where({
		hot : true
	}).get()
	return res
}

// 获取广告
const getHotAdvertise = async (event,context) => {
	let res = {};
	res = await db.collection('uni-id-advertise').where({
		type : event.type
	}).get()
	return res
}


// 获取热门话题
const getHotTopicList = async (event,context) => {
	let res = {};
	res = await db.collection('uni-id-topic-list').where({
		hot : true
	}).get()
	return res
}


// 获取指定分类下的话题列表(第一次获取)
const getCategoryTopicListFirst = async (event,context) => {
	let res = {};
	const {id,pageSize} = event;
	
	res = await db.collection('uni-id-topic-list').where({
		topic_class_id : id
	}).limit(pageSize).get()
	return res
}

// 获取指定分类下的话题列表（第二次获取）
const getCategoryTopicListSecond = async (event,context) => {
	let res = {};
	const {id,lastId,pageSize} = event;
	
	res = await db.collection('uni-id-topic-list').where({
		topic_class_id : id,
		_id: dbcmd.gt(lastId)
	}).limit(pageSize).get()
	return res
}