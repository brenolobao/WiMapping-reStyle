const startButton = document.getElementById('startButton');
const numGeneralCyclesSelect = document.getElementById('numGeneralCycles');
const numUniqueCyclesSelect = document.getElementById('numUniqueCycles');
const progressDiv = document.getElementById('progress');
const resultsSummaryDiv = document.getElementById('resultsSummary');
const individualChartCanvas = document.getElementById('speedChart');
const generalChartCanvas = document.getElementById('generalCyclesChart');
const downloadReportButton = document.getElementById('downloadReportButton');
const normalModeBtn = document.getElementById('normalModeBtn');
const mappingModeBtn = document.getElementById('mappingModeBtn');
const normalTestSection = document.getElementById('normalTestSection');
const mappingControls = document.getElementById('mappingControls');
const mappingProgress = document.getElementById('mappingProgress');
const currentRoomInput = document.getElementById('currentRoom');
const startMappingTestBtn = document.getElementById('startMappingTestBtn');
const finishMappingBtn = document.getElementById('finishMappingBtn');

const downloadFiles = [
    { url: 'https://brenolobao.github.io/WiMapping/15MBtest.zip', size: 15728640 },
    { url: 'https://brenolobao.github.io/WiMapping/5MBtest.zip', size: 5344622 },
    { url: 'https://brenolobao.github.io/WiMapping/10MBtest.zip', size: 10589104 },
    { url: 'https://brenolobao.github.io/WiMapping/20MBtest.zip', size: 21071670 }
];

let numGeneralCycles = 0;
let numUniqueCycles = 0;
let individualDownloadSpeeds = [];
let generalCycleAverageSpeeds = [];
let individualSpeedChart;
let generalCycleSpeedChart;
let testStartTime;
let finalReportData = {};

let currentMode = 'normal';
let mappingResults = [];

function initializeCharts() {
    if (individualSpeedChart) {
        individualSpeedChart.destroy();
    }
    individualSpeedChart = new Chart(individualChartCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Velocidade de Download (Mbps)',
                data: [],
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#007bff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Download #'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Velocidade (Mbps)'
                    },
                    beginAtZero: true,
                    min: 0
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)} Mbps`;
                        }
                    }
                }
            }
        }
    });

    if (generalCycleSpeedChart) {
        generalCycleSpeedChart.destroy();
    }
    generalCycleSpeedChart = new Chart(generalChartCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Média de Velocidade por Rodada (Mbps)',
                data: [],
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#28a745'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Rodada Geral #'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Média de Velocidade (Mbps)'
                    },
                    beginAtZero: true,
                    min: 0
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)} Mbps`;
                        }
                    }
                }
            }
        }
    });
}

async function measureSpeed() {
    try {
        const randomIndex = Math.floor(Math.random() * downloadFiles.length);
        const { url: fileUrl, size: fileSizeInBytes } = downloadFiles[randomIndex];

        const startTime = performance.now();
        const response = await fetch(fileUrl + '?cacheBuster=' + new Date().getTime());

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const endTime = performance.now();

        const downloadTimeMs = endTime - startTime;

        const speedBps = (downloadTimeMs > 0) ? (fileSizeInBytes / (downloadTimeMs / 1000)) : (fileSizeInBytes * 1000);

        return speedBps;
    } catch (error) {
        console.error("Erro ao medir a velocidade:", error);
        return 0;
    }
}

async function startNormalTest() {
    startButton.disabled = true;
    numGeneralCyclesSelect.disabled = true;
    numUniqueCyclesSelect.disabled = true;
    downloadReportButton.style.display = 'none';
    resultsSummaryDiv.innerHTML = '';

    numGeneralCycles = parseInt(numGeneralCyclesSelect.value);
    numUniqueCycles = parseInt(numUniqueCyclesSelect.value);
    individualDownloadSpeeds = [];
    generalCycleAverageSpeeds = [];
    testStartTime = performance.now();
    finalReportData = {};

    progressDiv.textContent = `Preparando teste...`;

    initializeCharts();
    let totalDownloadsCompleted = 0;

    for (let g = 0; g < numGeneralCycles; g++) {
        let currentGeneralCycleSpeeds = [];
        for (let u = 0; u < numUniqueCycles; u++) {
            totalDownloadsCompleted++;
            progressDiv.textContent = `Rodada ${g + 1}/${numGeneralCycles} - Download ${u + 1}/${numUniqueCycles} (${totalDownloadsCompleted} total)`;

            const currentSpeedBps = await measureSpeed();
            individualDownloadSpeeds.push(currentSpeedBps);
            currentGeneralCycleSpeeds.push(currentSpeedBps);

            const speedMbps = (currentSpeedBps * 8) / (1024 * 1024);

            individualSpeedChart.data.labels.push(`#${totalDownloadsCompleted}`);
            individualSpeedChart.data.datasets[0].data.push(speedMbps);
            individualSpeedChart.update();
        }

        if (currentGeneralCycleSpeeds.length > 0) {
            const validGeneralCycleSpeeds = currentGeneralCycleSpeeds.filter(speed => speed > 0);
            if (validGeneralCycleSpeeds.length > 0) {
                const averageGeneralSpeedBps = validGeneralCycleSpeeds.reduce((sum, speed) => sum + speed, 0) / validGeneralCycleSpeeds.length;
                const averageGeneralSpeedMbps = (averageGeneralSpeedBps * 8) / (1024 * 1024);
                generalCycleAverageSpeeds.push(averageGeneralSpeedMbps);

                generalCycleSpeedChart.data.labels.push(`Rodada ${g + 1}`);
                generalCycleSpeedChart.data.datasets[0].data.push(averageGeneralSpeedMbps);
                generalCycleSpeedChart.update();
            } else {
                generalCycleAverageSpeeds.push(0);
                generalCycleSpeedChart.data.labels.push(`Rodada ${g + 1}`);
                generalCycleSpeedChart.data.datasets[0].data.push(0);
                generalCycleSpeedChart.update();
            }
        }
    }

    finalizeNormalTest();
}

function finalizeNormalTest() {
    const totalTestTimeMs = performance.now() - testStartTime;
    const totalTestTimeSeconds = (totalTestTimeMs / 1000).toFixed(2);

    startButton.disabled = false;
    numGeneralCyclesSelect.disabled = false;
    numUniqueCyclesSelect.disabled = false;
    progressDiv.textContent = `Teste concluído em ${totalTestTimeSeconds} segundos.`;

    let finalOverallAverage = 0;

    if (individualDownloadSpeeds.length > 0) {
        const validIndividualSpeeds = individualDownloadSpeeds.filter(speed => speed > 0);

        if (validIndividualSpeeds.length > 0) {
            const speedsMbps = validIndividualSpeeds.map(speedBps => (speedBps * 8) / (1024 * 1024));

            const bestSpeed = Math.max(...speedsMbps);
            const worstSpeed = Math.min(...speedsMbps);
            const averageSpeed = speedsMbps.reduce((sum, speed) => sum + speed, 0) / speedsMbps.length;

            resultsSummaryDiv.innerHTML = `
                        <h2>Resultados Finais (Todos os Downloads)</h2>
                        <p>Total de Downloads Realizados: <strong>${individualDownloadSpeeds.length}</strong></p>
                        <p>Melhor Velocidade Individual: <strong>${bestSpeed.toFixed(2)} Mbps</strong></p>
                        <p>Pior Velocidade Individual: <strong>${worstSpeed.toFixed(2)} Mbps</strong></p>
                        <p>Velocidade Média Geral: <strong>${averageSpeed.toFixed(2)} Mbps</strong></p>
                    `;

            finalReportData.totalDownloads = individualDownloadSpeeds.length;
            finalReportData.bestIndividualSpeed = bestSpeed.toFixed(2);
            finalReportData.worstIndividualSpeed = worstSpeed.toFixed(2);
            finalReportData.averageOverallSpeed = averageSpeed.toFixed(2);

        } else {
            resultsSummaryDiv.innerHTML = '<p>Não foi possível obter medições válidas de download.</p>';
        }
    } else {
        resultsSummaryDiv.innerHTML = '<p>Nenhuma medição de velocidade de download realizada.</p>';
    }

    if (generalCycleAverageSpeeds.length > 0) {
        const validGeneralAverages = generalCycleAverageSpeeds.filter(speed => speed > 0);
        if (validGeneralAverages.length > 0) {
            finalOverallAverage = validGeneralAverages.reduce((sum, speed) => sum + speed, 0) / validGeneralAverages.length;
            resultsSummaryDiv.innerHTML += `
                        <h3>Média das Rodadas Gerais: <strong>${finalOverallAverage.toFixed(2)} Mbps</strong></h3>
                    `;
            finalReportData.averageGeneralCycles = finalOverallAverage.toFixed(2);
            finalReportData.generalCycleAverages = generalCycleAverageSpeeds.map((speed, index) => `Rodada ${index + 1}: ${speed.toFixed(2)} Mbps`);
        }
    }
    finalReportData.testDuration = totalTestTimeSeconds;
    finalReportData.numGeneralCycles = numGeneralCycles;
    finalReportData.numUniqueCycles = numUniqueCycles;
    finalReportData.isMappingTest = false;

    downloadReportButton.style.display = 'block';
}

async function startMappingFlow() {
    mappingResults = [];
    finishMappingBtn.style.display = 'none';
    resultsSummaryDiv.innerHTML = '';

    numGeneralCyclesSelect.disabled = false;
    numUniqueCyclesSelect.disabled = false;

    numGeneralCyclesSelect.value = "1";
    numUniqueCyclesSelect.value = "5";

    numGeneralCyclesSelect.disabled = true;
    numUniqueCyclesSelect.disabled = true;

    mappingProgress.textContent = "Para iniciar o mapeamento, digite o nome do cômodo (ex: 'Roteador') e clique em 'Realizar Teste neste Cômodo'.";
    currentRoomInput.value = '';
    currentRoomInput.focus();
    startMappingTestBtn.disabled = false;
    generalCycleAverageSpeeds = [];
    testStartTime = performance.now();
}

async function performRoomTest() {
    const roomName = currentRoomInput.value.trim();
    if (!roomName) {
        alert("Por favor, digite o nome do cômodo.");
        currentRoomInput.focus();
        return;
    }

    startMappingTestBtn.disabled = true;
    finishMappingBtn.disabled = true;
    progressDiv.textContent = `Realizando teste de velocidade em "${roomName}"...`;

    numGeneralCycles = 1;
    numUniqueCycles = parseInt(numUniqueCyclesSelect.value);

    individualDownloadSpeeds = [];

    individualSpeedChart.data.labels = [];
    individualSpeedChart.data.datasets[0].data = [];
    individualSpeedChart.update();


    let currentRoomTotalSpeedBps = 0;
    let currentRoomValidDownloads = 0;
    let currentRoomIndividualSpeedsMbps = [];

    for (let u = 0; u < numUniqueCycles; u++) {
        progressDiv.textContent = `Teste em "${roomName}": Download ${u + 1}/${numUniqueCycles}`;
        const currentSpeedBps = await measureSpeed();

        if (currentSpeedBps > 0) {
            currentRoomTotalSpeedBps += currentSpeedBps;
            currentRoomValidDownloads++;
        }

        const speedMbps = (currentSpeedBps * 8) / (1024 * 1024);
        currentRoomIndividualSpeedsMbps.push(speedMbps);

        individualSpeedChart.data.labels.push(`D ${u + 1} (${roomName})`);
        individualSpeedChart.data.datasets[0].data.push(speedMbps);
        individualSpeedChart.update();
    }

    let roomAverageSpeedMbps = 0;
    if (currentRoomValidDownloads > 0) {
        const roomAverageSpeedBps = currentRoomTotalSpeedBps / currentRoomValidDownloads;
        roomAverageSpeedMbps = (roomAverageSpeedBps * 8) / (1024 * 1024);
    }

    generalCycleSpeedChart.data.labels.push(roomName);
    generalCycleSpeedChart.data.datasets[0].data.push(roomAverageSpeedMbps);
    generalCycleSpeedChart.update();

    mappingResults.push({
        room: roomName,
        speed: roomAverageSpeedMbps.toFixed(2),
        individualSpeeds: currentRoomIndividualSpeedsMbps
    });

    mappingProgress.textContent = `Teste em "${roomName}" (${roomAverageSpeedMbps.toFixed(2)} Mbps) concluído! Agora, vá para outro cômodo, digite o nome e clique em 'Realizar Teste neste Cômodo', ou clique em 'Finalizar Mapeamento'.`;
    currentRoomInput.value = '';
    currentRoomInput.focus();

    startMappingTestBtn.disabled = false;
    finishMappingBtn.style.display = 'block';
    finishMappingBtn.disabled = false;
    progressDiv.textContent = `Teste de cômodo concluído.`;
}

function finalizeMappingTest() {
    finalReportData.isMappingTest = true;
    finalReportData.mappingResults = mappingResults;
    finalReportData.testDuration = ((performance.now() - testStartTime) / 1000).toFixed(2);

    resultsSummaryDiv.innerHTML = `
                <h2>Mapeamento de Sinal Concluído!</h2>
                <p>O relatório detalhado estará no PDF.</p>
                <p>Total de cômodos testados: <strong>${mappingResults.length}</strong></p>
                <p>Duração total do mapeamento: <strong>${finalReportData.testDuration} segundos</strong></p>
            `;

    downloadReportButton.style.display = 'block';
    downloadReportButton.disabled = false;

    mappingProgress.textContent = "Mapeamento finalizado. Você pode baixar o relatório ou iniciar um novo mapeamento.";
    startMappingTestBtn.disabled = false;
    finishMappingBtn.style.display = 'none';
    currentRoomInput.value = '';
}

function downloadImage(canvas, filename) {
    if (!canvas || !canvas.getContext) {
        console.error("Canvas inválido para download da imagem.");
        return;
    }

    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function generatePdfReport() {
    downloadReportButton.disabled = true;
    downloadReportButton.textContent = 'Gerando...';

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    doc.setFontSize(18);
    doc.text("Relatório de Teste de Velocidade da Internet", pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(12);
    doc.text(`Data do Teste: ${new Date().toLocaleString('pt-BR')}`, margin, yPos);
    yPos += 10;
    doc.text(`Duração Total do Teste: ${finalReportData.testDuration || 'N/A'} segundos`, margin, yPos);
    yPos += 15;

    if (finalReportData.isMappingTest) {
        doc.setFontSize(16);
        doc.text("Relatório de Mapeamento de Sinal Wi-Fi", margin, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.text(`Total de Cômodos Testados: ${finalReportData.mappingResults ? finalReportData.mappingResults.length : 'N/A'}`, margin, yPos);
        yPos += 15;

        doc.setFontSize(14);
        doc.text("Detalhes de Velocidade por Cômodo:", margin, yPos);
        yPos += 10;

        for (const result of finalReportData.mappingResults) {
            if (yPos + 20 > doc.internal.pageSize.height) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(12);
            doc.text(`Cômodo: ${result.room} - Velocidade Média: ${result.speed} Mbps`, margin, yPos);
            yPos += 8;
        }

        yPos += 15;
    } else {
        doc.setFontSize(12);
        doc.text(`Configuração do Teste: ${finalReportData.numGeneralCycles || 'N/A'} Rodadas Gerais, ${finalReportData.numUniqueCycles || 'N/A'} Downloads por Rodada`, margin, yPos);
        yPos += 15;

        doc.setFontSize(16);
        doc.text("Resultados Finais (Todos os Downloads)", margin, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.text(`Total de Downloads Realizados: ${finalReportData.totalDownloads || 'N/A'}`, margin, yPos);
        yPos += 10;
        doc.text(`Melhor Velocidade Individual: ${finalReportData.bestIndividualSpeed || 'N/A'} Mbps`, margin, yPos);
        yPos += 10;
        doc.text(`Pior Velocidade Individual: ${finalReportData.worstIndividualSpeed || 'N/A'} Mbps`, margin, yPos);
        yPos += 10;
        doc.text(`Velocidade Média Geral: ${finalReportData.averageOverallSpeed || 'N/A'} Mbps`, margin, yPos);
        yPos += 15;

        if (finalReportData.averageGeneralCycles) {
            doc.setFontSize(14);
            doc.text(`Média de Todas as Rodadas: ${finalReportData.averageGeneralCycles} Mbps`, margin, yPos);
            yPos += 15;
        }
    }

    doc.save("Relatorio_Teste_Velocidade.pdf");

    setTimeout(() => {
        if (!finalReportData.isMappingTest) {
            if (individualSpeedChart) {
                downloadImage(individualChartCanvas, 'grafico_velocidade_individual.png');
            }
        }

        setTimeout(() => {
            if (generalCycleSpeedChart) {
                downloadImage(generalChartCanvas, 'grafico_medias_gerais.png');
            }
        }, 500);
    }, 500);

    downloadReportButton.disabled = false;
    downloadReportButton.textContent = '';
}

function setMode(mode) {
    currentMode = mode;
    if (mode === 'normal') {
        normalModeBtn.classList.add('active');
        mappingModeBtn.classList.remove('active');
        normalTestSection.style.display = 'block';
        mappingControls.style.display = 'none';
        startButton.style.display = 'block';
        downloadReportButton.style.display = 'none';
        resultsSummaryDiv.innerHTML = '';

        numGeneralCyclesSelect.disabled = false;
        numUniqueCyclesSelect.disabled = false;

        document.getElementById('chartContainer').style.display = 'block';
        document.getElementById('generalCyclesChartContainer').style.display = 'block';


    } else {
        normalModeBtn.classList.remove('active');
        mappingModeBtn.classList.add('active');
        normalTestSection.style.display = 'none';
        mappingControls.style.display = 'block';
        startButton.style.display = 'none';
        downloadReportButton.style.display = 'none';
        resultsSummaryDiv.innerHTML = '';

        document.getElementById('chartContainer').style.display = 'block';
        document.getElementById('generalCyclesChartContainer').style.display = 'block';

        startMappingFlow();
    }
    initializeCharts();
}

normalModeBtn.addEventListener('click', () => setMode('normal'));
mappingModeBtn.addEventListener('click', () => setMode('mapping'));
startButton.addEventListener('click', startNormalTest);
startMappingTestBtn.addEventListener('click', performRoomTest);
finishMappingBtn.addEventListener('click', finalizeMappingTest);
downloadReportButton.addEventListener('click', generatePdfReport);

setMode('normal');
initializeCharts();
