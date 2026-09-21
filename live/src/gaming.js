import "./styles/style.scss";
import "./styles/gaming-screen.scss";
/**
 * Represents one memory card.
 */
class Card {
    id;
    image;
    isFlipped;
    isMatched;
    /**
     * Creates a new memory card.
     * @param data Card data.
     */
    constructor(data) {
        this.id = data.id;
        this.image = data.image;
        this.isFlipped = false;
        this.isMatched = false;
    }
    /**
     * Flips the card.
     */
    flip() {
        this.isFlipped = true;
    }
    /**
     * Turns the card back over.
     */
    unflip() {
        this.isFlipped = false;
    }
    /**
     * Marks the card as matched.
     */
    match() {
        this.isMatched = true;
    }
    /**
     * Checks whether the card is blocked.
     * @returns True when the card cannot be selected.
     */
    isBlocked() {
        return this.isFlipped || this.isMatched;
    }
}
/**
 * Controls the memory game.
 */
class MemoryGame {
    firstCard = null;
    secondCard = null;
    firstCardElement = null;
    secondCardElement = null;
    lockBoard = false;
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    matchedPairs = 0;
    totalPairs = 0;
    gameFinished = false;
    /**
     * Initializes the memory game.
     */
    init() {
        this.setupScore();
        this.setupStartingPlayer();
        this.createCards();
        this.setupExitPopup();
        this.setupWinnerButtons();
    }
    /**
     * Sets the starting player.
     */
    setupStartingPlayer() {
        const selectedPlayer = localStorage.getItem("selectedPlayer") || "blue";
        this.currentPlayer =
            selectedPlayer === "orange" ? 1 : 2;
        this.updateCurrentPlayerIndicator();
    }
    /**
     * Updates the active player indicator.
     */
    updateCurrentPlayerIndicator() {
        const players = document.querySelectorAll("[data-player]");
        players.forEach((player) => {
            const playerName = player.dataset.player;
            const isCurrentPlayer = playerName === this.getCurrentPlayerName();
            player.classList.toggle("is-current-player", isCurrentPlayer);
        });
    }
    /**
     * Gets the current player's name.
     * @returns Current player name.
     */
    getCurrentPlayerName() {
        return this.currentPlayer === 1
            ? "orange"
            : "blue";
    }
    /**
     * Creates all memory cards.
     */
    createCards() {
        const container = document.querySelector(".memory__card-container");
        if (!container) {
            return;
        }
        const savedCardCount = localStorage.getItem("cardCount");
        const cardCount = Number(savedCardCount) || 16;
        container.dataset.cardCount = String(cardCount);
        this.totalPairs = cardCount / 2;
        const cards = this.buildCards();
        this.shuffleCards(cards);
        this.renderCards(cards, container);
    }
    /**
     * Creates all card pairs.
     * @returns Array containing all cards.
     */
    buildCards() {
        const cards = [];
        for (let i = 1; i <= this.totalPairs; i++) {
            const image = `/assets/images/Code vibes card ${i}.png`;
            cards.push(new Card({
                id: i,
                image
            }));
            cards.push(new Card({
                id: i,
                image
            }));
        }
        return cards;
    }
    /**
     * Shuffles the cards.
     * @param cards Cards to shuffle.
     */
    shuffleCards(cards) {
        for (let i = cards.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [
                cards[i],
                cards[randomIndex]
            ] = [
                cards[randomIndex],
                cards[i]
            ];
        }
    }
    /**
     * Renders all cards.
     * @param cards Cards to render.
     * @param container Card container.
     */
    renderCards(cards, container) {
        cards.forEach((card) => {
            const element = this.createCardElement(card);
            container.appendChild(element);
            element.addEventListener("click", () => this.handleCardClick(card, element));
        });
    }
    /**
     * Creates the HTML element for a card.
     * @param card Card data.
     * @returns Card element.
     */
    createCardElement(card) {
        const element = document.createElement("div");
        element.classList.add("memory__card");
        element.dataset.card = String(card.id);
        element.innerHTML = this.getCardMarkup(card);
        return element;
    }
    /**
     * Creates the card markup.
     * @param card Card data.
     * @returns Card HTML markup.
     */
    getCardMarkup(card) {
        return `
            <div class="memory__card-inner">
                <div
                    class="memory__card-front"
                    style="background-image: url('${card.image}');"
                ></div>
                <div
                    class="memory__card-back"
                    style="background-image: url('${card.image}');"
                ></div>
            </div>
        `;
    }
    /**
     * Handles a card click.
     * @param card Selected card.
     * @param element Card element.
     */
    handleCardClick(card, element) {
        if (this.isCardBlocked(card)) {
            return;
        }
        card.flip();
        element.classList.add("is-flipped");
        if (!this.firstCard) {
            this.selectFirstCard(card, element);
            return;
        }
        this.selectSecondCard(card, element);
        this.checkMatch();
    }
    /**
     * Checks whether a card can be selected.
     * @param card Card to check.
     * @returns True when blocked.
     */
    isCardBlocked(card) {
        return (this.gameFinished ||
            this.lockBoard ||
            card.isBlocked());
    }
    /**
     * Selects the first card.
     * @param card Selected card.
     * @param element Card element.
     */
    selectFirstCard(card, element) {
        this.firstCard = card;
        this.firstCardElement = element;
    }
    /**
     * Selects the second card.
     * @param card Selected card.
     * @param element Card element.
     */
    selectSecondCard(card, element) {
        this.secondCard = card;
        this.secondCardElement = element;
    }
    /**
     * Checks whether both cards match.
     */
    checkMatch() {
        if (!this.firstCard || !this.secondCard) {
            return;
        }
        if (this.firstCard.id === this.secondCard.id) {
            this.handleMatch();
            return;
        }
        this.lockBoard = true;
        setTimeout(() => {
            this.unflipCards();
        }, 1000);
    }
    /**
     * Handles a matching pair.
     */
    handleMatch() {
        if (!this.hasSelectedCards()) {
            return;
        }
        this.firstCard.match();
        this.secondCard.match();
        this.markCardsAsMatched();
        this.addPoint();
        this.matchedPairs++;
        this.resetBoard();
        this.checkGameWon();
    }
    /**
     * Checks whether selected cards exist.
     * @returns True when cards exist.
     */
    hasSelectedCards() {
        return !!(this.firstCard &&
            this.secondCard &&
            this.firstCardElement &&
            this.secondCardElement);
    }
    /**
     * Adds matched styling to both cards.
     */
    markCardsAsMatched() {
        this.firstCardElement?.classList.add("matched");
        this.secondCardElement?.classList.add("matched");
    }
    /**
     * Adds a point to the current player.
     */
    addPoint() {
        if (this.currentPlayer === 1) {
            this.player1Score++;
        }
        else {
            this.player2Score++;
        }
        this.updateScore();
    }
    /**
     * Updates both player scores.
     */
    updateScore() {
        this.updateScoreElement("#player1Score", this.player1Score);
        this.updateScoreElement("#player2Score", this.player2Score);
    }
    /**
     * Updates one score element.
     * @param selector Element selector.
     * @param score Score value.
     */
    updateScoreElement(selector, score) {
        const element = document.querySelector(selector);
        if (!element) {
            return;
        }
        element.textContent = String(score);
    }
    /**
     * Sets up the initial game state.
     */
    setupScore() {
        this.player1Score = 0;
        this.player2Score = 0;
        this.currentPlayer = 1;
        this.matchedPairs = 0;
        this.gameFinished = false;
        this.lockBoard = false;
        this.resetBoard();
        this.updateScore();
    }
    /**
     * Turns unmatched cards back over.
     */
    unflipCards() {
        if (!this.hasSelectedCards()) {
            return;
        }
        this.firstCard.unflip();
        this.secondCard.unflip();
        this.removeFlippedClasses();
        this.switchPlayer();
        this.resetBoard();
    }
    /**
     * Removes the flipped class.
     */
    removeFlippedClasses() {
        this.firstCardElement?.classList.remove("is-flipped");
        this.secondCardElement?.classList.remove("is-flipped");
    }
    /**
     * Switches to the other player.
     */
    switchPlayer() {
        this.currentPlayer =
            this.currentPlayer === 1 ? 2 : 1;
        this.updateCurrentPlayerIndicator();
    }
    /**
     * Resets selected cards.
     */
    resetBoard() {
        this.firstCard = null;
        this.secondCard = null;
        this.firstCardElement = null;
        this.secondCardElement = null;
        this.lockBoard = false;
    }
    /**
     * Checks whether the game is won or tied.
     */
    checkGameWon() {
        if (this.matchedPairs !== this.totalPairs ||
            this.gameFinished) {
            return;
        }
        this.gameFinished = true;
        if (this.player1Score === this.player2Score) {
            this.showDrawPopup();
            return;
        }
        this.showWinnerPopup();
    }
    /**
     * Shows the draw popup.
     */
    showDrawPopup() {
        const popup = document.querySelector("#winnerPopup");
        const drawWinner = document.querySelector("#drawWinner");
        if (!popup || !drawWinner) {
            return;
        }
        this.hideWinnerContainers();
        drawWinner.style.display = "flex";
        drawWinner.classList.add("is-visible");
        popup.classList.add("is-visible");
    }
    /**
     * Shows winner popup.
     */
    showWinnerPopup() {
        const popup = document.querySelector("#winnerPopup");
        if (!popup) {
            return;
        }
        this.hideWinnerContainers();
        this.updateWinnerPopup();
        popup.classList.add("is-visible");
    }
    /**
     * Hides winner and draw containers.
     */
    hideWinnerContainers() {
        const winners = document.querySelectorAll("#blueWinner, #orangeWinner, #drawWinner");
        winners.forEach((winner) => {
            winner.classList.remove("is-visible");
            winner.style.display = "none";
        });
    }
    /**
     * Updates winner popup.
     */
    updateWinnerPopup() {
        const orangeWinner = document.querySelector("#orangeWinner");
        const blueWinner = document.querySelector("#blueWinner");
        if (!orangeWinner || !blueWinner) {
            return;
        }
        if (this.player1Score > this.player2Score) {
            this.showWinner(orangeWinner, "#orangeWinnerScore", this.player1Score);
            return;
        }
        this.showWinner(blueWinner, "#blueWinnerScore", this.player2Score);
    }
    /**
     * Shows winner and score.
     * @param winner Winner container.
     * @param scoreSelector Score selector.
     * @param score Winner score.
     */
    showWinner(winner, scoreSelector, score) {
        this.updateScoreElement(scoreSelector, score);
        winner.style.display = "flex";
        winner.classList.add("is-visible");
    }
    /**
     * Sets up winner buttons.
     */
    setupWinnerButtons() {
        const buttons = document.querySelectorAll("#blueBackHome, #orangeBackHome, #drawBackHome");
        buttons.forEach((button) => {
            button.addEventListener("click", () => this.leaveGame());
        });
    }
    /**
     * Sets up exit popup.
     */
    setupExitPopup() {
        const exitButton = document.querySelector(".gaming__header-right-part-exit-game");
        const exitPopup = document.querySelector("#exitPopup");
        const popup = document.querySelector(".exit-popup");
        const backToGame = document.querySelector("#backToGame");
        const exitGame = document.querySelector("#exitGame");
        exitButton?.addEventListener("click", () => this.openExitPopup(exitPopup));
        backToGame?.addEventListener("click", () => this.closeExitPopup(exitPopup));
        exitGame?.addEventListener("click", () => this.leaveGame());
        exitPopup?.addEventListener("click", (event) => {
            this.handlePopupClick(event, popup, exitPopup);
        });
    }
    /**
     * Handles clicks outside popup.
     * @param event Mouse event.
     * @param popup Popup element.
     * @param exitPopup Popup overlay.
     */
    handlePopupClick(event, popup, exitPopup) {
        const target = event.target;
        if (popup &&
            target instanceof Node &&
            !popup.contains(target)) {
            this.closeExitPopup(exitPopup);
        }
    }
    /**
     * Opens exit popup.
     * @param popup Popup element.
     */
    openExitPopup(popup) {
        if (!popup) {
            return;
        }
        popup.classList.remove("is-closing");
        popup.classList.add("is-visible");
    }
    /**
     * Closes exit popup.
     * @param popup Popup element.
     */
    closeExitPopup(popup) {
        if (!popup) {
            return;
        }
        popup.classList.add("is-closing");
        setTimeout(() => {
            popup.classList.remove("is-visible");
            popup.classList.remove("is-closing");
        }, 450);
    }
    /**
     * Leaves the game and returns to settings.
     */
    leaveGame() {
        window.location.href =
            `${import.meta.env.BASE_URL}settings.html`;
    }
}
const game = new MemoryGame();
game.init();
