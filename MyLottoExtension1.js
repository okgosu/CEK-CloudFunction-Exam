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
  launchRequest(cekResponse) {
    cekResponse.setSimpleSpeechText('로또 박사입니다. 로또 번호를 몇개 뽑아 드릴까요?');
    cekResponse.setMultiturn();
  }
  sessionEndedRequest(cekResponse) {
    cekResponse.setSimpleSpeechText('로또 박사를 이용해 주셔서 감사합니다.');
  }
  intentRequest(cekResponse) {
    const intent = this.request.intent.name
    const slots = this.request.intent.slots
    switch (intent) {
      case 'recommendLotto':
        cekResponse.setSimpleSpeechText('로또 박사가 추천하는 행운의 로또 번호는 6, 5, 4, 3, 2, 1 입니다.');
        break;
      case 'Clova.CancelIntent':
        cekResponse.setSimpleSpeechText('Clova.CancelIntent 입니다.');
        break;
      case 'Clova.YesIntent':
        cekResponse.setSimpleSpeechText('Clova.YesIntent 입니다.');
        break;
      case 'Clova.NoIntent':
        cekResponse.setSimpleSpeechText('Clova.NoIntent 입니다.');
        break;
      case 'Clova.GuideIntent':
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
