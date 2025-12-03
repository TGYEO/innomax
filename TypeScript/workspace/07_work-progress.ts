let isWorkProgressPanelInitialized = false;

export function initWorkProgressPanel(API_BASE: string) {
    const panel = document.getElementById("panel-진행상황보고");
    if (!panel) {
        console.warn("⚠ [WorkProgress] panel-진행상황보고 를 찾지 못했습니다.");
        return;
    }

    // 이미 초기화된 경우 → 이벤트 중복 방지
    if (isWorkProgressPanelInitialized) {
        console.log("⚠️ initWorkProgressPanel 이미 초기화됨 → 이벤트 중복 방지, 데이터만 새로 로딩");
        // 👉 탭 다시 들어올 때마다 최신 데이터만 다시 가져오고 싶으면:
        loadMyWorks(); // 아래에 정의된 함수 (function 선언이라 호이스팅됨)
        return;
    }
    isWorkProgressPanelInitialized = true;

    const tableBody = panel.querySelector("#myWorkProgressTableBody") as HTMLElement;

    // 📌 진행상황 보고 모달 DOM 매핑
    const modal = document.getElementById("workProgressModal") as HTMLElement;

    const modalFields = {
        orderNo: document.getElementById("modalWorkOrderNo") as HTMLElement,
        clientName: document.getElementById("modalWorkClientName") as HTMLElement,
        category: document.getElementById("modalWorkCategory") as HTMLElement,
        dueDate: document.getElementById("modalWorkDueDate") as HTMLElement,

        instruction: document.getElementById("modalInstruction") as HTMLElement, // NEW ✔

        status: document.getElementById("modalProgressStatus") as HTMLSelectElement,
        percent: document.getElementById("modalProgressPercent") as HTMLInputElement,
        percentLabel: document.getElementById("modalProgressPercentLabel") as HTMLElement,

        text: document.getElementById("modalReportText") as HTMLTextAreaElement,
        file: document.getElementById("modalAttachedFile") as HTMLInputElement,

        historyList: document.getElementById("modalHistoryList") as HTMLElement,
        historyCount: document.getElementById("modalHistoryCount") as HTMLElement,
    };




    // ---------------------------
    // 타입 정의
    // ---------------------------
    interface ProgressCell {
        status: string | null;
        percent: number | null;
        review: string;
    }

    interface WorkRow {
        id: string;
        orderNo: string;
        category: string;
        clientName: string;
        startDate: string;
        endDate: string;
        employees: { id: string; name: string }[];
        instruction: string;
        progress_buffer?: {
            [date: string]: {
                [empId: string]: ProgressCell;
            };
        };
    }

    let allWorks: WorkRow[] = [];
    let currentWork: WorkRow | null = null;
    let currentDateStr: string | null = null; // 👉 오늘 날짜 (YYYY-MM-DD)
    let currentWorkId: string | null = null;

    // ---------------------------
    // 유틸
    // ---------------------------

    // 상단바에서 사용자 이름 읽기
    function getLoggedInUserId(): string {
        const el = document.getElementById("userName");
        if (!el) return "";
        return el.textContent?.trim() || "";
    }



    function getTodayStr(): string {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    function fmtDate(d: string | null | undefined): string {
        if (!d) return "-";
        return d;
    }

    function getStatusLabel(status: string | null | undefined): string {
        if (!status) return "미작성";
        switch (status) {
            case "doing":
                return "진행중";
            case "hold":
                return "보류";
            case "request_done":
                return "완료 요청";
            case "done":
                return "완료";
            default:
                return status;
        }
    }

    // ---------------------------
    // 1) 내 업무 불러오기
    // ---------------------------
    async function loadMyWorks() {
        const loginUserId = getLoggedInUserId();

        if (!loginUserId) {
            console.warn("⚠ 사용자 이름을 찾을 수 없습니다 (#userName).");
            return;
        }

        try {
            const url = `${API_BASE}/api/innomax-progress/my-works?userId=${encodeURIComponent(loginUserId)}`;
            console.log("📡 [loadMyWorks] 요청:", url);

            const res = await fetch(url);
            if (!res.ok) {
                console.error("❌ [my-works] 응답 오류:", res.status);
                return;
            }

            const data = await res.json();
            console.log("⬅️ [my-works] 결과:", data);

            renderTable(data);
        } catch (err) {
            console.error("❌ [loadMyWorks] error:", err);
        }
    }


    // ---------------------------
    // 2) 테이블 렌더링 (오늘 기준)
    // ---------------------------
    function renderTable(list: WorkRow[]) {

        const loginUserId = getLoggedInUserId();

        if (!loginUserId) {
            console.warn("⚠ 사용자 이름을 찾을 수 없습니다 (#userName).");
            return;
        }
        tableBody.innerHTML = "";
        const todayStr = getTodayStr();

        if (!list || list.length === 0) {
            tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center text-gray-400 py-4">
            진행할 업무가 없습니다.
          </td>
        </tr>
      `;
            return;
        }

        list.forEach((w, idx) => {
            const tr = document.createElement("tr");
            tr.className = "hover:bg-sky-50";

            let todayCell: ProgressCell | null = null;
            const buf = w.progress_buffer || {};
            const dateEntry = buf[todayStr];

            if (dateEntry && loginUserId && dateEntry[loginUserId]) {
                todayCell = dateEntry[loginUserId];
            }

            const statusLabel = getStatusLabel(todayCell?.status ?? null);
            const percentStr =
                todayCell && todayCell.percent !== null
                    ? `${todayCell.percent}%`
                    : "-";
            const reviewPreview =
                todayCell && todayCell.review
                    ? (todayCell.review.length > 15
                        ? todayCell.review.slice(0, 15) + "..."
                        : todayCell.review)
                    : "-";

            tr.innerHTML = `
        <td class="border px-2 py-1 text-center">${idx + 1}</td>
        <td class="border px-2 py-1 text-center">${w.id}</td> 
        <td class="border px-2 py-1">${w.orderNo}</td>
        <td class="border px-2 py-1">${w.category}</td>
        <td class="border px-2 py-1">${w.clientName}</td>
        <td class="border px-2 py-1 text-center">${fmtDate(w.startDate)} ~ ${fmtDate(w.endDate)}</td>
        <td class="border px-2 py-1 text-center">${statusLabel}</td>
        <td class="border px-2 py-1 text-center">${percentStr}</td>
        <td class="border px-2 py-1 text-center">${reviewPreview}</td>
        <td class="border px-2 py-1 text-center">
          <button
            class="btn-report bg-indigo-600 text-white px-2 py-1 rounded text-xs"
            data-id="${w.id}"
          >
            보고
          </button>
        </td>
      `;

            tableBody.appendChild(tr);
        });

        attachTableEvents();
    }

    // ---------------------------
    // 3) 테이블의 보고 버튼 이벤트
    // ---------------------------
    function attachTableEvents() {

        tableBody.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;

            if (target.classList.contains("btn-report")) {
                const id = target.dataset.id!;
                openModal(id);
            }
        });

    }

    // ---------------------------
    // 4) 모달 열기 (오늘 날짜 기준)
    // ---------------------------
    async function openModal(workOrderNo: string) {

        const loginUserId = getLoggedInUserId();
        if (!loginUserId) {
            console.warn("⚠ 로그인 사용자 없음");
            return;
        }

        currentWorkId = workOrderNo;
        currentDateStr = getTodayStr();


        try {
            // 🔹 1) 백엔드에서 해당 업무 1건 조회
            const url = `${API_BASE}/api/innomax-progress/my-works-detail/${workOrderNo}`;
            console.log("▶ [openModal] fetch URL =", url);

            const res = await fetch(url);
            console.log("▶ [openModal] res.status =", res.status);

            if (!res.ok) {
                console.warn("❌ 서버 조회 실패:", res.status);
                return;
            }

            const w = await res.json();  // { id, detail_json }
            console.log("📡 [openModal] 단일 업무 데이터 w =", w);

            const d = w.detail_json || {};   // ✅ 실제 업무 데이터
            console.log("📡 [openModal] detail_json d =", d);

            // 오늘 날짜
            const todayStr = getTodayStr();
            console.log("▶ [openModal] todayStr =", todayStr);

            // progress_buffer 구조 가져오기
            const buf = d.progress_buffer || {};
            console.log("▶ [openModal] progress_buffer keys =", Object.keys(buf));

            const dateEntry = buf[todayStr] || {};
            console.log("▶ [openModal] dateEntry for today =", dateEntry);

            // 🔹 오늘 기록 (없으면 default 생성)
            let cell: ProgressCell =
                dateEntry[loginUserId] || {
                    status: "doing",
                    percent: null,
                    review: "",
                };

            console.log("▶ [openModal] 초기 cell =", cell);

            // 🔹 percent이 null이면 → 기간 대비 자동 계산
            if (cell.percent === null) {
                const startStr = d.startDate;
                const endStr = d.endDate;

                if (startStr && endStr) {
                    const start = new Date(startStr);
                    const end = new Date(endStr);
                    const today = new Date(todayStr);

                    console.log("▶ [openModal] startDate, endDate =", startStr, endStr);
                    console.log("▶ [openModal] start =", start, "end =", end, "today =", today);

                    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                        const totalDays = Math.max(
                            1,
                            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                        );

                        const passedDays = Math.max(
                            0,
                            (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                        );

                        const autoPercent = Math.round((passedDays / totalDays) * 100);
                        console.log("▶ [openModal] totalDays =", totalDays, "passedDays =", passedDays, "autoPercent =", autoPercent);

                        cell.percent = Math.min(100, Math.max(0, autoPercent)); // 0~100 제한
                    } else {
                        console.warn("⚠ start 또는 end 가 Invalid Date 입니다. percent 0으로 처리");
                        cell.percent = 0;
                    }
                } else {
                    console.warn("⚠ startDate / endDate 가 없습니다. percent 0으로 처리");
                    cell.percent = 0;
                }
            }

            if (isNaN(cell.percent as any)) {
                console.warn("⚠ percent 가 NaN 입니다. 0으로 보정");
                cell.percent = 0;
            }

            console.log("✅ [openModal] 최종 cell =", cell);

            // -----------------------------
            // 2) 모달 기본 정보 채우기
            // -----------------------------
            modalFields.orderNo.textContent = d.orderNo || "";
            modalFields.clientName.textContent = d.clientName || "";
            modalFields.category.textContent = d.category || "";
            modalFields.dueDate.textContent =
                (d.startDate && d.endDate)
                    ? `${fmtDate(d.startDate)} ~ ${fmtDate(d.endDate)}`
                    : "";

            // 🔹 수행 지시 사항
            modalFields.instruction.textContent = d.instruction || "지시 사항 없음";

            // -----------------------------
            // 3) 진행 상태 / 진행률 / 코멘트
            // -----------------------------
            modalFields.status.value = cell.status || "doing";

            modalFields.percent.value = String(cell.percent);
            modalFields.percentLabel.textContent = `(${cell.percent}%)`;

            modalFields.text.value = cell.review || "";
            modalFields.file.value = "";

            // -----------------------------
            // 4) 히스토리 로딩
            // -----------------------------
            console.log("▶ [openModal] 히스토리 렌더링 호출");
            renderWorkHistory(d, loginUserId);   // ✅ detail_json 기준으로 넘김

            // -----------------------------
            // 5) 모달 표시
            // -----------------------------
            console.log("▶ [openModal] 모달 표시");
            modal.classList.remove("hidden");
            modal.classList.add("flex");

        } catch (err) {
            console.error("❌ [openModal] 실행 중 예외 발생:", err);
        }
    }



    function renderWorkHistory(w: WorkRow, userId: string) {

        modalFields.historyList.innerHTML = "";

        const buf = w.progress_buffer || {};
        const entries: { date: string; cell: ProgressCell }[] = [];

        // 날짜별로 히스토리 추출
        for (const date in buf) {
            if (buf[date][userId]) {
                entries.push({
                    date,
                    cell: buf[date][userId],
                });
            }
        }

        // 최신순 정렬
        entries.sort((a, b) => (a.date < b.date ? 1 : -1));

        modalFields.historyCount.textContent = `${entries.length}건`;

        if (entries.length === 0) {
            modalFields.historyList.innerHTML =
                `<div class="text-gray-400 text-[11px]">기록이 없습니다.</div>`;
            return;
        }

        entries.forEach((e) => {
            const div = document.createElement("div");
            div.className = "p-1 border-b last:border-0";

            div.innerHTML = `
            <div class="text-[11px] text-gray-500">${e.date}</div>
            <div class="text-[12px] text-gray-700">
                상태: ${getStatusLabel(e.cell.status)} / 진행률: ${e.cell.percent}% 
            </div>
            <div class="text-[11px] text-gray-600 whitespace-pre-line mt-1">
                ${e.cell.review || "(내용 없음)"}
            </div>
        `;

            modalFields.historyList.appendChild(div);
        });
    }





    // ---------------------------
    // 5) 버퍼 기반 히스토리 렌더링
    // ---------------------------
    function renderHistoryFromBuffer(work: WorkRow) {
        const loginUserId = getLoggedInUserId();

        if (!loginUserId) {
            console.warn("⚠ 사용자 이름을 찾을 수 없습니다 (#userName).");
            return;
        }

        const buf = work.progress_buffer || {};
        const historyItems: { date: string; cell: ProgressCell }[] = [];

        Object.keys(buf)
            .sort() // 날짜 순으로
            .forEach((date) => {
                const empMap = buf[date];
                if (!empMap) return;
                const c = empMap[loginUserId];
                if (!c) return;

                // 아무것도 안 적힌 날은 히스토리에서 제외 (원하면 포함 가능)
                const hasContent =
                    (c.status && c.status !== "none") ||
                    (c.percent !== null && c.percent !== undefined) ||
                    (c.review && c.review.trim() !== "");
                if (!hasContent) return;

                historyItems.push({ date, cell: c });
            });

        modalFields.historyList.innerHTML = "";
        if (historyItems.length === 0) {
            modalFields.historyList.innerHTML =
                `<div class="text-[11px] text-gray-400">작성한 보고가 없습니다.</div>`;
            modalFields.historyCount.textContent = "0건";
            return;
        }

        historyItems.forEach((item) => {
            const div = document.createElement("div");
            div.className = "border-b pb-1 mb-1 text-xs";

            div.innerHTML = `
        <div class="flex justify-between">
          <span class="font-semibold">
            ${item.date} - ${getStatusLabel(item.cell.status)} (${item.cell.percent ?? 0}%)
          </span>
        </div>
        <div class="mt-0.5 text-gray-700 whitespace-pre-wrap">
          ${item.cell.review || ""}
        </div>
      `;
            modalFields.historyList.appendChild(div);
        });

        modalFields.historyCount.textContent = `${historyItems.length}건`;
    }

    // ================================
    // 6) 저장 (오늘 날짜 기준 업데이트)
    // ================================

    

    async function saveProgress() {

        const loginUserId = getLoggedInUserId();
        if (!loginUserId) {
            console.warn("⚠ 로그인 사용자 없음");
            return;
        }
        
        
        if (!currentWorkId) {
            console.warn("⚠ currentWorkId  없음");
            return;
        }

        if (!currentDateStr) {
            console.warn("⚠ currentDateStr 없음");
            return;
        }

        const body = {
            work_id: currentWorkId,           // 현재 작업 ID
            user_id: loginUserId,             // 로그인된 직원 ID
            date: currentDateStr,             // 오늘 날짜
            progress_status: modalFields.status.value,
            progress_percent: Number(modalFields.percent.value),
            report_text: modalFields.text.value,
            attached_file_url: null,
        };

        console.log("📡 [saveProgress] 요청 body:", body);

        const res = await fetch(`${API_BASE}/api/innomax-progress/work/progress-update/${currentWorkId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            console.error("❌ [saveProgress] 실패:", res.status);
            alert("저장 실패");
            return;
        }

        alert("저장되었습니다.");

        // 모달 닫기 & 목록 새로고침
        modal.classList.add("hidden");
        await loadMyWorks();
    }


    // ---------------------------
    // 7) 이벤트 바인딩
    // ---------------------------
    document
        .getElementById("btnSaveWorkProgress")!
        .addEventListener("click", saveProgress);

    document
        .getElementById("btnCancelWorkProgress")!
        .addEventListener("click", () => {
            modal.classList.add("hidden");
        });

    document
        .getElementById("btnCloseWorkProgressModal")!
        .addEventListener("click", () => {
            modal.classList.add("hidden");
        });

    modalFields.percent.addEventListener("input", () => {
        modalFields.percentLabel.textContent = `(${modalFields.percent.value}%)`;
    });

    // 최초 로드
    loadMyWorks();
}
