import { ModalUtil } from "../workspace/utils/ModalUtil";
let initOrderRegister_tab_3_init = false;


declare const gantt: any; // DHTMLX Gantt 전역 변수 선언

interface TaskItem {
    name: string;
    group: string;
}

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


    //#region 각종 함수 모음집

    function AllClear() {
        const leftBody = document.getElementById('left_body') as HTMLTableSectionElement;

        // 상단 기본 정보 초기화
        (domElements.specOrderNo_orderRegisterPage_tab_3 as HTMLInputElement).value = "";
        (domElements.specOrderName_orderRegisterPage_tab_3 as HTMLInputElement).value = "";
        (domElements.specOrderClient_orderRegisterPage_tab_3 as HTMLInputElement).value = "";

        (domElements.specOrderNo_orderRegisterPage_tab_3 as HTMLInputElement).classList.remove("bg-gray-300");
        (domElements.specOrderName_orderRegisterPage_tab_3 as HTMLInputElement).classList.remove("bg-gray-300");
        (domElements.specOrderClient_orderRegisterPage_tab_3 as HTMLInputElement).classList.remove("bg-gray-300");


        const canvas = document.getElementById('calendar_canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;




        console.log("모든 필드와 캔버스 데이터가 초기화되었습니다.");
    }




    //#endregion


    //#region 현재 등록 되어있는 수주건 불러오기
    async function fetchAndRenderOrderList() {

        showProgressModal("화면 로딩중 ...");
        updateProgressBar(10);
        await new Promise(resolve => setTimeout(resolve, 300)); // 완료 후 지연

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
            let orders = data.data;

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
                        const order = data.data;
                        const detail = order.detail_json;

                        //불러온 수주건 정보로 입력폼 채우기
                        (domElements.specOrderNo_orderRegisterPage_tab_3 as HTMLInputElement).value = order.code_no;
                        (domElements.specOrderName_orderRegisterPage_tab_3 as HTMLInputElement).value = detail.equipName;
                        (domElements.specOrderClient_orderRegisterPage_tab_3 as HTMLInputElement).value = detail.clientName;

                        (domElements.specOrderNo_orderRegisterPage_tab_3 as HTMLInputElement).classList.add("bg-gray-300");
                        (domElements.specOrderName_orderRegisterPage_tab_3 as HTMLInputElement).classList.add("bg-gray-300");
                        (domElements.specOrderClient_orderRegisterPage_tab_3 as HTMLInputElement).classList.add("bg-gray-300");



                    } catch (error) {
                        console.error("Error fetching order details:", error);
                        alert("Error fetching order details. Please try again. 개발자 문의!");
                    }




                    updateProgressBar(50);
                    await new Promise(resolve => setTimeout(resolve, 200)); // 완료 후 지연
                    updateProgressBar(100);
                    await new Promise(resolve => setTimeout(resolve, 100)); // 완료 후 지연

                    hideProgressModal();

                    
                    drawDhtmlxGantt("SINGLE", new Date("2026-01-01"), new Date("2026-03-20"));

                }


            });
        });
    }


    //#endregion





    //#region 일단 간트차트부터 그려버려 싱글, 웻 2개다 

    function drawDhtmlxGantt(eqType: string, projectStart: Date, projectEnd: Date): void {
        let taskData: TaskItem[] = [];

        if (eqType === "SINGLE") {
            taskData = [
                { name: "수주보고서 발행", group: "설계/준비" },
                { name: "1차 Kick up", group: "설계/준비" },
                { name: "2차 Kick up", group: "설계/준비" },
                { name: "Layout", group: "설계/준비" },
                { name: "PnID", group: "설계/준비" },
                { name: "실행예산", group: "설계/준비" },
                { name: "MAIN BODY(EFEM, BUFFER BODY 포함)", group: "설계/준비" },
                { name: "LOCAL UNIT BODY", group: "부품입고" },
                { name: "OP PANEL", group: "부품입고" },
                { name: "MAIN MONITOR BRACKET", group: "부품입고" },
                { name: "RINSE 및 PROCESS CHAMBER", group: "부품입고" },
                { name: "CHAMBER UP-DOWN", group: "부품입고" },
                { name: "CHAMBER EXHAUST", group: "부품입고" },
                { name: "CHAMBER BASE", group: "부품입고" },
                { name: "RINSE 및 PROCESS CHAMBER BOX", group: "부품입고" },
                { name: "SHUTTER", group: "부품입고" },
                { name: "INNER CUP", group: "부품입고" },
                { name: "CHAMBER BOX SENSOR", group: "부품입고" },
                { name: "RINSE 및 PROCESS DISPENSER", group: "부품입고" },
                { name: "SPIN CHUCK", group: "부품입고" },
                { name: "SPINDLE", group: "부품입고" },
                { name: "고압 REGULATOR", group: "부품입고" },
                { name: "ROBOT ASSY", group: "부품입고" },
                { name: "TANK", group: "부품입고" },
                { name: "BUFFER", group: "부품입고" },
                { name: "SERIAL NAME PLATE", group: "부품입고" },
                { name: "소음기 BOX", group: "부품입고" },
                { name: "MAIN BODY 배관설계", group: "설계/준비" },
                { name: "LOCAL 배관 설계", group: "설계/준비" },
                { name: "Main Body 입고", group: "부품입고" },
                { name: "Local unit 입고", group: "부품입고" },
                { name: "Chamber base Setting", group: "조립/셋팅" },
                { name: "Dispenser Setting", group: "조립/셋팅" },
                { name: "Chamber up-down Setting", group: "조립/셋팅" },
                { name: "Spindle Setting", group: "조립/셋팅" },
                { name: "Chamber exhaust Setting", group: "조립/셋팅" },
                { name: "Chamber Cup Setting", group: "조립/셋팅" },
                { name: "Spin chuck Setting", group: "조립/셋팅" },
                { name: "Chamber box Setting", group: "조립/셋팅" },
                { name: "Shutter Setting", group: "조립/셋팅" },
                { name: "Main Piping 및 Air Line Piping", group: "배관/배선" },
                { name: "Local Unit Piping 및 Air Line Piping", group: "배관/배선" },
                { name: "Programming", group: "테스트/출하" },
                { name: "Wiring", group: "배관/배선" },
                { name: "ATM Setting", group: "조립/셋팅" },
                { name: "ATM Teaching", group: "테스트/출하" },
                { name: "IO Check", group: "테스트/출하" },
                { name: "Manual Test", group: "테스트/출하" },
                { name: "Auto Running Test", group: "테스트/출하" },
                { name: "사내 QC", group: "테스트/출하" },
                { name: "Inspection", group: "테스트/출하" },
                { name: "PACKING", group: "테스트/출하" },
                { name: "출하", group: "테스트/출하" }
            ];
        }

        if (taskData.length === 0) return;

        // 1) DHTMLX Gantt 데이터/링크 구성
        let currentDate = new Date(projectStart);
        const tasks: any[] = [];
        const links: any[] = [];

        taskData.forEach((item, index) => {
            const id = index + 1;
            const start = new Date(currentDate);
            const duration = 0; // 0일

            const startStr = start.toISOString().substring(0, 10); // YYYY-MM-DD

            tasks.push({
                id,
                text: item.name,
                start_date: startStr,
                duration,
                progress: 0,
                group: item.group
            });

            if (index > 0) {
                links.push({
                    id: index,
                    source: index,
                    target: id,
                    type: "0"
                });
            }

            currentDate.setDate(currentDate.getDate() + 2);
        });

        const data = { data: tasks, links };

        const ganttDiv = document.getElementById('gantt_here');
        if (!ganttDiv) {
            console.error('#gantt_here 요소를 찾을 수 없습니다.');
            return;
        }

        // 기간 제한
        gantt.config.start_date = new Date(projectStart);
        gantt.config.end_date = new Date(projectEnd);

        // 포맷
        gantt.config.date_format = "%Y-%m-%d";
        gantt.templates.date_grid = function (date: Date) {
            const y = date.getFullYear();
            const m = date.getMonth() + 1;
            const d = date.getDate();
            return `${y}년 ${m}월 ${d}일`;
        };

        // 컬럼 (가로 폭 약간 줄임)
        gantt.config.columns = [
            { name: "text", label: "작업", width: 300, tree: true },
            { name: "group", label: "그룹", align: "center", width: 110 },
            {
                name: "start_date",
                label: "시작일",
                align: "center",
                width: 130,
                template: function (task: any) {
                    const d = task.start_date instanceof Date
                        ? task.start_date
                        : gantt.date.parseDate(task.start_date, gantt.config.date_format);

                    const y = d.getFullYear();
                    const m = d.getMonth() + 1;
                    const day = d.getDate();
                    return `${y}년 ${m}월 ${day}일`;
                }
            },
            { name: "duration", label: "기간(일)", align: "center", width: 70 }
        ];

        // 스케일 (day 폭 줄이기 위해 min_column_width 조정)
        gantt.config.scales = [
            {
                unit: "month",
                step: 1,
                format: function (date: Date) {
                    const y = date.getFullYear();
                    const m = date.getMonth() + 1;
                    return `${y}년 ${m}월`;
                }
            },
            {
                unit: "day",
                step: 1,
                format: function (date: Date) {
                    const d = date.getDate();
                    return `${d}`; // 일만 표시해서 더 컴팩트하게
                }
            }
        ];

        // 하루 셀 가로폭 최소값 (기본보다 작게)
        gantt.config.min_column_width = 40; // 필요하면 30 ~ 50 사이로 조절

        // 줄무늬
        gantt.templates.grid_row_class = function (_start: Date, _end: Date, row: any) {
            return row.id % 2 === 0 ? "gantt_row_even" : "gantt_row_odd";
        };
        gantt.templates.timeline_cell_class = function (_task: any, date: Date) {
            const day = date.getDate();
            // 홀짝 배경 + border 클래스를 같이 줌
            return (day % 2 === 0 ? "gantt_cell_even" : "gantt_cell_odd") + " gantt_cell_bordered";
        };

        gantt.init("gantt_here");
        gantt.clearAll();
        gantt.parse(data);
    }



    //#endregion








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

    domElements.pmsSave_orderRegisterPage_tab_3.addEventListener("click", async () => {

        const specOrderNo_orderRegisterPage_tab_3 = (domElements.specOrderNo_orderRegisterPage_tab_3 as HTMLInputElement).value;


    });


    domElements.init_orderRegisterPage_tab_3.addEventListener("click", () => {
        AllClear();
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

        const modalOverlay_orderRegisterPage_tab_3 = document.getElementById("modalOverlay_orderRegisterPage_tab_3") as HTMLDivElement;
        if (modalOverlay_orderRegisterPage_tab_3) {
            modalOverlay_orderRegisterPage_tab_3.classList.add("hidden");
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