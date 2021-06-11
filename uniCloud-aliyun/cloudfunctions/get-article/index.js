'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
// 聚合操作
const $ = dbCmd.aggregate
exports.main = async (event, context) => {
	let res = {};
	
	switch(event.action){
		case 'category' : {
			res = await getArticleCategory(event,context);
			break;
		};
		case 'listone' : {
			res = await getArticleListFirst(event,context);
			break;
		};
		case 'listafter' : {
			res = await getArticleListAfter(event,context);
			break;
		};
		case 'comment' : {
			res = await getArticleComment(event,context);
			break;
		};
		case 'addcomment' : {
			res = await addArticleComment(event,context);
			break;
		};
		case 'starArticle' : {
			res = await starArticle(event,context);
			break;
		};
		case 'unStarArticle' : {
			res = await unStarArticle(event,context);
			break;
		};
		case 'firstStarOrUnstar' : {
			res = await firstStarOrUnstar(event,context);
			break;
		};
		case 'getTopicArticleListFirst' : {
			res = await getTopicArticleListFirst(event,context);
			break;
		};
		case 'getTopicArticleListSecond' : {
			res = await getTopicArticleListSecond(event,context);
			break;
		};
		case 'getTopicArticleListFirstTime' : {
			res = await getTopicArticleListFirstTime(event,context);
			break;
		};
		case 'getTopicArticleListSecondTime' : {
			res = await getTopicArticleListSecondTime(event,context);
			break;
		};
		case 'addArticle' : {
			res = await addArticle(event,context);
			break;
		};
		case 'getFollowActicleListFirst' : {
			res = await getFollowActicleListFirst(event,context);
			break;
		};
		case 'getFollowActicleListSecond' : {
			res = await getFollowActicleListSecond(event,context);
			break;
		};
		case 'getUserPostingListFirst' : {
			res = await getUserPostingListFirst(event,context);
			break;
		};
		case 'getUserPostingListSecond' : {
			res = await getUserPostingListSecond(event,context);
			break;
		}
	}
	

	return res
};

// 获取所有的文章分类
const getArticleCategory = async (event,context) => {
	let res = await db.collection('uni-id-article-category').get();
	return res
}

// 按照分类id 获取对应的文章列表(第一次获取)
// 联表查询（uni-id-userinfo && uni-id-article-list）
const getArticleListFirst = async (event,context) => {
	let res = {};
	const {id,page} = event;
	let pageSize = 3
	
	res = await db.collection('uni-id-article-list').aggregate()
	.lookup({
	    from: 'uni-id-userinfo',
	    localField: 'user_id',
	    foreignField: 'user_id',
	    as: 'user',
	})
	.match({
		post_class_id : $.eq(id),
	}).limit(pageSize).end()
	return res
}

// 按照分类id 获取对应的文章列表(第一次以后获取)
const getArticleListAfter = async (event,context) => {
	let res = {};
	const {lastId,id,page} = event;
	let pageSize = 3
	
	res = await db.collection('uni-id-article-list').aggregate()
	.lookup({
	    from: 'uni-id-userinfo',
	    localField: 'user_id',
	    foreignField: 'user_id',
	    as: 'user',
	})
	.match({
		post_class_id : $.eq(id),
		_id: dbCmd.gt(lastId)
	}).limit(pageSize).end()

	return res
}

//获取文章下面的评论列表
const getArticleComment = async (event,context) => {
	let res = {};
	const {id} = event;

	
	res = await db.collection('uni-id-article-comment').where({
		articleId : id
	}).get()
	return res;
}

//添加评论
const addArticleComment = async (event,context) => {
	let res = {};
	res = await db.collection('uni-id-article-comment').where({
		articleId : event.replyData._id
	}).update({
	  list: dbCmd.push(event.replyData)
	})
	await db.collection('uni-id-article-list').where({
		_id : event.replyData._id
	}).update({
		comment_count : dbCmd.inc(1)
	})
	await db.collection('uni-id-userinfo').where({
		user_id : event.id
	}).update({
		comment : dbCmd.inc(1)
	})
	return res;
}

// 第一次点赞或者点踩
const firstStarOrUnstar = async(event,context) => {
	let res = {};
	res = await db.collection('uni-id-article-list').where({
		_id : event.id
	}).update({
		ding_count : event.support_count,
		cai_count : event.unsupport_count,
		support : dbCmd.push(event.user)
	})
	return res;
}

//点赞文章
const starArticle = async (event,context) => { 
	let res = {};
	res = await db.collection('uni-id-article-list').where({
		_id : event.id
	}).update({
		ding_count : event.support_count,
		cai_count : event.unsupport_count,
		['support.'+0]:{
			type : 0
		}
	})
	return res;
}

//踩文章
const unStarArticle = async (event,context) => { 
	let res = {};
	res = await db.collection('uni-id-article-list').where({
		_id : event.id
	}).update({
		ding_count : event.support_count,
		cai_count : event.unsupport_count,
		['support.'+0]:{
			type : 1
		}
	})
	return res;
}

// 通过话题id来获取对应的文章列表(第一次)
const getTopicArticleListFirst = async (event,context) => {
	let res = {};
	const {id,pageSize} = event;
	res = await db.collection('uni-id-article-list').aggregate()
	.lookup({
	    from: 'uni-id-userinfo',
	    localField: 'user_id',
	    foreignField: 'user_id',
	    as: 'user',
	})
	.match({
		topic_class_id : $.eq(id),
	}).limit(pageSize).end()
	return res;
}

// 通过话题id来获取对应的文章列表(第二次)
const getTopicArticleListSecond = async (event,context) => {
	let res = {};
	const {id,lastId,pageSize} = event;
	res = await db.collection('uni-id-article-list').aggregate()
	.lookup({
	    from: 'uni-id-userinfo',
	    localField: 'user_id',
	    foreignField: 'user_id',
	    as: 'user',
	})
	.match({
		topic_class_id : $.eq(id),
		_id: dbCmd.gt(lastId)
	}).limit(pageSize).end()
	return res;
}

// 通过话题id来获取对应的文章列表(第一次)（按照时间顺序）
const getTopicArticleListFirstTime = async (event,context) => {
	let res = {};
	const {id,pageSize} = event;
	res = await db.collection('uni-id-article-list').aggregate()
	.lookup({
	    from: 'uni-id-userinfo',
	    localField: 'user_id',
	    foreignField: 'user_id',
	    as: 'user',
	})
	.match({
		topic_class_id : $.eq(id),
	}).limit(pageSize)
	.sort({
	   create_time: -1,
	}).end()
	return res;
}

// 通过话题id来获取对应的文章列表(第二次)（按照时间顺序）
const getTopicArticleListSecondTime = async (event,context) => {
	let res = {};
	const {id,pageSize} = event;
	res = await db.collection('uni-id-article-list').aggregate()
	.lookup({
	    from: 'uni-id-userinfo',
	    localField: 'user_id',
	    foreignField: 'user_id',
	    as: 'user',
	})
	.match({
		topic_class_id : $.eq(id),
	}).limit(pageSize)
	.sort({
	   create_time: -1,
	}).end()
	return res;
}

// 添加文章
const addArticle = async (event,context) => { 
	let res = {};
	let res2 = {};
	let res3 = {};
	const {obj} = event;
	res = await db.collection('uni-id-article-list').add(obj);
	if(res.id){
		res2 = await db.collection('uni-id-article-comment').add({
			articleId : res.id,
			list : []
		});
		if(res2.id){
			res3 = await db.collection('uni-id-userinfo').where({
				user_id : event.id
			}).update({
				posting : dbCmd.inc(1)
			})
			return res;
		}
		
	}
}

// 获取用户关注列表下的文章(第一次)
const getFollowActicleListFirst = async (event,context) => {
	let res = {};
	let res2 = {};
	res = await db.collection('uni-id-userinfo').aggregate().match({
		user_id : event.id
	}).end()


	let follow = res.data[0].follow;
	let arr = follow.map((item) => {
		return item.userid
	})
	console.log('arr',arr)

	res2 = await db.collection('uni-id-article-list').aggregate().lookup({
	    from: 'uni-id-userinfo',
	    localField: 'user_id',
	    foreignField: 'user_id',
	    as: 'user',
	}).match({
		user_id : dbCmd.in(arr)
	}).sort({
		create_time : -1
	}).limit(3).end()
	
	
	return res2;
}

// 获取用户关注列表下的文章(第二次)
const getFollowActicleListSecond = async (event,context) => {
	let res = {};
	let res2 = {};
	res = await db.collection('uni-id-userinfo').aggregate().match({
		user_id : event.id
	}).end()


	let follow = res.data[0].follow;
	let arr = follow.map((item) => {
		return item.userid
	})
	console.log('arr',arr)

	res2 = await db.collection('uni-id-article-list').aggregate().lookup({
	    from: 'uni-id-userinfo',
	    localField: 'user_id',
	    foreignField: 'user_id',
	    as: 'user',
	}).match({
		user_id : dbCmd.in(arr),
	}).sort({
		create_time : -1
	}).limit(event.pageSize).end()
	
	
	return res2;
}

// 根据用户id获取用户发的帖子(第一次)
const getUserPostingListFirst = async (event,context) => {
	let res = {};
	const {id,pageSize} = event
	res = await db.collection('uni-id-article-list').aggregate()
	.lookup({
	    from: 'uni-id-userinfo',
	    localField: 'user_id',
	    foreignField: 'user_id',
	    as: 'user',
	})
	.match({
		user_id : $.eq(id),
	}).limit(pageSize).end()
	return res;
}

// 根据用户id获取用户发的帖子(第二次)
const getUserPostingListSecond = async (event,context) => {
	let res = {};
	const {id,lastId,pageSize} = event
	res = await db.collection('uni-id-article-list').aggregate()
	.lookup({
	    from: 'uni-id-userinfo',
	    localField: 'user_id',
	    foreignField: 'user_id',
	    as: 'user',
	})
	.match({
		user_id : $.eq(id),
		_id: dbCmd.gt(lastId)
	}).limit(pageSize).end()
	return res;
}