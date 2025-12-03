// ========================================================================================
// 📌 업무할당 패널 초기화 (캘린더 포함 버전)
// ========================================================================================
let isWorkAssignPanelInitialized = false;

export function initWorkAssignPanel(API_BASE: string) {
    const panel = document.getElementById("panel-업무할당");
    if (!panel) return;
    // 이미 초기화된 경우 재등록 방지
    if (isWorkAssignPanelInitialized) {
        console.log("⚠️ initWorkAssignPanel 이미 초기화됨 → 이벤트 중복 방지");
        return;
    }
    isWorkAssignPanelInitialized = true;

    // 직원 칩 시스템 초기화
    const employeeSelector = initEmployeeSelectFeature(panel, API_BASE);

    // DOM 요소 수집
    const clientFilter = panel.querySelector("#assignClientFilter") as HTMLSelectElement;
    const orderSelect = panel.querySelector("#assignOrderSelect") as HTMLSelectElement;

    const categoryEl = panel.querySelector("#assignCategory") as HTMLSelectElement;
    const instructionEl = panel.querySelector("#assignInstruction") as HTMLTextAreaElement;

    const startDateEl = panel.querySelector("#assignStartDate") as HTMLInputElement;
    const endDateEl = panel.querySelector("#assignEndDate") as HTMLInputElement;

    const btnSave = panel.querySelector("#btnSaveAssignment") as HTMLButtonElement;

    // 📌 캘린더 관련 DOM
    const calMonthLabel = panel.querySelector("#calendarCurrentLabel") as HTMLElement | null;
    const calBody = panel.querySelector("#assignCalendarBody") as HTMLElement | null;

    const btnCalPrev = panel.querySelector("#calendarPrev") as HTMLButtonElement | null;
    const btnCalNext = panel.querySelector("#calendarNext") as HTMLButtonElement | null;

    let allOrders: any[] = [];




    function clearAllFields() {
        if (!panel) return;

        // 모든 input 초기화
        panel.querySelectorAll("input").forEach((el: any) => {
            el.value = "";
        });

        // 모든 textarea 초기화
        panel.querySelectorAll("textarea").forEach((el: any) => {
            el.value = "";
        });

        // 모든 select 초기화
        panel.querySelectorAll("select").forEach((el: any) => {
            el.selectedIndex = 0;
        });

        // 직원 선택칩 초기화
        employeeSelector.clearAllEmployees();
    }

    // =========================================================================
    // 📌 1. 수주건 전체 불러오기
    // =========================================================================
    async function loadOrders() {
        try {
            const res = await fetch(`${API_BASE}/api/innomax-projects`);
            const json = await res.json();
            if (!json.ok) return;
            allOrders = json.rows;
        } catch (err) {
            console.error("❌ 수주건 로딩 오류:", err);
        }
    }

    // =========================================================================
    // 📌 2. 고객사 선택 → 해당 고객사의 수주건만 소팅하여 표시
    // =========================================================================
    clientFilter.addEventListener("change", () => {
        const cName = clientFilter.value.trim();
        orderSelect.innerHTML = `<option value="">수주건을 선택하세요</option>`;

        if (!cName) return;

        const filtered = allOrders.filter((o) => o.detail_json.clientName === cName);

        filtered.forEach((o) => {
            const op = document.createElement("option");
            op.value = o.code_no;
            op.textContent = `${o.code_no}`;
            orderSelect.appendChild(op);
        });

        // 고객사 변경 시 직원 초기화
        employeeSelector.clearAllEmployees();
    });

    // =========================================================================
    // 📌 3. 업무 저장 (innomax_works) — 리뷰 버퍼 자동 생성
    // =========================================================================
    btnSave.addEventListener("click", async () => {
        const orderNo = orderSelect.value;
        const clientName = clientFilter.value;
        const employees = employeeSelector.getSelectedEmployees(); // [{id,name}, ...]
        const category = categoryEl.value;
        const instruction = instructionEl.value;

        const startDate = startDateEl.value;
        const endDate = endDateEl.value;

        if (!orderNo) return alert("수주건을 선택하세요.");
        if (!category) return alert("업무 카테고리를 선택하세요.");
        if (employees.length === 0) return alert("직원을 선택하세요.");
        if (!startDate || !endDate) return alert("시작일과 종료일을 선택하세요.");

        // ===============================================
        // 🔥 리뷰 버퍼(progress_buffer) 자동 생성
        // ===============================================

        // 날짜 범위 생성
        function generateDateRange(start: string, end: string): string[] {
            const result: string[] = [];
            const s = new Date(start);
            const e = new Date(end);

            const cur = new Date(s);
            while (cur <= e) {
                const y = cur.getFullYear();
                const m = String(cur.getMonth() + 1).padStart(2, "0");
                const d = String(cur.getDate()).padStart(2, "0");
                result.push(`${y}-${m}-${d}`);
                cur.setDate(cur.getDate() + 1);
            }
            return result;
        }

        const dateList = generateDateRange(startDate, endDate);

        // 직원 이름 목록
        const empNames = employees.map(e => e.id); // ex) ["권택선","여태검"]

        // 버퍼 구조
        const progress_buffer: any = {};

        dateList.forEach(dateStr => {
            progress_buffer[dateStr] = {};
            empNames.forEach(name => {
                progress_buffer[dateStr][name] = {
                    status: null,
                    percent: null,
                    review: ""
                };
            });
        });

        // ===============================================
        // 서버에 보낼 payload
        // ===============================================
        const payload = {
            orderNo,
            clientName,
            employees,
            category,
            instruction,
            startDate,
            endDate,
            progress_buffer // 🔥 새로 추가됨
        };

        try {
            const res = await fetch(`${API_BASE}/api/innomax-works`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!json.ok) {
                console.error(json);
                return alert("저장 실패");
            }

            alert("업무가 성공적으로 할당되었습니다!");

            // 재로딩
            await loadWorks();
            renderCalendar();
            clearAllFields();

        } catch (err) {
            console.error("❌ 업무 저장 오류:", err);
            alert("저장 중 오류가 발생했습니다.");
        }
    });


    // ========================================================================================
    // 📌 직원 선택 (칩 UI) — 완성본
    // ========================================================================================
    function initEmployeeSelectFeature(panel: HTMLElement, API_BASE: string) {

        const employeeSelect = panel.querySelector("#assignEmployeeSelect") as HTMLSelectElement;
        const btnAddEmployee = panel.querySelector("#btnAddEmployee") as HTMLButtonElement;

        const employeeListContainer = panel.querySelector("#assignEmployeeList") as HTMLElement;
        const selectedText = panel.querySelector("#assignSelectedEmployees") as HTMLElement;
        const btnClearEmployee = panel.querySelector("#btnClearEmployeeSelection") as HTMLButtonElement;

        // 현재 선택된 직원 목록
        const selectedEmployees: { id: string; name: string }[] = [];

        // ------------------------------------------------------------
        // 📌 직원 목록 불러오기 (/api/users)
        // ------------------------------------------------------------
        async function loadEmployees() {
            console.log("📡 loadEmployees() 호출됨");

            try {
                const url = `${API_BASE}/api/users`;
                const res = await fetch(url);
                const json = await res.json();

                const rows = Array.isArray(json) ? json : (json.rows ?? []);

                employeeSelect.innerHTML = `<option value="">직원을 선택하세요</option>`;

                rows.forEach((u: any) => {
                    const opt = document.createElement("option");
                    opt.value = u.Name;        // ✔ id 대신 Name 사용
                    opt.textContent = u.Name;  // ✔ 화면에도 Name
                    employeeSelect.appendChild(opt);
                });

            } catch (err) {
                console.error("❌ 직원 목록 로딩 실패:", err);
            }
        }

        // ------------------------------------------------------------
        // 📌 직원 칩 UI 갱신
        // ------------------------------------------------------------
        function refreshSelectedView() {
            employeeListContainer.innerHTML = "";

            selectedEmployees.forEach((emp) => {
                const chip = document.createElement("div");
                chip.className =
                    "flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs text-indigo-700";
                chip.setAttribute("data-id", emp.id);

                chip.innerHTML = `
                <span>${emp.name}</span>
                <button type="button"
                    class="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-indigo-100 text-[10px] text-indigo-500 btn-remove-employee">
                    ✕
                </button>
            `;

                employeeListContainer.appendChild(chip);
            });

            selectedText.textContent =
                selectedEmployees.length > 0
                    ? selectedEmployees.map((e) => e.name).join(", ")
                    : "없음";
        }

        // ------------------------------------------------------------
        // 📌 직원 추가
        // ------------------------------------------------------------
        btnAddEmployee.addEventListener("click", () => {
            const id = employeeSelect.value;
            const name = employeeSelect.options[employeeSelect.selectedIndex]?.text;

            if (!id) return alert("직원을 선택하세요.");

            if (selectedEmployees.some((e) => e.id === id)) {
                return alert("이미 선택된 직원입니다.");
            }

            selectedEmployees.push({ id, name });
            refreshSelectedView();
        });

        // ------------------------------------------------------------
        // 📌 직원 칩 삭제(X 버튼)
        // ------------------------------------------------------------
        employeeListContainer.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (!target.classList.contains("btn-remove-employee")) return;

            const chip = target.closest("[data-id]") as HTMLElement;
            const removeId = chip.getAttribute("data-id");

            const idx = selectedEmployees.findIndex((e) => e.id === removeId);
            if (idx >= 0) selectedEmployees.splice(idx, 1);

            refreshSelectedView();
        });

        // ------------------------------------------------------------
        // 📌 전체 초기화
        // ------------------------------------------------------------
        btnClearEmployee.addEventListener("click", () => {
            selectedEmployees.length = 0;
            refreshSelectedView();
        });

        // 초기 직원 목록 불러오기
        loadEmployees();

        // 외부 접근 가능한 인터페이스 반환
        return {
            getSelectedEmployees: () => selectedEmployees,
            clearAllEmployees: () => {
                selectedEmployees.length = 0;
                refreshSelectedView();
            }
        };
    }

    //#region 캘린더

    // ======================================================
    // 📌 전역 변수
    // ======================================================
    let allWorks: any[] = [];
    let currentMonth = new Date();
    let tooltipEl: HTMLDivElement | null = null;

    // 직원 색상 매핑
    const employeeColorMap: Record<string, string> = {};
    const colorPalette = [
        "#A5B4FC", // indigo
        "#6EE7B7", // green
        "#FDE68A", // yellow
        "#FCA5A5", // red
        "#7DD3FC", // sky
        "#F9A8D4", // pink
        "#FDBA74"  // orange
    ];

    function getColorForEmployee(name: string | undefined): string {
        if (!name) return "#E5E7EB";

        if (!employeeColorMap[name]) {
            const keys = Object.keys(employeeColorMap);
            employeeColorMap[name] = colorPalette[keys.length % colorPalette.length];
        }
        return employeeColorMap[name];
    }

    // ======================================================
    // 📌 Tooltip 생성
    // ======================================================
    function ensureTooltip() {
        if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "assignCalendarTooltip";
            tooltipEl.className =
                "fixed z-50 max-w-xs px-2 py-1 text-[11px] rounded bg-gray-800 text-white shadow-lg pointer-events-none whitespace-pre-line";
            tooltipEl.style.display = "none";
            document.body.appendChild(tooltipEl);
        }
    }
    function showTooltip(text: string, x: number, y: number) {
        ensureTooltip();
        if (!tooltipEl) return;
        tooltipEl.textContent = text;
        tooltipEl.style.left = x + 12 + "px";
        tooltipEl.style.top = y + 12 + "px";
        tooltipEl.style.display = "block";
    }
    function hideTooltip() {
        if (tooltipEl) tooltipEl.style.display = "none";
    }

    // ======================================================
    // 📌 날짜 문자열 → Date 변환
    // ======================================================
    function parseDate(dateStr: string | null | undefined): Date | null {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    // ======================================================
    // 📌 innomax_works GET + detail_json 평탄화
    // ======================================================
    async function loadWorks() {
        try {
            console.log("📡 /api/innomax-works 호출 시작");

            const res = await fetch(`${API_BASE}/api/innomax-works`);
            console.log("⬅️ 응답 상태:", res.status);

            const json = await res.json();
            console.log("⬅️ 응답 JSON:", json);

            const rows = Array.isArray(json) ? json : (json.rows ?? []);

            // detail_json을 펼친다
            allWorks = rows.map((row: any) => ({
                id: row.id,
                ...row.detail_json
            }));

            console.log("📌 평탄화된 allWorks:", allWorks);

        } catch (err) {
            console.error("❌ 업무 로딩 오류:", err);
        }
    }

    // ======================================================
    // 📌 달력 렌더링 (GRID + 형광펜 + 툴팁)
    // ======================================================
    function renderCalendar() {
        if (!calBody || !calMonthLabel) return;

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // 상단 월 표시
        calMonthLabel.textContent = `${year}년 ${month + 1}월`;

        // 기존 grid 비우기
        calBody.innerHTML = "";

        const firstDay = new Date(year, month, 1);
        const firstWeekday = firstDay.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 1) 시작 전 빈칸
        for (let i = 0; i < firstWeekday; i++) {
            const blank = document.createElement("div");
            blank.className = "border bg-gray-50";
            calBody.appendChild(blank);
        }

        // 2) 날짜 칸
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);

            const worksForDay = allWorks.filter((w: any) => {
                const s = parseDate(w.startDate);
                const e = parseDate(w.endDate) || s;
                if (!s) return false;

                return (
                    cellDate.getTime() >= s.getTime() &&
                    e &&
                    cellDate.getTime() <= e.getTime()
                );
            });

            const cell = document.createElement("div");
            cell.className = "relative border p-1 text-[11px] bg-white flex flex-col";

            // 날짜 표시
            const header = document.createElement("div");
            header.className = "flex justify-between items-center mb-1";
            header.innerHTML = `
            <span class="font-semibold">${day}</span>
            ${worksForDay.length
                    ? `<span class="text-[10px] text-indigo-600 font-medium">${worksForDay.length}건</span>`
                    : ""
                }
        `;
            cell.appendChild(header);

            // 내용
            if (worksForDay.length === 0) {
                const empty = document.createElement("div");
                empty.className = "text-[10px] text-gray-400";
                empty.textContent = "업무 없음";
                cell.appendChild(empty);

            } else {
                const list = document.createElement("div");
                list.className = "flex flex-col gap-1";


                worksForDay.forEach((w: any) => {
                    const employees = Array.isArray(w.employees) ? w.employees : [];

                    const item = document.createElement("div");
                    item.className =
                        "relative h-5 rounded-full overflow-hidden cursor-pointer";

                    // ============================
                    // 🔥 직원 여러명 → 멀티 컬러 바 생성
                    // ============================
                    const barWrapper = document.createElement("div");
                    barWrapper.className = "absolute inset-0 flex";

                    employees.forEach((emp: any) => {
                        const empColor = getColorForEmployee(emp.name || emp.id);

                        const bar = document.createElement("div");
                        bar.style.backgroundColor = empColor;
                        bar.style.opacity = "0.6";
                        bar.className = "flex-1 h-full";

                        barWrapper.appendChild(bar);
                    });

                    // 직원이 없을 때 기본색
                    if (employees.length === 0) {
                        const bar = document.createElement("div");
                        bar.style.backgroundColor = "#E5E7EB";
                        bar.style.opacity = "0.5";
                        bar.className = "absolute inset-0";
                        barWrapper.appendChild(bar);
                    }

                    item.appendChild(barWrapper);

                    // ============================
                    // 🔹 내용 텍스트
                    // ============================
                    const label = document.createElement("div");
                    label.className =
                        "relative z-10 text-[9px] px-1 truncate text-gray-800 font-medium";
                    label.textContent = `[${w.orderNo}] ${w.category}`;
                    item.appendChild(label);

                    // ============================
                    // 🔹 툴팁
                    // ============================
                    const empNames = employees.map((e: any) => e.name).join(", ");

                    const tooltip =
                        `수주: ${w.orderNo} (${w.clientName})\n` +
                        `업무: ${w.category}\n` +
                        `담당: ${empNames || "미지정"}\n` +
                        `기간: ${w.startDate} ~ ${w.endDate}\n` +
                        (w.instruction ? `지시사항: ${w.instruction}` : "");

                    item.addEventListener("mouseenter", (ev) => {
                        const e = ev as MouseEvent;
                        showTooltip(tooltip, e.clientX, e.clientY);
                    });
                    item.addEventListener("mouseleave", hideTooltip);

                    list.appendChild(item);
                });


                cell.appendChild(list);
            }

            calBody.appendChild(cell);
        }
    }

    // ======================================================
    // 📌 월 이동 버튼
    // ======================================================
    if (btnCalPrev) {
        btnCalPrev.addEventListener("click", () => {
            currentMonth = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1
            );
            renderCalendar();
        });
    }

    if (btnCalNext) {
        btnCalNext.addEventListener("click", () => {
            currentMonth = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                1
            );
            renderCalendar();
        });
    }

    // ======================================================
    // 📌 초기 실행
    // ======================================================
    (async () => {
        ensureTooltip();
        await loadWorks();
        renderCalendar();
    })();

    //#endregion


    // =========================================================================
    // 📌 초기 로딩
    // =========================================================================
    (async () => {
        await loadOrders();
        await loadWorks();
        renderCalendar();

        clearAllFields();
    })();
}
