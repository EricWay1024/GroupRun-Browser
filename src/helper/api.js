import Taro from '@tarojs/taro'
// const BASE_URL = "http://10.0.2.2:7001";
const BASE_URL = "https://www.rjxsh.cn";
const AUTH = true;

const genRequest = (url, auth = false) => (
  async (data) => {
    // Let's always use POST!!!
    return await Taro.request({
      url: BASE_URL + url,
      method: 'POST',
      header: auth ? { Authorization: Taro.getStorageSync('token')} : {},
      data: data
    })
    .catch(e => {console.log(e)})
    .then(r => r.data || {});
  }
);

export default {
  login:  genRequest('/login'),
  user: {
    update: genRequest('/user/update', AUTH),
    get: genRequest('/user/get', AUTH),
  },
  step: {
    update: genRequest('/step/update', AUTH),
    get: genRequest('/step/get', AUTH),
    like: genRequest('/step/like', AUTH)
  },
  team: {
    get: genRequest('/team/get', AUTH),
    create: genRequest('/team/create', AUTH),
    updateMember: genRequest('/team/updateMember', AUTH),
    update: genRequest('/team/update', AUTH),
    delete: genRequest('/team/delete', AUTH),
    getMember: genRequest('/team/getMember', AUTH),
  }
};