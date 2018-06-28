const uuid = require('uuid').v4
const _ = require('lodash')

let MAX_DAN = 9;
let dan = 9;
let danQuestion = "";
let userAnswer = 0;
let danQuestionAnswer = 0;
let randomNumber = 1;

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
    let q = "";
    randomNumber = parseInt(Math.random() * 9) + 1;
    danQuestionAnswer = dan * randomNumber;
    while (danQuestionAnswer == userAnswer || danQuestionAnswer < 5) {
        randomNumber++;
        if(randomNumber == 10) {
            randomNumber = 7;
        }
        danQuestionAnswer = dan * randomNumber;
    }
    danQuestionAnswer = dan * randomNumber;
    q = dan + " 곱하기 " + randomNumber;
    return q;
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

    dan = parseInt(Math.random() * (MAX_DAN-1)) + 2;
    danQuestion = buildQuesion(dan);
    cekResponse.setSimpleSpeechText(dan + '단을 시작합니다. 게임 중 다른 단으로 변경 하시려면 답 대신 원하는 단수를 말씀하세요. ' + danQuestion)
    cekResponse.setMultiturn({
      intent: 'gugudanPlay',
    })
  }

  intentRequest(cekResponse) {
    console.log('intentRequest')
    console.dir(this.request)
    const intent = this.request.intent.name
    const slots = this.request.intent.slots

    switch (intent) {
    case 'gugudanPlay':
      if (!!slots) {
        const danSlot = slots.dan
        if (slots.length != 0 && danSlot) {
          dan = parseInt(danSlot.value)
        }
        if (isNaN(dan)) {
          dan = 9
        }
        danQuestion = buildQuesion(dan);
      }
      cekResponse.appendSpeechText(` ${dan}단을 시작합니다. 게임 중 다른 단으로 변경 하시려면 답 대신 원하는 단 수를 말씀하세요.`+ danQuestion)
      cekResponse.setMultiturn({
        intent: 'gugudanPlay',
      })
      break
    case 'gugudanAnswer':
      if (!!slots) {
        const answerSlot = slots.answer
        if (slots.length != 0 && answerSlot) {
          userAnswer = parseInt(answerSlot.value)
        }
        if (userAnswer == danQuestionAnswer) {
            danQuestion = buildQuesion(dan);
            cekResponse.appendSpeechText(` ${userAnswer}, 정답입니다. 다음 문제.`+ danQuestion)
            cekResponse.setMultiturn({
              intent: 'gugudanPlay',
            })
        } else {
            cekResponse.appendSpeechText(` ${userAnswer}, 틀렸습니다. 다음 문제.`+ danQuestion)
            cekResponse.setMultiturn({
              intent: 'gugudanPlay',
            })
        }
      }
      break
    case 'Clova.CancelIntent':
      cekResponse.setSimpleSpeechText("구구단 놀이 실행을 취소합니다.")
      break
    case 'Clova.YesIntent':
    case 'Clova.NoIntent':
    case 'Clova.GuideIntent':
      cekResponse.setSimpleSpeechText("방금 나간 문제를 다시 말씀드립니다. " + danQuestion)
      cekResponse.setMultiturn({
        intent: 'gugudanPlay',
      })
      break
    }

    if (this.session.new == false) {
      cekResponse.setMultiturn()
    }
  }

  sessionEndedRequest(cekResponse) {
    console.log('sessionEndedRequest')
    cekResponse.setSimpleSpeechText('구구단놀이를 종료합니다.')
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
