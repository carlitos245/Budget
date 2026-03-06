  //💻 Script principal 
  
  // 📂 Listes d'options pour chaque catégorie
  const habitationOptions = ["Loyer", "EDF", "Courses", "Téléphone", "Ecole", "Autre"];
  const transportOptions = ["Essence", "Assurance", "Ticket stationement", "Carte Navigo", "Autre"];
  const loisirsOptions = ["Cinéma", "Restaurant", "Voyage", "week end", "Activité sportive", "Autre"];
  const epargneOptions = ["Livret A", "PEA", "Crypto", "Épargne retraite", "Assurance vie", "Autres"];

  // 🔐 Fonctions de sécurité
  function sanitize(text) {
    return text.replace(/[<>]/g, "");
  }

  function isValidAmount(value) {
    return /^\d+(\.\d{1,2})?$/.test(value);
  }

  function isValidText(value) {
    return /^[\wÀ-ÿ \-']+$/.test(value);
  }

  // 🔗 Références DOM
  const tableBody = document.getElementById("tableBody");
  const totalDisplay = document.getElementById("totalDisplay");
  const revenuInput = document.getElementById("revenu");
  const budgetInput = document.getElementById("budgetInput");

  // Effacer automatiquement le 0
 revenuInput.addEventListener("focus", () => {
  if (revenuInput.value === "0") {
    revenuInput.value = "";
  }
});
 
// Remettre 0 si l’utilisateur sort
revenuInput.addEventListener("blur", () => {
  if (revenuInput.value.trim() === "") {
    revenuInput.value = "0";
  }
});

  let pieChart;

  // 🧱 Création d'une cellule avec menu déroulant + champ de saisie
  function createCategoryCell(optionsArray, rowIndex, colName) {
    const cell = document.createElement("td");

    const select = document.createElement("select");
    optionsArray.forEach(opt => {
      const safeOpt = sanitize(opt);
      const option = document.createElement("option");
      option.value = safeOpt;
      option.textContent = safeOpt;
      select.appendChild(option);
    });

    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = "€";
    input.value = "0";
    input.max = "1000000";  // ✅ Limite maximale autorisée
    input.setAttribute("maxlength", "7"); // ✅ Limite 6
    
    // 🔁 Restauration des valeurs sauvegardées
    const savedSelect = localStorage.getItem(`select_${rowIndex}_${colName}`);
    const savedInput = localStorage.getItem(`input_${rowIndex}_${colName}`);
    if (savedSelect) select.value = savedSelect;
    if (savedInput) input.value = savedInput;

    // 💾 Sauvegarde + validation
    select.addEventListener("change", () => {
      if (!isValidText(select.value)) {
        alert("Caractère non autorisé dans la sélection !");
        select.value = optionsArray[0];
      }
      localStorage.setItem(`select_${rowIndex}_${colName}`, select.value);
    });

// Limite la longueur à 7 caractères
input.addEventListener("input", () => {
  if (input.value.length > 7) {
    input.value = input.value.slice(0, 7);
  }
});

// Vide le champ si la valeur est "0" au focus
input.addEventListener("focus", () => {
  if (input.value === "0") {
    input.value = "";
  }
});

// Valide et remet "0" si vide au blur
input.addEventListener("blur", () => {
  if (input.value === "") {
    input.value = "0";
  }

  if (!isValidAmount(input.value)) {
    alert("Veuillez entrer un montant valide (ex: 120.50)");
    input.value = "0";
  }

  const value = parseFloat(input.value);

  if (value > 1000000) {
    alert("Le montant ne peut pas dépasser 1 000 000 €");
    input.value = "1000000";
  }

  if (value < 0) {
    alert("Le montant ne peut pas être négatif");
    input.value = "0";
  }

  localStorage.setItem(`input_${rowIndex}_${colName}`, input.value);
  updateTotals();
});

cell.appendChild(select);
cell.appendChild(document.createElement("br"));
cell.appendChild(input);
return { cell, input };

}

  // 🧮 Calcul des totaux
  function updateTotals() {
    let totalGeneral = 0;
    for (let i = 0; i < 6; i++) {
      const row = tableBody.rows[i];
      let rowTotal = 0;
      for (let j = 1; j <= 4; j++) {
        const input = row.cells[j].querySelector("input");
        const value = parseFloat(input.value) || 0;
        rowTotal += value;
      }
      row.cells[5].textContent = rowTotal.toFixed(2) + " €";
      totalGeneral += rowTotal;
    }
    totalDisplay.textContent = "Total général : " + totalGeneral.toFixed(2) + " €";
    updateChart();
    calculerTotal();
  }

  // 📊 Mise à jour du graphique
  function updateChart() {
    const categories = ["Habitation", "Transport", "Loisirs", "Épargne"];
    const totals = [0, 0, 0, 0];
    for (let i = 0; i < 6; i++) {
      const row = tableBody.rows[i];
      for (let j = 1; j <= 4; j++) {
        const input = row.cells[j].querySelector("input");
        const value = parseFloat(input.value) || 0;
        totals[j - 1] += value;
      }
    }

    if (pieChart) {
      pieChart.data.datasets[0].data = totals;
      pieChart.update();
    } else {
      const ctx = document.getElementById("pieChart").getContext("2d");
      pieChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: categories,
          datasets: [{
            data: totals,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
            title: { display: true, text: "Répartition des dépenses par catégorie" }
          }
        }
      });
    }
  }

  // 🚀 Initialisation au chargement
  window.onload = () => {
    const savedRevenu = localStorage.getItem("revenu");
    const savedBudget = localStorage.getItem("budget");
    if (savedRevenu) revenuInput.value = savedRevenu;
    if (savedBudget) budgetInput.value = savedBudget;

    for (let i = 0; i < 6; i++) {
      const row = document.createElement("tr");
      const lineCell = document.createElement("td");
      lineCell.textContent = i + 1;
      row.appendChild(lineCell);

      const habitation = createCategoryCell(habitationOptions, i, "habitation");
      const transport = createCategoryCell(transportOptions, i, "transport");
      const loisirs = createCategoryCell(loisirsOptions, i, "loisirs");
      const epargne = createCategoryCell(epargneOptions, i, "epargne");

      row.appendChild(habitation.cell);
      row.appendChild(transport.cell);
      row.appendChild(loisirs.cell);
      row.appendChild(epargne.cell);

      const totalCell = document.createElement("td");
      totalCell.textContent = "0 €";
      row.appendChild(totalCell);

      tableBody.appendChild(row);
    }

    updateTotals();
  };

  // 🔄 Réinitialisation
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Voulez-vous vraiment tout réinitialiser ?")) {
      localStorage.clear();
      location.reload();
    }
  });

  // 📄 Export PDF sécurisé
  document.getElementById("pdfBtn").addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;
    doc.setFontSize(14);
    doc.text("Résumé du budget", 10, y);
    y += 10;
    
    // ✅ Ajouter la date du jour dans le PDF
    const date = new Date().toLocaleDateString("fr-FR");
    doc.setFontSize(10);
    doc.text(`Date : ${date}`, 10, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.text(`Revenu mensuel : ${sanitize(revenuInput.value)} €`, 10, y);
    y += 8;
    doc.text(`Objectif de budget : ${sanitize(budgetInput.value)} €`, 10, y);
    y += 10;

    doc.text("Détails par ligne :", 10, y);
    y += 8;

    for (let i = 0; i < 6; i++) {
      const row = tableBody.rows[i];
      let lineText = `Ligne ${i + 1} : `;
      for (let j = 1; j <= 4; j++) {
        const select = sanitize(row.cells[j].querySelector("select").value);
        const input = sanitize(row.cells[j].querySelector("input").value);
        lineText += `${select} - ${input} € | `;
      }
      const total = sanitize(row.cells[5].textContent);
      lineText += `Total : ${total}`;
      doc.text(lineText, 10, y);
      y += 8;
    }

    y += 5;
    doc.text(sanitize(totalDisplay.textContent), 10, y);
    y += 10;

    const canvas = document.getElementById("pieChart");
    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", 10, y, 100, 100);

    doc.save("budget.pdf");
  });

  // 🔍 Calcul du solde
  function calculerTotal() {
    const revenu = parseFloat(revenuInput.value) || 0;
    localStorage.setItem("revenu", revenu);

      let totalDepenses = 0;
  const depensesInputs = document.querySelectorAll("#tableBody input[type='number']");

  depensesInputs.forEach((input, index) => {
    const val = parseFloat(input.value) || 0;
    totalDepenses += val;
    localStorage.setItem("depense_" + index, val); // sauvegarde automatique
  });

  const solde = revenu - totalDepenses;
  totalDisplay.textContent = `Solde restant : ${solde.toFixed(2)} €`;

  if (solde < 0) {
        totalDisplay.classList.add("negative");
    alert("⚠️ Attention : votre solde est négatif !");
  } else {
    totalDisplay.classList.remove("negative");
  }
}





