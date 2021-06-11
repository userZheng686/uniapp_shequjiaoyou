'use strict';
const db = uniCloud.database()
const dbCmd = db.command;
const $ = dbCmd.aggregate
exports.main = async (event, context) => {
	
	let res = {}
	
	switch(event.action){
		case 'newChat' : {
			res = await newChat(event,context);
			break;
		};
		case 'getAllChat' : {
			res = await getAllChat(event,context);
			break;
		};
		case 'getChatDetail' : {
			res = await getChatDetail(event,context);
			break;
		};
		case 'sendChatDetail' : {
			res = await sendChatDetail(event,context);
			break;
		}
	}

	
	//返回数据给客户端
	return res
};

// 新建聊天列表
const newChat = async (event,context) => {
	let res = {};
	let {serverUser} = event
	res = await db.collection('uni-id-chat').add(serverUser)
	return res;
}


// 获取聊天列表
const getAllChat = async (event,context) => {
	let res = {};
	let res2 = {};
	let {id} = event
	
	//发送方
	res = await db.collection('uni-id-chat').aggregate() 
	.lookup({
	    from: 'uni-id-userinfo',
	    localField: 'reply_userid',
	    foreignField: 'user_id',
	    as: 'user',
	})
	.match({
		send_userid : $.eq(id)
	}).end()
	
	//接收方
	res2 = await db.collection('uni-id-chat').aggregate() 
	.lookup({
	    from: 'uni-id-userinfo',
	    localField: 'send_userid',
	    foreignField: 'user_id',
	    as: 'user',
	})
	.match({
		reply_userid : $.eq(id)
	}).end()
	
	return {
		res,
		res2
	};
}

// 获取聊天列表详情
const getChatDetail = async (event,context) => {
	let res = {};
	let {send_userid,reply_userid} = event
	
	res = await db.collection('uni-id-chat-detail').where({
		send_userid : dbCmd.or([dbCmd.eq(send_userid),dbCmd.eq(reply_userid)]),
		reply_userid : dbCmd.or([dbCmd.eq(send_userid),dbCmd.eq(reply_userid)]),
	}).get()
	
	return res;
}

// 发送聊天记录
const sendChatDetail = async (event,context) => {
	let res = {};
	let res2 = {};
	let {send} = event
	res = await db.collection('uni-id-chat-detail').add(send)
	res2 = await db.collection('uni-id-chat').where({
		send_userid : dbCmd.or([dbCmd.eq(send.send_userid),dbCmd.eq(send.reply_userid)]),
		reply_userid : dbCmd.or([dbCmd.eq(send.send_userid),dbCmd.eq(send.reply_userid)]),
	}).update({
		reply_content : send.content,
		reply_time : send.create_time
	})
	
	return res2;
}