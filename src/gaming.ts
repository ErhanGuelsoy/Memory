import "./styles/style.scss";
import "./styles/gaming-screen.scss";

interface CardData {
    id: number;
    frontImage: string;
    backImage: string;
}

/**
 * Represents one memory card.
 */
class Card {
    id: number;
    frontImage: string;
    backImage: string;
    isFlipped: boolean;
    isMatched: boolean;

    /**
     * Creates a new memory card.
     * @param data Card data.
     */
    constructor(data: CardData) {
        this.id = data.id;
        this.frontImage = data.frontImage;
        this.backImage = data.backImage;
        this.isFlipped = false;
        this.isMatched = false;
    }

    /**
     * Flips the card.
     */
    flip(): void {
        this.isFlipped = true;
    }

    /**
     * Turns the card back over.
     */
    unflip(): void {
        this.isFlipped = false;
    }

    /**
     * Marks the card as matched.
     */
    match(): void {
        this.isMatched = true;
    }

    /**
     * Checks whether the card is blocked.
     * @returns True when the card cannot be selected.
     */
    isBlocked(): boolean {
        return this.isFlipped || this.isMatched;
    }
}

/**
 * Controls the memory game.
 */
class MemoryGame {
    private firstCard: Card | null = null;
    private secondCard: Card | null = null;
    private firstCardElement: HTMLElement | null = null;
    private secondCardElement: HTMLElement | null = null;
    private lockBoard = false;
    private player1Score = 0;
    private player2Score = 0;
    private currentPlayer = 1;
    private matchedPairs = 0;
    private totalPairs = 0;
    private gameFinished = false;

    /**
     * Initializes the memory game.
     */
    init(): void {
        this.setupScore();
        this.setupStartingPlayer();
        this.createCards();
        this.setupExitPopup();
        this.setupWinnerButtons();
    }

    /**
     * Sets the starting player.
     */
    private setupStartingPlayer(): void {
        const selectedPlayer =
            localStorage.getItem("selectedPlayer") || "blue";

        this.currentPlayer = selectedPlayer === "orange" ? 1 : 2;
        this.updateCurrentPlayerIndicator();
    }

    /**
     * Updates the active player indicator.
     */
    private updateCurrentPlayerIndicator(): void {
        const players =
            document.querySelectorAll<HTMLElement>("[data-player]");

        players.forEach((player) =>
            this.updatePlayerIndicator(player)
        );
    }

    /**
     * Updates one player indicator.
     * @param player Player element.
     */
    private updatePlayerIndicator(player: HTMLElement): void {
        const name = player.dataset.player;
        const current = name === this.getCurrentPlayerName();

        player.classList.toggle("is-current-player", current);
    }

    /**
     * Gets the current player's name.
     * @returns Current player name.
     */
    private getCurrentPlayerName(): string {
        return this.currentPlayer === 1 ? "orange" : "blue";
    }

    /**
     * Creates all memory cards.
     */
    private createCards(): void {
        const container =
            document.querySelector<HTMLElement>(
                ".memory__card-container"
            );

        if (!container) return;

        const count =
            Number(localStorage.getItem("cardCount")) || 16;

        this.prepareBoard(container, count);
    }

    /**
     * Prepares the game board.
     * @param container Card container.
     * @param count Number of cards.
     */
    private prepareBoard(
        container: HTMLElement,
        count: number
    ): void {
        container.dataset.cardCount = String(count);
        this.totalPairs = count / 2;

        const cards = this.buildCards();

        this.shuffleCards(cards);
        this.renderCards(cards, container);
    }

    /**
     * Creates all card pairs.
     * @returns Array containing all cards.
     */
    private buildCards(): Card[] {
        const cards: Card[] = [];

        for (let i = 1; i <= this.totalPairs; i++) {
            this.addCardPair(cards, i);
        }

        return cards;
    }

    /**
     * Adds one card pair.
     * @param cards Card array.
     * @param id Card identifier.
     */
    private addCardPair(
        cards: Card[],
        id: number
    ): void {
        const frontImage =
            `${import.meta.env.BASE_URL}assets/images/Code vibes card front.png`;

        const backImage =
            `${import.meta.env.BASE_URL}assets/images/Code vibes card back ${id}.png`;

        const cardData: CardData = {
            id,
            frontImage,
            backImage
        };

        cards.push(new Card(cardData));
        cards.push(new Card(cardData));
    }

    /**
     * Shuffles the cards.
     * @param cards Cards to shuffle.
     */
    private shuffleCards(cards: Card[]): void {
        for (let i = cards.length - 1; i > 0; i--) {
            this.swapCards(cards, i);
        }
    }

    /**
     * Swaps two cards.
     * @param cards Cards to swap.
     * @param index Current card index.
     */
    private swapCards(
        cards: Card[],
        index: number
    ): void {
        const randomIndex =
            Math.floor(Math.random() * (index + 1));

        [cards[index], cards[randomIndex]] =
            [cards[randomIndex], cards[index]];
    }

    /**
     * Renders all cards.
     * @param cards Cards to render.
     * @param container Card container.
     */
    private renderCards(
        cards: Card[],
        container: HTMLElement
    ): void {
        cards.forEach((card) =>
            this.renderCard(card, container)
        );
    }

    /**
     * Renders one card.
     * @param card Card data.
     * @param container Card container.
     */
    private renderCard(
        card: Card,
        container: HTMLElement
    ): void {
        const element = this.createCardElement(card);

        container.appendChild(element);

        element.addEventListener(
            "click",
            () => this.handleCardClick(card, element)
        );
    }

    /**
     * Creates the HTML element for a card.
     * @param card Card data.
     * @returns Card element.
     */
    private createCardElement(
        card: Card
    ): HTMLElement {
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
    private getCardMarkup(card: Card): string {
        return `
            <div class="memory__card-inner">
                <img
                    class="memory__card-front"
                    src="${card.frontImage}"
                    alt="Code vibes card front"
                >
                <img
                    class="memory__card-back"
                    src="${card.backImage}"
                    alt="Code vibes card back"
                >
            </div>
        `;
    }

    /**
     * Handles a card click.
     * @param card Selected card.
     * @param element Card element.
     */
    private handleCardClick(
        card: Card,
        element: HTMLElement
    ): void {
        if (this.isCardBlocked(card)) return;

        card.flip();
        element.classList.add("is-flipped");
        this.selectCard(card, element);
    }

    /**
     * Selects a clicked card.
     * @param card Selected card.
     * @param element Selected element.
     */
    private selectCard(
        card: Card,
        element: HTMLElement
    ): void {
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
    private isCardBlocked(card: Card): boolean {
        return (
            this.gameFinished ||
            this.lockBoard ||
            card.isBlocked()
        );
    }

    /**
     * Selects the first card.
     * @param card Selected card.
     * @param element Selected element.
     */
    private selectFirstCard(
        card: Card,
        element: HTMLElement
    ): void {
        this.firstCard = card;
        this.firstCardElement = element;
    }

    /**
     * Selects the second card.
     * @param card Selected card.
     * @param element Selected element.
     */
    private selectSecondCard(
        card: Card,
        element: HTMLElement
    ): void {
        this.secondCard = card;
        this.secondCardElement = element;
    }

    /**
     * Checks whether both cards match.
     */
    private checkMatch(): void {
        if (!this.hasSelectedCards()) return;

        if (this.firstCard!.id === this.secondCard!.id) {
            this.handleMatch();
            return;
        }

        this.lockBoard = true;
        setTimeout(() => this.unflipCards(), 1000);
    }

    /**
     * Handles a matching pair.
     */
    private handleMatch(): void {
        if (!this.hasSelectedCards()) return;

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
    private hasSelectedCards(): boolean {
        return !!(
            this.firstCard &&
            this.secondCard &&
            this.firstCardElement &&
            this.secondCardElement
        );
    }

    /**
     * Marks both cards as matched.
     */
    private markCardsAsMatched(): void {
        this.firstCard!.match();
        this.secondCard!.match();

        this.firstCardElement?.classList.add("matched");
        this.secondCardElement?.classList.add("matched");
    }

    /**
     * Adds a point to the current player.
     */
    private addPoint(): void {
        if (this.currentPlayer === 1) {
            this.player1Score++;
        } else {
            this.player2Score++;
        }

        this.updateScore();
    }

    /**
     * Updates both player scores.
     */
    private updateScore(): void {
        this.updateScoreElement(
            "#player1Score",
            this.player1Score
        );

        this.updateScoreElement(
            "#player2Score",
            this.player2Score
        );
    }

    /**
     * Updates one score element.
     * @param selector Element selector.
     * @param score Score value.
     */
    private updateScoreElement(
        selector: string,
        score: number
    ): void {
        const element =
            document.querySelector<HTMLElement>(selector);

        if (element) {
            element.textContent = String(score);
        }
    }

    /**
     * Sets up the initial game state.
     */
    private setupScore(): void {
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
    private unflipCards(): void {
        if (!this.hasSelectedCards()) return;

        this.firstCard!.unflip();
        this.secondCard!.unflip();
        this.removeFlippedClasses();
        this.switchPlayer();
        this.resetBoard();
    }

    /**
     * Removes the flipped class.
     */
    private removeFlippedClasses(): void {
        this.firstCardElement?.classList.remove("is-flipped");
        this.secondCardElement?.classList.remove("is-flipped");
    }

    /**
     * Switches to the other player.
     */
    private switchPlayer(): void {
        this.currentPlayer =
            this.currentPlayer === 1 ? 2 : 1;

        this.updateCurrentPlayerIndicator();
    }

    /**
     * Resets selected cards.
     */
    private resetBoard(): void {
        this.firstCard = null;
        this.secondCard = null;
        this.firstCardElement = null;
        this.secondCardElement = null;
        this.lockBoard = false;
    }

    /**
     * Checks whether the game is won or tied.
     */
    private checkGameWon(): void {
        if (
            this.matchedPairs !== this.totalPairs ||
            this.gameFinished
        ) {
            return;
        }

        this.gameFinished = true;
        this.showGameOverPopup();
    }

    /**
     * Shows the game over popup before the winner popup.
     */
    private showGameOverPopup(): void {
        const popup =
            document.querySelector<HTMLElement>(
                "#gameOverPopup"
            );

        if (!popup) return;

        this.updateGameOverScore();
        popup.classList.add("is-visible");

        setTimeout(
            () => this.showGameResult(),
            2000
        );
    }

    /**
     * Updates the final score in the game over popup.
     */
    private updateGameOverScore(): void {
        this.updateScoreElement(
            "#gameOverOrangeScore",
            this.player1Score
        );

        this.updateScoreElement(
            "#gameOverBlueScore",
            this.player2Score
        );
    }

    /**
     * Shows the final winner result.
     */
    private showGameResult(): void {
        const gameOverPopup =
            document.querySelector<HTMLElement>(
                "#gameOverPopup"
            );

        gameOverPopup?.classList.remove("is-visible");

        if (this.player1Score === this.player2Score) {
            this.showDrawPopup();
            return;
        }

        this.showWinnerPopup();
    }

    /**
     * Shows the draw popup.
     */
    private showDrawPopup(): void {
        const popup =
            document.querySelector<HTMLElement>(
                "#winnerPopup"
            );

        const drawWinner =
            document.querySelector<HTMLElement>(
                "#drawWinner"
            );

        if (!popup || !drawWinner) return;

        this.hideWinnerContainers();
        this.showPopupContainer(popup, drawWinner);
    }

    /**
     * Shows a popup container.
     * @param popup Main popup element.
     * @param container Result container.
     */
    private showPopupContainer(
        popup: HTMLElement,
        container: HTMLElement
    ): void {
        container.style.display = "flex";
        container.classList.add("is-visible");
        popup.classList.add("is-visible");
    }

    /**
     * Shows winner popup.
     */
    private showWinnerPopup(): void {
        const popup =
            document.querySelector<HTMLElement>(
                "#winnerPopup"
            );

        if (!popup) return;

        this.hideWinnerContainers();
        this.updateWinnerPopup();
        popup.classList.add("is-visible");
    }

    /**
     * Hides winner and draw containers.
     */
    private hideWinnerContainers(): void {
        const winners =
            document.querySelectorAll<HTMLElement>(
                "#blueWinner, #orangeWinner, #drawWinner"
            );

        winners.forEach((winner) =>
            this.hideWinnerContainer(winner)
        );
    }

    /**
     * Hides one winner container.
     * @param winner Winner container.
     */
    private hideWinnerContainer(
        winner: HTMLElement
    ): void {
        winner.classList.remove("is-visible");
        winner.style.display = "none";
    }

    /**
     * Updates winner popup.
     */
    private updateWinnerPopup(): void {
        const orange =
            document.querySelector<HTMLElement>(
                "#orangeWinner"
            );

        const blue =
            document.querySelector<HTMLElement>(
                "#blueWinner"
            );

        if (!orange || !blue) return;

        this.showWinningPlayer(orange, blue);
    }

    /**
     * Shows the winning player.
     * @param orange Orange winner container.
     * @param blue Blue winner container.
     */
    private showWinningPlayer(
        orange: HTMLElement,
        blue: HTMLElement
    ): void {
        if (this.player1Score > this.player2Score) {
            this.showWinner(
                orange,
                "#orangeWinnerScore",
                this.player1Score
            );
            return;
        }

        this.showWinner(
            blue,
            "#blueWinnerScore",
            this.player2Score
        );
    }

    /**
     * Shows winner and score.
     * @param winner Winner container.
     * @param scoreSelector Score selector.
     * @param score Winner score.
     */
    private showWinner(
        winner: HTMLElement,
        scoreSelector: string,
        score: number
    ): void {
        this.updateScoreElement(scoreSelector, score);
        winner.style.display = "flex";
        winner.classList.add("is-visible");
    }

    /**
     * Sets up winner buttons.
     */
    private setupWinnerButtons(): void {
        const buttons =
            document.querySelectorAll<HTMLElement>(
                "#blueBackHome, #orangeBackHome, #drawBackHome"
            );

        buttons.forEach((button) =>
            button.addEventListener(
                "click",
                () => this.leaveGame()
            )
        );
    }

    /**
     * Sets up exit popup.
     */
    private setupExitPopup(): void {
        const exitButton =
            document.querySelector<HTMLElement>(
                ".gaming__header-right-part-exit-game"
            );

        const exitPopup =
            document.querySelector<HTMLElement>(
                "#exitPopup"
            );

        const popup =
            document.querySelector<HTMLElement>(
                ".exit-popup"
            );

        const backToGame =
            document.querySelector<HTMLElement>(
                "#backToGame"
            );

        const exitGame =
            document.querySelector<HTMLElement>(
                "#exitGame"
            );

        this.setupExitEvents(
            exitButton,
            exitPopup,
            popup,
            backToGame,
            exitGame
        );
    }

    /**
     * Sets up exit popup events.
     * @param exitButton Exit button.
     * @param exitPopup Popup overlay.
     * @param popup Popup element.
     * @param backToGame Back button.
     * @param exitGame Exit button.
     */
    private setupExitEvents(
        exitButton: HTMLElement | null,
        exitPopup: HTMLElement | null,
        popup: HTMLElement | null,
        backToGame: HTMLElement | null,
        exitGame: HTMLElement | null
    ): void {
        exitButton?.addEventListener(
            "click",
            () => this.openExitPopup(exitPopup)
        );

        backToGame?.addEventListener(
            "click",
            () => this.closeExitPopup(exitPopup)
        );

        exitGame?.addEventListener(
            "click",
            () => this.leaveGame()
        );

        this.setupOverlayEvent(exitPopup, popup);
    }

    /**
     * Sets up the popup overlay event.
     * @param exitPopup Popup overlay.
     * @param popup Popup element.
     */
    private setupOverlayEvent(
        exitPopup: HTMLElement | null,
        popup: HTMLElement | null
    ): void {
        exitPopup?.addEventListener(
            "click",
            (event: MouseEvent) =>
                this.handlePopupClick(
                    event,
                    popup,
                    exitPopup
                )
        );
    }

    /**
     * Handles clicks outside popup.
     * @param event Mouse event.
     * @param popup Popup element.
     * @param exitPopup Popup overlay.
     */
    private handlePopupClick(
        event: MouseEvent,
        popup: HTMLElement | null,
        exitPopup: HTMLElement
    ): void {
        const target = event.target;

        if (
            popup &&
            target instanceof Node &&
            !popup.contains(target)
        ) {
            this.closeExitPopup(exitPopup);
        }
    }

    /**
     * Opens exit popup.
     * @param popup Popup element.
     */
    private openExitPopup(
        popup: HTMLElement | null
    ): void {
        if (!popup) return;

        popup.classList.remove("is-closing");
        popup.classList.add("is-visible");
    }

    /**
     * Closes exit popup.
     * @param popup Popup element.
     */
    private closeExitPopup(
        popup: HTMLElement | null
    ): void {
        if (!popup) return;

        popup.classList.add("is-closing");

        setTimeout(
            () => this.finishClosingPopup(popup),
            450
        );
    }

    /**
     * Finishes closing the exit popup.
     * @param popup Popup element.
     */
    private finishClosingPopup(
        popup: HTMLElement
    ): void {
        popup.classList.remove("is-visible");
        popup.classList.remove("is-closing");
    }

    /**
     * Leaves the game and returns to settings.
     */
    private leaveGame(): void {
        window.location.href =
            `${import.meta.env.BASE_URL}settings.html`;
    }
}

const game = new MemoryGame();
game.init();