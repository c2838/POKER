const GAME_STATE = {
  // 等待翻第一張牌
  FirstCardAwaits: 'FirstCardAwaits',
  // 等待翻第二張牌
  SecondCardAwaits: 'SecondCardAwaits',
  // 配對失敗
  CardsMatchFailed: 'CardsMatchFailed',
  // 配對成功
  CardsMatched: 'CardsMatched',
  // 遊戲結束
  GameFinished: 'GameFinished'
}

// [黑桃,愛心,方塊,梅花] 存放圖片網址陣列
const symbols = ['https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png',
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png',
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png',
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png'
]

// 顯示外觀用
const view = {
  getCardElement(index) { //生成卡片element函式
    return `<div data-index="${index}" class="card back"></div>`
  },
  getCardContent(index) { //生成卡片內容函式
    //撲克牌數字，特殊數字則轉換為字母
    const number = this.transformNumber((index % 13) + 1)
    //撲克牌花色
    const symbol = symbols[Math.floor(index / 13)]
    // 回傳字串(HTML內容)
    return `<p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>`
  },
  transformNumber(number) { //將特殊數字轉換為字母AJQK函式
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  flipCards(...cards) { //翻牌函式，點擊可將牌翻面
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
      } else {
        card.classList.add('back')
        card.innerHTML = null
      }
    })
  },
  displayCards(indexes) { //渲染卡片用函式
    const rootElement = document.querySelector('#cards')
    //利用洗牌函式生成隨機數字陣列，再利用getCardElement()生成HTML內容，最後利用join()函式合併陣列成為字串
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  pairCards(cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderedScore(score) {
    document.querySelector('.score').innerText = `Score: ${score}`
  },
  renderedTriedTimes(times) {
    document.querySelector('.tried').innerText = `You've tried: ${times} ${times <= 1 ? 'time' : 'times'}`
  },
  appendWrongAnimation(cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => {
        card.classList.remove('wrong'), { once: true }
      })
    })
  },
  showGamefinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${Model.score}</p>
      <p>You've tried: ${Model.triedTimes} times</p>
      `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

// 狀態控制用
const controller = {
  // 預設狀態
  currentState: GAME_STATE.FirstCardAwaits,
  // 生成卡片
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  // 依照不同狀態，控制行為
  dispatchCardAction(card) {
    // 若點到已翻開的牌，則不進行動作
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      // 翻第一張
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        // 將翻到第一張牌放入陣列
        Model.revaledCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      // 翻第二張
      case GAME_STATE.SecondCardAwaits:
        // 增加嘗試次數顯示
        view.renderedTriedTimes(++Model.triedTimes)
        view.flipCards(card)
        // 將第二張牌也放入陣列
        Model.revaledCards.push(card)
        // 判斷配對成功與否
        if (Model.isRevealedCardMatched()) {
          // 若成功則更改狀態為matched
          this.currentState = GAME_STATE.CardsMatched
          // 配對成功+10分
          view.renderedScore(Model.score += 10)
          // 將牌改為灰底並顯示於頁面
          view.pairCards(Model.revaledCards)
          // 清空陣列
          Model.revaledCards = []
          // 若遊戲完成
          if (Model.score === 260) {
            console.log('showGameFinished')
            // 狀態設為遊戲完成
            this.currentState = GAME_STATE.GameFinished
            //秀出祝賀畫面 
            view.showGamefinished()
          } else {
            // 重設狀態
            this.currentState = GAME_STATE.FirstCardAwaits
          }
        } else {
          // 設定狀態為配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          // 加上失敗動畫
          view.appendWrongAnimation(Model.revaledCards)
          // 設定延遲時間1秒後翻回
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('current state:' + this.currentState)
    console.log('revealed cards:' + Model.revaledCards.map(card => card.dataset.index))
  },
  resetCards() {
    // 將牌組翻回
    view.flipCards(...Model.revaledCards)
    // 清空陣列
    Model.revaledCards = []
    // 重設狀態
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}


// 存放資料用
const Model = {
  // 建立陣列存入被翻開的卡片inedex，並用以比較數字
  revaledCards: [],
  isRevealedCardMatched() {
    return (Number(this.revaledCards[0].dataset.index) % 13) === (Number(this.revaledCards[1].dataset.index) % 13)
  },
  score: 0,
  triedTimes: 0,
}

// 外掛函式庫
const utility = {
  getRandomNumberArray(count) { //利用Fisher-Yates Shuffle演算法進行洗牌
    // 生成迭代陣列
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      // 生成隨機索引值
      let randomIndex = Math.floor(Math.random() * (index + 1));
      // 解構賦值語法，SWAP隨機索引值與預設索引值
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()

// NodeList，點擊卡片的事件監聽
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    // 呼叫控制器幫忙指派狀態(牌是否要翻面與翻面後的動作)
    controller.dispatchCardAction(card)
  })
})