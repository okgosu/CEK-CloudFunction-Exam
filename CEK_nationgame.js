const uuid = require('uuid').v4
const _ = require('lodash')

let INTENT_REQ_NAME_01 = "playGameIntent";
let INTENT_REQ_NAME_02 = "answerIntent";

let MAX_DAN = 3;
let dan = 1;
let danQuestion = "";
let userAnswer = "";
let danQuestionAnswer = 0;
let randomNumber = 1;

let TOTAL_QUESTION = 0;
let TOTAL_ANSWER = 0;

let NATION_ARR = new Array(
/****** easy level 0 ~ 19 ******/
{nation:'대한민국', city:'서울'},
{nation:'그리스', city:'아테네'},
{nation:'독일', city:'베를린'},
{nation:'러시아', city:'모스크바'},
{nation:'멕시코', city:'멕시코시티'},
{nation:'미국', city:'워싱턴DC'},
{nation:'영국', city:'런던'},
{nation:'이라크', city:'바그다드'},
{nation:'이란', city:'테헤란'},
{nation:'베트남', city:'하노이'},
{nation:'이집트', city:'카이로'},
{nation:'이탈리아', city:'로마'},
{nation:'인도', city:'뉴델리'},
{nation:'인도네시아', city:'자카르타'},
{nation:'일본', city:'도쿄'},
{nation:'대만', city:'타이베이'},
{nation:'중국', city:'베이징'},
{nation:'프랑스', city:'파리'},
{nation:'필리핀', city:'마닐라'},
/****** mid level 20 ~ 39 ******/
{nation:'네덜란드', city:'암스테르담'},
{nation:'네팔', city:'카트만두'},
{nation:'노르웨이', city:'오슬로'},
{nation:'뉴질랜드', city:'웰링턴'},
{nation:'덴마크', city:'코펜하겐'},
{nation:'레바논', city:'베이루트'},
{nation:'몽골', city:'울란바토르'},
{nation:'트리니다드 토바고', city:'포트오브스페인'},
{nation:'벨기에', city:'브뤼셀'},
{nation:'아르헨티나', city:'부에노스아이레스'},
{nation:'브라질', city:'브라질리아'},
{nation:'오스트레일리아', city:'캔버라'},
{nation:'오스트리아', city:'비엔나'},
{nation:'태국', city:'방콕'},
{nation:'터키', city:'앙카라'},
{nation:'포르투갈', city:'리스본'},
{nation:'핀란드', city:'헬싱키'},
{nation:'폴란드', city:'바르샤바'},
{nation:'헝가리', city:'부다페스트'},
/****** hard level 40 ~ 98 ******/
{nation:'가나', city:'아크라'},
{nation:'가봉', city:'리브르빌'},
{nation:'과테말라', city:'과테말라'},
{nation:'나이지리아', city:'아부자'},
{nation:'남아프리카 공화국', city:'케이프타운'},
{nation:'루마니아', city:'부쿠레슈티'},
{nation:'룩셈부르크', city:'룩셈부르크'},
{nation:'르완다', city:'키갈리'},
{nation:'리비아', city:'트리폴리'},
{nation:'말레이시아', city:'쿠알라룸푸르'},
{nation:'모나코', city:'모나코'},
{nation:'모로코', city:'카사블랑카'},
{nation:'몰디브', city:'말레'},
{nation:'미얀마', city:'네피도'},
{nation:'방글라데시', city:'다카'},
{nation:'베네수엘라', city:'카라카스'},
{nation:'볼리비아', city:'수크레'},
{nation:'부탄', city:'팀푸'},
{nation:'불가리아', city:'소피아'},
{nation:'아랍에미리트', city:'두바이'},
{nation:'아이슬란드', city:'레이캬비크'},
{nation:'아프가니스탄', city:'카불'},
{nation:'알제리', city:'알제'},
{nation:'앤티가 바부다', city:'세인트존스'},
{nation:'에콰도르', city:'키토'},
{nation:'에티오피아', city:'아디스아바바'},
{nation:'엘살바도르', city:'산살바도르'},
{nation:'요르단', city:'암만'},
{nation:'우간다', city:'캄팔라'},
{nation:'우루과이', city:'몬테비데오'},
{nation:'우즈베키스탄', city:'타슈켄트'},
{nation:'우크라이나', city:'키예프'},
{nation:'자메이카', city:'킹스턴'},
{nation:'잠비아', city:'루사카'},
{nation:'지부티', city:'지부티'},
{nation:'짐바브웨', city:'하라레'},
{nation:'체코', city:'프라하'},
{nation:'칠레', city:'산티아고'},
{nation:'카메룬', city:'야운데'},
{nation:'카자흐스탄', city:'아스타나'},
{nation:'카타르', city:'도하'},
{nation:'캄보디아', city:'프놈펜'},
{nation:'캐나다', city:'오타와'},
{nation:'케냐', city:'나이로비'},
{nation:'코스타리카', city:'산호세'},
{nation:'콜롬비아', city:'보고타'},
{nation:'쿠바', city:'아바나'},
{nation:'쿠웨이트', city:'쿠웨이트'},
{nation:'크로아티아', city:'자그레브'},
{nation:'타지키스탄', city:'두샨베'},
{nation:'탄자니아', city:'도도마'},
{nation:'토고', city:'로메'},
{nation:'튀니지', city:'튀니스'},
{nation:'파나마', city:'파나마'},
{nation:'파라과이', city:'아순시온'},
{nation:'파키스탄', city:'이슬라마바드'},
{nation:'팔레스타인', city:'라말라'},
{nation:'페루', city:'리마'}
);
//{nation:'이스라엘', city:'예루살렘'},
//{nation:'가이아나', city:'조지타운'},
//{nation:'감비아', city:'반줄'},
//{nation:'괌', city:'하갓냐'},
//{nation:'그레나다', city:'세인트조지스'},
//{nation:'기니', city:'코나크리'},
//{nation:'기니비사우', city:'비사우'},
//{nation:'나미비아', city:'빈트후크'},
//{nation:'나우루', city:'야렌'},
//{nation:'남수단', city:'주바'},
//{nation:'남오세티야', city:'츠힌발리'},
//{nation:'니우에', city:'알로피'},
//{nation:'니제르', city:'니아메'},
//{nation:'니카라과', city:'마나과'},
//{nation:'도미니카', city:'로조'},
//{nation:'도미니카 공화국', city:'산토도밍고'},
//{nation:'동티모르', city:'딜리'},
//{nation:'라오스', city:'비엔티안'},
//{nation:'라이베리아', city:'몬로비아'},
//{nation:'라트비아', city:'리가'},
//{nation:'레소토', city:'마세루'},
//{nation:'리투아니아', city:'빌뉴스'},
//{nation:'리히텐슈타인', city:'파두츠'},
//{nation:'마다가스카르', city:'안타나나리보'},
//{nation:'마셜 제도', city:'마주로'},
//{nation:'마케도니아 공화국', city:'스코페'},
//{nation:'말라위', city:'릴롱궤'},
//{nation:'말리', city:'바마코'},
//{nation:'모리셔스', city:'포트루이스'},
//{nation:'모리타니', city:'누악쇼트'},
//{nation:'모잠비크', city:'마푸투'},
//{nation:'몬테네그로', city:'포드고리차'},
//{nation:'몰도바', city:'키시너우'},
//{nation:'몰타', city:'발레타'},
//{nation:'미크로네시아 연방', city:'팔리키르'},
//{nation:'바누아투', city:'포트빌라'},
//{nation:'바레인', city:'마나마'},
//{nation:'바베이도스', city:'브리지타운'},
//{nation:'바티칸 시국', city:'바티칸'},
//{nation:'바하마', city:'나소'},
//{nation:'베냉', city:'포르토노보'},
//{nation:'벨라루스', city:'민스크'},
//{nation:'벨리즈', city:'벨리즈시티'},
//{nation:'보스니아 헤르체고비나', city:'사라예보'},
//{nation:'보츠와나', city:'가보로네'},
//{nation:'부룬디', city:'부줌부라'},
//{nation:'부르키나파소', city:'와가두구'},
//{nation:'북마리아나 제도', city:'사이판'},
//{nation:'북키프로스', city:'니코시아'},
//{nation:'브루나이', city:'반다르스리브가완'},
//{nation:'아르메니아', city:'예레반'},
//{nation:'아르차흐 공화국', city:'스테파나케르트'},
//{nation:'아이티', city:'포르토프랭스'},
//{nation:'아일랜드', city:'더블린'},
//{nation:'아제르바이잔', city:'바쿠'},
//{nation:'안도라', city:'안도라라베야'},
//{nation:'알바니아', city:'티라나'},
//{nation:'압하스', city:'수후미'},
//{nation:'앙골라', city:'루안다'},
//{nation:'에리트레아', city:'아스마라'},
//{nation:'에스토니아', city:'탈린'},
//{nation:'예멘', city:'사나'},
//{nation:'오만', city:'무스카트'},
//{nation:'온두라스', city:'테구시갈파'},
//{nation:'웨일즈', city:'카디프'},
//{nation:'적도 기니', city:'말라보'},
//{nation:'조선민주주의인민공화국', city:'평양'},
//{nation:'조지아', city:'트빌리시'},
//{nation:'중앙아프리카 공화국', city:'방기'},
//{nation:'차드', city:'은자메나'},
//{nation:'카보베르데', city:'프라이아'},
//{nation:'코모로', city:'모로니'},
//{nation:'코소보', city:'프리슈티나'},
//{nation:'코트디부아르', city:'야무수크로'},
//{nation:'콩고 공화국', city:'브라자빌'},
//{nation:'콩고 민주 공화국', city:'킨샤사'},
//{nation:'키르기스스탄', city:'비슈케크'},
//{nation:'키리바시', city:'타라와'},
//{nation:'키프로스', city:'니코시아'},
//{nation:'통가', city:'누쿠알로파'},
//{nation:'투르크메니스탄', city:'아슈하바트'},
//{nation:'투발루', city:'푸나푸티'},
//{nation:'트란스니스트리아', city:'티라스폴'},
//{nation:'파푸아뉴기니', city:'포트모르즈비'},
//{nation:'팔라우', city:'멜레케오크'},
//{nation:'피지', city:'수바'},

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

function getScoreMsg() {
  str = "총, " + TOTAL_QUESTION + " 문제중, " + TOTAL_ANSWER + ", 문제를 맞추셨습니다.";
  return str;
}

function buildQuesion(dan) {
    let q = "";
    let level_start_num = 0; //0 ~ 19, 20~39, 40~98
    let level_end_num = 19;
    switch (dan) {
      case 1:
        level_start_num = 0;
        level_end_num = 19;
        break;
      case 2:
        level_start_num = 20;
        level_end_num = 39;
        break;
      case 3:
        level_start_num = 40;
        level_end_num = NATION_ARR.length;
        break;
    }
    let t = level_start_num + parseInt(Math.random() * (level_end_num-1));
    while (t == randomNumber ) {
        t++
        if(t == NATION_ARR.length) {
            t = 0;
        }
    }
    randomNumber = t;
    danQuestionAnswer = NATION_ARR[randomNumber].city;
    q = NATION_ARR[randomNumber].nation + "의 수도는?";
    TOTAL_QUESTION ++;
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
    danQuestion = buildQuesion(1);
    cekResponse.setSimpleSpeechText('나라수도 맞추기를 시작합니다.' + danQuestion)
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
    case 'getScoreIntent':
        cekResponse.appendSpeechText(getScoreMsg())
        cekResponse.appendSpeechText(`다음 문제.`+ buildQuesion(dan))
        cekResponse.setMultiturn({
          intent: 'playGameIntent',
        })
        break
    case 'playGameIntent':
      if (!!slots) {
        const danSlot = slots.dan
        if (slots.length != 0 && danSlot) {
          dan = parseInt(danSlot.value)
        }
        if (isNaN(dan)) {
          dan = 1
        }
        danQuestion = buildQuesion(dan);
        cekResponse.setSimpleSpeechText(dan + ' 단계, 나라수도 맞추기를 시작합니다.' + danQuestion)
        cekResponse.setMultiturn({
          intent: 'playGameIntent',
        })
      } else {
        danQuestion = buildQuesion(dan);
        cekResponse.setSimpleSpeechText('나라수도 맞추기를 시작합니다. 게임중 문제 난이도를 변경하시려면 1에서 3중 원하는 단계를 말씀하시면됩니다. ' + danQuestion)
        cekResponse.setMultiturn({
          intent: 'playGameIntent',
        })
      }
      break
    case 'answerIntent':
      if (!!slots) {
        const answerSlot = slots.city
        if (slots.length != 0 && answerSlot) {
          userAnswer = answerSlot.value
        }
        userAnswer = answerSlot.value
        if (userAnswer == danQuestionAnswer) {
            TOTAL_ANSWER++;
            cekResponse.appendSpeechText(` ${userAnswer}, 정답입니다. 다음 문제.`+ buildQuesion(dan))
            cekResponse.setMultiturn({
              intent: 'playGameIntent',
            })
        } else {
            cekResponse.appendSpeechText(` ${userAnswer}, 틀렸습니다. 정답은 ${danQuestionAnswer}, 다음 문제.`+ buildQuesion(dan))
            cekResponse.setMultiturn({
              intent: 'playGameIntent',
            })
        }
      }
      break
    case 'Clova.CancelIntent':
      cekResponse.setSimpleSpeechText("나라수도 맞추기 실행을 취소합니다." + getScoreMsg())
      break
    case 'Clova.YesIntent':
    case 'Clova.NoIntent':
    case 'Clova.GuideIntent':
      if (!!slots) {
        const answerSlot = slots.city
        if (slots.length != 0 && answerSlot) {
          userAnswer = answerSlot.value
          if (userAnswer == danQuestionAnswer) {
              cekResponse.setSimpleSpeechText(` ${userAnswer}, 정답입니다. 다음 문제.`+ buildQuesion(dan))
          } else {
              cekResponse.setSimpleSpeechText(` 틀렸습니다. 정답은, ${danQuestionAnswer}, 다음 문제.`+ buildQuesion(dan))
          }
        } else {
          cekResponse.setSimpleSpeechText(` 틀렸습니다. 정답은, ${danQuestionAnswer}, 다음 문제.`+ buildQuesion(dan))
//          cekResponse.setSimpleSpeechText("방금 나간 문제를 다시 말씀드립니다. " + danQuestion)
        }
      } else {
        cekResponse.setSimpleSpeechText(` 틀렸습니다. 정답은, ${danQuestionAnswer}, 다음 문제.`+ buildQuesion(dan))
  //      cekResponse.setSimpleSpeechText("방금 나간 문제를 다시 말씀드립니다. " + danQuestion)
      }
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
    cekResponse.setSimpleSpeechText('나라수도맞추기를 종료합니다.' + getScoreMsg())
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
