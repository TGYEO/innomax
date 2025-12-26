
import { ModalUtil } from "../workspace/utils/ModalUtil";
let initOrderRegister_tab_2_init = false;

export function initOrderRegister_tab_2(API_BASE: string) {

    const container = document.getElementById("orderRegisterPage_tab_2")!;
    if (!container) {
        console.error("Container with id 'orderRegisterPage_tab_2' not found.");
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
    if (initOrderRegister_tab_2_init) {
        allClear_tab_2();
        visible_option("init");
        return;
    }
    initOrderRegister_tab_2_init = true;





    //#region 각종 유티릴티 함수들

    function allClear_tab_2() {
        const inputs = container.querySelectorAll<HTMLInputElement>("input");
        inputs.forEach(input => input.value = "");

        const selects = container.querySelectorAll<HTMLSelectElement>("select");
        selects.forEach(select => select.selectedIndex = 0);

        const textareas = container.querySelectorAll<HTMLTextAreaElement>("textarea");
        textareas.forEach(textarea => textarea.value = "");


        inputs.forEach(input => {
            input.style.backgroundColor = "#ffffff"; // 흰색
        });


        selects.forEach(select => {
            select.style.backgroundColor = "#ffffff"; // 흰색
        });


        textareas.forEach(textarea => {
            textarea.style.backgroundColor = "#ffffff"; // 흰색
        });

    }

    function visible_option(option: string) {
        if (option === "init") { //초기화면

            (domElements.specSave_orderRegisterPage_tab_2 as HTMLButtonElement).disabled = true; //저장 버튼 비활성화
            domElements.specSave_orderRegisterPage_tab_2.classList.add("bg-gray-400", "cursor-not-allowed");

            domElements.specOrderNo_orderRegisterPage_tab_2.classList.remove("bg-gray-300");
            domElements.specOrderName_orderRegisterPage_tab_2.classList.remove("bg-gray-300");
            domElements.specOrderClient_orderRegisterPage_tab_2.classList.remove("bg-gray-300");

        }

        if (option === "call") { //수주건 불러왔을때

            (domElements.specSave_orderRegisterPage_tab_2 as HTMLButtonElement).disabled = false; //저장 버튼 활성화
            domElements.specSave_orderRegisterPage_tab_2.classList.remove("bg-gray-400", "cursor-not-allowed");

            domElements.specOrderNo_orderRegisterPage_tab_2.classList.add("bg-gray-300");
            domElements.specOrderName_orderRegisterPage_tab_2.classList.add("bg-gray-300");
            domElements.specOrderClient_orderRegisterPage_tab_2.classList.add("bg-gray-300");

        }
    }

    function handleFilterChange() {
        // 필터 값 가져오기
        const selectedYear = (domElements.filterYear_orderList_Modal_orderRegisterPage_tab_2 as HTMLSelectElement).value; // 예: "2025"
        const selectedEquipGroup = (domElements.filterEquipGroup_orderList_Modal_orderRegisterPage_tab_2 as HTMLSelectElement).value;
        const selectedClient = (domElements.filterClient_orderList_Modal_orderRegisterPage_tab_2 as HTMLSelectElement).value;

        console.log("🔍 선택된 필터 값:", {
            year: selectedYear,
            equipGroup: selectedEquipGroup,
            client: selectedClient,
        });

        // 현재 렌더링된 테이블 데이터에서 필터링
        const rows = Array.from(domElements.orderListBody_orderList_Modal_orderRegisterPage_tab_2.querySelectorAll("tr"));
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


    //사양이 적혀있는 DIV 들 내부의 아이디들 가져온 후 Payload 후 데이터베이스에 저장해버리자
    function gatherSpecPayload_tab_2() {
        const payload: { [key: string]: any } = {};

        // container 내부의 모든 id를 가진 요소를 수집
        const inputs = container.querySelectorAll<HTMLInputElement>("input");
        inputs.forEach((input) => {
            const id = input.id;
            payload[id] = input.value;
        });

        const selects = container.querySelectorAll<HTMLSelectElement>("select");
        selects.forEach((select) => {
            const id = select.id;
            payload[id] = select.value;
        });

        const textareas = container.querySelectorAll<HTMLTextAreaElement>("textarea");
        textareas.forEach((textarea) => {
            const id = textarea.id;
            payload[id] = textarea.value;
        });

        return payload;
    }

    async function SaveSpecPayload_tab_2() {

        const payload = gatherSpecPayload_tab_2();
        const orderNo = payload["specOrderNo_orderRegisterPage_tab_2"];

        try {
            const response = await fetch(`${API_BASE}/api/innomax-projects/spec_update/${orderNo}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error === "해당 order_no를 찾을 수 없습니다.") {
                    await ModalUtil.confirm({
                        title: "존재하지 않는 수주번호",
                        message: "존재하지 않는 수주번호 입니다.",
                        type: "error"
                    });

                    hideProgressModal();

                    return -1; // 중복 오류 코드 반환
                }
                throw new Error("Failed to save order");
            }

            return 0; // 정상 종료

        }
        catch (error) {
            console.error("Error saving spec payload:", error);
            alert("Error saving spec payload. Please try again. 개발자 문의!");
        }
    }
    //



    //#region 수주건 사양 불러와서 fill 해버림
    async function fetchAndFillSpec_orderRegister_tab_2(number: string) {
        try {
            const response = await fetch(`${API_BASE}/api/innomax-projects/${encodeURIComponent(number)}`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch order details");
            }

            const data = await response.json();
            const order = data.rows;
            const detail_spec = order.detail_spec_json;



            // 불러온 수주건 정보로 입력폼 채우기
            for (const key in detail_spec) {
                const element = container.querySelector<HTMLElement>(`#${key}`);
                if (element) {
                    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                        if (element.value !== detail_spec[key]) { // 이전 값과 비교
                            element.value = detail_spec[key];
                            element.dispatchEvent(new Event("change")); // 값이 다를 때만 이벤트 트리거
                        }
                    } else if (element instanceof HTMLSelectElement) {
                        if (element.value !== detail_spec[key]) { // 이전 값과 비교
                            element.value = detail_spec[key];
                            element.dispatchEvent(new Event("change")); // 값이 다를 때만 이벤트 트리거
                        }
                    }
                }
            }

        } catch (error) {
            console.error("Error fetching order details:", error);
            alert("Error fetching order details. Please try again. 개발자 문의!");
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
            domElements.orderListBody_orderList_Modal_orderRegisterPage_tab_2.innerHTML = "";

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



                domElements.orderListBody_orderList_Modal_orderRegisterPage_tab_2.appendChild(row);

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
        domElements.orderListBody_orderList_Modal_orderRegisterPage_tab_2.querySelectorAll("button").forEach((btn) => {
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
                        const response = await fetch(`${API_BASE}/api/innomax-projects/${encodeURIComponent(number)}`, {
                            method: "GET",
                            headers: {
                                Accept: "application/json",
                            },
                        });

                        if (!response.ok) {
                            throw new Error("Failed to fetch order details");
                        }

                        const data = await response.json();
                        const order = data.rows;
                        const detail = order.detail_json;

                        //불러온 수주건 정보로 입력폼 채우기
                        (domElements.specOrderNo_orderRegisterPage_tab_2 as HTMLInputElement).value = order.code_no;
                        (domElements.specOrderName_orderRegisterPage_tab_2 as HTMLInputElement).value = detail.equipName;
                        (domElements.specOrderClient_orderRegisterPage_tab_2 as HTMLInputElement).value = detail.clientName;



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

                    await fetchAndFillSpec_orderRegister_tab_2(number);

                }


            });
        });
    }


    //#endregion



    //#region 각종 이벤트 모음
    domElements.readOrder_orderRegisterPage_tab_2.addEventListener("click", async () => {
        console.log("Read Order button clicked in Tab 2");
        await fetchAndRenderOrderList();
        domElements.modalOverlay_orderRegisterPage_tab_2.classList.remove("hidden");

    });

    domElements.closeModalBtn1_orderList_Modal_orderRegisterPage_tab_2.addEventListener("click", () => {
        domElements.modalOverlay_orderRegisterPage_tab_2.classList.add("hidden");
    });

    domElements.closeModalBtn2_orderList_Modal_orderRegisterPage_tab_2.addEventListener("click", () => {
        domElements.modalOverlay_orderRegisterPage_tab_2.classList.add("hidden");
    });


    domElements.init_orderRegisterPage_tab_2.addEventListener("click", () => {
        allClear_tab_2();
        visible_option("init");
    });

    domElements.specSave_orderRegisterPage_tab_2.addEventListener("click", async () => {

        showProgressModal("수주건 저장 중...");

        updateProgressBar(10);
        await new Promise(resolve => setTimeout(resolve, 500)); // 완료 후 지연
        const returnValue = await SaveSpecPayload_tab_2();
        updateProgressBar(50);
        await new Promise(resolve => setTimeout(resolve, 200)); // 완료 후 지연

        updateProgressBar(70);
        await new Promise(resolve => setTimeout(resolve, 100)); // 완료 후 지연
        updateProgressBar(100);

        hideProgressModal();

        if (returnValue === 0) {
            ModalUtil.confirm({
                title: "저장 완료",
                message: "수주건 사양 데이터가 성공적으로 저장되었습니다.",
                type: "success"
            });
        };

        allClear_tab_2();
        visible_option("init");


    });



    // 필터 변경 이벤트 추가
    domElements.filterYear_orderList_Modal_orderRegisterPage_tab_2.addEventListener("change", handleFilterChange);
    domElements.filterEquipGroup_orderList_Modal_orderRegisterPage_tab_2.addEventListener("change", handleFilterChange);
    domElements.filterClient_orderList_Modal_orderRegisterPage_tab_2.addEventListener("change", handleFilterChange);

    domElements.filterResetbtn_orderList_Modal_orderRegisterPage_tab_2.addEventListener("click", () => {
        (domElements.filterYear_orderList_Modal_orderRegisterPage_tab_2 as HTMLSelectElement).value = "전체";
        (domElements.filterEquipGroup_orderList_Modal_orderRegisterPage_tab_2 as HTMLSelectElement).value = "전체";
        (domElements.filterClient_orderList_Modal_orderRegisterPage_tab_2 as HTMLSelectElement).value = "전체";
        handleFilterChange();
    });


    function addInputChangeHandlers() {
        const inputs = container.querySelectorAll<HTMLInputElement>("input");
        inputs.forEach(input => {
            input.addEventListener("change", () => {
                input.style.backgroundColor = "#d4fcd4"; // 옅은 녹색
            });
        });

        const selects = container.querySelectorAll<HTMLSelectElement>("select");
        selects.forEach(select => {
            select.addEventListener("change", () => {
                select.style.backgroundColor = "#d4fcd4"; // 옅은 녹색
            });
        });

        const textareas = container.querySelectorAll<HTMLTextAreaElement>("textarea");
        textareas.forEach(textarea => {
            textarea.addEventListener("change", () => {
                textarea.style.backgroundColor = "#d4fcd4"; // 옅은 녹색
            });
        });
    }

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

        const orderListModal = document.getElementById("modalOverlay_orderRegisterPage_tab_2") as HTMLDivElement;
        if (orderListModal) {
            orderListModal.classList.add("hidden");
        }
    }


    function updateProgressBar(percentage: number) {
        const progressBar = document.getElementById("progressBar_orderRegisterPage") as HTMLDivElement;
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }
    //#endregion





    allClear_tab_2();
    visible_option("init");
    addInputChangeHandlers();

}