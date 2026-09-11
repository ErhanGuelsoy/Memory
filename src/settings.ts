import "./styles/style.scss";
import "./styles/settings-page.scss";

init();

/**
 * Initializes the settings page.
 */
function init(): void {
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
function setupThemeSelection(): void {
    const themes =
        document.querySelectorAll<HTMLElement>(
            "[data-theme]"
        );

    themes.forEach(
        (theme: HTMLElement) => {
            theme.addEventListener(
                "click",
                () => selectTheme(theme)
            );
        }
    );
}

/**
 * Stores the selected theme.
 */
function selectTheme(theme: HTMLElement): void {
    const selectedTheme =
        theme.dataset.theme;

    if (!selectedTheme) {
        return;
    }

    localStorage.setItem(
        "selectedTheme",
        selectedTheme
    );

    document
        .querySelectorAll<HTMLElement>(
            "[data-theme]"
        )
        .forEach(
            (item: HTMLElement) => {
                item.classList.remove(
                    "is-selected"
                );
            }
        );

    theme.classList.add(
        "is-selected"
    );
}

/**
 * Sets up the theme preview.
 */
function setupThemePreview(): void {
    const themes =
        document.querySelectorAll<HTMLElement>(
            "[data-theme]"
        );

    const preview =
        document.querySelector<HTMLImageElement>(
            ".game__component-container img"
        );

    if (!preview) {
        return;
    }

    themes.forEach(
        (theme: HTMLElement) => {
            theme.addEventListener(
                "mouseenter",
                () => updatePreview(
                    theme,
                    preview
                )
            );

            theme.addEventListener(
                "click",
                () => updatePreview(
                    theme,
                    preview
                )
            );
        }
    );
}

/**
 * Updates the preview image.
 */
function updatePreview(
    theme: HTMLElement,
    preview: HTMLImageElement
): void {
    const themeName =
        theme.dataset.theme;

    if (themeName === "code-vibes") {
        preview.src =
            "public/assets/images/Frame 629.png";

        preview.alt =
            "Code Vibes game preview";

        return;
    }

    if (themeName === "foods") {
        preview.src =
            "public/assets/images/food_frame.png";

        preview.alt =
            "Foods game preview";

        return;
    }
}

/**
 * Sets up player selection.
 */
function setupPlayerSelection(): void {
    const players =
        document.querySelectorAll<HTMLElement>(
            "[data-player]"
        );

    players.forEach(
        (player: HTMLElement) => {
            player.addEventListener(
                "click",
                () => selectPlayer(player)
            );
        }
    );
}

/**
 * Stores the selected player.
 */
function selectPlayer(player: HTMLElement): void {
    const selectedPlayer =
        player.dataset.player;

    if (!selectedPlayer) {
        return;
    }

    localStorage.setItem(
        "selectedPlayer",
        selectedPlayer
    );

    document
        .querySelectorAll<HTMLElement>(
            "[data-player]"
        )
        .forEach(
            (item: HTMLElement) => {
                item.classList.remove(
                    "is-selected"
                );
            }
        );

    player.classList.add(
        "is-selected"
    );
}

/**
 * Sets up the board size selection.
 */
function setupCardSelection(): void {
    const cardOptions =
        document.querySelectorAll<HTMLElement>(
            "[data-cards]"
        );

    cardOptions.forEach(
        (option: HTMLElement) => {
            option.addEventListener(
                "click",
                () => selectCardCount(option)
            );
        }
    );
}

/**
 * Stores the selected board size.
 */
function selectCardCount(
    option: HTMLElement
): void {
    const cardCount =
        option.dataset.cards;

    if (!cardCount) {
        return;
    }

    localStorage.setItem(
        "cardCount",
        cardCount
    );

    document
        .querySelectorAll<HTMLElement>(
            "[data-cards]"
        )
        .forEach(
            (item: HTMLElement) => {
                item.classList.remove(
                    "is-selected"
                );
            }
        );

    option.classList.add(
        "is-selected"
    );
}

/**
 * Sets up the start button.
 */
function setupStartButton(): void {
    const startButton =
        document.querySelector<HTMLButtonElement>(
            "#start-button"
        );

    if (!startButton) {
        return;
    }

    startButton.addEventListener(
        "click",
        navigateToGame
    );
}

/**
 * Navigates to the selected game.
 */
function navigateToGame(): void {
    let selectedTheme =
        localStorage.getItem(
            "selectedTheme"
        );

    if (!selectedTheme) {
        selectedTheme =
            "code-vibes";

        localStorage.setItem(
            "selectedTheme",
            selectedTheme
        );
    }

    if (!localStorage.getItem("cardCount")) {
        localStorage.setItem(
            "cardCount",
            "16"
        );
    }

    if (!localStorage.getItem("selectedPlayer")) {
        localStorage.setItem(
            "selectedPlayer",
            "blue"
        );
    }

    if (selectedTheme === "foods") {
        window.location.href =
            "./food-theme.html";

        return;
    }

    if (
        selectedTheme === "gaming" ||
        selectedTheme === "code-vibes" ||
        selectedTheme === "da-projects"
    ) {
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
function restoreSettings(): void {
    restoreTheme();
    restorePlayer();
    restoreCardCount();
}

/**
 * Restores the selected theme.
 */
function restoreTheme(): void {
    const savedTheme =
        localStorage.getItem(
            "selectedTheme"
        );

    if (!savedTheme) {
        return;
    }

    const theme =
        document.querySelector<HTMLElement>(
            `[data-theme="${savedTheme}"]`
        );

    theme?.classList.add(
        "is-selected"
    );
}

/**
 * Restores the selected player.
 */
function restorePlayer(): void {
    const savedPlayer =
        localStorage.getItem(
            "selectedPlayer"
        ) || "blue";

    localStorage.setItem(
        "selectedPlayer",
        savedPlayer
    );

    const player =
        document.querySelector<HTMLElement>(
            `[data-player="${savedPlayer}"]`
        );

    player?.classList.add(
        "is-selected"
    );
}

/**
 * Restores the selected board size.
 */
function restoreCardCount(): void {
    const savedCards =
        localStorage.getItem(
            "cardCount"
        );

    if (!savedCards) {
        return;
    }

    const cards =
        document.querySelector<HTMLElement>(
            `[data-cards="${savedCards}"]`
        );

    cards?.classList.add(
        "is-selected"
    );
}