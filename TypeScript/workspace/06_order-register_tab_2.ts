
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
    }

    function visible_option(option: string) {
        if (option === "init") { //초기화면

            (domElements.specSave_orderRegisterPage_tab_2 as HTMLButtonElement).disabled = true; //저장 버튼 비활성화
            domElements.specSave_orderRegisterPage_tab_2.classList.add("bg-gray-400", "cursor-not-allowed");

            (domElements.specEdit_orderRegisterPage_tab_2 as HTMLButtonElement).disabled = true; //수정 버튼 비활성화
            domElements.specEdit_orderRegisterPage_tab_2.classList.add("bg-gray-400", "cursor-not-allowed");



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
            let orders = data.data;

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

        
        visible_option("init");

        updateProgressBar(70);
        await new Promise(resolve => setTimeout(resolve, 100)); // 완료 후 지연
        updateProgressBar(100);

        hideProgressModal();
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





    allClear_tab_2();
    visible_option("init");

}