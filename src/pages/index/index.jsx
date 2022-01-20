import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { AtAvatar, AtButton, AtInput } from 'taro-ui'
import Taro from '@tarojs/taro'
import api from '../../helper/api'
import { Picker } from '@tarojs/components'
import { AtList, AtListItem } from 'taro-ui'
import moment from 'moment';

import "taro-ui/dist/style/components/button.scss" // 按需引入
import "taro-ui/dist/style/components/list.scss";
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/flex.scss";
import "taro-ui/dist/style/components/avatar.scss";
// import "~taro-ui/dist/style/components/avatar.scss";

import './index.scss'

export default class Index extends Component {
   constructor (props) {
    super(props);
    this.state = {
      editing: false
    };
  }

  async login ()  { 
    const res = await Taro.login();
    const token = await api.login({code: res.code})
      .then(r => r.token);
    Taro.setStorageSync('token', token);
    console.log(token)
    await api.team.updateMember({ team_id: 0, status: 1 })
  }

  getDBUser = async () => {
    const user = await api.user.get();
    console.log(user)
    this.setState({
      ...user
    });
    return user;
  }

  async componentWillMount () {
    await this.login(); 
    Taro.checkSession({
      success: async () => {
        if (!Taro.getStorageSync('token')) { await this.login(); }
      },
      fail: this.login
    })
    const user = await this.getDBUser();
    console.log(this.state)
    if (!user.avatar_url) {
      Taro.showToast({
        title: '请点击登录',
        duration: 1500
      })
    } else {
      // this.goToTeamList();
      this.goToDefaultTeam();
    }
  }
  async componentDidMount () { 
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  goToDefaultTeam = async () => {
    Taro.navigateTo({url: `/pages/step_list/step_list?team_id=0`});
  }
  getUserProfile = async () => {
    const res = await Taro.getUserProfile({
      desc: 'User info needed',
      lang: 'zh_CN'
    });
    console.log(res);
    await api.user.update({
      nickname: res.userInfo.nickName,
      avatarUrl: res.userInfo.avatarUrl,
      alias: res.userInfo.nickName
    });
    await this.getDBUser();
  }

  goToTeamList = () => {
    Taro.navigateTo({url: '/pages/team_list/team_list'})
  }

  handleAliasChange = alias => {
    this.setState({ alias });
  }

  submitAlias = async () => {
    console.log(this.state.alias)
    await api.user.update({ alias: this.state.alias });
    this.setState({ editing: false });
    Taro.showToast({
      title: '昵称修改成功',
      icon: 'success',
      duration: 1000
    })
    await this.getDBUser();
  }

  authSetting = async () => {
    Taro.openSetting({
      success: function (res) {
        console.log(res.authSetting)
      }
    })
  }

  render () {
    return (
      <View className={`index${this.state.avatar_url ? "" : "-default"}`}>
        {this.state.avatar_url &&
          <View className='at-row avatarCtn'>
            <AtAvatar image={this.state.avatar_url} className='avatarImg' circle></AtAvatar>
          </View>}
        {this.state.avatar_url && !this.state.editing && 
          <View className='at-row centered aliasText'>
            <Text>
              {this.state.alias}
            </Text>
            <View className='at-icon at-icon-edit' onClick={() => {this.setState({editing: true})}}></View>
          </View>}
          {this.state.avatar_url && this.state.editing && <View className='at-row centered aliasInput'>
            <AtInput
              name='value'
              type='text'
              value={this.state.alias}
              onChange={this.handleAliasChange}
            />
            <View className='at-icon at-icon-check' onClick={this.submitAlias}></View>
          </View>}
          {this.state.avatar_url &&
            <AtButton type='primary' circle={true} onClick={this.goToDefaultTeam} className='mainButton'>大本营</AtButton>
          }
          {this.state.avatar_url &&
            <AtButton type='secondary' circle={true} onClick={this.goToTeamList} className='mainButton'>队伍列表</AtButton>
          }
        {!this.state.avatar_url && <View className="gap" />}
        <AtButton 
          type={this.state.avatar_url ? "secondary" :　"primary"} circle={true} onClick={this.getUserProfile} className='mainButton'>
          {this.state.avatar_url ? "同步微信个人资料" :　"点击登录"}
        </AtButton>
        <AtButton type="secondary" circle={true} onClick={this.authSetting} className='mainButton'>
          授权设置
        </AtButton>
      </View>
    );
  }
}
