// Z-Score lookup for service levels
function getZScore(csl) {
    const zTable = {
        80: 0.84, 85: 1.04, 90: 1.28, 92: 1.41, 95: 1.65, 98: 2.05, 99: 2.33
    };
    return zTable[csl] || 1.65;
}

// PROBLEM 1
function solveProblem1() {
    const demand = parseFloat(document.getElementById('prob1-demand').value);
    const shipment = parseFloat(document.getElementById('prob1-shipment').value);
    const lt = parseFloat(document.getElementById('prob1-lt').value);
    const ssWeeks = parseFloat(document.getElementById('prob1-ss').value);
    const value = parseFloat(document.getElementById('prob1-value').value);

    const cycleStock = shipment / 2;
    const pipelineStock = demand * lt;
    const safetyStock = demand * ssWeeks;
    const avgInventory = cycleStock + pipelineStock + safetyStock;
    const totalValue = avgInventory * value;

    document.getElementById('prob1-result').innerHTML = `
        <strong>Cycle Stock:</strong> ${cycleStock} units<br>
        <strong>Pipeline Stock:</strong> ${pipelineStock} units<br>
        <strong>Safety Stock:</strong> ${safetyStock} units<br>
        <strong>Average Aggregate Inventory:</strong> ${avgInventory} units<br>
        <strong>Total Value:</strong> $${totalValue.toFixed(2)}
    `;
}





// PROBLEM 2: ABC Classification
function solveProblem2() {
    const table = document.getElementById("abc-table");
    const rows = table.querySelectorAll("tr").length - 1; // exclude header
    const skus = [];

    let totalDollarUsage = 0;

    // Read all rows
    for (let i = 1; i <= rows; i++) {
        const row = table.rows[i];
        const sku = row.cells[0].querySelector("input").value;
        const desc = row.cells[1].querySelector("input").value;
        const qty = parseFloat(row.cells[2].querySelector("input").value) || 0;
        const value = parseFloat(row.cells[3].querySelector("input").value) || 0;

        const dollarUsage = qty * value;
        totalDollarUsage += dollarUsage;

        skus.push({ sku, desc, qty, value, dollarUsage });
    }

    // Sort by dollar usage (high to low)
    skus.sort((a, b) => b.dollarUsage - a.dollarUsage);

    // Add % and cumulative %
    let cumulative = 0;
    const results = [];
    skus.forEach(item => {
        const pct = (item.dollarUsage / totalDollarUsage) * 100;
        cumulative += pct;
        let cls;
        if (cumulative <= 80) cls = "A";
        else if (cumulative <= 95) cls = "B";
        else cls = "C";

        results.push(`
            <strong>SKU ${item.sku} (${item.desc})</strong>: 
            $${item.dollarUsage.toFixed(2)} (${pct.toFixed(1)}%) → 
            Cumulative: ${cumulative.toFixed(1)}% → 
            <span style="color: ${cls === 'A' ? 'red' : cls === 'B' ? 'blue' : 'green'}">
                Class ${cls}
            </span><br>
        `);
    });

    // Final output
    document.getElementById("prob2-result").innerHTML = `
        <strong>Total Dollar Usage:</strong> $${totalDollarUsage.toFixed(2)}<br><br>
        ${results.join("")}<br>
        <em><strong>Class A</strong>: Top ~80% value<br>
        <strong>Class B</strong>: Next ~15%<br>
        <strong>Class C</strong>: Last ~5%</em>
    `;
}


// PROBLEM 3
function solveProblem3() {
    const D = parseFloat(document.getElementById('prob3-D').value);
    const S = parseFloat(document.getElementById('prob3-S').value);
    const H = parseFloat(document.getElementById('prob3-H').value);

    const EOQ = Math.sqrt((2 * D * S) / H);
    const totalCost = (D / EOQ) * S + (EOQ / 2) * H;

    document.getElementById('prob3-result').innerHTML = `
        <strong>EOQ:</strong> ${EOQ.toFixed(0)} units<br>
        <strong>Total Annual Cost:</strong> $${totalCost.toFixed(2)}
    `;
}

// PROBLEM 4
function solveProblem4() {
    const d = parseFloat(document.getElementById('prob4-d').value);
    const sd = parseFloat(document.getElementById('prob4-sd').value);
    const L = parseFloat(document.getElementById('prob4-L').value);
    const S = parseFloat(document.getElementById('prob4-S').value);
    const H = parseFloat(document.getElementById('prob4-H').value);
    const CSL = parseInt(document.getElementById('prob4-CSL').value);

    const D = d * 5 * 52;
    const EOQ = Math.sqrt((2 * D * S) / H);
    const stdDevLT = Math.sqrt(L) * sd;
    const z = getZScore(CSL);
    const safetyStock = z * stdDevLT;
    const ROP = d * L + safetyStock;
    const totalCost = (EOQ / 2) * H + (D / EOQ) * S + H * safetyStock;

    document.getElementById('prob4-result').innerHTML = `
        <strong>EOQ:</strong> ${EOQ.toFixed(0)} units<br>
        <strong>Reorder Point (ROP):</strong> ${ROP.toFixed(0)} units<br>
        <strong>Safety Stock:</strong> ${safetyStock.toFixed(0)} units<br>
        <strong>Total Annual Cost:</strong> $${totalCost.toFixed(2)}
    `;
}



// PROBLEM 5: P System (Periodic Review)
function solveProblem5() {
    const d = parseFloat(document.getElementById('prob5-d').value);
    const sd = parseFloat(document.getElementById('prob5-sd').value);
    const L = parseFloat(document.getElementById('prob5-L').value);
    const S = parseFloat(document.getElementById('prob5-S').value);
    const H = parseFloat(document.getElementById('prob5-H').value);
    const CSL = parseInt(document.getElementById('prob5-CSL').value);
    const D = parseFloat(document.getElementById('prob5-D').value);

    // Step 1: Use EOQ to find review period P
    const EOQ = Math.sqrt((2 * D * S) / H); // Same as Q system
    const P_days = Math.round((EOQ / D) * 260); // 260 working days/year

    // Protection interval = P + L
    const P = P_days;
    const protectionInterval = P + L;

    // Std dev during protection interval
    const stdDevP = Math.sqrt(protectionInterval) * sd;

    // Z-score for service level
    const z = getZScore(CSL); // Reuse from earlier
    const safetyStock = z * stdDevP;
    const avgDemandDuringPI = d * protectionInterval;
    const targetInventory = avgDemandDuringPI + safetyStock;

    // Total annual cost for P system
    const avgInventory = (d * P / 2) + safetyStock;
    const totalCost = (D / EOQ) * S + avgInventory * H;

    // Output
    document.getElementById('prob5-result').innerHTML = `
        <strong>Review Period (P):</strong> ${P} workdays<br>
        <strong>EOQ (used to calculate P):</strong> ${EOQ.toFixed(0)} units<br>
        <strong>Protection Interval (P + L):</strong> ${protectionInterval} days<br>
        <strong>Std Dev During Protection Interval:</strong> ${stdDevP.toFixed(1)} units<br>
        <strong>Safety Stock:</strong> ${safetyStock.toFixed(0)} units<br>
        <strong>Target Inventory Level (T):</strong> ${targetInventory.toFixed(0)} units<br>
        <strong>Total Annual Cost:</strong> $${totalCost.toFixed(2)}<br><br>

        <strong>Replenishment Decision:</strong><br>
        Suppose on-hand = 40, scheduled receipt = 440, no backorders.<br>
        Inventory Position (IP) = 40 + 440 = 480<br>
        Since IP (480) > T (target), no order needed.<br>
        If IP < T: Order Quantity = T - IP
    `;
}


// PROBLEM 6
function solveProblem6() {
    const d = parseFloat(document.getElementById('prob6-d').value);
    const sd_d = parseFloat(document.getElementById('prob6-sd').value);
    const L = parseFloat(document.getElementById('prob6-L').value);
    const sd_L = parseFloat(document.getElementById('prob6-sL').value);
    const S = parseFloat(document.getElementById('prob6-S').value);
    const H = parseFloat(document.getElementById('prob6-H').value);
    const CSL = parseInt(document.getElementById('prob6-CSL').value);

    const D = d * 365;
    const EOQ = Math.sqrt((2 * D * S) / H);
    const sigma_dl = Math.sqrt(L * sd_d * sd_d + d * d * sd_L * sd_L);
    const z = getZScore(CSL);
    const safetyStock = z * sigma_dl;
    const ROP = d * L + safetyStock;
    const totalCost = (EOQ / 2) * H + (D / EOQ) * S + H * safetyStock;

    document.getElementById('prob6-result').innerHTML = `
        <strong>EOQ:</strong> ${EOQ.toFixed(0)} units<br>
        <strong>Safety Stock:</strong> ${safetyStock.toFixed(0)} units<br>
        <strong>Reorder Point (ROP):</strong> ${ROP.toFixed(0)} units<br>
        <strong>Total Annual Cost:</strong> $${totalCost.toFixed(2)}
    `;
}