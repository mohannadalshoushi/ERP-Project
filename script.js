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





// PROBLEM 2: ABC Classification (Simple Version)
function solveProblem2() {
    // Step 1: Get the table and prepare variables
    const table = document.getElementById("abc-table");
    const rows = table.rows; // All rows including header
    const items = []; // To store each item's data
    let totalUsage = 0; // Total dollar usage

    // Step 2: Read data from each row (skip header)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const sku = row.cells[0].querySelector("input").value;
        const desc = row.cells[1].querySelector("input").value;
        const qty = parseFloat(row.cells[2].querySelector("input").value) || 0;
        const value = parseFloat(row.cells[3].querySelector("input").value) || 0;

        const usage = qty * value; // Annual dollar usage
        totalUsage += usage;

        items.push({ sku, desc, usage });
    }

    // Step 3: Sort from highest to lowest
    items.sort((a, b) => b.usage - a.usage);

    // Step 4: Calculate % and assign class
    let cumulative = 0;
    let result = `Total Dollar Usage: $${totalUsage.toFixed(2)}\n\n`;

    items.forEach(item => {
        const percent = (item.usage / totalUsage) * 100;
        cumulative += percent;

        let cls;
        if (cumulative <= 85) cls = "A";
        else if (cumulative <= 96) cls = "B";
        else cls = "C";

        // Simple clean output
        result += `SKU ${item.sku} (${item.desc})\n`;
        result += `  Usage: $${item.usage.toFixed(2)}\n`;
        result += `  % of Total: ${percent.toFixed(1)}%\n`;
        result += `  Cumulative: ${cumulative.toFixed(1)}%\n`;
        result += `  Class: ${cls}\n\n`;
    });

    // Step 5: Show result in a clean way
    document.getElementById("prob2-result").innerHTML = `
        <pre style="font-family: monospace; font-size: 0.9em; line-height: 1.4;">
            ${result}
        </pre>
        <em>Class A: Top 80% of value<br>
        Class B: Next 15%<br>
        Class C: Last 5%</em>
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




// PROBLEM 5: P System (Periodic Review) - FIXED
function solveProblem5() {
    const d = parseFloat(document.getElementById('prob5-d').value);
    const sd = parseFloat(document.getElementById('prob5-sd').value);
    const L = parseFloat(document.getElementById('prob5-L').value);
    const S = parseFloat(document.getElementById('prob5-S').value);
    const H = parseFloat(document.getElementById('prob5-H').value);
    const CSL = parseInt(document.getElementById('prob5-CSL').value);
    const D = parseFloat(document.getElementById('prob5-D').value);

    // Step 1: Calculate EOQ (used to determine P)
    const EOQ = Math.sqrt((2 * D * S) / H); // This is Q
    const P_days = Math.round((EOQ / D) * 260); // Review period in workdays

    // Step 2: Protection interval = P + L
    const P = P_days;
    const protectionInterval = P + L;

    // Std dev during protection interval
    const stdDevP = Math.sqrt(protectionInterval) * sd;

    // Z-score for service level
    const z = getZScore(CSL);
    const safetyStock = z * stdDevP;
    const avgDemandDuringPI = d * protectionInterval;
    const targetInventory = avgDemandDuringPI + safetyStock;

    // Step 3: Total Annual Cost (same formula as Q system)
    // Total Cost = (Q/2)*H + (D/Q)*S + H*SafetyStock
    const totalCost = (EOQ / 2) * H + (D / EOQ) * S + H * safetyStock;

    // Output
    document.getElementById('prob5-result').innerHTML = `
        <strong>Review Period (P):</strong> ${P} workdays<br>
        <strong>EOQ (used to calculate P):</strong> ${EOQ.toFixed(0)} units<br>
        <strong>Protection Interval (P + L):</strong> ${protectionInterval} days<br>
        <strong>Std Dev During Protection Interval:</strong> ${stdDevP.toFixed(1)} units<br>
        <strong>Safety Stock:</strong> ${safetyStock.toFixed(0)} units<br>
        <strong>Target Inventory Level (T):</strong> ${targetInventory.toFixed(0)} units<br>
        <strong>Total Annual Cost:</strong> $${totalCost.toFixed(2)}

    `;
}


/* <br><br> */
//  <strong>Replenishment Decision:</strong><br>
//         Suppose on-hand = 40, scheduled receipt = 440, no backorders.<br>
//         Inventory Position (IP) = 40 + 440 = 480<br>
//         Since IP (480) > T (target), no order needed.<br>
//         If IP < T: Order Quantity = T - IP

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