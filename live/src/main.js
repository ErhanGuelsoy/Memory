import "./styles/style.scss";
import "./styles/homescreen.scss";
import "./styles/gaming-screen.scss";
init();
/**
 * Initializes the home screen.
 */
function init() {
    setupPlayButton();
}
/**
 * Sets up the Play button.
 */
function setupPlayButton() {
    const playButton = document.querySelector(".play__style");
    if (!playButton) {
        return;
    }
    playButton.addEventListener("click", () => {
        window.location.href =
            "./settings.html";
    });
}
