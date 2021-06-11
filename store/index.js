import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state : {
		loginStatus : false
	},
	mutations : {
		changeStatus(store,status){
			store.loginStatus = status
		}
	}
})