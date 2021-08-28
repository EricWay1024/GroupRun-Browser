import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import Taro from '@tarojs/taro'
import api from '../../helper/api'
import { Picker } from '@tarojs/components'
import { AtList, AtListItem } from 'taro-ui'
import moment from 'moment';

import "taro-ui/dist/style/components/button.scss" // 按需引入
import "taro-ui/dist/style/components/list.scss";
import "taro-ui/dist/style/components/flex.scss";
// import "~taro-ui/dist/style/components/avatar.scss";

import './step_list.scss'

export default class Index extends Component {
  constructor (props) {
    super(props);
    this.state = {
      dateSel: moment().subtract(1, 'days').format('YYYY-MM-DD'),
      team_id: Taro.getCurrentInstance().router.params.team_id * 1,
    };
  }

  async componentWillMount () { 
  }

  async componentDidMount () { 
    await this.getStepData();
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  getStepData = async () => {
    const runData = await Taro.getWeRunData().catch(e => {console.log(e)});;
    await api.step.update(runData);
    const stepData = await api.step.get({ date: this.state.dateSel, team_id: this.state.team_id })
      .then(r => r.stepData);
    this.setState({ stepData });
    console.log(this.state)
  }

  onDateChange = async e => {
    this.setState({
      dateSel: e.detail.value
    })
    await this.getStepData();
  }

  likeStep = (date, recv_openid, state) => (
    async () => {
      await api.step.like({ date, recv_openid, state });
      await this.getStepData();
    }
  )
  render () {
    return (
      <View className='index'>
        <View>
          <Picker mode='date' onChange={this.onDateChange} value={this.state.dateSel}>
            <AtList>
              <AtListItem title='日期选择' extraText={this.state.dateSel} />
            </AtList>
          </Picker>
        </View>
        <View className='stepList'>
          {this.state.stepData && this.state.stepData.map((e, i) => (
            <View id={e.openid} className='stepItem at-row'>
              <View className='at-col at-col-1 rankText'>
                {`${i + 1}`}
              </View>
              <View className='at-col at-col-3 avatarCtn'>
                <Image src={e.avatarUrl} className='avatarImg'></Image>
              </View>
              <View className='at-col at-col-3 aliasText'>
                {e.alias}
              </View>
              <View className='at-col at-col-3 stepText'>
                {e.step}
              </View>
              <View className='at-col at-col-1 likeCtn'>
              <View 
                className={`at-icon at-icon-heart${e.myLike ? "-2" : ""} myLike-${e.myLike ? "on" : "off"}`}
                onClick={this.likeStep(e.date, e.openid, e.myLike ? 0 : 1)}
              >
              </View>
              <View className='likeCnt'>
                { e.likeCnt || 0 }
              </View>
              </View>
            </View>
          ))}
        </View>

      </View>
    )
  }
}
