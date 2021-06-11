'use strict';

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
	
	let res = {};
	
	switch(event.action){
		case 'searchPosting' : {
			res = await searchPosting(event, context);
			break;
		};
		case 'searchTopic' : {
			res = await searchTopic(event, context);
			break;
		};
		case 'searchTopicSecond' : {
			res = await searchTopicSecond(event, context);
			break;
		};
		case 'searchUser' : {
			res = await searchUser(event, context);
			break;
		}
	}
	
	//返回数据给客户端
	return res
};

// 帖子搜索
const searchPosting = async (event, context) => {
	let res = {};
	let {content,pageSize} = event
	
	res = await db.collection('uni-id-article-list').aggregate().lookup({
	    from: 'uni-id-userinfo',
	    localField: 'user_id',
	    foreignField: 'user_id',
	    as: 'user',
	}).match(dbCmd.or([{
		title : new RegExp(`^${content}`,'i')
	},{
		content : new RegExp(`^${content}`,'i')
	}])).sort({
		create_time : -1
	}).limit(pageSize).end()
	
	return res;
}

// 话题搜索
const searchTopic = async (event,context) => {
	let res = {};
	let {content,pageSize} = event
	
	res = await db.collection('uni-id-topic-list').aggregate().match(dbCmd.or([{
		title : new RegExp(`^${content}`,'i')
	},{
		desc : new RegExp(`^${content}`,'i')
	}])).limit(pageSize).end()
	return res;
}

// 话题搜索第二次
const searchTopicSecond = async (event,context) => {
	let res = {};
	let {content,pageSize} = event
	res = await db.collection('uni-id-topic-list').where(dbCmd.or([{
		title : new RegExp(`^${content}`,'i')
	},{
		desc : new RegExp(`^${content}`,'i')
	},{
		_id : dbCmd.gt(lastId)
	}])).get()
	
	return res;
}

// 用户名称搜索
const searchUser = async (event,context) => {
	let res = {};
	let {content,pageSize} = event
	res = await db.collection('uni-id-userinfo').where({
		username : new RegExp(`^${content}`,'i')
	}).limit(pageSize).get()
	return res;
}