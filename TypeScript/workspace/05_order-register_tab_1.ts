
//여기는 수주건 등록쪽임 초기

import { promises } from "dns";
import { ModalUtil } from "../workspace/utils/ModalUtil";
import { defined } from "chart.js/helpers";


let initOrderRegister_tab_1_init = false;

export function initOrderRegister_tab_1(API_BASE: string) {

    // 탭 패널
    const orderNo_orderRegisterPage_tab_1 = document.getElementById("orderNo_orderRegisterPage_tab_1") as HTMLInputElement;
    const equipName_orderRegisterPage_tab_1 = document.getElementById("equipName_orderRegisterPage_tab_1") as HTMLInputElement;
    const clientEquipName_orderRegisterPage_tab_1 = document.getElementById("clientEquipName_orderRegisterPage_tab_1") as HTMLInputElement;
    const clientName_orderRegisterPage_tab_1 = document.getElementById("clientName_orderRegisterPage_tab_1") as HTMLSelectElement;
    const packDate_orderRegisterPage_tab_1 = document.getElementById("packDate_orderRegisterPage_tab_1") as HTMLInputElement;
    const deliveryDate_orderRegisterPage_tab_1 = document.getElementById("deliveryDate_orderRegisterPage_tab_1") as HTMLInputElement;
    const hartMakeMain_orderRegisterPage_tab_1 = document.getElementById("hartMakeMain_orderRegisterPage_tab_1") as HTMLInputElement;
    const hartMakeSub_orderRegisterPage_tab_1 = document.getElementById("hartMakeSub_orderRegisterPage_tab_1") as HTMLInputElement;
    const hartMakeCompany_orderRegisterPage_tab_1 = document.getElementById("hartMakeCompany_orderRegisterPage_tab_1") as HTMLInputElement;
    const plcMain_orderRegisterPage_tab_1 = document.getElementById("plcMain_orderRegisterPage_tab_1") as HTMLInputElement;
    const plcSub_orderRegisterPage_tab_1 = document.getElementById("plcSub_orderRegisterPage_tab_1") as HTMLInputElement;
    const plcCompany_orderRegisterPage_tab_1 = document.getElementById("plcCompany_orderRegisterPage_tab_1") as HTMLInputElement;

    const pcGuiMain_orderRegisterPage_tab_1 = document.getElementById("pcGuiMain_orderRegisterPage_tab_1") as HTMLInputElement;
    const pcGuiSub_orderRegisterPage_tab_1 = document.getElementById("pcGuiSub_orderRegisterPage_tab_1") as HTMLInputElement;
    const pcGuiCompany_orderRegisterPage_tab_1 = document.getElementById("pcGuiCompany_orderRegisterPage_tab_1") as HTMLInputElement;

    const pcControlMain_orderRegisterPage_tab_1 = document.getElementById("pcControlMain_orderRegisterPage_tab_1") as HTMLInputElement;
    const pcControlSub_orderRegisterPage_tab_1 = document.getElementById("pcControlSub_orderRegisterPage_tab_1") as HTMLInputElement;
    const pcControlCompany_orderRegisterPage_tab_1 = document.getElementById("pcControlCompany_orderRegisterPage_tab_1") as HTMLInputElement;


    const wireMain_orderRegisterPage_tab_1 = document.getElementById("wireMain_orderRegisterPage_tab_1") as HTMLInputElement;
    const wireSub_orderRegisterPage_tab_1 = document.getElementById("wireSub_orderRegisterPage_tab_1") as HTMLInputElement;
    const wireCompany_orderRegisterPage_tab_1 = document.getElementById("wireCompany_orderRegisterPage_tab_1") as HTMLInputElement;
    const setupMain_orderRegisterPage_tab_1 = document.getElementById("setupMain_orderRegisterPage_tab_1") as HTMLInputElement;
    const setupSub_orderRegisterPage_tab_1 = document.getElementById("setupSub_orderRegisterPage_tab_1") as HTMLInputElement;
    const btnSaveOrder_orderRegisterPage_tab_1 = document.getElementById("btnSaveOrder_orderRegisterPage_tab_1") as HTMLButtonElement;
    const btnEditOrder_orderRegisterPage_tab_1 = document.getElementById("btnEditOrder_orderRegisterPage_tab_1") as HTMLButtonElement;
    const orderListBody_orderRegisterPage_tab_1 = document.getElementById("orderListBody_orderRegisterPage_tab_1") as HTMLTableSectionElement;
    const EquipGroup_orderRegisterPage_tab_1 = document.getElementById("EquipGroup_orderRegisterPage_tab_1") as HTMLSelectElement;


    //테이블 렌더링 쪽
    const filterYear_orderRegisterPage_tab_1 = document.getElementById("filterYear_orderRegisterPage_tab_1") as HTMLSelectElement;
    const filterEquipGroup_orderRegisterPage_tab_1 = document.getElementById("filterEquipGroup_orderRegisterPage_tab_1") as HTMLSelectElement;
    const filterClient_orderRegisterPage_tab_1 = document.getElementById("filterClient_orderRegisterPage_tab_1") as HTMLSelectElement;
    const filterResetbtn_orderRegisterPage_tab_1 = document.getElementById("filterResetbtn_orderRegisterPage_tab_1") as HTMLButtonElement;

    //필수 요소 모음집
    const requiredElements = [
        orderNo_orderRegisterPage_tab_1,
        equipName_orderRegisterPage_tab_1,
        clientEquipName_orderRegisterPage_tab_1,
        clientName_orderRegisterPage_tab_1,
        packDate_orderRegisterPage_tab_1,
        deliveryDate_orderRegisterPage_tab_1,
        EquipGroup_orderRegisterPage_tab_1,
    ];


    if (initOrderRegister_tab_1_init) {
        filterYear_orderRegisterPage_tab_1.value = "전체";
        filterEquipGroup_orderRegisterPage_tab_1.value = "전체";
        filterClient_orderRegisterPage_tab_1.value = "전체";
        clearOrderRegisterTab1Inputs();
        visible_option("init");
        fetchAndRenderOrderList();

        return;

    }
    initOrderRegister_tab_1_init = true;



    //#region 각종 유틸 함수관련

    function clearOrderRegisterTab1Inputs() {
        orderNo_orderRegisterPage_tab_1.value = "";
        equipName_orderRegisterPage_tab_1.value = "";
        clientEquipName_orderRegisterPage_tab_1.value = "";
        clientName_orderRegisterPage_tab_1.value = "";
        packDate_orderRegisterPage_tab_1.value = "";
        deliveryDate_orderRegisterPage_tab_1.value = "";
        hartMakeMain_orderRegisterPage_tab_1.value = "";
        hartMakeSub_orderRegisterPage_tab_1.value = "";
        hartMakeCompany_orderRegisterPage_tab_1.value = "";
        plcMain_orderRegisterPage_tab_1.value = "";
        plcSub_orderRegisterPage_tab_1.value = "";
        plcCompany_orderRegisterPage_tab_1.value = "";

        pcControlMain_orderRegisterPage_tab_1.value = "";
        pcControlSub_orderRegisterPage_tab_1.value = "";
        pcControlCompany_orderRegisterPage_tab_1.value = "";

        pcGuiMain_orderRegisterPage_tab_1.value = "";
        pcGuiSub_orderRegisterPage_tab_1.value = "";
        pcGuiCompany_orderRegisterPage_tab_1.value = "";


        wireMain_orderRegisterPage_tab_1.value = "";
        wireSub_orderRegisterPage_tab_1.value = "";
        wireCompany_orderRegisterPage_tab_1.value = "";
        setupMain_orderRegisterPage_tab_1.value = "";
        setupSub_orderRegisterPage_tab_1.value = "";
        EquipGroup_orderRegisterPage_tab_1.value = "";
    }


    function visible_option(option: string) {

        if (option === "call") { //불러오기
            orderNo_orderRegisterPage_tab_1.readOnly = true; //수정 방지
            orderNo_orderRegisterPage_tab_1.classList.add("bg-gray-400"); //읽기전용 표시

            btnSaveOrder_orderRegisterPage_tab_1.disabled = true; //저장 비활성화
            btnSaveOrder_orderRegisterPage_tab_1.classList.add("bg-gray-400", "cursor-not-allowed");

            btnEditOrder_orderRegisterPage_tab_1.disabled = false; //수정 활성화
            btnEditOrder_orderRegisterPage_tab_1.classList.remove("bg-gray-400", "cursor-not-allowed");
        }

        if (option === "save") { //저장
            orderNo_orderRegisterPage_tab_1.readOnly = false; //수정 허용
            orderNo_orderRegisterPage_tab_1.classList.remove("bg-gray-400"); //읽기전용 표시
            orderNo_orderRegisterPage_tab_1.classList.add("bg-white-400"); //수정 허용

            btnSaveOrder_orderRegisterPage_tab_1.disabled = false; //저장 활성화
            btnSaveOrder_orderRegisterPage_tab_1.classList.remove("bg-gray-400", "cursor-not-allowed");

            btnEditOrder_orderRegisterPage_tab_1.disabled = true; //수정 비활성화
            btnEditOrder_orderRegisterPage_tab_1.classList.add("bg-gray-400", "cursor-not-allowed");

        }

        if (option === "init") { //초기
            orderNo_orderRegisterPage_tab_1.readOnly = false; //수정 허용
            orderNo_orderRegisterPage_tab_1.classList.remove("bg-gray-400"); //읽기전용 표시
            orderNo_orderRegisterPage_tab_1.classList.add("bg-white-400"); //수정 허용

            btnSaveOrder_orderRegisterPage_tab_1.disabled = false; //저장 활성화
            btnSaveOrder_orderRegisterPage_tab_1.classList.remove("bg-gray-400", "cursor-not-allowed");

            btnEditOrder_orderRegisterPage_tab_1.disabled = true; //수정 비활성화
            btnEditOrder_orderRegisterPage_tab_1.classList.add("bg-gray-400", "cursor-not-allowed");

        }


    }

    // 날짜 검증 및 인터락 함수
    function setupDateInterlock() {
        // 납기 날짜 변경 시 이벤트
        deliveryDate_orderRegisterPage_tab_1.addEventListener("change", () => {
            const deliveryDate = new Date(deliveryDate_orderRegisterPage_tab_1.value);

            if (isNaN(deliveryDate.getTime())) {
                // 납기 날짜가 유효하지 않으면 포장 날짜 비활성화
                packDate_orderRegisterPage_tab_1.value = "";
                packDate_orderRegisterPage_tab_1.disabled = true;
                return;
            }

            // 납기 날짜가 유효하면 포장 날짜 활성화
            packDate_orderRegisterPage_tab_1.readOnly = false;
            packDate_orderRegisterPage_tab_1.disabled = false;
        });

        // 포장 날짜 변경 시 이벤트
        packDate_orderRegisterPage_tab_1.addEventListener("change", () => {
            const deliveryDate = new Date(deliveryDate_orderRegisterPage_tab_1.value);
            const packDate = new Date(packDate_orderRegisterPage_tab_1.value);

            if (isNaN(deliveryDate.getTime()) || isNaN(packDate.getTime())) {
                // 날짜가 유효하지 않으면 아무 작업도 하지 않음
                return;
            }

            if (packDate > deliveryDate) {
                // 포장 날짜가 납기 날짜보다 늦으면 경고 및 초기화
                ModalUtil.confirm({
                    title: "날짜 오류",
                    message: "포장예정일은 납기일보다 늦을 수 없습니다. 다시 선택해주세요.",
                    type: "error"
                });
                packDate_orderRegisterPage_tab_1.value = "";
            }
        });
    }



    function handleFilterChange() {
        // 필터 값 가져오기
        const selectedYear = filterYear_orderRegisterPage_tab_1.value; // 예: "2025"
        const selectedEquipGroup = filterEquipGroup_orderRegisterPage_tab_1.value;
        const selectedClient = filterClient_orderRegisterPage_tab_1.value;

        console.log("🔍 선택된 필터 값:", {
            year: selectedYear,
            equipGroup: selectedEquipGroup,
            client: selectedClient,
        });

        // 현재 렌더링된 테이블 데이터에서 필터링
        const rows = Array.from(orderListBody_orderRegisterPage_tab_1.querySelectorAll("tr"));
        rows.forEach((row) => {
            const codeNo = row.querySelector("td:nth-child(1) button")?.getAttribute("data-number") || "";
            const equipName = row.querySelector("td:nth-child(2)")?.textContent || "";
            const clientName = row.querySelector("td:nth-child(3)")?.textContent || "";

            // 첫 번째 셀에서 4, 5번째 숫자 추출
            const yearSuffix = codeNo.substring(3, 5); // 예: "ISS25-312S" -> "25"

            // 수주번호 셀에서 마지막 문자 추출 (Eqtype)
            const Eqtype = codeNo.substring(codeNo.length - 1); // 예: "ISS25-312S" -> "S" 또는 "A"

            //장비군 
            let matchesEqtype = false;
            if (selectedEquipGroup === "전체") {
                matchesEqtype = true; // "전체"가 선택되면 모든 Eqtype을 허용
            } else {
                if (Eqtype === "A" && selectedEquipGroup === "Wet") {
                    matchesEqtype = true;
                }

                if (Eqtype === "S" && selectedEquipGroup === "Single") {
                    matchesEqtype = true;
                }
            }

            // 년도
            let matchesYear = false;
            if (selectedYear === "전체") {
                matchesYear = true; // "전체"가 선택되면 모든 년도를 허용
            }
            else {
                matchesYear = selectedYear === "" || yearSuffix === selectedYear.substring(2, 4); // "2025" -> "25"
            }



            // 고객사
            let matchesClient = false;
            if (selectedClient === "전체") {
                matchesClient = true; // "전체"가 선택되면 모든 고객사를 허용
            }
            else {
                matchesClient = selectedClient === "" || clientName.includes(selectedClient);
            }


            // 조건에 맞으면 보이기, 아니면 숨기기
            if (matchesEqtype && matchesYear && matchesClient) {
                row.style.display = ""; // 보이기
            } else {
                row.style.display = "none"; // 숨기기
            }
        });
    }
    //#endregion





    //#region 수주건 저장 함수
    async function saveOrderRegisterTab1(): Promise<number> {
        const payload = {
            orderNo: orderNo_orderRegisterPage_tab_1.value,
            details: {
                equipName: equipName_orderRegisterPage_tab_1.value,
                clientEquipName: clientEquipName_orderRegisterPage_tab_1.value,
                clientName: clientName_orderRegisterPage_tab_1.value,
                packDate: packDate_orderRegisterPage_tab_1.value,
                deliveryDate: deliveryDate_orderRegisterPage_tab_1.value,
                hartMakeMain: hartMakeMain_orderRegisterPage_tab_1.value,
                hartMakeSub: hartMakeSub_orderRegisterPage_tab_1.value,
                hartMakeCompany: hartMakeCompany_orderRegisterPage_tab_1.value,
                plcMain: plcMain_orderRegisterPage_tab_1.value,
                plcSub: plcSub_orderRegisterPage_tab_1.value,
                plcCompany: plcCompany_orderRegisterPage_tab_1.value,

                pcControlMain: pcControlMain_orderRegisterPage_tab_1.value,
                pcControlSub: pcControlSub_orderRegisterPage_tab_1.value,
                pcControlCompany: pcControlCompany_orderRegisterPage_tab_1.value,

                pcGuiMain: pcGuiMain_orderRegisterPage_tab_1.value,
                pcGuiSub: pcGuiSub_orderRegisterPage_tab_1.value,
                pcGuiCompany: pcGuiCompany_orderRegisterPage_tab_1.value,



                wireMain: wireMain_orderRegisterPage_tab_1.value,
                wireSub: wireSub_orderRegisterPage_tab_1.value,
                wireCompany: wireCompany_orderRegisterPage_tab_1.value,
                setupMain: setupMain_orderRegisterPage_tab_1.value,
                setupSub: setupSub_orderRegisterPage_tab_1.value,
                eqtype: EquipGroup_orderRegisterPage_tab_1.value,
            },
        };

        try {
            const response = await fetch(`${API_BASE}/api/innomax-projects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error === "중복된 code_no가 존재합니다.") {
                    await ModalUtil.confirm({
                        title: "중복된 수주건 번호",
                        message: "이미 존재하는 수주건 번호입니다. 다른 번호를 입력해주세요.",
                        type: "error"
                    });

                    hideProgressModal();

                    return -1; // 중복 오류 코드 반환
                }
                throw new Error("Failed to save order");
            }


            clearOrderRegisterTab1Inputs();
            return 0; // 성공 코드 반환
            // 추가로, 수주건 목록을 새로고침하는 함수 호출 가능

        } catch (error) {
            console.error("Error saving order:", error);
            alert("Error saving order. Please try again. 개발자 문의!");
            return -2; // 일반 오류 코드 반환
        }
    }
    //#endregion


    //#region 수주건 수정 함수
    async function ChangeOrderRegisterTab1(): Promise<number> {
        const payload = {
            orderNo: orderNo_orderRegisterPage_tab_1.value,
            equipName: equipName_orderRegisterPage_tab_1.value,
            clientEquipName: clientEquipName_orderRegisterPage_tab_1.value,
            clientName: clientName_orderRegisterPage_tab_1.value,
            packDate: packDate_orderRegisterPage_tab_1.value,
            deliveryDate: deliveryDate_orderRegisterPage_tab_1.value,
            hartMakeMain: hartMakeMain_orderRegisterPage_tab_1.value,
            hartMakeSub: hartMakeSub_orderRegisterPage_tab_1.value,
            hartMakeCompany: hartMakeCompany_orderRegisterPage_tab_1.value,
            plcMain: plcMain_orderRegisterPage_tab_1.value,
            plcSub: plcSub_orderRegisterPage_tab_1.value,
            plcCompany: plcCompany_orderRegisterPage_tab_1.value,

            pcControlMain: pcControlMain_orderRegisterPage_tab_1.value,
            pcControlSub: pcControlSub_orderRegisterPage_tab_1.value,
            pcControlCompany: pcControlCompany_orderRegisterPage_tab_1.value,

            pcGuiMain: pcGuiMain_orderRegisterPage_tab_1.value,
            pcGuiSub: pcGuiSub_orderRegisterPage_tab_1.value,
            pcGuiCompany: pcGuiCompany_orderRegisterPage_tab_1.value,


            wireMain: wireMain_orderRegisterPage_tab_1.value,
            wireSub: wireSub_orderRegisterPage_tab_1.value,
            wireCompany: wireCompany_orderRegisterPage_tab_1.value,
            setupMain: setupMain_orderRegisterPage_tab_1.value,
            setupSub: setupSub_orderRegisterPage_tab_1.value,
            eqtype: EquipGroup_orderRegisterPage_tab_1.value,
        };

        try {
            const response = await fetch(`${API_BASE}/api/innomax-projects/${orderNo_orderRegisterPage_tab_1.value}`, {
                method: "PUT", // PUT 메서드 사용
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                hideProgressModal();
                throw new Error("Failed to save order");

            }

            clearOrderRegisterTab1Inputs(); // 수주건 목록을 새로고침하는 함수 호출 가능

            visible_option("init");
            return 0; // 성공 코드 반환

        } catch (error) {
            console.error("Error saving order:", error);
            alert("Error saving order. Please try again. 개발자 문의!");
            hideProgressModal();
            return -2; // 오류 코드 반환
        }


    }
    //#endregion




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
            orderListBody_orderRegisterPage_tab_1.innerHTML = "";

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



                orderListBody_orderRegisterPage_tab_1.appendChild(row);

            });
        } catch (error) {
            console.error("Error fetching orders:", error);
        }

        bindRowEvents();
        visible_option("init");

        updateProgressBar(70);
        await new Promise(resolve => setTimeout(resolve, 100)); // 완료 후 지연
        updateProgressBar(100);

        hideProgressModal();
    }
    //#endregion


    //#region 현재 수주건 테이블에서 버튼 클릭 이벤트쪽
    function bindRowEvents() {
        orderListBody_orderRegisterPage_tab_1.querySelectorAll("button").forEach((btn) => {
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


                    //해당 수주건 정보 불러오기
                    try {
                        console.log("Fetching order number:", number);
                        if (!number) {
                            alert("수주 번호가 비어있습니다.");
                            return;
                        }

                        const response = await fetch(
                            `${API_BASE}/api/innomax-projects/${encodeURIComponent(number)}`,
                            {
                                method: "GET",
                                headers: {
                                    Accept: "application/json",
                                },
                            }
                        );

                        if (!response.ok) {
                            throw new Error("Failed to fetch order details");
                        }

                        const data = await response.json();
                        const rows = data?.rows;
                        if (!rows) {
                            throw new Error("Invalid response shape: rows is missing");
                        }

                        const order = rows;                 // code_no 포함
                        const detail = rows.detail_json;    // 디테일 JSON

                        // 불러온 수주건 정보로 입력폼 채우기
                        orderNo_orderRegisterPage_tab_1.value = order.code_no;
                        equipName_orderRegisterPage_tab_1.value = detail.equipName;
                        clientEquipName_orderRegisterPage_tab_1.value = detail.clientEquipName;
                        clientName_orderRegisterPage_tab_1.value = detail.clientName;
                        packDate_orderRegisterPage_tab_1.value = detail.packDate;
                        deliveryDate_orderRegisterPage_tab_1.value = detail.deliveryDate;
                        hartMakeMain_orderRegisterPage_tab_1.value = detail.hartMakeMain;
                        hartMakeSub_orderRegisterPage_tab_1.value = detail.hartMakeSub;
                        hartMakeCompany_orderRegisterPage_tab_1.value = detail.hartMakeCompany;
                        plcMain_orderRegisterPage_tab_1.value = detail.plcMain;
                        plcSub_orderRegisterPage_tab_1.value = detail.plcSub;
                        plcCompany_orderRegisterPage_tab_1.value = detail.plcCompany;

                        pcControlMain_orderRegisterPage_tab_1.value = detail.pcControlMain;
                        pcControlSub_orderRegisterPage_tab_1.value = detail.pcControlSub;
                        pcControlCompany_orderRegisterPage_tab_1.value = detail.pcControlCompany;

                        pcGuiMain_orderRegisterPage_tab_1.value = detail.pcGuiMain;
                        pcGuiSub_orderRegisterPage_tab_1.value = detail.pcGuiSub;
                        pcGuiCompany_orderRegisterPage_tab_1.value = detail.pcGuiCompany;

                        wireMain_orderRegisterPage_tab_1.value = detail.wireMain;
                        wireSub_orderRegisterPage_tab_1.value = detail.wireSub;
                        wireCompany_orderRegisterPage_tab_1.value = detail.wireCompany;
                        setupMain_orderRegisterPage_tab_1.value = detail.setupMain;
                        setupSub_orderRegisterPage_tab_1.value = detail.setupSub;
                        EquipGroup_orderRegisterPage_tab_1.value = detail.eqtype;

                    } catch (error) {
                        console.error("Error fetching order details:", error);
                        alert("Error fetching order details. Please try again. 개발자 문의!");
                    }

                    updateProgressBar(50);
                    await new Promise(resolve => setTimeout(resolve, 200)); // 완료 후 지연
                    updateProgressBar(100);
                    await new Promise(resolve => setTimeout(resolve, 100)); // 완료 후 지연

                    hideProgressModal();

                    visible_option("call");

                }


            });
        });
    }


    //#endregion







    //#region 각종 이벤트쓰

    btnSaveOrder_orderRegisterPage_tab_1.addEventListener("click", async () => {

        for (const lists of requiredElements) {
            if (!lists.value) {
                await ModalUtil.confirm({
                    title: "필수 입력 항목 누락",
                    message: "필수 입력 항목을 모두 채워주세요.",
                    type: "warning"
                });
                return; //하나라도 비어있으면 함수 종료
            }
        }

        showProgressModal("수주건 저장 중...");
        updateProgressBar(10);
        await new Promise(resolve => setTimeout(resolve, 500)); // 완료 후 지연

        const returnValue = await saveOrderRegisterTab1();
        updateProgressBar(50);
        await new Promise(resolve => setTimeout(resolve, 200)); // 완료 후 지연

        updateProgressBar(70);
        await new Promise(resolve => setTimeout(resolve, 100)); // 완료 후 지연
        updateProgressBar(100);

        hideProgressModal();

        if (returnValue === 0) {
            ModalUtil.confirm({
                title: "저장 완료",
                message: "수주건이 성공적으로 저장되었습니다.",
                type: "success"
            });
        };

        fetchAndRenderOrderList();// 마지막 갱신






    });

    btnEditOrder_orderRegisterPage_tab_1.addEventListener("click", async () => {
        showProgressModal("수주건 수정 중...");
        updateProgressBar(10);
        await new Promise(resolve => setTimeout(resolve, 500)); // 완료 후 지연

        const returnValue = await ChangeOrderRegisterTab1();
        updateProgressBar(50);
        await new Promise(resolve => setTimeout(resolve, 200)); // 완료 후 지연

        updateProgressBar(70);
        await new Promise(resolve => setTimeout(resolve, 100)); // 완료 후 지연
        updateProgressBar(100);

        hideProgressModal();

        if (returnValue === 0) {
            ModalUtil.confirm({
                title: "수정 완료",
                message: "수주건이 성공적으로 수정되었습니다.",
                type: "success"
            });
        };
    });


    deliveryDate_orderRegisterPage_tab_1.addEventListener("change", () => {

        setupDateInterlock();
    });

    // 필터 변경 이벤트 추가
    filterYear_orderRegisterPage_tab_1.addEventListener("change", handleFilterChange);
    filterEquipGroup_orderRegisterPage_tab_1.addEventListener("change", handleFilterChange);
    filterClient_orderRegisterPage_tab_1.addEventListener("change", handleFilterChange);

    filterResetbtn_orderRegisterPage_tab_1.addEventListener("click", () => {
        filterYear_orderRegisterPage_tab_1.value = "전체";
        filterEquipGroup_orderRegisterPage_tab_1.value = "전체";
        filterClient_orderRegisterPage_tab_1.value = "전체";
        handleFilterChange();
    });


    //
    //#endregion


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



    fetchAndRenderOrderList();

}
