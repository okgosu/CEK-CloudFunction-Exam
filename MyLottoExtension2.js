const uuid = require('uuid').v4
const _ = require('lodash')

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

class CEKRequest {
  constructor (httpReq) {
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session
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
  // LaunchRequest 메시지 응답 처리 
  launchRequest(cekResponse) {
    cekResponse.setSimpleSpeechText('로또 박사입니다. 로또 번호를 몇개 뽑아 드릴까요?');
    cekResponse.setMultiturn();
  }
  // SessionEndedRequest 메시지 응답 처리 
  sessionEndedRequest(cekResponse) {
    cekResponse.setSimpleSpeechText('로또 박사를 이용해 주셔서 감사합니다.');
  }
  // IntentRequest 메시지 응답 처리 
  intentRequest(cekResponse) {
    const intent = this.request.intent.name
    const slots = this.request.intent.slots
    switch (intent) {
      case 'recommendLotto': // Custom intent 중 recommendLotto 인텐트 처리 
        const lottoCountSlot = slots.lottoCount;
        var lottoCnt = 1;
        if(lottoCountSlot != undefined && lottoCountSlot.value != null ){
            lottoCnt = lottoCountSlot.value;
        }
        if(lottoCnt==1) {
            cekResponse.setSimpleSpeechText('이번 주 추천 번호는 1, 2, 3, 4, 5, 6 입니다.');
        } else {
            cekResponse.setSimpleSpeechText(lottoCnt + '개의 로또를 요청하셨군요. 하지만 번호는 한개만 알려드릴게요. 추천 번호는 7, 8, 9 10, 11, 12, 13 입니다.');
        }        
        break;
      case 'Clova.CancelIntent': // Built-in intent 처리
        cekResponse.setSimpleSpeechText('Clova.CancelIntent 입니다.');
        break;
      case 'Clova.YesIntent':    // Built-in intent 처리
        cekResponse.setSimpleSpeechText('Clova.YesIntent 입니다.');
        break;
      case 'Clova.NoIntent':     // Built-in intent 처리
        cekResponse.setSimpleSpeechText('Clova.NoIntent 입니다.');
        break;
      case 'Clova.GuideIntent':  // Built-in intent 처리 
        cekResponse.setSimpleSpeechText('Clova.GuideIntent 입니다.');
        break;
    }
    if (this.session.new == false) {
      cekResponse.setMultiturn()
    }
  }
}

class CEKResponse {
  constructor () {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
      reprompt: {},
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

  appendReprompt(outputText) {
    this.response.reprompt.outputSpeech = {
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
