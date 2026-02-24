const beads = document.querySelectorAll(".bead");
const charms = document.querySelectorAll(".charm");
const quantityInput = document.getElementById("quantity");
const priceDisplay = document.getElementById("price");
const preview = document.getElementById("preview");

beads.forEach(b => b.addEventListener("change", update));
charms.forEach(c => c.addEventListener("change", update));
quantityInput.addEventListener("input", update);

function update() {
    let total = 0;
    preview.innerHTML = "";

    const quantity = parseInt(quantityInput.value) || 1;

    beads.forEach(bead => {
        if (bead.checked) {
            const price = parseInt(bead.dataset.price);
            total += price * quantity;

            for (let i = 0; i < quantity; i++) {
                addPreviewImage(bead.dataset.type);
            }
        }
    });

    charms.forEach(charm => {
        if (charm.checked) {
            const price = parseInt(charm.dataset.price);
            total += price;
            addPreviewImage(charm.dataset.type + "-charm");
        }
    });

    priceDisplay.textContent = total;
}

function addPreviewImage(type) {
    const img = document.createElement("img");
    img.src = `images/${type}.png`;
    img.classList.add("preview-item");
    preview.appendChild(img);
}

function addToCart() {
    const wristSize = document.getElementById("wristSize").value;
    const total = parseInt(priceDisplay.textContent);

    if (total === 0) {
        alert("Please select your beads or charms! 💕");
        return;
    }

    if (!wristSize) {
        alert("Please enter your wrist size 💕");
        return;
    }

    if (wristSize < 10 || wristSize > 30) {
        alert("Enter a valid wrist size (10–30 cm) 💕");
        return;
    }

    alert(
        "🎀 Added to cart! 🎀\n\n" +
        "Wrist Size: " + wristSize + " cm\n" +
        "Total: $" + total
    );
}

update();



const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

let musicStarted = false;

document.addEventListener("click", function () {
    if (!musicStarted) {
        music.play().catch(() => {});
        musicBtn.textContent = "🎵 Music On";
        musicStarted = true;
    }
}, { once: true });

function toggleMusic() {
    if (music.paused) {
        music.play();
        musicBtn.textContent = "🎵 Music On";
    } else {
        music.pause();
        musicBtn.textContent = "🔇 Music Off";
    }
}