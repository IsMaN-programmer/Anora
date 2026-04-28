document.addEventListener("DOMContentLoaded", function () {
    const homeSection = document.getElementById("home");
    const sumSection = document.getElementById("sum");
    const paymentSection = document.getElementById("payment");
    const checkSection = document.getElementById("check");
    const historySection = document.getElementById("historySection");
    const historyList = document.getElementById("historyList");
    const cardInfo = document.getElementById("cardInfo");

    // Default history
    if (!localStorage.getItem("paymentHistory")) {
        const defaultHistory = [
            { name: "Gulchekhra Akbarova", card: "9860 0901 0680 2458", amount: "365 000", time: "24.10.2025 13:38" },
            { name: "Gulchekhra Akbarova", card: "9860 0901 0680 2458", amount: "261 000", time: "23.10.2025 13:21" },
            { name: "Ergashev Saidburhon", card: "5641 5890 4860 8230", amount: "45 000", time: "23.10.2025 15:34" },
            { name: "Sardor Ismanov", card: "5641 5890 4860 8230", amount: "26 000", time: "24.10.2025 15:10" },
            { name: "Madina Raxmatova", card: "5641 5890 4860 8230", amount: "18 000", time: "20.10.2025 13:00" },
        ];
        localStorage.setItem("paymentHistory", JSON.stringify(defaultHistory));
    }

    // Load saved cards
    const savedCards = JSON.parse(localStorage.getItem("cards")) || [
        { name: "Madina Raxmatova", number: "5641 5890 4860 8230" }
    ];
    savedCards.forEach(c => createCardElement(c.name, c.number));

    function createCardElement(name, number) {
        const el = document.createElement("div");
        el.classList.add("card-item");
        el.innerHTML = `
            <div style="flex:1">
                <div style="font-size:14px;font-weight:600;color:#111">${name}</div>
                <div style="font-size:12px;color:#aaa;margin-top:2px">${number}</div>
            </div>
            <button class="green-b">Оплатить</button>
            <button class="red-b" title="Удалить">✕</button>
        `;
        cardInfo.appendChild(el);

        el.querySelector(".green-b").addEventListener("click", function (e) {
            e.stopPropagation();
            document.querySelectorAll(".card-item").forEach(c => c.classList.remove("selected"));
            el.classList.add("selected");
            document.getElementById("sumRecipientName").innerText = name;
            document.getElementById("sumRecipientCard").innerText = number;
            homeSection.style.display = "none";
            sumSection.style.display = "block";
        });

        el.querySelector(".red-b").addEventListener("click", function (e) {
            e.stopPropagation();
            el.remove();
            let cards = JSON.parse(localStorage.getItem("cards")) || [];
            cards = cards.filter(c => c.number !== number);
            localStorage.setItem("cards", JSON.stringify(cards));
        });

        el.addEventListener("click", function () {
            document.querySelectorAll(".card-item").forEach(c => c.classList.remove("selected"));
            el.classList.add("selected");
        });
    }

    // Add card toggle
    document.getElementById("createBtn").addEventListener("click", function () {
        const f = document.getElementById("addCardForm");
        f.style.display = f.style.display === "none" ? "block" : "none";
    });

    document.getElementById("addCardBtn").addEventListener("click", function () {
        const name = document.getElementById("cardName").value.trim();
        const number = document.getElementById("cardNumber").value.trim();
        if (!name || !number) { alert("Введите имя и номер карты!"); return; }
        createCardElement(name, number);
        const cards = JSON.parse(localStorage.getItem("cards")) || [];
        cards.push({ name, number });
        localStorage.setItem("cards", JSON.stringify(cards));
        document.getElementById("cardName").value = "";
        document.getElementById("cardNumber").value = "";
        document.getElementById("addCardForm").style.display = "none";
    });

    // Back from sum
    document.getElementById("backFromSum").addEventListener("click", function () {
        sumSection.style.display = "none";
        homeSection.style.display = "block";
    });

    // Proceed to confirm
    document.getElementById("proceedBtn").addEventListener("click", function () {
        const rawSum = document.getElementById("sumInput").value.trim();
        if (!rawSum || isNaN(rawSum) || parseInt(rawSum) <= 0) {
            alert("Введите корректную сумму!");
            return;
        }
        const formatted = parseInt(rawSum, 10).toLocaleString("ru-RU");
        const name = document.getElementById("sumRecipientName").innerText;
        const card = document.getElementById("sumRecipientCard").innerText;

        document.getElementById("confirmAmount").innerHTML = `${formatted} <span class="ab-confirm-currency">UZS</span>`;
        document.getElementById("confirmName").innerText = name;
        document.getElementById("confirmCard").innerText = card;

        sumSection.style.display = "none";
        paymentSection.style.display = "block";
    });

    // Back from payment
    document.getElementById("backFromPayment").addEventListener("click", function () {
        paymentSection.style.display = "none";
        sumSection.style.display = "block";
    });

    // Show check (icon click)
    document.querySelectorAll(".icon").forEach(icon => {
        icon.addEventListener("click", function () {
            showCheck();
        });
    });

    function showCheck() {
        const name = document.getElementById("confirmName").innerText;
        const card = document.getElementById("confirmCard").innerText;
        const amountRaw = document.getElementById("confirmAmount").innerText.replace(/\D/g, "");
        const formatted = parseInt(amountRaw, 10).toLocaleString("ru-RU");
        const last4 = card.replace(/\s/g, "").slice(-4);

        const now = new Date();
        const pad = n => String(n).padStart(2, "0");
        const dateStr = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

        const txId = Array.from({length: 36}, (_, i) => {
            if ([8,13,18,23].includes(i)) return "-";
            return Math.floor(Math.random()*16).toString(16);
        }).join("");

        document.getElementById("checkAmountDisplay").innerText = formatted;
        document.getElementById("checkRecipientNameTop").innerText = name.split(" ")[0].toUpperCase();
        document.getElementById("checkCardLast4").innerText = last4;
        document.getElementById("checkDatetime").innerText = dateStr;
        document.getElementById("detailRecipientName").innerText = name;
        document.getElementById("detailRecipientCard").innerText = card;
        document.getElementById("detailDatetime").innerText = dateStr;
        document.getElementById("detailTxId").innerText = txId;
        document.getElementById("detailAmount").innerText = formatted + ",00 UZS";
        document.getElementById("detailTotal").innerText = formatted + ",00 UZS";
        document.getElementById("detailsPanel").style.display = "none";

        paymentSection.style.display = "none";
        checkSection.style.display = "block";
    }

    // Toggle details
    document.getElementById("toggleDetails").addEventListener("click", function () {
        const p = document.getElementById("detailsPanel");
        p.style.display = p.style.display === "none" ? "block" : "none";
    });

    // Done button on check → home
    document.getElementById("checkDoneBtn").addEventListener("click", function () {
        const name = document.getElementById("detailRecipientName").innerText;
        const card = document.getElementById("detailRecipientCard").innerText;
        const amount = document.getElementById("checkAmountDisplay").innerText + ",00";
        const time = document.getElementById("checkDatetime").innerText;
        addToHistory(name, card, amount, time);

        checkSection.style.display = "none";
        homeSection.style.display = "block";
        document.getElementById("sumInput").value = "";
    });

    // Repeat
    document.getElementById("checkRepeatBtn").addEventListener("click", function () {
        checkSection.style.display = "none";
        sumSection.style.display = "block";
    });

    // Final button (Готово) on confirm → save & home
    document.querySelector(".final-b").addEventListener("click", function () {
        const name = document.getElementById("confirmName").innerText;
        const card = document.getElementById("confirmCard").innerText;
        const amountRaw = document.getElementById("confirmAmount").innerText.replace(/\D/g, "");
        const formatted = parseInt(amountRaw, 10).toLocaleString("ru-RU");
        const now = new Date();
        const pad = n => String(n).padStart(2, "0");
        const time = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
        addToHistory(name, card, formatted + ",00", time);

        paymentSection.style.display = "none";
        homeSection.style.display = "block";
        document.getElementById("sumInput").value = "";
    });

    // History
    document.getElementById("historyBtn").addEventListener("click", function () {
        homeSection.style.display = "none";
        historySection.style.display = "block";
        renderHistory();
    });

    document.getElementById("backToHome").addEventListener("click", function () {
        historySection.style.display = "none";
        homeSection.style.display = "block";
    });

    document.getElementById("clearHistory").addEventListener("click", function () {
        if (confirm("Очистить всю историю?")) {
            localStorage.removeItem("paymentHistory");
            renderHistory();
        }
    });

    function addToHistory(name, card, amount, time) {
        const h = JSON.parse(localStorage.getItem("paymentHistory")) || [];
        h.unshift({ name, card, amount, time });
        localStorage.setItem("paymentHistory", JSON.stringify(h));
    }

    function renderHistory() {
        historyList.innerHTML = "";
        const h = JSON.parse(localStorage.getItem("paymentHistory")) || [];
        if (h.length === 0) {
            historyList.innerHTML = `<p style="text-align:center;color:#aaa;padding:20px">История пуста</p>`;
            return;
        }
        h.forEach(entry => {
            const item = document.createElement("div");
            item.classList.add("history-item");
            item.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                    <div>
                        <div class="hi-name">${entry.name}</div>
                        <div class="hi-card">${entry.card}</div>
                        <div class="hi-time">${entry.time}</div>
                    </div>
                    <div class="hi-amount">${entry.amount} UZS</div>
                </div>
            `;
            historyList.appendChild(item);
        });
    }
});
