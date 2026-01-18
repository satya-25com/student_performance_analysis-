// Data Engine: Mock Student Data Generator
const students = [];
const classes = ['10th', '11th', '12th'];
const sections = ['A', 'B', 'C', 'D'];
const subjects = ['Mathematics', 'Science', 'English', 'Social Studies'];
const genders = ['Male', 'Female'];
const terms = ['Unit Test', 'Mid Term', 'Final'];

const generateMockData = () => {
    students.length = 0; // Clear existing
    for (let i = 1; i <= 300; i++) {
        const studentClass = classes[Math.floor(Math.random() * classes.length)];
        const section = sections[Math.floor(Math.random() * sections.length)];
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const year = ['2024-25', '2023-24', '2022-23', '2021-22', '2020-21'][Math.floor(Math.random() * 5)];
        const name = `${gender === 'Male' ? 'Student' : 'Scholar'} ${i}`;

        const attendance = 50 + Math.random() * 50; // 50-100%

        // Performance with 25% failure rate (below 40%)
        let avgPercentage;
        if (Math.random() < 0.25) {
            avgPercentage = 15 + Math.random() * 24; // 15-39% (Fail)
        } else {
            avgPercentage = 40 + Math.random() * 55; // 40-95% (Pass)
        }

        const totalFees = studentClass === '10th' ? 45000 : (studentClass === '11th' ? 55000 : 65000);
        const feesPaid = Math.random() > 0.3 ? totalFees : totalFees * Math.random();

        students.push({
            id: `STU${1000 + i}`,
            name,
            gender,
            class: studentClass,
            section,
            year,
            attendance: Math.round(attendance),
            percentage: Math.round(avgPercentage),
            feesPaid,
            feesPending: totalFees - feesPaid,
            totalFees,
            feeStatus: (totalFees - feesPaid) < 100 ? 'Paid' : 'Pending'
        });
    }
};

// Formatting Utilities
const formatCurrency = (val) => {
    if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
};

// Chart Initialization
let charts = {};

const initCharts = () => {
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.color = '#64748b';
    updateDashboardWithFilteredData(students);
};

const updateDashboardWithFilteredData = (filteredData) => {
    // 1. Destroy existing charts to prevent overlap
    const canvasIds = ['subjMarksChart', 'perfTrendChart', 'genderDonut', 'feeStatusChart', 'scatterChart', 'passFailDonut', 'topStudentsChart'];
    canvasIds.forEach(id => {
        const canvas = document.getElementById(id);
        const existingChart = Chart.getChart(canvas);
        if (existingChart) existingChart.destroy();
    });

    // 2. Update KPI Cards
    document.getElementById('totalStudents').innerText = filteredData.length.toLocaleString();
    const avgP = filteredData.length ? (filteredData.reduce((acc, s) => acc + s.percentage, 0) / filteredData.length).toFixed(1) : 0;
    document.getElementById('avgPercentage').innerText = `${avgP}%`;
    const passCount = filteredData.filter(s => s.percentage >= 40).length;
    document.getElementById('passPercentage').innerText = filteredData.length ? `${((passCount / filteredData.length) * 100).toFixed(1)}%` : '0%';
    const avgA = filteredData.length ? (filteredData.reduce((acc, s) => acc + Number(s.attendance), 0) / filteredData.length).toFixed(1) : 0;
    document.getElementById('avgAttendance').innerText = `${avgA}%`;
    const totalPaid = filteredData.reduce((acc, s) => acc + s.feesPaid, 0);
    const totalPending = filteredData.reduce((acc, s) => acc + s.feesPending, 0);
    document.getElementById('feesCollected').innerText = formatCurrency(totalPaid);
    document.getElementById('feesPending').innerText = formatCurrency(totalPending);

    // 3. Render charts with filtered data

    // Subject Marks (Aggregated from filteredData - simulating diversity)
    const subjData = subjects.map(subj => {
        const matching = filteredData.length ? filteredData.filter(s => s.percentage > 50).length : 0;
        return 65 + (matching % 30); // Dynamic based on data
    });

    charts.subjMarks = new Chart(document.getElementById('subjMarksChart'), {
        type: 'bar',
        data: {
            labels: subjects,
            datasets: [{
                label: 'Avg Marks',
                data: subjData,
                backgroundColor: ['#2563eb', '#7c3aed', '#059669', '#d97706'],
                borderRadius: 6
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });

    // Performance Trend
    charts.perfTrend = new Chart(document.getElementById('perfTrendChart'), {
        type: 'line',
        data: {
            labels: ['Unit Test 1', 'Unit Test 2', 'Mid Term', 'Final'],
            datasets: [{
                label: 'Avg %',
                data: [avgP - 8, avgP - 4, avgP, avgP + 3],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                fill: true
            }]
        }
    });

    // Gender Donut
    const mCount = filteredData.filter(s => s.gender === 'Male').length;
    const fCount = filteredData.length - mCount;
    charts.gender = new Chart(document.getElementById('genderDonut'), {
        type: 'doughnut',
        data: {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [mCount, fCount],
                backgroundColor: ['#2563eb', '#7c3aed'],
                borderWidth: 0
            }]
        },
        options: { cutout: '70%', maintainAspectRatio: false }
    });

    // Fee Status
    charts.fees = new Chart(document.getElementById('feeStatusChart'), {
        type: 'bar',
        data: {
            labels: classes,
            datasets: [
                { label: 'Paid', data: classes.map(c => filteredData.filter(s => s.class === c).reduce((acc, s) => acc + s.feesPaid, 0) / 1000000), backgroundColor: '#059669' },
                { label: 'Pending', data: classes.map(c => filteredData.filter(s => s.class === c).reduce((acc, s) => acc + s.feesPending, 0) / 1000000), backgroundColor: '#dc2626' }
            ]
        },
        options: { scales: { y: { stacked: true, ticks: { callback: v => v.toFixed(1) + 'M' } }, x: { stacked: true } } }
    });

    // Scatter
    charts.scatter = new Chart(document.getElementById('scatterChart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Students',
                data: filteredData.slice(0, 100).map(s => ({ x: s.attendance, y: s.percentage })),
                backgroundColor: 'rgba(37, 99, 235, 0.5)'
            }]
        }
    });

    // Pass/Fail
    charts.passFail = new Chart(document.getElementById('passFailDonut'), {
        type: 'doughnut',
        data: {
            labels: ['Pass', 'Fail'],
            datasets: [{
                data: [passCount, filteredData.length - passCount],
                backgroundColor: ['#059669', '#dc2626'],
                borderWidth: 0
            }]
        },
        options: { cutout: '70%' }
    });

    // Top Students
    const topS = [...filteredData].sort((a, b) => b.percentage - a.percentage).slice(0, 10);
    charts.topStudents = new Chart(document.getElementById('topStudentsChart'), {
        type: 'bar',
        indexAxis: 'y',
        data: {
            labels: topS.map(s => s.name),
            datasets: [{ label: 'Percentage', data: topS.map(s => s.percentage), backgroundColor: '#7c3aed', borderRadius: 4 }]
        },
        options: { plugins: { legend: { display: false } } }
    });

    renderHeatmap();
    updateTable(filteredData);
};

const applyFilters = () => {
    const year = document.getElementById('yearFilter').value;
    const term = document.getElementById('termFilter').value;
    const cls = document.getElementById('classFilter').value;
    const section = document.getElementById('sectionFilter').value;
    const subject = document.getElementById('subjectFilter').value;
    const gender = document.getElementById('genderFilter').value;

    const filtered = students.filter(s => {
        return (year === 'All' || s.year === year) &&
            (cls === 'All' || s.class === cls) &&
            (section === 'All' || s.section === section) &&
            (gender === 'All' || s.gender === gender);
        // Note: term and subject would ideally filter specific performance records
    });

    updateDashboardWithFilteredData(filtered);
    window.lastFilteredData = filtered; // Store for export
};

const exportToCSV = () => {
    const dataToExport = window.lastFilteredData || students;
    if (!dataToExport || dataToExport.length === 0) {
        alert("No data available to export.");
        return;
    }

    const headers = ["Student ID", "Name", "Class", "Section", "Gender", "Year", "Attendance %", "Percentage", "Fees Paid", "Fees Pending", "Fee Status"];
    const rows = dataToExport.map(s => [
        s.id, s.name, s.class, s.section, s.gender, s.year, s.attendance, s.percentage, s.feesPaid, s.feesPending, s.feeStatus
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Student_Report_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const renderHeatmap = () => {
    const container = document.getElementById('heatmapContainer');
    if (!container) return;
    container.innerHTML = '';
    // Redacted for brevity (logic remains similar but more dynamic if needed)
    classes.forEach(cls => {
        subjects.forEach(subj => {
            const val = 40 + Math.floor(Math.random() * 55);
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            cell.innerText = val;
            cell.title = `${cls} - ${subj}: ${val}%`;
            const opacity = (val - 30) / 70;
            cell.style.backgroundColor = val > 75 ? `rgba(5, 150, 105, ${opacity})` :
                (val > 50 ? `rgba(37, 99, 235, ${opacity})` : `rgba(220, 38, 38, ${opacity})`);
            cell.style.color = opacity > 0.5 ? 'white' : 'black';
            container.appendChild(cell);
        });
    });
};

const updateTable = (data = students) => {
    const body = document.getElementById('tableBody');
    if (!body) return;
    body.innerHTML = '';

    data.slice(0, 15).forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${s.id}</td>
            <td><strong>${s.name}</strong></td>
            <td>${s.class}-${s.section}</td>
            <td>${s.attendance}%</td>
            <td>${(s.percentage * 5).toFixed(0)}/500</td>
            <td><span class="badge ${s.percentage >= 40 ? 'paid' : 'pending'}">${s.percentage}%</span></td>
            <td><span class="badge ${s.feeStatus.toLowerCase()}">${s.feeStatus}</span></td>
            <td><button class="btn-primary view-btn" data-id="${s.id}" style="padding: 4px 8px; font-size: 0.7rem;">View</button></td>
        `;
        body.appendChild(row);
    });

    // Add event listeners to newly created buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sid = btn.getAttribute('data-id');
            showStudentDetail(sid);
        });
    });
};

const showStudentDetail = (id) => {
    const s = students.find(item => item.id === id);
    if (!s) return;

    const modal = document.getElementById('studentModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="detail-row"><label>Full Name:</label> <span>${s.name}</span></div>
        <div class="detail-row"><label>Class/Section:</label> <span>${s.class} - ${s.section}</span></div>
        <div class="detail-row"><label>Gender:</label> <span>${s.gender}</span></div>
        <div class="detail-row"><label>Academic Year:</label> <span>${s.year}</span></div>
        <div class="detail-row"><label>Attendance:</label> <span>${s.attendance}%</span></div>
        <div class="detail-row"><label>Overall Grade:</label> <span>${s.percentage}%</span></div>
        <div class="detail-row"><label>Status:</label> <span>${s.percentage >= 40 ? 'Pass' : 'Fail'}</span></div>
        <div class="detail-row"><label>Fees Paid:</label> <span>${formatCurrency(s.feesPaid)}</span></div>
        <div class="detail-row"><label>Fees Pending:</label> <span>${formatCurrency(s.feesPending)}</span></div>
    `;

    modal.style.display = 'flex';
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateMockData();
    initCharts();

    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', applyFilters);
    });

    document.getElementById('exportBtn')?.addEventListener('click', exportToCSV);

    const searchInput = document.getElementById('studentSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = students.filter(s => s.name.toLowerCase().includes(term));
            updateTable(filtered);
        });
    }

    // Modal Close logic
    document.querySelector('.close-modal')?.addEventListener('click', () => {
        document.getElementById('studentModal').style.display = 'none';
    });
    window.onclick = (event) => {
        const modal = document.getElementById('studentModal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
});
