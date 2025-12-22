
//여기는 수주건 등록쪽임 초기

import { ModalUtil } from "../workspace/utils/ModalUtil";


let initOrderRegister_tab_1_init = false;

export function initOrderRegister_tab_1(API_BASE: string) {

    // 탭 패널
    const orderNo_orderRegisterPage_tab_1 = document.getElementById("orderNo_orderRegisterPage_tab_1") as HTMLInputElement;
    const equipName_orderRegisterPage_tab_1 = document.getElementById("equipName_orderRegisterPage_tab_1") as HTMLInputElement;
    const clientName_orderRegisterPage_tab_1 = document.getElementById("clientName_orderRegisterPage_tab_1") as HTMLSelectElement;
    const packDate_orderRegisterPage_tab_1 = document.getElementById("packDate_orderRegisterPage_tab_1") as HTMLInputElement;
    const deliveryDate_orderRegisterPage_tab_1 = document.getElementById("deliveryDate_orderRegisterPage_tab_1") as HTMLInputElement;
    const hartMakeMain_orderRegisterPage_tab_1 = document.getElementById("hartMakeMain_orderRegisterPage_tab_1") as HTMLInputElement;
    const hartMakeSub_orderRegisterPage_tab_1 = document.getElementById("hartMakeSub_orderRegisterPage_tab_1") as HTMLInputElement;
    const hartMakeCompany_orderRegisterPage_tab_1 = document.getElementById("hartMakeCompany_orderRegisterPage_tab_1") as HTMLInputElement;
    const plcMain_orderRegisterPage_tab_1 = document.getElementById("plcMain_orderRegisterPage_tab_1") as HTMLInputElement;
    const plcSub_orderRegisterPage_tab_1 = document.getElementById("plcSub_orderRegisterPage_tab_1") as HTMLInputElement;
    const plcCompany_orderRegisterPage_tab_1 = document.getElementById("plcCompany_orderRegisterPage_tab_1") as HTMLInputElement;
    const wireMain_orderRegisterPage_tab_1 = document.getElementById("wireMain_orderRegisterPage_tab_1") as HTMLInputElement;
    const wireSub_orderRegisterPage_tab_1 = document.getElementById("wireSub_orderRegisterPage_tab_1") as HTMLInputElement;
    const wireCompany_orderRegisterPage_tab_1 = document.getElementById("wireCompany_orderRegisterPage_tab_1") as HTMLInputElement;
    const setupMain_orderRegisterPage_tab_1 = document.getElementById("setupMain_orderRegisterPage_tab_1") as HTMLInputElement;
    const setupSub_orderRegisterPage_tab_1 = document.getElementById("setupSub_orderRegisterPage_tab_1") as HTMLInputElement;
    const btnSaveOrder_orderRegisterPage_tab_1 = document.getElementById("btnSaveOrder_orderRegisterPage_tab_1") as HTMLButtonElement;
    const orderListBody_orderRegisterPage_tab_1 = document.getElementById("orderListBody_orderRegisterPage_tab_1") as HTMLTableSectionElement;


    if (initOrderRegister_tab_1_init) {
        clearOrderRegisterTab1Inputs();
        return;

    }
    initOrderRegister_tab_1_init = true;



    //#region 각종 유틸 함수관련

    function clearOrderRegisterTab1Inputs() {
        orderNo_orderRegisterPage_tab_1.value = "";
        equipName_orderRegisterPage_tab_1.value = "";
        clientName_orderRegisterPage_tab_1.value = "";
        packDate_orderRegisterPage_tab_1.value = "";
        deliveryDate_orderRegisterPage_tab_1.value = "";
        hartMakeMain_orderRegisterPage_tab_1.value = "";
        hartMakeSub_orderRegisterPage_tab_1.value = "";
        hartMakeCompany_orderRegisterPage_tab_1.value = "";
        plcMain_orderRegisterPage_tab_1.value = "";
        plcSub_orderRegisterPage_tab_1.value = "";
        plcCompany_orderRegisterPage_tab_1.value = "";
        wireMain_orderRegisterPage_tab_1.value = "";
        wireSub_orderRegisterPage_tab_1.value = "";
        wireCompany_orderRegisterPage_tab_1.value = "";
        setupMain_orderRegisterPage_tab_1.value = "";
        setupSub_orderRegisterPage_tab_1.value = "";
    }



    //#endregion





    //#region 수주건 저장 함수
    async function saveOrderRegisterTab1() {
        const payload = {
            orderNo: orderNo_orderRegisterPage_tab_1.value,
            equipName: equipName_orderRegisterPage_tab_1.value,
            clientName: clientName_orderRegisterPage_tab_1.value,
            packDate: packDate_orderRegisterPage_tab_1.value,
            deliveryDate: deliveryDate_orderRegisterPage_tab_1.value,
            hartMakeMain: hartMakeMain_orderRegisterPage_tab_1.value,
            hartMakeSub: hartMakeSub_orderRegisterPage_tab_1.value,
            hartMakeCompany: hartMakeCompany_orderRegisterPage_tab_1.value,
            plcMain: plcMain_orderRegisterPage_tab_1.value,
            plcSub: plcSub_orderRegisterPage_tab_1.value,
            plcCompany: plcCompany_orderRegisterPage_tab_1.value,
            wireMain: wireMain_orderRegisterPage_tab_1.value,
            wireSub: wireSub_orderRegisterPage_tab_1.value,
            wireCompany: wireCompany_orderRegisterPage_tab_1.value,
            setupMain: setupMain_orderRegisterPage_tab_1.value,
            setupSub: setupSub_orderRegisterPage_tab_1.value,
        };

        try {
            const response = await fetch(`${API_BASE}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to save order");
            }

            clearOrderRegisterTab1Inputs();
            // 추가로, 수주건 목록을 새로고침하는 함수 호출 가능

        } catch (error) {
            console.error("Error saving order:", error);
            alert("Error saving order. Please try again. 개발자 문의!");
        }
    }


    //#endrion


    //#region 현재 등록 되어있는 수주건 불러오기





    //#endregion






    //#region 각종 이벤트쓰

    btnSaveOrder_orderRegisterPage_tab_1.addEventListener("click", async () => {
        showProgressModal("수주건 저장 중...");
        updateProgressBar(10);
        await new Promise(resolve => setTimeout(resolve, 500)); // 완료 후 지연

        updateProgressBar(50);
        await new Promise(resolve => setTimeout(resolve, 200)); // 완료 후 지연

        updateProgressBar(70);
        await new Promise(resolve => setTimeout(resolve, 100)); // 완료 후 지연
        updateProgressBar(100);
        //await saveOrderRegisterTab1();
        hideProgressModal();


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


}
