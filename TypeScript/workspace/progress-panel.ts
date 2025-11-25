//-------------------------------------------------------------
// 📌 진행상황 패널 초기화 함수
//-------------------------------------------------------------
// 📌 Chart.js import
import Chart from "chart.js/auto";

export function initProgressPanel(API_BASE: string) {
    console.log("📡 initProgressPanel() 실행");

    // HTML 요소 캐싱
    const dashboardSection = document.getElementById("progressDashboardSection")!;
    const calendarSection = document.getElementById("progressCalendarSection")!;
    const btnTabDashboard = document.getElementById("btnProgressTabDashboard")!;
    const btnTabCalendar = document.getElementById("btnProgressTabCalendar")!;

    // 데이터 저장소
    let allWorks: any[] = [];
    let flatProgressList: any[] = [];   // 날짜별 직원별 progress 목록
    let employeeList: Set<string> = new Set();

    // 현재 캘린더 월
    let currentMonth = new Date();

    //-------------------------------------------------------------
    // 📌 탭 전환 처리
    //-------------------------------------------------------------
    btnTabDashboard.addEventListener("click", () => {
        dashboardSection.classList.remove("hidden");
        calendarSection.classList.add("hidden");
        btnTabDashboard.classList.add("bg-white", "shadow", "text-gray-800");
        btnTabCalendar.classList.remove("bg-white", "shadow", "text-gray-800");
    });

    btnTabCalendar.addEventListener("click", () => {
        dashboardSection.classList.add("hidden");
        calendarSection.classList.remove("hidden");
        btnTabCalendar.classList.add("bg-white", "shadow", "text-gray-800");
        btnTabDashboard.classList.remove("bg-white", "shadow", "text-gray-800");
        renderCalendar();
    });

    //-------------------------------------------------------------
    // 📌 초기 데이터 로딩
    //-------------------------------------------------------------
    loadWorks();

    async function loadWorks() {
        try {
            console.log("📡 GET /api/innomax-works 호출");

            const res = await fetch(`${API_BASE}/api/innomax-works`);
            const json = await res.json();

            allWorks = Array.isArray(json) ? json : json.rows ?? [];

            console.log("⬅️ 로드된 works:", allWorks);

            // detail_json 펼쳐서 progress 데이터를 단일 배열로 취합
            flatProgressList = extractProgress(allWorks);

            // 직원 목록 생성
            employeeList = new Set(flatProgressList.map(v => v.employee));

            // 필터 드롭다운 채우기
            fillSelectOptions();

            // 대시보드 렌더링
            renderDashboard();

            // 캘린더 렌더링
            renderCalendar();
        }
        catch (err) {
            console.error("❌ loadWorks error:", err);
        }
    }

    //-------------------------------------------------------------
    // 📌 detail_json → progress flatten 변환
    //-------------------------------------------------------------
    function extractProgress(rows: any[]) {
        const result: any[] = [];

        rows.forEach(row => {
            const detail = row.detail_json;
            if (!detail) return;

            // 예: detail.progress_buffer = { "2025-01-02": { "여태검": {...}, "장혜용": {...} } }
            const buffer = detail.progress_buffer || {};

            Object.keys(buffer).forEach(date => {
                const users = buffer[date];
                Object.keys(users).forEach(emp => {
                    const item = users[emp];

                    result.push({
                        workId: row.id,
                        date,
                        employee: emp,
                        title: item.title ?? row.category ?? "",
                        status: item.status ?? "진행중",
                        percent: item.percent ?? 0,
                        place: item.place ?? "내근",
                        location: item.location ?? "",
                    });
                });
            });
        });

        console.log("📌 flattened progress:", result);
        return result;
    }

    //-------------------------------------------------------------
    // 📌 Select 옵션 채우기
    //-------------------------------------------------------------
    function fillSelectOptions() {
        const selectIds = [
            "progressFilterUser",
            "calendarFilterUser"
        ];

        selectIds.forEach(id => {
            const sel = document.getElementById(id) as HTMLSelectElement;
            if (!sel) return;

            sel.innerHTML = `<option value="">전체</option>`;
            Array.from(employeeList).forEach(emp => {
                const opt = document.createElement("option");
                opt.value = emp;
                opt.textContent = emp;
                sel.appendChild(opt);
            });
        });
    }

    //-------------------------------------------------------------
    // 📌 대시보드 렌더링
    //-------------------------------------------------------------
    function renderDashboard() {
        console.log("📡 renderDashboard() 시작");

        const tbody = document.getElementById("progressWorkTableBody")!;
        const employeeStatusList = document.getElementById("employeeStatusList")!;
        const kpiTotalWorks = document.getElementById("kpiTotalWorks")!;
        const kpiInProgress = document.getElementById("kpiInProgress")!;
        const kpiCompleted = document.getElementById("kpiCompleted")!;
        const kpiBusinessTrip = document.getElementById("kpiBusinessTrip")!;
        const kpiAvailable = document.getElementById("kpiAvailable")!;
        const summaryAvailable = document.getElementById("summaryAvailableCount")!;
        const summaryTrip = document.getElementById("summaryTripCount")!;
        const summaryEtc = document.getElementById("summaryEtcCount")!;

        const list = flatProgressList;

        // KPI 집계
        kpiTotalWorks.textContent = list.length.toString();
        kpiInProgress.textContent = list.filter(v => v.status === "진행중").length.toString();
        kpiCompleted.textContent = list.filter(v => v.status === "완료").length.toString();
        kpiBusinessTrip.textContent = list.filter(v => v.place === "출장").length.toString();
        kpiAvailable.textContent = list.filter(v => v.place === "내근").length.toString();

        summaryAvailable.textContent = `${list.filter(v => v.place === "내근").length}명`;
        summaryTrip.textContent = `${list.filter(v => v.place === "출장").length}명`;
        summaryEtc.textContent = `${list.filter(v => v.place !== "내근" && v.place !== "출장").length}명`;

        // 테이블 렌더링
        tbody.innerHTML = "";
        list.forEach(v => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="border px-2 py-1">${v.date}</td>
                <td class="border px-2 py-1">${v.employee}</td>
                <td class="border px-2 py-1">${v.title}</td>
                <td class="border px-2 py-1">${v.status}</td>
                <td class="border px-2 py-1">${v.percent}%</td>
                <td class="border px-2 py-1">${v.place} / ${v.location}</td>
            `;
            tbody.appendChild(tr);
        });

        // 직원별 상태 카드
        employeeStatusList.innerHTML = "";
        Array.from(employeeList).forEach(emp => {
            const empItems = list.filter(v => v.employee === emp);

            // 가장 최근 날짜 기준 대표 업무 선택
            const latest = empItems.sort((a, b) => b.date.localeCompare(a.date))[0];
            if (!latest) return;

            const div = document.createElement("div");
            div.className = "border rounded-lg px-2 py-2";

            div.innerHTML = `
                <div class="flex items-center justify-between mb-1">
                    <div class="font-semibold">${emp}</div>
                    <span class="text-[11px] text-gray-500">${latest.place} / ${latest.location}</span>
                </div>
                <div class="text-[11px] text-gray-600">
                    ${latest.title} (${latest.percent}%)
                </div>
            `;

            employeeStatusList.appendChild(div);
        });

        renderCharts();
    }

    //-------------------------------------------------------------
    // 📌 차트 렌더링
    //-------------------------------------------------------------
    let chartUser: any = null;
    let chartStatus: any = null;

    function renderCharts() {
        const ctx1 = document.getElementById("chartProgressByUser") as HTMLCanvasElement;
        const ctx2 = document.getElementById("chartStatusRatio") as HTMLCanvasElement;

        const users = Array.from(employeeList);

        const userAvg = users.map(user => {
            const items = flatProgressList.filter(v => v.employee === user);
            if (items.length === 0) return 0;
            return Math.round(items.reduce((a, b) => a + b.percent, 0) / items.length);
        });

        const statusCount = {
            예정: flatProgressList.filter(v => v.status === "예정").length,
            진행중: flatProgressList.filter(v => v.status === "진행중").length,
            완료: flatProgressList.filter(v => v.status === "완료").length,
            보류: flatProgressList.filter(v => v.status === "보류").length
        };

        if (chartUser) chartUser.destroy();
        if (chartStatus) chartStatus.destroy();

        chartUser = new Chart(ctx1, {
            type: "bar",
            data: {
                labels: users,
                datasets: [{
                    label: "진행률(%)",
                    data: userAvg,
                    backgroundColor: "#6366F1"
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }
            }
        });

        chartStatus = new Chart(ctx2, {
            type: "doughnut",
            data: {
                labels: ["예정", "진행중", "완료", "보류"],
                datasets: [{
                    data: [
                        statusCount.예정,
                        statusCount.진행중,
                        statusCount.완료,
                        statusCount.보류
                    ],
                    backgroundColor: ["#60A5FA", "#FACC15", "#34D399", "#9CA3AF"]
                }]
            },
            options: { responsive: true }
        });
    }

    //-------------------------------------------------------------
    // 📌 캘린더 렌더링
    //-------------------------------------------------------------
    function renderCalendar() {
        const body = document.getElementById("progressCalBody")!;
        const label = document.getElementById("progressCalMonthLabel")!;

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        label.textContent = `${year}년 ${month + 1}월`;

        const firstDay = new Date(year, month, 1);
        const firstWeekday = firstDay.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = "<tr>";

        // 앞 공백
        for (let i = 0; i < firstWeekday; i++) html += `<td class="border p-1 align-top h-24"></td>`;

        let day = 1;

        while (day <= daysInMonth) {
            if ((firstWeekday + day - 1) % 7 === 0 && day !== 1) html += "</tr><tr>";

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const items = flatProgressList.filter(v => v.date === dateStr);

            let bars = "";

            items.forEach(v => {
                const color = v.place === "출장" ? "bg-orange-400" : "bg-blue-400";
                bars += `
                    <div class="relative h-4 rounded-full overflow-hidden mb-0.5 cursor-pointer"
                         title="${v.employee} - ${v.title} (${v.percent}%)">
                        <div class="absolute inset-0 opacity-60 ${color}"></div>
                        <div class="relative z-10 text-[9px] px-1 text-white truncate">
                            [${v.employee}] ${v.title}
                        </div>
                    </div>`;
            });

            html += `
                <td class="border align-top p-1 h-24 cursor-pointer" data-date="${dateStr}">
                    <div class="text-[10px] text-right text-gray-500 mb-1">${day}</div>
                    ${bars}
                </td>
            `;

            day++;
        }

        html += "</tr>";

        body.innerHTML = html;

        // 날짜 클릭 → 상세 표시
        body.querySelectorAll("td[data-date]").forEach(td => {
            td.addEventListener("click", () => {
                const date = (td as HTMLElement).dataset.date!;
                renderCalendarDetail(date);
            });
        });
    }

    //-------------------------------------------------------------
    // 📌 캘린더 상세
    //-------------------------------------------------------------
    function renderCalendarDetail(date: string) {
        const label = document.getElementById("selectedCalDate")!;
        const tbody = document.getElementById("calendarDetailBody")!;

        label.textContent = date;
        tbody.innerHTML = "";

        const items = flatProgressList.filter(v => v.date === date);

        items.forEach(v => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="border px-1 py-1">${v.employee}</td>
                <td class="border px-1 py-1">${v.title}</td>
                <td class="border px-1 py-1">${v.status}</td>
                <td class="border px-1 py-1">${v.percent}%</td>
            `;
            tbody.appendChild(tr);
        });
    }

    //-------------------------------------------------------------
    // 📌 캘린더 이전 / 다음
    //-------------------------------------------------------------
    document.getElementById("progressCalPrev")?.addEventListener("click", () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById("progressCalNext")?.addEventListener("click", () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    });
}
