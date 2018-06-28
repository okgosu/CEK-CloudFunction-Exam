const uuid = require('uuid').v4
const _ = require('lodash')

let dan = 9;
let danQuestion = "";
let userAnswer = 0;
let danQuestionAnswer = 0;
let randomNumber = 1;
let answerCount = 0;

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

function buildQuesion(dan) {
    danQuestionAnswer = parseInt(Math.random() * dan) + 1;
}

class CEKRequest {
  constructor (httpReq) {
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session
    console.log(`CEK Request: ${JSON.stringify(this.context)}, ${JSON.stringify(this.session)}`)
  }

  do(cekResponse) {
    switch (this.request.type) {
      case 'LaunchRequest':
        return this.launchRequest(cekResponse)
      case 'IntentRequest':
        return this.intentRequest(cekResponse)
      case 'SessionEndedRequest':
        return this.sessionEndedRequest(cekResponse)
    }
  }

  launchRequest(cekResponse) {
    console.log('launchRequest')
    answerCount = 0;
    buildQuesion(100);
    cekResponse.setSimpleSpeechText('업다운 게임을 시작합니다. 1에서 100사이에 제가 생각하는 숫자를 맞춰보시길 바랍니다.')
    cekResponse.setMultiturn({
      intent: 'playGameIntent',
    })
  }

  intentRequest(cekResponse) {
    console.log('intentRequest')
    console.dir(this.request)
    const intent = this.request.intent.name
    const slots = this.request.intent.slots

    switch (intent) {
    case 'numberAnswerIntent':
      if (!!slots) {
        const numberAnswer = slots.numberAnswer
        if (slots.length != 0 && numberAnswer) {
          userAnswer = parseInt(numberAnswer.value)
          if (userAnswer == danQuestionAnswer) {
              cekResponse.appendSpeechText(` ${userAnswer}, 정답입니다. 총 ${answerCountMsg}, 회 만에 맞추셨네요. 게임을 또 하시려면 시작 이라고 말씀해 주세요`)
              cekResponse.setMultiturn({
                intent: 'playGameIntent',
              })
          } else if (userAnswer > danQuestionAnswer){
              answerCount++;
              cekResponse.appendSpeechText(` ${userAnswer}, down! 입니다. 숫자를 낮춰서 불러보세요`)
              cekResponse.setMultiturn({
                intent: 'playGameIntent',
              })
          } else {
            answerCount++;
            cekResponse.appendSpeechText(` ${userAnswer}, up! 입니다. 숫자를 높여서 불러보세요`)
            cekResponse.setMultiturn({
              intent: 'playGameIntent',
            })
          }
        } else {
          answerCount++;
          cekResponse.appendSpeechText(` 숫자를 다시 말씀해주세요`)
          cekResponse.setMultiturn({
            intent: 'playGameIntent',
          })
        }
      } else {
        answerCount++;
        cekResponse.appendSpeechText(` 숫자를 다시 말씀해주세요`)
        cekResponse.setMultiturn({
          intent: 'playGameIntent',
        })
      }
      break
    case 'playGameIntent':
      answerCount = 0;
      buildQuesion(100);
      cekResponse.setSimpleSpeechText('업다운 게임을 시작합니다. 1에서 100사이에 제가 생각하는 숫자를 맞춰보시길 바랍니다.')
      cekResponse.setMultiturn({
        intent: 'playGameIntent',
      })
      break
    case 'Clova.CancelIntent':
      cekResponse.setSimpleSpeechText("업다운 게임을 실행을 취소합니다.")
      break
    case 'Clova.YesIntent':
    case 'Clova.NoIntent':
    case 'Clova.GuideIntent':
    cekResponse.appendSpeechText(` 숫자를 다시 말씀해주세요`)
    cekResponse.setMultiturn({
      intent: 'playGameIntent',
    })
      break
    }

    if (this.session.new == false) {
      cekResponse.setMultiturn()
    }
  }

  sessionEndedRequest(cekResponse) {
    console.log('sessionEndedRequest')
    cekResponse.setSimpleSpeechText('업다운 게임을 종료합니다.')
    cekResponse.clearMultiturn()
  }

}

class CEKResponse {
  constructor () {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
      card: {},
    }
    this.version = '0.1.0'
    this.sessionAttributes = {}
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
  }

  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: 'SimpleSpeech',
      values: {
          type: 'PlainText',
          lang: 'ko',
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
  console.log(`CEKResponse: ${JSON.stringify(cekResponse)}`)
  return cekResponse
};
