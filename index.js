let deck = []
let dealerHand = []
let playerHand = []
let playFlag = true
let totalBet = 0
let betFlag = true
let cardX = 0
let cardY
let playerArea = document.getElementById("player-card-area")
let dealerArea = document.getElementById("dealer-card-area")
let splitFlag = false
let doubleFlag = false
let hitFlag = false
let standFlag = false
let natural = false
let chipCount = parseInt(document.getElementById("chip-count"))

startButton = document.getElementById("new-game-button")
startButton.addEventListener("click", function() {
    document.getElementById("new-game").style.display = "none"
    loadControls()
    loadCards()
    startGame()
})

document.getElementById("clear").addEventListener("click", function() {
    if(betFlag) {
        document.getElementById("chip-count").innerText = parseInt(document.getElementById("chip-count").innerText) + totalBet
        totalBet = 0
        document.getElementById("betz").innerText = "Bet: 0"
    }
})

function loadControls() {
    document.getElementById("controls").style.top = "50%"
    document.getElementById("controls").style.display = "grid"
    document.getElementById("bets").style.display = "inline-block"
}

function startGame() {
    if (parseInt(document.getElementById("chip-count").innerText) === 0) {
        gameOver()
    }
    else {
        disableButtons()
        getBets(createClickListenerPromise(document.querySelector('#submit')))
    }
}

function disableButtons() {
    setHit(false)
    setStand(false)
    setDouble(false)
    setSplit(false)
}

function setHit(flag) {
    document.getElementById("hit").disabled = !flag
}
function setStand(flag) {
    document.getElementById("stand").disabled = !flag
}
function setDouble(flag) {
    document.getElementById("double").disabled = !flag
}
function setSplit(flag) {
    document.getElementById("split").disabled = !flag
}

function playerAction() {
    playerChoice(buttonPromises([document.querySelector('#hit'), document.querySelector('#double'), document.querySelector('#stand'), document.querySelector('#split')]))
}

async function evaluateChoice() {
    if(standFlag) {
        payout()
    }
    else if(doubleFlag) {
        document.getElementById("chip-count").innerText -= totalBet
        totalBet *= 2
        document.getElementById("betz").innerText = "Bet: " + totalBet
        playerDeal()
        setTimeout(function () {
        }, 1000)
        payout()
    }
    else if(hitFlag) {
        p = new Promise((resolve) => {
            playerDeal()
            setTimeout(function () {
            }, 1000)
        })
        if(!bust() && !blackjack()) {
            setSplit(false)
            playerAction()
        }
        else {
            await p
            payout()
        }
    }
    else if(splitFlag) {
        // todo
    }
}

async function payout() {
    dealerFlip()
    if(bust()) {          // player busted
        dealerWin()
    }
    else if(blackjack()){
        if(dealerBlackjack()) {  // player got bj
            tie()
        }
        else {
            if(natural) {
                playerWin(1.5)
            }
            else {
                stoppromise = new Promise((resolve) => {
                    setTimeout(function () {
                        dealerHit()
                    }, 1000)
                })
                await stoppromise 
                compare()
            }
            
        }
    }
    else {     
        dealerHit()
        stoppromise = new Promise((resolve) => {
            setTimeout(function () {
                resolve()
            }, 3000)
        })
        await stoppromise                  // dealer plays    
        compare()
    }
}

function playerWin(amount) {
    chipCount += totalBet*amount
    deleteCards()
    disableButtons()
    const title = document.createElement("h1")
    title.innerText = "Player Won"
    const title2 = document.createElement("h2")
    title2.innerText = `Chips: ${chipCount}`
    title2.style.textAlign = 'center'
    const saveBtn = document.getElementById('new-game-button')
    document.getElementById("bets").style.display = "none"
    document.getElementById("controls").style.display = "none"
    document.getElementById("new-game").innerText = ""
    document.getElementById("new-game").appendChild(title)
    document.getElementById("new-game").appendChild(title2)
    document.getElementById("new-game").appendChild(saveBtn)
    document.getElementById("new-game").style.display = 'block'
    reset()
}

function reset() {
    document.getElementById("chip-count").innerText = chipCount
    dealerHand = []
    playerHand = []
    playFlag = true
    totalBet = 0
    betFlag = true
    splitFlag = false
    doubleFlag = false
    hitFlag = false
    standFlag = false
    natural = false
    document.getElementById("betz").innerText = "Bet: 0"
    if(deck.length < 65) {
        deck = []
        loadCards()
    }
}

function compare() {
    let dealerSoft = 0
    let dealerHard = 0
    dealerHand.forEach((card) => {
        dealerSoft += card.soft
        dealerHard += card.hard
    })
    let playerSoft = 0
    let playerHard = 0
    playerHand.forEach((card) => {
        playerSoft += card.soft
        playerHard += card.hard
    })
    let dealerNumber = 0
    let playerNumber = 0
    if(dealerHard > 21) {
        dealerNumber = dealerSoft
    }
    else {
        dealerNumber = dealerHard
    }
    if(playerHard > 21) {
        playerNumber = playerSoft
    }
    else {
        playerNumber = playerHard
    }
    if(playerNumber > dealerNumber || dealerNumber > 21) {
        playerWin(1)
    }
    else if(playerNumber === dealerNumber){
        tie()
    }
    else {
        dealerWin()
    }

}
let done = false
async function dealerHit() {
    let dealerSoft = 0
    let dealerHard = 0
    dealerHand.forEach((card) => {
        dealerSoft += card.soft
        dealerHard += card.hard
    })
    while(dealerHard < 17 || (dealerHard > 21 && dealerSoft < 17)) {
        stoppromise = new Promise((resolve) => {
            setTimeout(function () {
                resolve()
            }, 1000)
        })
        await stoppromise 
        dealerDeal()
        dealerSoft = 0
        dealerHard = 0
        dealerHand.forEach((card) => {
            dealerSoft += card.soft
            dealerHard += card.hard
        })
    }
    setTimeout(function () {
        done = true
    }, 3000)
}

function dealerBlackjack() {
    let softCount = 0
    let hardCount = 0
    dealerHand.forEach((card) => {
        softCount += card.soft
        hardCount += card.hard
    })
    return softCount === 21 || hardCount === 21
}

function dealerWin() {
    deleteCards()
    disableButtons()
    const title = document.createElement("h1")
    title.innerText = "Dealer Won"
    const title2 = document.createElement("h2")
    title2.innerText = `Chips: ${chipCount}`
    title2.style.textAlign = 'center'
    const saveBtn = document.getElementById('new-game-button')
    document.getElementById("bets").style.display = "none"
    document.getElementById("controls").style.display = "none"
    document.getElementById("new-game").innerText = ""
    document.getElementById("new-game").appendChild(title)
    document.getElementById("new-game").appendChild(title2)
    document.getElementById("new-game").appendChild(saveBtn)
    document.getElementById("new-game").style.display = 'block'
    reset()
}

function tie() {
    chipCount += totalBet
    deleteCards()
    disableButtons()
    const title = document.createElement("h1")
    title.innerText = "Tie"
    const title2 = document.createElement("h2")
    title2.innerText = `Chips: ${chipCount}`
    title2.style.textAlign = 'center'
    const saveBtn = document.getElementById('new-game-button')
    document.getElementById("bets").style.display = "none"
    document.getElementById("controls").style.display = "none"
    document.getElementById("new-game").innerText = ""
    document.getElementById("new-game").appendChild(title)
    document.getElementById("new-game").appendChild(title2)
    document.getElementById("new-game").appendChild(saveBtn)
    document.getElementById("new-game").style.display = 'block'
    reset()
}

function deleteCards() {
    let cards = document.querySelectorAll('.dealtCard')
    cards.forEach((card) => {
        card.remove()
    })
}

function dealerFlip() {
    document.getElementById(`back`).remove()
    displayDealerHand(false)
}

function playerDeal() {
    playerHand.push(deck.shift())
    displayPlayerHand(false)
}

function dealerDeal() {
    dealerHand.push(deck.shift())
    displayDealerHand(false)
}

function bust() {
    let count = 0
    playerHand.forEach((card) => {
        count += card.soft
    })
    return count > 21
}

function blackjack() {
    let softCount = 0
    let hardCount = 0
    playerHand.forEach((card) => {
        softCount += card.soft
        hardCount += card.hard
    })
    return softCount === 21 || hardCount === 21
}

async function playerChoice(pro) {
    await pro 
    evaluateChoice()
}

function buttonPromises(buttons) {
    promise = new Promise(resolve  => {
        buttons[0].addEventListener('click', function() {
            hitFlag = true
            resolve()
        })
        buttons[1].addEventListener('click', function () {
            doubleFlag = true
            resolve()
        })
        buttons[2].addEventListener('click', function () {
            standFlag = true
            resolve()
        })
        buttons[3].addEventListener('click', function () {
            splitFlag = true
            resolve()
        })
    })
    return promise
}



function initialDeal() {
    playerHand.push(deck.shift())
    dealerHand.push(deck.shift())
    playerHand.push(deck.shift())
    dealerHand.push(deck.shift())
    displayPlayerHand(true)
    displayDealerHand(true)
    setButtons()
    if (playerHand[0].hard + playerHand[1].hard === 21) {
        natural = true
        payout()
    }
    else {
        playerAction()
    }
    

}

function displayPlayerHand(isStart) {
    if(isStart) {
        playerHand.forEach(card => {
            const newCard = document.createElement("span")
            newCard.style.backgroundImage = `url(./images/${card.text}.png)`
            newCard.className = 'dealtCard'
            newCard.style.position = 'relative'
            newCard.style.display = 'inline-block'
            newCard.style.backgroundSize = 'contain'
            newCard.style.backgroundRepeat = 'no-repeat'
            newCard.style.backgroundSize = 'contain'
            newCard.style.width = '90px'
            newCard.style.height = '120px'
            newCard.style.left = `${cardX}px`
            newCard.style.top = '80px'
            playerArea.appendChild(newCard)
        })
    }
    else {
        const newCard = document.createElement("span")
        newCard.style.backgroundImage = `url(./images/${playerHand[playerHand.length-1].text}.png)`
        newCard.style.position = 'relative'
        newCard.className = 'dealtCard'
        newCard.style.display = 'inline-block'
        newCard.style.backgroundSize = 'contain'
        newCard.style.backgroundRepeat = 'no-repeat'
        newCard.style.backgroundSize = 'contain'
        newCard.style.width = '90px'
        newCard.style.height = '120px'
        newCard.style.left = `${cardX}px`
        newCard.style.top = '80px'
        playerArea.appendChild(newCard)
    }
}

function displayDealerHand(isStart) {
    if(isStart) {
        const newCard = document.createElement("span")
        newCard.style.backgroundImage = `url(./images/${dealerHand[0].text}.png)`
        newCard.style.position = 'relative'
        newCard.className = 'dealtCard'
        newCard.style.display = 'inline-block'
        newCard.style.backgroundSize = 'contain'
        newCard.style.backgroundRepeat = 'no-repeat'
        newCard.style.backgroundSize = 'contain'
        newCard.style.width = '90px'
        newCard.style.height = '120px'
        newCard.style.left = `${cardX}px`
        newCard.style.top = '-205px'
        dealerArea.appendChild(newCard)

        const newCard2 = document.createElement("span")
        newCard2.style.backgroundImage = `url(./images/back.png)`
        newCard2.id = "back"
        newCard2.style.position = 'relative'
        newCard2.className = 'dealtCard'
        newCard2.style.display = 'inline-block'
        newCard2.style.backgroundSize = 'contain'
        newCard2.style.backgroundRepeat = 'no-repeat'
        newCard2.style.backgroundSize = 'contain'
        newCard2.style.width = '90px'
        newCard2.style.height = '120px'
        newCard2.style.left = `${cardX}px`
        newCard2.style.top = '-205px'
        dealerArea.appendChild(newCard2)
    }
    else {
        const newCard = document.createElement("span")
        newCard.style.backgroundImage = `url(./images/${dealerHand[dealerHand.length - 1].text}.png)`
        newCard.style.position = 'relative'
        newCard.className = 'dealtCard'
        newCard.style.display = 'inline-block'
        newCard.style.backgroundSize = 'contain'
        newCard.style.backgroundRepeat = 'no-repeat'
        newCard.style.backgroundSize = 'contain'
        newCard.style.width = '90px'
        newCard.style.height = '120px'
        newCard.style.left = `${cardX}px`
        newCard.style.top = '-205px'
        dealerArea.appendChild(newCard)
    }
}

async function getBets(clickListenerPromise) {
    await clickListenerPromise
    initialDeal()
}

function createClickListenerPromise(target) {
    return new Promise((resolve) => target.addEventListener('click', resolve))
}


function loadCards() {
    makeCards()
    shuffleDeck()
}

class Card {
    constructor(text, hard, soft, url) {
        this.text = text
        this.hard = hard
        this.soft = soft
        this.url = url
    }
}

function makeCards() {
    for(j=1; j<=6; j++) {
        makeFour("1", 1, 1, "../images/1.png")
        makeFour("2", 2, 2, "../images/2.png")
        makeFour("3", 3, 3, "../images/3.png")
        makeFour("4", 4, 4, "../images/4.png")
        makeFour("5", 5, 5, "../images/5.png")
        makeFour("6", 6, 6, "../images/6.png")
        makeFour("7", 7, 7, "../images/7.png")
        makeFour("8", 8, 8, "../images/8.png")
        makeFour("9", 9, 9, "../images/9.png")
        makeFour("10", 10, 10, "../images/10.png")
        makeFour("J", 10, 10, "../images/J.png")
        makeFour("Q", 10, 10, "../images/Q.png")
        makeFour("K", 10, 10, "../images/K.png")
        makeFour("A", 11, 1, "../images/A.png")
    }
}

function makeFour(text, hard, soft, url) {
    deck.push(new Card(text, hard, soft, url))
    deck.push(new Card(text, hard, soft, url))
    deck.push(new Card(text, hard, soft, url))
    deck.push(new Card(text, hard, soft, url))
}

function shuffleDeck() {
    for(i=deck.length-1; i >= 0; i--) {
        rand = Math.floor(Math.random() * deck.length)
        temp = deck[i]
        deck[i] = deck[rand]
        deck[rand] = deck[i]
    }
}

function allowDrop(ev) {
    if(betFlag) {
        ev.preventDefault()
    }
    
}

function drag(ev) {
    if(betFlag) {
        ev.dataTransfer.setData("text", ev.target.id)
    }
    
}

function drop(ev) {
    amount = 0
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text")
    id = document.getElementById(data).id
    if(id === "red") {
        amount = 5
    }
    else if(id === "blue") {
        amount = 1
    }
    else if (id === "green") {
        amount = 10
    }
    else {
        amount = 50
    }
    chipCount = parseInt(document.getElementById("chip-count").innerText)
    if (amount <= chipCount) {
        document.getElementById("chip-count").innerText -= amount
        totalBet += amount
        document.getElementById("betz").innerText = "Bet: " + totalBet
    }
    else {
        window.alert("Not enough chips")
    }
    
}

function setButtons() {
    chipAmount = parseInt(document.getElementById('chip-count').innerText)

    //split button
    if (chipAmount > totalBet && playerHand[0].text === playerHand[1].text) {
        setSplit(true)
    }

    //stand and hit button
    if (playerHand[0].hard + playerHand[1].hard != 21) {
        setStand(true)
        setHit(true)
    }

    //double button
    if (chipAmount > totalBet && (playerHand[0].hard + playerHand[1].hard != 21)) {
        setDouble(true)
    }
}