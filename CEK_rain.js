const uuid = require('uuid').v4
const _ = require('lodash')
const TEST_NUM = 1;
const myPlayerId = uuid();

let DOMAIN = "http://static.naver.net/clova/service/native_extensions/sound_serise"
let AUDIO_ARR = new Array(
  { token:uuid(), titleText:'빗소리', titleSubText1:'[출처] 잡소리 스킬', artImageUrl:`${DOMAIN}/img_sound_rain_108.png`, headerText:'잡소리 스킬 재생 목록', stream:`${DOMAIN}/rainning_sound.mp3`},
  { token:uuid(), titleText:'파도소리', titleSubText1:'[출처] 잡소리 스킬', artImageUrl:`${DOMAIN}/img_sound_wave_108.png`, headerText:'잡소리 스킬 재생 목록', stream:`${DOMAIN}/wave_sound.mp3`},
  { token:uuid(), titleText:'카페소리', titleSubText1:'[출처] 잡소리 스킬', artImageUrl:`${DOMAIN}/img_sound_cafe_108.png`, headerText:'잡소리 스킬 재생 목록', stream:`${DOMAIN}/cafe_sound.mp3`}
);
let skillLogoUrl = 'https://phinf.pstatic.net/contact/42/2016/6/1/okgosu_1464774184074.jpg?type=s160'; // Skill 로고 이미지 URL
let playInfoArr = null; // 현재 재생중인 곡 정보 저장용
let curIndex = 0; // 배열에서 현재 재생중인 곡의 인덱스

class Directive {
  constructor({namespace, name, payload}) {
    this.header = {
      messageId: uuid(),
      namespace: namespace,
      name: name,
    }
    this.payload = payload
  }
}

function playControlDirective(type) {
  return new Directive({
    namespace: 'PlaybackController',
    name: type,
    payload: { }
  })
}

function templateRuntime(playInfoArr) {
  return new Directive({
    arr: AUDIO_ARR,
    namespace: 'TemplateRuntime',
    name: 'RenderPlayerInfo',
    dialogRequestId: uuid(),
    messageId: uuid(),
    payload: {
      controls: [
        {
          enabled: true,
          name: 'PLAY_PAUSE',
          selected: false,
          type: 'BUTTON'
        },
        {
          enabled: true,
          name: 'NEXT',
          selected: false,
          type: 'BUTTON'
        },
        {
          enabled: true,
          name: 'PREVIOUS',
          selected: false,
          type: 'BUTTON'
        }
      ],
      displayType: 'single',
      playerId: myPlayerId,
      playableItems: AUDIO_ARR,
/*
      playableItems: [
        {
          token: playInfoArr.token,
          artImageUrl:playInfoArr.artImageUrl,
          showAdultIcon: false,
          headerText: playInfoArr.headerText,
          titleSubText1: playInfoArr.titleSubText1,
          titleSubText2: playInfoArr.titleSubText1,
          titleText: playInfoArr.titleText,
        }
      ],
*/
      provider: {
        logoUrl: skillLogoUrl,
        artImageUrl : playInfoArr.artImageUrl,
        name: playInfoArr.titleText,
        smallLogoUrl: skillLogoUrl
      }
    }
  })
}

function clearAudio() {
    return new Directive({
      namespace: 'AudioPlayer',
      name: 'ClearQueue',
      payload: {
        "clearBehavior": "CLEAR_ALL"
      }
    })
}

function audioDirective(playInfoArr) {
  episodeId = Math.floor(Math.random() * 1000)
  return new Directive({
    namespace: 'AudioPlayer',
    name: 'Play',
    payload: {
      audioItem: {
        audioItemId: playInfoArr.token,
        stream: {
          beginAtInMilliseconds: 0,
          playType: "NONE",
          token: playInfoArr.token,
          progressReport: {
            progressReportDelayInMilliseconds: null,
            progressReportIntervalInMilliseconds: 60000,
            progressReportPositionInMilliseconds: null
          },
          url: playInfoArr.stream,
          urlPlayable: true
        },
        type: "custom",
      },
      playBehavior: "REPLACE_ALL",
      source: {
        logoUrl: skillLogoUrl,
        artImageUrl: playInfoArr.artImageUrl,
        name: playInfoArr.titleText
      },
      provider: {
        logoUrl: skillLogoUrl,
        artImageUrl : playInfoArr.artImageUrl,
        name: playInfoArr.titleText,
        smallLogoUrl: skillLogoUrl
      }
    }
  })
}


function getNextSong(idx) {
  idx ++;
  if(idx >= AUDIO_ARR.length) {
    return false
  } else {
    return true
  }
}

function getPrevSong(idx) {
  idx --;
  if(idx < 0) {
    return false
  } else {
    return true
  }
}

function playByIndex(index) {
  if(index < 0 || index >= AUDIO_ARR.length ) {
    return null;
  }
  return AUDIO_ARR[index];
}

function getAudioTitleIndex(title) {
  for(i=0; i<AUDIO_ARR.length ; i++) {
    if(AUDIO_ARR[i].titleText == title) {
      return i;
    }
  }
  return -1;
}

function parseTitle(json) {
   if(json != null && json != '') {
     if(json.title != null) {
       return json.title.value;
     } else {
       return null;
     }
   } else {
     return null;
   }
}

function setPlayInfo(index) {
  playInfoArr = playByIndex(index)
}

function playSound(cekResponse, deviceSize) {
  cekResponse.addDirective(audioDirective(playInfoArr))
 }

class CEKRequest {
  constructor (httpReq) {
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session
  }

  do(cekResponse) {
    switch (this.request.type) {
      case "LaunchRequest":
        return this.launchRequest(cekResponse)
      case "IntentRequest":
        return this.intentRequest(cekResponse)
      case "SessionEndedRequest":
        return this.sessionEndedRequest(cekResponse)
      case "EventRequest":
        return this.eventRequest(cekResponse)
    }
  }

  eventRequest(cekResponse) {
    const eventName = this.request.event.name
    console.log('=====EventRequest RequestPlayerInfo .eventName======' + eventName);
    if(eventName== 'RequestPlayerInfo') {
      console.log("RequestPlayerInfo 이벤트 발생! 재생 메타데이터를 전송!!")
      cekResponse.addDirective(templateRuntime(playInfoArr))
    }
  }
  launchRequest(cekResponse) {
    setPlayInfo(0);
    cekResponse.appendSpeechText(TEST_NUM + ' 번째 테스트, ' + playInfoArr.titleText + "를 재생합니다. ")
    playSound(cekResponse, this.context.System.device.display.size)
    cekResponse.setMultiturn(playInfoArr)
  }

  intentRequest(cekResponse) {
    const intent = this.request.intent.name
    const slots = this.request.intent.slots
    let title = parseTitle(slots)
    if(title != null) {
      curIndex = getAudioTitleIndex(title);
      setPlayInfo(curIndex);
    } else {
      setPlayInfo(0);
    }
    switch (intent) {
      case "Clova.PauseIntent":
        cekResponse.appendSpeechText("음원을 일시 중지 합니다.")
        cekResponse.addDirective(playControlDirective('Pause'))
        break;
      case "Clova.ResumeIntent":
        cekResponse.appendSpeechText("음원을 다시 재생합니다.")
        cekResponse.addDirective(playControlDirective('Resume'))
        break;
      case "Clova.StopIntent":
        cekResponse.appendSpeechText("음원재생을 종료합니다.")
        cekResponse.addDirective(playControlDirective('Stop'))
        break;
      case "Clova.NextIntent":
        if(getNextSong(curIndex)) {
          curIndex++;
          setPlayInfo(curIndex);
          cekResponse.appendSpeechText("다음 음원을 재생합니다. 제목은 " + playInfoArr.titleText + "입니다.")
          playSound(cekResponse, this.context.System.device.display.size)
        } else {
          cekResponse.appendSpeechText("더 이상 재생할 음원이 없습니다.")
        }
        break;
      case "Clova.PreviousIntent":
        if(getPrevSong(curIndex)) {
          curIndex--;
          setPlayInfo(curIndex);
          cekResponse.appendSpeechText("이전 음원을 재생합니다. 제목은 " + playInfoArr.titleText + "입니다.")
          playSound(cekResponse, this.context.System.device.display.size)
        } else {
          cekResponse.appendSpeechText("더 이상 재생할 음원이 없습니다.")
        }
        break;
      case "PlayInfoIntent":
        cekResponse.appendSpeechText("이 음원의 제목은 ." + playInfoArr.titleText + "입니다.")
        break;
      case "PlayIntent":
      case "PlayLoopIntent":
        let loopCount
        const loopCountSlot = slots.loopCount
        if (intent == "PlayIntent") {
          loopCount = 1
        } else if (slots.length == 0 || !loopCountSlot) {
          loopCount = 3
        } else {
          loopCount = parseInt(loopCountSlot.value)
        }
        if(curIndex == -1) {
          cekResponse.appendSpeechText("재생할 음원이 없습니다.")
        } else {
          if (loopCount == 1) {
            cekResponse.appendSpeechText(playInfoArr.titleText + "를 재생합니다.")
          } else {
            cekResponse.appendSpeechText(playInfoArr.titleText + `를 ${loopCount}번 재생합니다.`)
          }
          for (let i = 0; i < loopCount; i++) {
            playSound(cekResponse, this.context.System.device.display.size)
          }
        }
        break
      case "Clova.GuideIntent":
        cekResponse.appendSpeechText("이 음원의 제목은 ." + playInfoArr.titleText + "입니다.")
        cekResponse.appendSpeechText("다른 음원을 들으시려면 이전 또는 다음이라고 말해보세요.")
        break;
      }
  }

  sessionEndedRequest(cekResponse) {
    console.log('sessionEndedRequest');
    cekResponse.clearMultiturn()
  }
}

class CEKResponse {
  constructor () {
    this.version = "1.0"
    this.sessionAttributes = {}
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
    }
    this.response.reprompt = {
      outputSpeech: null
    }
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
  }

  addDirective(directive) {
    this.response.directives.push(directive)
  }

  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: "SimpleSpeech",
      values: {
          type: "PlainText",
          lang: "ko",
          value: outputText,
      },
    }
  }

  appendSpeechText(outputText) {
    const outputSpeech = this.response.outputSpeech
    if (outputSpeech.type != 'SpeechList') {
      outputSpeech.type = 'SpeechList'
      outputSpeech.values = []
    }
    if (typeof(outputText) == 'string') {
      outputSpeech.values.push({
        type: 'PlainText',
        lang: 'ko',
        value: outputText,
      })
    } else {
      outputSpeech.values.push(outputText)
    }
  }
}

function main(params) {
  const httpReq = {"body": params}
  cekResponse = new CEKResponse()
  cekRequest = new CEKRequest(httpReq)
  cekRequest.do(cekResponse)
  return cekResponse
};
