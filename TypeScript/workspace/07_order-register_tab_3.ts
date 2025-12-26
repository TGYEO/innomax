import { ModalUtil } from "../workspace/utils/ModalUtil";
let initOrderRegister_tab_3_init = false;

type CalendarConfig = {
    tasks: string[];
    startYear: number;
    endYear: number;
};

// 가로/세로 상수 정의
const CELL_WIDTH = 30; // 하루 너비
const ROW_HEIGHT = 50; // 한 태스크 높이
const HEADER_HEIGHT = 80; // 헤더 높이

export function initOrderRegister_tab_3(API_BASE: string) {


    const container = document.getElementById("orderRegisterPage_tab_3")!;
    if (!container) {
        console.error("Container with id 'orderRegisterPage_tab_3' not found.");
        return;
    }

    // 수집된 DOM 요소를 저장할 객체
    const domElements: { [key: string]: HTMLElement } = {};

    // container 내부의 모든 id를 가진 요소를 수집
    const elementsWithId = container.querySelectorAll<HTMLElement>("[id]");
    elementsWithId.forEach((element) => {
        const id = element.id;
        domElements[id] = element; // id를 키로, DOM 요소를 값으로 저장
    });

    Object.keys(domElements).forEach((id) => {
        (window as any)[id] = domElements[id]; // 전역 변수로 등록
    });



    //이벤트 중복 방지임
    if (initOrderRegister_tab_3_init) {

        return;
    }
    initOrderRegister_tab_3_init = true;



    //#region 현재 등록 되어있는 수주건 불러오기
    async function fetchAndRenderOrderList() {

        showProgressModal("화면 로딩중 ...");
        updateProgressBar(10);
        await new Promise(resolve => setTimeout(resolve, 500)); // 완료 후 지연

        updateProgressBar(50);
        await new Promise(resolve => setTimeout(resolve, 200)); // 완료 후 지연


        try {
            const response = await fetch(`${API_BASE}/api/innomax-projects`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }

            const data = await response.json();
            let orders = data.rows;

            // 코드번호 기준 정렬 (- 이후의 3글자를 기준으로)
            orders = orders.sort((a: any, b: any) => {
                const aNumber = parseInt(a.code_no.split("-")[1]?.substring(0, 3) || "0", 10);
                const bNumber = parseInt(b.code_no.split("-")[1]?.substring(0, 3) || "0", 10);
                return aNumber - bNumber;
            });

            // 테이블 바디 초기화
            domElements.orderListBody_orderList_Modal_orderRegisterPage_tab_3.innerHTML = "";

            // 각 수주건을 테이블에 추가
            orders.forEach((order: any, index: number) => {
                const detail = order.detail_json;
                const row = document.createElement("tr");

                // 격줄 스타일링: 기본색과 옅은 하늘색 번갈아가며 적용
                const rowStyle = index % 2 === 0 ? "bg-white" : "bg-blue-200";

                row.innerHTML = `
                <td class="border px-3 py-2 text-center ${rowStyle}">
                    <button class="bg-white-200 text-black px-2 py-1 rounded hover:bg-white-200" 
                    data-action="code_no_button"
                    data-number="${order.code_no}">
                        ${order.code_no}
                    </button>
                </td>
                <td class="border px-3 py-2 text-center ${rowStyle}">${detail.equipName}</td>
                <td class="border px-3 py-2 text-center ${rowStyle}">${detail.clientName}</td>
            `;



                domElements.orderListBody_orderList_Modal_orderRegisterPage_tab_3.appendChild(row);

            });
        } catch (error) {
            console.error("Error fetching orders:", error);
        }

        bindRowEvents();
        //visible_option("init");

        updateProgressBar(70);
        await new Promise(resolve => setTimeout(resolve, 100)); // 완료 후 지연
        updateProgressBar(100);

        hideProgressModal();




    }
    //#endregion

    //#region 현재 수주건 테이블에서 버튼 클릭 이벤트쪽  
    function bindRowEvents() {
        domElements.orderListBody_orderList_Modal_orderRegisterPage_tab_3.querySelectorAll("button").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const target = e.currentTarget as HTMLElement;
                const action = target.dataset.action;
                const number = target.dataset.number;

                if (!action || !number) return;

                if (action === "code_no_button") {


                    console.log(`[order_registerPage_tab_1] 수주번호 클릭: ${number}`);

                    await ModalUtil.confirm({
                        title: "수주건 정보 불러오기",
                        message: `수주번호 ${number} 의 정보를 불러오시겠습니까?`,
                        type: "info"
                    });

                    showProgressModal("수주건 불러오는 중...");
                    updateProgressBar(10);
                    await new Promise(resolve => setTimeout(resolve, 500)); // 완료 후 지연

                    //해당 수주건 정보 불러오기
                    try {
                        const response = await fetch(`${API_BASE}/api/innomax-projects/target/${number}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        });

                        if (!response.ok) {
                            throw new Error("Failed to fetch order details");
                        }

                        const data = await response.json();
                        const order = data.rows;
                        const detail = order.detail_json;

                        //불러온 수주건 정보로 입력폼 채우기
                        (domElements.specOrderNo_orderRegisterPage_tab_3 as HTMLInputElement).value = order.code_no;
                        (domElements.specOrderName_orderRegisterPage_tab_3 as HTMLInputElement).value = detail.equipName;
                        (domElements.specOrderClient_orderRegisterPage_tab_3 as HTMLInputElement).value = detail.clientName;



                    } catch (error) {
                        console.error("Error fetching order details:", error);
                        alert("Error fetching order details. Please try again. 개발자 문의!");
                    }

                    updateProgressBar(50);
                    await new Promise(resolve => setTimeout(resolve, 200)); // 완료 후 지연
                    updateProgressBar(100);
                    await new Promise(resolve => setTimeout(resolve, 100)); // 완료 후 지연

                    hideProgressModal();

                    //visible_option("call");


                }


            });
        });
    }


    //#endregion




    //#region 캘린더 캔버스 구현 건들필요 없음!
    const tasks = [
        "수주보고서 발행", "1차 Kick up", "2차 Kick up", "Layout", "PnID", "실행예산",
        "MAIN BODY(EFEM, BUFFER BODY 포함)", "LOCAL UNIT BODY", "OP PANEL",
        "MAIN MONITOR BRACKET", "RINSE 및 PROCESS CHAMBER", "CHAMBER UP-DOWN",
        "CHAMBER EXHAUST", "CHAMBER BASE", "RINSE 및 PROCESS CHAMBER BOX", "SHUTTER",
        "INNER CUP", "CHAMBER BOX SENSOR", "RINSE 및 PROCESS DISPENSER", "SPIN CHUCK",
        "SPINDLE", "고압 REGULATOR", "ROBOT ASSY", "TANK", "BUFFER", "SERIAL NAME PLATE",
        "소음기 BOX", "MAIN BODY 배관설계", "LOCAL 배관 설계", "Main Body 입고",
        "Local unit 입고", "Chamber base Setting", "Dispenser Setting",
        "Chamber up-down Setting", "Spindle Setting", "Chamber exhaust Setting",
        "Chamber Cup Setting", "Spin chuck Setting", "Chamber box Setting",
        "Shutter Setting", "Main Piping 및 Air Line Piping",
        "Local Unit Piping 및 Air Line Piping", "Programming", "Wiring", "ATM Setting",
        "ATM Teaching", "IO Check", "Manual Test", "Auto Running Test", "사내 QC",
        "Inspection", "PACKING", "출하"
    ];

    // 각 태스크의 기간 상태 저장
    const taskRanges = tasks.map(() => ({ start: '', end: '' }));
    let currentSelectedRow = -1;
    let highlightedCol: number | null = null;

    function generateDateList(startYear: number, endYear: number): Date[] {
        const dates: Date[] = [];
        for (let y = startYear; y <= endYear; y++) {
            for (let m = 0; m < 12; m++) {
                const lastDay = new Date(y, m + 1, 0).getDate();
                for (let d = 1; d <= lastDay; d++) {
                    dates.push(new Date(y, m, d));
                }
            }
        }
        return dates;
    }

    function renderCanvasCalendar(config: CalendarConfig): void {
        const { startYear, endYear } = config;
        const dateList = generateDateList(startYear, endYear);

        const container = document.getElementById('calendar_container_orderRegisterPage_tab_3');
        if (!container) return;

        container.innerHTML = `
        <div id="calendar_outer_wrapper" style="display: flex; height: 750px; overflow: auto; border: 1px solid #ccc; position: relative;">
            <div id="left_panel" style="position: sticky; left: 0; z-index: 50; background: white; border-right: 2px solid #999;">
                <table style="border-collapse: collapse; width: 540px; table-layout: fixed;">
                    <thead>
                        <tr style="height: ${HEADER_HEIGHT}px; background: #f3f4f6;">
                            <th style="border: 1px solid #ccc; width: 300px; font-size: 13px;">작업종류</th>
                            <th style="border: 1px solid #ccc; width: 120px; font-size: 13px;">시작일</th>
                            <th style="border: 1px solid #ccc; width: 120px; font-size: 13px;">종료일</th>
                        </tr>
                    </thead>
                    <tbody id="left_body"></tbody>
                </table>
            </div>
            <div id="canvas_wrapper" style="position: relative; background-color: #fff;">
                <canvas id="calendar_canvas"></canvas>
            </div>
        </div>
        `;

        const outerWrapper = document.getElementById('calendar_outer_wrapper') as HTMLElement;
        const leftBody = document.getElementById('left_body') as HTMLTableSectionElement;
        const canvas = document.getElementById('calendar_canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;

        const totalWidth = dateList.length * CELL_WIDTH;
        const totalHeight = tasks.length * ROW_HEIGHT;
        canvas.width = totalWidth;
        canvas.height = totalHeight + HEADER_HEIGHT;



        // 좌측 패널 생성 및 이벤트 바인딩
        tasks.forEach((task, idx) => {
            const tr = document.createElement('tr');
            tr.style.height = `${ROW_HEIGHT}px`;
            tr.style.cursor = 'pointer';
            tr.innerHTML = `
            <td style="border: 1px solid #ccc; padding: 4px; font-size: 12px; font-weight: 500;">${task}</td>
            <td style="border: 1px solid #ccc; padding: 2px;">
                <input type="date" class="start-date" data-idx="${idx}" style="width:100%; border:1px solid #ddd; font-size:11px;">
            </td>
            <td style="border: 1px solid #ccc; padding: 2px;">
                <input type="date" class="end-date" data-idx="${idx}" style="width:100%; border:1px solid #ddd; font-size:11px;">
            </td>
            `;

            // 날짜 입력 이벤트
            tr.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const target = e.target as HTMLInputElement;
                    const type = target.classList.contains('start-date') ? 'start' : 'end';
                    taskRanges[idx][type] = target.value;
                    drawGrid(); // 입력 즉시 캔버스 업데이트
                });
            });

            // 단일 클릭: 행 선택
            tr.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).tagName === 'INPUT') return;
                leftBody.querySelectorAll('tr').forEach(r => (r as HTMLElement).style.backgroundColor = '');
                tr.style.backgroundColor = '#0cd316ff';
                currentSelectedRow = idx;
                drawGrid();
            });

            // ✅ 더블 클릭: 시작일 위치로 스크롤 이동
            tr.addEventListener('dblclick', () => {
                const startInput = tr.querySelector<HTMLInputElement>('input.start-date');
                if (!startInput || !startInput.value) {
                    alert('시작일이 없습니다.');
                    return;
                }

                const startDateStr = startInput.value; // yyyy-MM-dd
                const targetIndex = dateList.findIndex(
                    d => d.toISOString().split('T')[0] === startDateStr
                );
                if (targetIndex === -1) {
                    alert('해당 시작일이 캘린더 범위에 없습니다.');
                    return;
                }

                const targetX = targetIndex * CELL_WIDTH;

                // 좌측 패널 폭만큼 오른쪽에 canvas가 있으므로 그걸 고려해서 스크롤
                const canvasWrapper = document.getElementById('canvas_wrapper') as HTMLElement;
                const offsetLeft = canvasWrapper.offsetLeft;

                // 타깃 날짜가 가운데쯤 오도록
                const scrollX = targetX - offsetLeft - outerWrapper.clientWidth / 5;
                outerWrapper.scrollLeft = Math.max(0, scrollX);

                // 행/컬럼 하이라이트 상태 갱신
                leftBody.querySelectorAll('tr').forEach(r => (r as HTMLElement).style.backgroundColor = '');
                tr.style.backgroundColor = '#fef9c3';
                currentSelectedRow = idx;
                highlightedCol = targetIndex;
                drawGrid();
            });

            leftBody.appendChild(tr);
        });

        function drawGrid() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. 배경 그리드 및 데이터 영역 그리기
            dateList.forEach((date, i) => {
                const x = i * CELL_WIDTH;
                const dow = date.getDay();
                const isWeekend = (dow === 0 || dow === 6);
                const dateStr = date.toISOString().split('T')[0];

                for (let j = 0; j < tasks.length; j++) {
                    const y = HEADER_HEIGHT + (j * ROW_HEIGHT);
                    const range = taskRanges[j];

                    let cellColor = '#ffffff';
                    if (j === currentSelectedRow) cellColor = '#fff3cd'; // 더 진한 노랑
                    if (isWeekend) cellColor = '#e9ecef'; // 더 진한 회색

                    if (range.start && range.end) {
                        if (dateStr >= range.start && dateStr <= range.end) {
                            cellColor = '#2563eb'; // 더 진한 파랑
                        }
                    }

                    ctx.fillStyle = cellColor;
                    ctx.fillRect(x, y, CELL_WIDTH, ROW_HEIGHT);

                    // 날짜 셀 구분선
                    ctx.strokeStyle = '#cbd5e1'; // 더 진한 회색
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, CELL_WIDTH, ROW_HEIGHT);

                    // 월 구분선
                    const nextDate = new Date(date);
                    nextDate.setDate(date.getDate() + 1);
                    if (nextDate.getMonth() !== date.getMonth()) {
                        ctx.beginPath();
                        ctx.strokeStyle = '#9ca3af';
                        ctx.lineWidth = 1.5;
                        ctx.moveTo(x + CELL_WIDTH, y);
                        ctx.lineTo(x + CELL_WIDTH, y + ROW_HEIGHT);
                        ctx.stroke();
                    }
                }

                // 헤더 날짜 영역
                ctx.fillStyle = '#f3f4f6';
                ctx.fillRect(x, HEADER_HEIGHT / 2, CELL_WIDTH, HEADER_HEIGHT / 2);
                ctx.strokeStyle = '#d1d5db';
                ctx.strokeRect(x, HEADER_HEIGHT / 2, CELL_WIDTH, HEADER_HEIGHT / 2);

                ctx.fillStyle = dow === 0 ? '#ef4444' : (dow === 6 ? '#2563eb' : '#374151');
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(date.getDate().toString(), x + CELL_WIDTH / 2, HEADER_HEIGHT * 0.75 + 4);
            });

            // 2. 상단 월/년 헤더
            let currentX = 0;
            let currentMonthStart = 0;
            dateList.forEach((date, i) => {
                const isLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() === date.getDate();

                if (isLastDay || i === dateList.length - 1) {
                    const monthWidth = (i - currentMonthStart + 1) * CELL_WIDTH;

                    ctx.fillStyle = '#e5e7eb';
                    ctx.fillRect(currentX, 0, monthWidth, HEADER_HEIGHT / 2);
                    ctx.strokeStyle = '#9ca3af';
                    ctx.strokeRect(currentX, 0, monthWidth, HEADER_HEIGHT / 2);

                    ctx.fillStyle = '#111827';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${date.getFullYear()}년 ${date.getMonth() + 1}월`, currentX + monthWidth / 2, HEADER_HEIGHT / 4 + 5);

                    currentX += monthWidth;
                    currentMonthStart = i + 1;
                }
            });

            // 3. 선택된 컬럼(시작일) 강조
            if (highlightedCol !== null && highlightedCol >= 0 && highlightedCol < dateList.length) {
                const x = highlightedCol * CELL_WIDTH;

                ctx.fillStyle = 'rgba(192, 212, 134, 0.15)'; // 노랑 반투명
                ctx.fillRect(x, HEADER_HEIGHT, CELL_WIDTH, totalHeight);

                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, HEADER_HEIGHT);
                ctx.lineTo(x, HEADER_HEIGHT + totalHeight);
                ctx.stroke();
                ctx.lineWidth = 1;
            }
        }



        drawGrid();
    }

    renderCanvasCalendar({
        tasks,
        startYear: 2026,
        endYear: 2027
    });

    //#endregion 캘린더 캔버스 구현




    //#region 이벤트 관련 모음집

    domElements.readOrder_orderRegisterPage_tab_3.addEventListener("click", async () => {
        console.log("Read Order button clicked in Tab 3");
        await fetchAndRenderOrderList();
        domElements.modalOverlay_orderRegisterPage_tab_3.classList.remove("hidden");

    });


    domElements.closeModalBtn1_orderList_Modal_orderRegisterPage_tab_3.addEventListener("click", () => {
        domElements.modalOverlay_orderRegisterPage_tab_3.classList.add("hidden");
    });

    domElements.closeModalBtn2_orderList_Modal_orderRegisterPage_tab_3.addEventListener("click", () => {
        domElements.modalOverlay_orderRegisterPage_tab_3.classList.add("hidden");
    });


    //#endregion 이벤트 관련 모음집


    //#region 프로그레스바 관련 건드필요없음

    function showProgressModal(message: string = "잠시만 기다려주세요.") {
        const progressModal = document.getElementById("progressModal_orderRegisterPage") as HTMLDivElement;
        const progressBar = document.getElementById("progressBar_orderRegisterPage") as HTMLDivElement;
        const progressMessage = document.getElementById("progressMessage_orderRegisterPage") as HTMLParagraphElement;

        if (progressModal && progressBar && progressMessage) {
            progressMessage.textContent = message;
            progressBar.style.width = "0%"; // 초기화
            progressModal.classList.remove("hidden");
        }
    }


    function hideProgressModal() {
        const progressModal = document.getElementById("progressModal_orderRegisterPage") as HTMLDivElement;
        if (progressModal) {
            progressModal.classList.add("hidden");
        }
    }


    function updateProgressBar(percentage: number) {
        const progressBar = document.getElementById("progressBar_orderRegisterPage") as HTMLDivElement;
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }
    //#endregion
}