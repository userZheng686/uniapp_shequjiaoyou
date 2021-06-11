'use strict';

const db = uniCloud.database();
const dbCmd = db.command;
// 聚合操作
const $ = dbCmd.aggregate
// 云函数update-pwd代码
const uniID = require('uni-id')

exports.main = async (event, context) => {
	let res = {};
	
	switch(event.action){
		case 'addSupport' : {
			res = await addSupport(event,context);
			break;	
		};
		case 'cancelSupport' : {
			res = await cancelSupport(event,context);
			break;	
		};
		case 'getFollow' : {
			res = await getFollow(event,context);
			break;	
		};
		case 'getUserInfo' : {
			res = await getUserInfo(event,context);
			break;	
		};
		case 'getTodayPosting' : { 
			res = await getTodayPosting(event,context);
			break;
		};
		case 'updateUserPassword' : {
			res = await updateUserPassword(event,context);
			break;
		};
		case 'updateUserInfo' : {
			res = await updateUserInfo(event,context);
			break;
		};
		case 'AddBlacklist' : {
			res = await AddBlacklist(event,context);
			break;
		};
		case 'DelBlacklist' : {
			res = await DelBlacklist(event,context);
			break;
		};
		case 'getBlacklist' : {
			res = await getBlacklist(event,context);
			break;
		};
	}
	
	//返回数据给客户端
	return res
};

// 关注
// follow 关注 user 关注的粉丝
const addSupport = async (event,context) => {
	let res = {};
	let updateres = {};
	const {follow,user} = event;
	await db.collection('uni-id-userinfo').where({
		user_id : user.userid
	}).update({
		follow : dbCmd.push(follow)
	})
	
	res = await db.collection('uni-id-userinfo').where({
		user_id : user.userid
	}).get()
	

	user.username = res.data[0].username;
	user.userpic = res.data[0].userpic;
	
	updateres = await db.collection('uni-id-userinfo').where({
		user_id : follow.userid
	}).update({
		fens : dbCmd.push(user)
	})
	return updateres;
}

// 取消关注
const cancelSupport = async (event,context) => {
	let res = {}
	let res2 = {};
	let {ownid,otherid} = event 
	// 对关注者进行操作
	res = await db.collection('uni-id-userinfo').where({
		user_id : ownid
	}).get()
	// 对被关注者进行操作
	res2 = await db.collection('uni-id-userinfo').where({
		user_id : otherid
	}).get()
	
	let follow = res.data[0].follow
	let fens = res2.data[0].fens
	
	
	let index = follow.findIndex((v) => v.userid === otherid)
	let index2 = fens.findIndex((v) => v.userid === ownid)


	if(index != -1){
		follow.splice(index,1)
	}
	if(index2 != -1){
		fens.splice(index2,1)
	}

	
	res = await db.collection('uni-id-userinfo').where({
		user_id : ownid
	}).update({
		follow : follow
	})
	res2 = await db.collection('uni-id-userinfo').where({
		user_id : otherid
	}).update({
		fens : fens
	})
	return {
		res,res2
	}
}

// 获取关注列表和粉丝列表
const getFollow = async (event,context) => {
	let res = {}
	let res2 = {}
	let res3 = {}
	res = await db.collection('uni-id-userinfo').field({ 'fens': true,'follow':true }).where({
		user_id : event.id
	}).get()
	// follow
	let follow = res.data[0].follow.map((item) => {return item.userid})
	// fens
	let fens = res.data[0].fens.map((item) => {return item.userid})
	
	
	// 获取关注列表下的follow数据
	res2 = await db.collection('uni-id-userinfo').field({'follow':true,'userpic':true,'username':true,'user_id':true,'sex':true,'age':true}).where({
		user_id : $.in(follow)
	}).get()
	// 获取粉丝列表下的fens数据
	res3 = await db.collection('uni-id-userinfo').field({'fens':true,'userpic':true,'username':true,'user_id':true,'sex':true,'age':true}).where({
		user_id : $.in(fens)
	}).get()
	return {
		'own' : res,
		'follow' : res2,
		'fens' : res3,
	};
}


// 获取用户今天是否发过帖子
const getTodayPosting = async (event,context) => {
	const dbCmd = db.command
	const $ = dbCmd.aggregate
	let res = {};
	res = await db.collection('uni-id-article-list').where({
		create_time : dbCmd.and(dbCmd.gte(new Date(event.date1).getTime()),dbCmd.lte(new Date(event.date2).getTime())),
		user_id : event.id
	}).get();
	return res;
}

// 获取用户信息
const getUserInfo = async (event,context) => {
	let res = {};
	res = await db.collection('uni-id-userinfo').where({
		user_id : event.id
	}).get();
	return res;
}

// 修改用户密码
const updateUserPassword = async (event,context) => {
	let res = {};
	const {oldPassword,newPassword,uid} = event;
	res = await uniID.updatePwd({
		uid,oldPassword,newPassword
	})
}

// 修改用户信息
const updateUserInfo = async (event,context) => {
	let res = {};
	const {uid,userpic,username,sex,qg,job,birthday,path} = event
	res = await db.collection('uni-id-userinfo').where({
		user_id : uid
	}).update({
		userpic : userpic,
		username : username,
		sex : sex,
		qg : qg,
		job : job,
		birthday : birthday,
		path : path,
	});
	return res;
}

// 加入黑名单
const AddBlacklist = async (event,context) => {
	let res = {}
	const {uid,otherid} = event
	res = await db.collection('uni-id-userinfo').where({
		user_id : uid
	}).update({
		blacklist : dbCmd.push(otherid)
	})
	return res;
}

// 删除黑名单
const DelBlacklist = async (event,context) => {
	let res = {}
	const {uid,otherid} = event
	res = await db.collection('uni-id-userinfo').where({
		user_id : uid
	}).get()
	let blacklist = res.data[0].blacklist
	let index = blacklist.findIndex((v) => v === otherid)
	if(index != -1){
		blacklist.splice(index,1)
	}
	res = await db.collection('uni-id-userinfo').where({
		user_id : uid
	}).update({
		blacklist : blacklist
	})
	return res
}

// 获取是否双方互相加入黑名单
const getBlacklist = async (event,context) => {
	let own = {}
	let other = {}
	let {uid,otherid} = event
	own = await db.collection('uni-id-userinfo').field({'blacklist':true  }).where({
		user_id : uid
	}).get()
	other = await db.collection('uni-id-userinfo').field({'blacklist':true  }).where({
		user_id : otherid
	}).get()
	return {
		own,other
	}
}