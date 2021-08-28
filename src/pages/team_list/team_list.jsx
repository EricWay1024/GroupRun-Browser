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

import './team_list.scss'
import { toPlainObject } from 'lodash'

export default class Index extends Component {
  constructor (props) {
    super(props);
    this.state = {
      is_my: true,
      teamList: [],
      teamName: "",
      showCreate: false,
    };
  }
  async componentWillMount () { 
  }

  async componentDidMount () { 
    // await this.getTeamData();
  }

  componentWillUnmount () { }

  async componentDidShow () { 
    await this.getTeamData();
  }

  componentDidHide () { }

  getTeamData = async () => {
    const { is_my } = this.state;
    const teamList = await api.team.get({ is_my }).then(r => r.teamList);
    this.setState({ teamList });
    console.log(this.state)
  }

  handleChange = async is_my => {
    this.setState({ is_my });
    const teamList = await api.team.get({ is_my }).then(r => r.teamList);
    this.setState({ teamList });
  }

  handleNameChange = teamName => {
    this.setState({ teamName });
  }

  createTeam = async () => {
    console.log(this.state.teamName)
    if (!this.state.teamName) {
      Taro.showToast({
        title: '队名不能为空',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const res = await Taro.showModal({
      'title': '提示',
      content: '您确定要创建队伍吗？'
    })
    if (res.confirm) {
      await api.team.create({ name: this.state.teamName });
      await this.getTeamData();
      console.log(this.state.teamName)
      this.setState({ teamName: "" });
    }
  }

  updateMember = (team_id, status) => (
    async () => {
      console.log(team_id, status);
      const verb = (status === 0 ? "离开" : "加入");
      Taro.showModal({
        title: '提示',
        content: `您确定要${verb}队伍${team_id}吗？`,
        success: async res => {
          if (res.confirm) {
            await api.team.updateMember({ team_id, status });
            await this.getTeamData();
          } 
        }
      })

    }
  )

  render () {
    return (
      <View className='index'>
        {this.state.showCreate && 
          <View className='at-row'>
            <AtInput
              name='name'
              title='队伍名称'
              type='text'
              placeholder='新建队伍名称'
              value={this.state.teamName}
              onChange={this.handleNameChange}
              className='at-col at-col-8'
            />
            <AtButton type='primary' onClick={this.createTeam}
              className='at-col at-col-4'>
              创建队伍
            </AtButton>
          </View>
        }

        <AtForm>
          <View className='at-row'>

            <AtSwitch className='at-col at-col-9'
            title='仅查看我的队伍' checked={this.state.is_my} onChange={this.handleChange} />
            <View className='at-col at-col-2 centered at-icon at-icon-add-circle' type='secondary'
              onClick={() => {this.setState({ showCreate: !this.state.showCreate })}}>
                
            </View>
          </View>
        </AtForm>


        
        <View className='teamList'>
          {this.state.teamList && this.state.teamList.map((e, i) => (
           <View id={e.team_id} className={`teamItem at-row status-${(e.status || 0) + 1}`}>
            <View className='at-col at-col-2 idText'>
              {e.team_id}
            </View>
            <View className='at-col at-col-8 nameText'
              onClick={() => {if (e.status && e.status >= 1) Taro.navigateTo({url: `/pages/step_list/step_list?team_id=${e.team_id}`})}}>
              {e.team_name}
            </View>
            {!e.status && 
              <View className='at-col at-col-1 at-icon at-icon-add centered' onClick={this.updateMember(e.team_id, -1)}></View>}
            {(e.team_id !== 0 && (e.status === -1 || e.status === 1)) && 
              <View className='at-col at-col-1 at-icon at-icon-subtract centered' onClick={this.updateMember(e.team_id, 0)}></View>}
            {(e.status === 2) && 
              <View 
                className='at-col at-col-1 at-icon at-icon-settings centered' 
                onClick={() => {Taro.navigateTo({url: `/pages/team_settings/team_settings?team_id=${e.team_id}&team_name=${e.team_name}`})}}></View>
            }
           </View>
          ))}
        </View> 

      </View>
    )
  }
}
