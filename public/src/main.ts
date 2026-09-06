
import "./styles/style.scss";
import "./styles/homescreen.scss";
import "./styles/gaming-screen.scss";

init();

function init() {
    const fieldRef = document.getElementById("field");

    if (!fieldRef) {
        return;
    }

    fieldRef.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        const card = target.closest(".card");

        if (card) {
            card.classList.toggle("is-flipped");
        }
    });
}
