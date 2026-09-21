import "./styles/style.scss";
import "./styles/settings-page.scss";
init();
/**
 * Initializes the settings page.
 */
function init() {
    setupThemeSelection();
    setupThemePreview();
    setupPlayerSelection();
    setupCardSelection();
    setupStartButton();
    restoreSettings();
}
/**
 * Sets up the theme selection.
 */
function setupThemeSelection() {
    const themes = document.querySelectorAll("[data-theme]");
    themes.forEach((theme) => {
        theme.addEventListener("click", () => selectTheme(theme));
    });
}
/**
 * Stores the selected theme.
 */
function selectTheme(theme) {
    const selectedTheme = theme.dataset.theme;
    if (!selectedTheme) {
        return;
    }
    localStorage.setItem("selectedTheme", selectedTheme);
    document
        .querySelectorAll("[data-theme]")
        .forEach((item) => {
        item.classList.remove("is-selected");
    });
    theme.classList.add("is-selected");
}
/**
 * Sets up the theme preview.
 */
function setupThemePreview() {
    const themes = document.querySelectorAll("[data-theme]");
    const preview = document.querySelector(".game__component-container img");
    if (!preview) {
        return;
    }
    themes.forEach((theme) => {
        theme.addEventListener("mouseenter", () => updatePreview(theme, preview));
        theme.addEventListener("click", () => updatePreview(theme, preview));
    });
}
/**
 * Updates the preview image.
 */
function updatePreview(theme, preview) {
    const themeName = theme.dataset.theme;
    if (themeName === "code-vibes") {
        preview.src =
            "/assets/images/Frame 629.png";
        preview.alt =
            "Code Vibes game preview";
        return;
    }
    if (themeName === "foods") {
        preview.src =
            "/assets/images/food_frame.png";
        preview.alt =
            "Foods game preview";
        return;
    }
}
/**
 * Sets up player selection.
 */
function setupPlayerSelection() {
    const players = document.querySelectorAll("[data-player]");
    players.forEach((player) => {
        player.addEventListener("click", () => selectPlayer(player));
    });
}
/**
 * Stores the selected player.
 */
function selectPlayer(player) {
    const selectedPlayer = player.dataset.player;
    if (!selectedPlayer) {
        return;
    }
    localStorage.setItem("selectedPlayer", selectedPlayer);
    document
        .querySelectorAll("[data-player]")
        .forEach((item) => {
        item.classList.remove("is-selected");
    });
    player.classList.add("is-selected");
}
/**
 * Sets up the board size selection.
 */
function setupCardSelection() {
    const cardOptions = document.querySelectorAll("[data-cards]");
    cardOptions.forEach((option) => {
        option.addEventListener("click", () => selectCardCount(option));
    });
}
/**
 * Stores the selected board size.
 */
function selectCardCount(option) {
    const cardCount = option.dataset.cards;
    if (!cardCount) {
        return;
    }
    localStorage.setItem("cardCount", cardCount);
    document
        .querySelectorAll("[data-cards]")
        .forEach((item) => {
        item.classList.remove("is-selected");
    });
    option.classList.add("is-selected");
}
/**
 * Sets up the start button.
 */
function setupStartButton() {
    const startButton = document.querySelector("#start-button");
    if (!startButton) {
        return;
    }
    startButton.addEventListener("click", navigateToGame);
}
/**
 * Navigates to the selected game.
 */
function navigateToGame() {
    let selectedTheme = localStorage.getItem("selectedTheme");
    if (!selectedTheme) {
        selectedTheme =
            "code-vibes";
        localStorage.setItem("selectedTheme", selectedTheme);
    }
    if (!localStorage.getItem("cardCount")) {
        localStorage.setItem("cardCount", "16");
    }
    if (!localStorage.getItem("selectedPlayer")) {
        localStorage.setItem("selectedPlayer", "blue");
    }
    if (selectedTheme === "foods") {
        window.location.href =
            "./food-theme.html";
        return;
    }
    if (selectedTheme === "gaming" ||
        selectedTheme === "code-vibes" ||
        selectedTheme === "da-projects") {
        window.location.href =
            "./gaming-theme.html";
        return;
    }
    window.location.href =
        "./gaming-theme.html";
}
/**
 * Restores saved settings.
 */
function restoreSettings() {
    restoreTheme();
    restorePlayer();
    restoreCardCount();
}
/**
 * Restores the selected theme.
 */
function restoreTheme() {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (!savedTheme) {
        return;
    }
    const theme = document.querySelector(`[data-theme="${savedTheme}"]`);
    theme?.classList.add("is-selected");
}
/**
 * Restores the selected player.
 */
function restorePlayer() {
    const savedPlayer = localStorage.getItem("selectedPlayer") || "blue";
    localStorage.setItem("selectedPlayer", savedPlayer);
    const player = document.querySelector(`[data-player="${savedPlayer}"]`);
    player?.classList.add("is-selected");
}
/**
 * Restores the selected board size.
 */
function restoreCardCount() {
    const savedCards = localStorage.getItem("cardCount");
    if (!savedCards) {
        return;
    }
    const cards = document.querySelector(`[data-cards="${savedCards}"]`);
    cards?.classList.add("is-selected");
}
