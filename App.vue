<script>
	export default {
		onLaunch: function() {
			// 检测更新
			this.$U.update()
			// 网络监听
			this.$U.onNetwork()
			// 初始化数据
			
			// #ifdef APP-PLUS
			plus.push.setAutoNotification(true); // 在程序运行时接收到的消息在系统消息中心显示
			// 点击通知消息时，自动执行该事件
			plus.push.addEventListener('click',function(message){
				// 自定义内容获取
				let payload = message.payload
				console.log(payload)
			})
			
			// 收到透传，执行该事件
			plus.push.addEventListener('receive',function(message){
				// 自定义内容获取
				let payload = message.payload
				console.log(payload)
			})
			// #endif
		},
	}
</script>

<style>
	/*每个页面公共基础css*/
	/*每个页面公共css */
	@import "./common/css/uni.css";
	/*自定义图标库*/
	@import "./common/css/icon.css";
	/*animatecss动画库*/
	@import "./common/css/animate.css";
	/*自定义样式库*/
	@import "./common/css/free.css";
	/*全局样式*/
	@import "./common/css/common.css";
</style>
