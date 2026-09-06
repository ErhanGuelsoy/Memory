import "./styles/style.scss";
import "./styles/gaming-screen.scss";

init();

/**
 * Initializes the game.
 */
function init(): void {
    setupCards();
    setupExitPopup();
}

/**
 * Sets up the memory cards.
 */
function setupCards(): void {
    const cards = document.querySelectorAll<HTMLElement>(".memory__card");

    cards.forEach((card) => {
        card.addEventListener("click", () => {
            flipCard(card);
        });
    });
}

/**
 * Flips a memory card.
 */
function flipCard(card: HTMLElement): void {
    card.classList.toggle("is-flipped");
}

/**
 * Sets up the exit popup.
 */
function setupExitPopup(): void {
    const exitButton = document.querySelector(
        ".gaming__header-right-part-exit-game"
    );

    const exitPopup = document.querySelector<HTMLElement>("#exitPopup");
    const popup = document.querySelector<HTMLElement>(".exit-popup");
    const backToGame = document.querySelector("#backToGame");
    const exitGame = document.querySelector("#exitGame");

    exitButton?.addEventListener("click", () => {
        openExitPopup(exitPopup);
    });

    backToGame?.addEventListener("click", () => {
        closeExitPopup(exitPopup);
    });

    exitGame?.addEventListener("click", leaveGame);

    exitPopup?.addEventListener("click", (event) => {
        if (popup && !popup.contains(event.target as Node)) {
            closeExitPopup(exitPopup);
        }
    });
}

/**
 * Opens the exit popup.
 */
function openExitPopup(popup: HTMLElement | null): void {
    if (!popup) {
        return;
    }

    popup.classList.remove("is-closing");
    popup.classList.add("is-visible");
}

/**
 * Closes the exit popup with an upward animation.
 */
function closeExitPopup(popup: HTMLElement | null): void {
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
 * Returns to the settings page.
 */
function leaveGame(): void {
    window.location.href = "/settings.html";
}