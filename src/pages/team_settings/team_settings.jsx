import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import Taro from '@tarojs/taro'
import api from '../../helper/api'
import { Picker } from '@tarojs/components'
import { AtList, AtListItem } from 'taro-ui'
import moment from 'moment';
import { AtForm, AtSwitch } from 'taro-ui'
import { AtInput }  from 'taro-ui'


import "taro-ui/dist/style/components/button.scss" // 按需引入
import "taro-ui/dist/style/components/list.scss";
import "taro-ui/dist/style/components/flex.scss";
import "taro-ui/dist/style/components/switch.scss";
import "taro-ui/dist/style/components/icon.scss";

// import "~taro-ui/dist/style/components/avatar.scss";

import './team_settings.scss'
import { toPlainObject } from 'lodash'

export default class Index extends Component {
  constructor (props) {
    super(props);
    this.state = {
      team_id: Taro.getCurrentInstance().router.params.team_id * 1,
      teamName: Taro.getCurrentInstance().router.params.team_name,
      memberList: [],
    };
  }
  async componentWillMount () { 
    // console.log(Taro.getCurrentInstance().router.params)

  }

  async componentDidMount () { 
    await this.getMember();
  }

  getMember = async () => {
    const res = await api.team.getMember({ team_id: this.state.team_id });
    const { memberList } = res;
    this.setState({ memberList });
    console.log(res);
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleNameChange = teamName => {
    this.setState({ teamName });
  }

  updateTeam = async () => {
    const res = await Taro.showModal({
      title: '提示',
      content: '你确定要修改队伍名称？'
    });
    if (res.confirm) {
      await api.team.update({ 
        team_id: this.state.team_id,
        name: this.state.teamName,
      })
      Taro.showToast({
        'title': '修改成功',
        'icon': 'success',
        duration: 1000
      })
    }

  }

  deleteTeam = async () => {
    const res = await Taro.showModal({
      title: "提示",
      content: "你确定要删除队伍吗？",
    });
    if (res.confirm) {
      await api.team.delete({
        team_id: this.state.team_id
      })
      Taro.navigateBack();
    }
  }

  updateMember = (team_id, status, openid) => (
    async () => {
      console.log(team_id, status);
      const verb = (status === 0 ? "删除" : "添加");
      const res = await Taro.showModal({
        title: '提示',
        content: `您确定要${verb}该用户吗？`,
      })
      if (res.confirm) {
        await api.team.updateMember({ team_id, status, openid });
        await this.getMember();
      }
    }
  )

  render () {
    return (
      <View className='index'>
        <View className='at-row'>
          <AtInput
            name='name'
            title='队伍名称'
            type='text'
            placeholder='修改队伍名称'
            value={this.state.teamName}
            onChange={this.handleNameChange}
            className='at-col at-col-8'
          />
          <AtButton type='primary' onClick={this.updateTeam}
            className='at-col at-col-4'>
            修改名称
          </AtButton>
        </View>

        <View>
          <AtButton onClick={this.deleteTeam}>
            删除队伍
          </AtButton>
        </View>

        <View>
          {this.state.memberList.map((e) => (
            <View className={`at-row memberItem status-${(e.status || 0) + 1}`}>
              <View className='at-col at-col-3 avatarCtn'>
                <Image src={e.avatarUrl} className='avatarImg'></Image>
              </View>
              <View className='at-col at-col-7 centered'>{`${e.alias}`}</View>
              {e.status === -1 && 
                <View className='at-col at-col-1 at-icon at-icon-check centered'
                  onClick={this.updateMember(this.state.team_id, 1, e.openid)}
                ></View>
              }
              {Math.abs(e.status) === 1 &&
                <View className='at-col at-col-1 at-icon at-icon-close centered'
                  onClick={this.updateMember(this.state.team_id, 0, e.openid)}
                ></View>
              }
              
            </View>
          ))}
        </View>

      </View>
    )
  }
}
