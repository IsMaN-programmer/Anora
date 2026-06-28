document.addEventListener("DOMContentLoaded", function () {
    const CORRECT_PIN = "0585";
    let enteredPin = "";

    // Screen elements
    const screens = {
        pin: document.getElementById("pinScreen"),
        home: document.getElementById("homeScreen"),
        transfers: document.getElementById("transfersScreen"),
        payment: document.getElementById("paymentScreen"),
        betweenCards: document.getElementById("betweenCardsScreen"),
        sum: document.getElementById("sumScreen"),
        check: document.getElementById("checkScreen"),
        profile: document.getElementById("profileScreen"),
        monitoring: document.getElementById("monitoringScreen"),
        services: document.getElementById("servicesScreen")
    };
    const bottomNav = document.getElementById("bottomNav");

    const mainTabs = ["home", "transfers", "payment", "monitoring", "services"];

    // ===== BALANCE =====
    if (!localStorage.getItem("anorBalance")) {
        localStorage.setItem("anorBalance", "823.45");
    }

    function getBalance() {
        return parseFloat(localStorage.getItem("anorBalance")) || 0;
    }

    function setBalance(val) {
        localStorage.setItem("anorBalance", val.toFixed(2));
    }

    function updateBalanceDisplay() {
        const bal = getBalance();
        const intPart = Math.floor(bal);
        const formattedInt = intPart.toLocaleString("ru-RU");
        const decPart = (bal % 1).toFixed(2).slice(1);
        const totalEl = document.getElementById("totalBalance");
        const totalDec = document.querySelector(".balance-decimal");
        const cardEl = document.getElementById("cardBalance");
        const cardDec = document.querySelector("#cardsCarousel .cc-decimal");
        const profileEl = document.getElementById("profileBalance");
        if (totalEl) totalEl.innerText = formattedInt;
        if (totalDec) totalDec.innerText = decPart + " UZS";
        if (cardEl) cardEl.innerText = formattedInt;
        if (cardDec) cardDec.innerText = decPart + " UZS";
        if (profileEl) profileEl.innerText = bal.toFixed(2) + " UZS";
    }

    function deductBalance(amount) {
        const bal = getBalance();
        const num = parseFloat(amount) || 0;
        if (num > bal) {
            alert("Недостаточно средств на счету!");
            return false;
        }
        setBalance(bal - num);
        updateBalanceDisplay();
        return true;
    }

    function addBalance(amount) {
        const bal = getBalance();
        const num = parseFloat(amount) || 0;
        setBalance(bal + num);
        updateBalanceDisplay();
    }

    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove("active"));
        if (screens[name]) screens[name].classList.add("active");
        if (mainTabs.includes(name)) {
            bottomNav.style.display = "flex";
        } else {
            bottomNav.style.display = "none";
        }
        window.scrollTo(0, 0);
    }

    // ===== PIN LOGIC =====
    const dots = [
        document.getElementById("dot0"),
        document.getElementById("dot1"),
        document.getElementById("dot2"),
        document.getElementById("dot3")
    ];
    const pinError = document.getElementById("pinError");

    document.querySelectorAll(".pin-key").forEach(btn => {
        btn.addEventListener("click", function () {
            const key = this.dataset.key;
            if (key === "back") {
                enteredPin = "";
                updateDots();
                pinError.classList.remove("show");
            } else if (key === "del") {
                enteredPin = enteredPin.slice(0, -1);
                updateDots();
            } else {
                if (enteredPin.length < 4) {
                    enteredPin += key;
                    updateDots();
                }
                if (enteredPin.length === 4) {
                    setTimeout(checkPin, 200);
                }
            }
        });
    });

    function updateDots() {
        dots.forEach((d, i) => {
            d.classList.toggle("filled", i < enteredPin.length);
        });
    }

    function checkPin() {
        if (enteredPin === CORRECT_PIN) {
            pinError.classList.remove("show");
            updateBalanceDisplay();
            showScreen("home");
        } else {
            pinError.classList.add("show");
            enteredPin = "";
            updateDots();
            dots.forEach(d => {
                d.style.borderColor = "#e74c3c";
                setTimeout(() => d.style.borderColor = "#ccc", 500);
            });
        }
    }

    // ===== BOTTOM NAV =====
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", function () {
            document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
            this.classList.add("active");
            const nav = this.dataset.nav;
            showScreen(nav);
            if (nav === "monitoring") renderMonitoring();
            if (nav === "home") updateBalanceDisplay();
        });
    });

    // ===== PROFILE =====
    document.getElementById("profileBtn").addEventListener("click", () => { updateBalanceDisplay(); showScreen("profile"); });
    document.getElementById("profileBackBtn").addEventListener("click", () => showScreen("home"));

    // ===== TOPUP =====
    document.querySelectorAll(".profile-menu-item[data-action='topup']").forEach(el => {
        el.addEventListener("click", function () {
            const card = document.getElementById("topupCard");
            card.style.display = card.style.display === "none" ? "block" : "none";
        });
    });

    document.querySelectorAll("#topupCard .bc-quick-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            document.getElementById("topupAmount").value = this.dataset.amount;
        });
    });

    document.getElementById("topupConfirmBtn").addEventListener("click", function () {
        const val = document.getElementById("topupAmount").value.trim();
        if (!val || parseFloat(val) <= 0) {
            alert("Введите сумму пополнения!");
            return;
        }
        addBalance(val);
        document.getElementById("topupAmount").value = "";
        document.getElementById("topupCard").style.display = "none";
    });

    // ===== QUICK ACTIONS =====
    document.querySelectorAll(".quick-action").forEach(qa => {
        qa.addEventListener("click", function () {
            const action = this.dataset.action;
            if (action === "transfer" || action === "check") {
                showScreen("transfers");
            } else if (action === "mobile" || action === "exchange") {
                showScreen("transfers");
            }
            document.querySelectorAll(".nav-item").forEach(n => {
                n.classList.toggle("active", n.dataset.nav === "transfers");
            });
        });
    });

    // ===== TRANSFERS =====
    document.querySelectorAll(".transfer-option").forEach(to => {
        to.addEventListener("click", function () {
            const action = this.dataset.action;
            if (action === "between-cards") {
                showScreen("betweenCards");
            }
        });
    });

    // ===== TABS =====
    document.querySelectorAll("#transfersTabBar .tab-btn").forEach(tab => {
        tab.addEventListener("click", function () {
            document.querySelectorAll("#transfersTabBar .tab-btn").forEach(t => t.classList.remove("active"));
            this.classList.add("active");
        });
    });

    document.querySelectorAll(".freq-tab").forEach(tab => {
        tab.addEventListener("click", function () {
            document.querySelectorAll(".freq-tab").forEach(t => t.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // ===== BETWEEN CARDS =====
    document.getElementById("betweenBackBtn").addEventListener("click", () => showScreen("transfers"));

    const bcAmountInput = document.getElementById("bcAmountInput");
    const bcTransferBtn = document.getElementById("bcTransferBtn");

    bcAmountInput.addEventListener("input", function () {
        const val = parseFloat(this.value);
        if (val > 0) {
            bcTransferBtn.classList.remove("disabled");
        } else {
            bcTransferBtn.classList.add("disabled");
        }
    });

    document.querySelectorAll(".bc-quick-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            bcAmountInput.value = this.dataset.amount;
            bcTransferBtn.classList.remove("disabled");
        });
    });

    bcTransferBtn.addEventListener("click", function () {
        if (this.classList.contains("disabled")) return;
        const amount = bcAmountInput.value;
        const numAmt = parseFloat(amount) || 0;
        if (numAmt > getBalance()) {
            alert("Недостаточно средств на счету!");
            return;
        }
        showCheck("ISMANOV SARDOR", "5217 3959 0505 3502", amount);
        showScreen("check");
    });

    // ===== PAYMENT / OLD FLOW =====
    document.getElementById("paymentBackBtn").addEventListener("click", () => showScreen("home"));

    if (!localStorage.getItem("paymentHistory")) {
        const defaultHistory = [
            { name: "Gulchekhra Akbarova", card: "9860 0901 0680 2458", amount: "365 000", time: "24.10.2025 13:38" },
            { name: "Gulchekhra Akbarova", card: "9860 0901 0680 2458", amount: "261 000", time: "23.10.2025 13:21" },
            { name: "Ergashev Saidburhon", card: "5641 5890 4860 8230", amount: "45 000", time: "23.10.2025 15:34" }
        ];
        localStorage.setItem("paymentHistory", JSON.stringify(defaultHistory));
    }

    const savedCards = JSON.parse(localStorage.getItem("cards")) || [
        { name: "Madina Raxmatova", number: "5641 5890 4860 8230" }
    ];
    const cardInfo = document.getElementById("cardInfo");
    savedCards.forEach(c => createCardElement(c.name, c.number));

    function createCardElement(name, number) {
        const el = document.createElement("div");
        el.classList.add("card-item");
        el.innerHTML = '<div style="flex:1"><div style="font-size:14px;font-weight:600;color:#111">' + name + '</div><div style="font-size:12px;color:#aaa;margin-top:2px">' + number + '</div></div><button class="green-b">Оплатить</button><button class="red-b" title="Удалить">✕</button>';
        cardInfo.appendChild(el);

        el.querySelector(".green-b").addEventListener("click", function (e) {
            e.stopPropagation();
            document.querySelectorAll(".card-item").forEach(c => c.classList.remove("selected"));
            el.classList.add("selected");
            document.getElementById("sumRecipientName").innerText = name;
            document.getElementById("sumRecipientCard").innerText = number;
            showScreen("sum");
        });

        el.querySelector(".red-b").addEventListener("click", function (e) {
            e.stopPropagation();
            el.remove();
            let cards = JSON.parse(localStorage.getItem("cards")) || [];
            cards = cards.filter(c => c.number !== number);
            localStorage.setItem("cards", JSON.stringify(cards));
        });
    }

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

    // ===== SUM =====
    document.getElementById("sumBackBtn").addEventListener("click", () => showScreen("payment"));

    document.getElementById("proceedBtn").addEventListener("click", function () {
        const rawSum = document.getElementById("sumInput").value.trim();
        if (!rawSum || isNaN(rawSum) || parseInt(rawSum) <= 0) {
            alert("Введите корректную сумму!");
            return;
        }
        const numSum = parseFloat(rawSum) || 0;
        if (numSum > getBalance()) {
            alert("Недостаточно средств на счету!");
            return;
        }
        const name = document.getElementById("sumRecipientName").innerText;
        const card = document.getElementById("sumRecipientCard").innerText;
        showCheck(name, card, rawSum);
        showScreen("check");
    });

    // ===== CHECK =====
    let lastCheckData = null;

    document.getElementById("checkBackBtn").addEventListener("click", () => showScreen("home"));
    document.getElementById("checkDoneBtn").addEventListener("click", function () {
        if (lastCheckData && !lastCheckData.fromHistory) {
            const amt = lastCheckData.rawAmount;
            if (!deductBalance(amt)) {
                showScreen("home");
                document.getElementById("sumInput").value = "";
                lastCheckData = null;
                renderMonitoring();
                return;
            }
            const h = JSON.parse(localStorage.getItem("paymentHistory")) || [];
            h.unshift(lastCheckData);
            localStorage.setItem("paymentHistory", JSON.stringify(h));
            renderMonitoring();
        }
        showScreen("home");
        document.getElementById("sumInput").value = "";
        lastCheckData = null;
    });

    document.getElementById("checkRepeatBtn").addEventListener("click", function () {
        showScreen("sum");
    });

    document.getElementById("toggleDetails").addEventListener("click", function () {
        const p = document.getElementById("detailsPanel");
        p.style.display = p.style.display === "none" ? "block" : "none";
    });

    function showCheck(name, card, amount) {
        const formatted = parseInt(amount, 10).toLocaleString("ru-RU");
        const last4 = card.replace(/\s/g, "").slice(-4);
        const now = new Date();
        const pad = n => String(n).padStart(2, "0");
        const dateStr = pad(now.getDate()) + "." + pad(now.getMonth() + 1) + "." + now.getFullYear() + " " + pad(now.getHours()) + ":" + pad(now.getMinutes());
        const txId = "15cde282-0520-4b90-95f4-cb1c45b0e908";

        lastCheckData = {
            name: name,
            card: card,
            rawAmount: parseFloat(amount),
            amount: formatted + ",00",
            time: dateStr
        };

        document.getElementById("checkAmountDisplay").innerText = formatted;
        document.getElementById("checkRecipientNameTop").innerText = name.split(" ")[0].toUpperCase();
        document.getElementById("checkCardLast4").innerText = last4;
        document.getElementById("checkDatetime").innerText = dateStr;
        document.getElementById("detailRecipientName").innerText = name;
        document.getElementById("detailRecipientCard").innerText = card;
        document.getElementById("detailSenderName").innerText = "ISMANOV SARDOR";
        document.getElementById("detailDatetime").innerText = dateStr;
        document.getElementById("detailTxId").innerText = txId;
        document.getElementById("detailAmount").innerText = formatted + ",00 UZS";
        document.getElementById("detailTotal").innerText = formatted + ",00 UZS";
        document.getElementById("detailsPanel").style.display = "none";
    }

    // ===== MONITORING =====
    function renderMonitoring() {
        const list = document.getElementById("monitoringList");
        const h = JSON.parse(localStorage.getItem("paymentHistory")) || [];
        if (h.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:#aaa;padding:20px">История пуста</p>';
            return;
        }
        list.innerHTML = "";
        h.forEach((entry, index) => {
            const item = document.createElement("div");
            item.classList.add("monitoring-item");
            item.innerHTML =
                '<div class="mi-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg></div>' +
                '<div class="mi-info">' +
                    '<div class="mi-name">' + entry.name + '</div>' +
                    '<div class="mi-card">' + entry.card + '</div>' +
                    '<div class="mi-time">' + entry.time + '</div>' +
                '</div>' +
                '<div>' +
                    '<div class="mi-amount">' + entry.amount + ' UZS</div>' +
                    '<div class="mi-commission">Без комиссии</div>' +
                '</div>';
            item.addEventListener("click", function () {
                const cleanAmt = entry.rawAmount ? String(entry.rawAmount) : entry.amount.replace(",", ".");
                showCheck(entry.name, entry.card, cleanAmt);
                document.getElementById("checkDatetime").innerText = entry.time;
                document.getElementById("detailDatetime").innerText = entry.time;
                lastCheckData.fromHistory = true;
                showScreen("check");
            });
            list.appendChild(item);
        });
    }
    renderMonitoring();

    // ===== EYE TOGGLE =====
    let balanceHidden = false;
    document.getElementById("eyeToggle").addEventListener("click", function () {
        balanceHidden = !balanceHidden;
        const el = document.getElementById("totalBalance");
        const cardEl = document.getElementById("cardBalance");
        if (balanceHidden) {
            el.dataset.val = el.innerText;
            el.innerText = "****";
            if (cardEl) cardEl.innerText = "****";
        } else {
            el.innerText = el.dataset.val || "823";
            updateBalanceDisplay();
        }
    });

    // Start with PIN screen
    showScreen("pin");
});
