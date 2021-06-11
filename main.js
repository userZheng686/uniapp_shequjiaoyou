import Vue from 'vue'
import App from './App'
import store from './store/index.js';

Vue.prototype.$store = store;

import divider from './components/common/divider.vue'
Vue.component('divider',divider)
import nothing from './components/common/no-thing.vue'
Vue.component('nothing',nothing)
import loading from './components/common/loading.vue'
Vue.component('loading',loading)

// 引入配置文件
import $C from 'common/css/config.js'
Vue.prototype.$C = $C

// 挂载助手函数库
import $U from 'common/css/util.js';
Vue.prototype.$U = $U


// 权限验证操作
Vue.prototype.checkAuth = (callback) => {
	// 权限验证
	// 获取token
	let token = uni.getStorageSync('uni_id_token');
	uniCloud.callFunction({
		name : 'check-token',
		data : {
			token : token
		},
		success(res) {
			if(res.result.code === 0){
				callback()
			}else{
				return uni.navigateTo({
					url : '/pages/login/login',
					complete() {
						uni.showToast({
							title : '请先登录',
							icon : 'none',
						})
					}
				})
			}	
		},
		fail(res) {
			uni.showToast({
				title : '请先登录',
				icon : 'none'
			})
			return uni.navigateTo({
				url : '/pages/login/login',
				complete() {
					uni.showToast({
						title : '请先登录',
						icon : 'none',
					})
				}
			})
		}
	})
	
}

// 权限验证跳转
Vue.prototype.navigate = (options) => {
	// 权限验证
	// 获取token
	let token = uni.getStorageSync('uni_id_token')
	uniCloud.callFunction({
		name : 'check-token',
		data : {
			token : token
		},
		success(res) {
			if(res.result.code === 0){
				uni.navigateTo(options)
			}else{
				return uni.navigateTo({
					url : '/pages/login/login',
					complete() {
						uni.showToast({
							title : '请先登录',
							icon : 'none',
						})
					}
				})
			}
		},
		fail(res) {
			return uni.navigateTo({
				url : '/pages/login/login',
				complete() {
					uni.showToast({
						title : '请先登录',
						icon : 'none',
					})
				}
			})
		}
	})
	
}

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	store,
    ...App
})
app.$mount()
