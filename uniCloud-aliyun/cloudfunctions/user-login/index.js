'use strict';
const uniID = require('uni-id');
const db = uniCloud.database()
let nodemailer = require('nodemailer');
exports.main = async (event, context) => {
	let res = {}
	
	switch(event.action){
		case 'emailLogin' : {
			res = await emailLogin(event,context)
			break;
		} ; 
		case 'weixinLogin' : {
			res = await weixinLogin(event,context)
			break;
		} ; 
		case 'bindEmail' : {
			res = await bindEmail(event,context)
			break;
		} ; 
		case 'emailSend' : {
			res = await emailSend(event,context)
			break;
		} ; 
		case 'emailRegister' : {
			res = await emailRegister(event,context)
			break;
		} ; 
		case 'phoneLogin' : {
			res = await phoneLogin(event,context)
			break;
		} ; 
		case 'logout' : {
			res = await uniID.logout(event.uniIdToken)
			break;
		}
	}
	
	return res
};

//邮箱登录
const emailLogin = async (event, context) => {
	let res = {};
	let params = {};
	params = event.params;
	const {username,password} = params
	res = await uniID.login({
		username,
		password,
		queryField: ['username', 'email', 'mobile']
	})
	return res
}

//微信登录
const weixinLogin = async (event, context) => {
	let res = await uniID.loginByWeixin({code:event.code});
	return res
};

//发送邮箱验证码
const emailSend = async (event, context) => {
	const { email } = event
	const randomStr = '00000' + Math.floor(Math.random() * 1000000)
	const code = randomStr.substring(randomStr.length - 6);

	
	var send = (data, code, codeString) => {
		var emailConfig = {
			qq: {
				host: 'smtp.qq.com',
				port: 465,
				secure: true,
				auth: {
					user: '1257815018@qq.com',
					pass: 'iutxaawbjqfpfehc'
				},
				tls: {rejectUnauthorized: false}
			}
		}
		// data为客户端上传的参数
		let transporter = nodemailer.createTransport({
			"host": emailConfig[data.serviceType].host,
			"port": emailConfig[data.serviceType].port,
			"secure": emailConfig[data.serviceType].secure, 
			"auth": emailConfig[data.serviceType].auth
		});
	
		let mailOptions = {
			from: emailConfig[data.serviceType].auth.user,
			to: data.email,
			subject: data.subject,
			text: code ? data.html.replace('#code#', codeString) : data.html
		};
		var res = transporter.sendMail(mailOptions);
		if (code) {
			res.code = codeString;
		}
		return res;
	}
	
	await send(event, true, code);
	const res = await uniID.setVerifyCode({
		email,
		code,
		expiresIn: 60,
		type: 'register'
	})
	return res;
};

//邮箱注册（通过验证码）
const emailRegister = async (event, context) => {
	const { email,code,password } = event;

	const res = await uniID.loginByEmail({
		email,
		code,
		password,
	    type: 'register'
	})
	
	if(res.code === 0){
		let obj = {
			user_id : res.uid,
			username : res.email,
			userpic : "",
			fens : [],
			age : "",
			sex : "",
			qg : "",
			job : "",
			path : "",
			birthday : "",
			email : res.email,
			follow : [],
			blacklist : [],
			comment : 0,
			posting : 0,
			create_time : new Date().getTime()
		}
		const res2 = await db.collection('uni-id-userinfo').add(obj)
		return {
			res,res2
		}
	}
	
};

//邮箱绑定
const bindEmail = async (event,context) => {
	let {uid,email,code} = event
	const res = await uniID.bindEmail({
	    uid : uid,
	    email : email,
	    code : code
	})
	return res
}

//一键登录
const phoneLogin = async (event, context) => {
	let res = {}
	res = await uniCloud.getPhoneNumber({
	  provider: 'univerify',
	  apiKey: 'bc4c94326e567f66225de2c9bff90898', // 在开发者中心开通服务并获取apiKey
	  apiSecret: '551fcc88bdc3382884d2c9f1c13b1442', // 在开发者中心开通服务并获取apiSecret
	  access_token: event.access_token,
	  openid: event.openid
	})
	
	
	//返回数据给客户端
	return res
};
