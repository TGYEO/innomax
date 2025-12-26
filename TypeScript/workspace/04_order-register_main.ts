let initOrderRegister_main_init = false;

import {initOrderRegister_tab_1} from "./05_order-register_tab_1";
import {initOrderRegister_tab_2} from "./06_order-register_tab_2";
import {initOrderRegister_tab_3} from "./07_order-register_tab_3";

export function initOrderRegister_main(API_BASE: string) {

    

    // 모든 탭 숨기기 (접근 시마다 실행)
    const tabs = document.querySelectorAll(".tab-panel");
    tabs.forEach((tab) => {
        tab.classList.add("opacity-0", "translate-x-10", "pointer-events-none");
    });

    if (initOrderRegister_main_init) return;
    initOrderRegister_main_init = true;


    
    //각 탭페이지 접속
    const tabButtons = document.querySelectorAll("[data-tab-target]");
tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const targetTab = button.getAttribute("data-tab-target");

        // 모든 버튼에서 활성화 클래스 제거
        tabButtons.forEach((btn) => btn.classList.remove("active-tab"));

        // 현재 버튼에 활성화 클래스 추가
        button.classList.add("active-tab");

        // 선택된 탭 활성화
        const activeTab = document.querySelector(`#${targetTab}`);
        if (activeTab) {
            activeTab.classList.remove("opacity-0", "translate-x-10", "pointer-events-none");
        }

        // 탭에 따라 초기화 함수 호출
        switch (targetTab) {
            case "orderRegisterPage_tab_1":
                initOrderRegister_tab_1(API_BASE);
                break;
            case "orderRegisterPage_tab_2":
                initOrderRegister_tab_2(API_BASE);
                break;
            case "orderRegisterPage_tab_3":
                initOrderRegister_tab_3(API_BASE);
                break;
            default:
                console.warn("Unknown tab:", targetTab);
        }
    });
});




    



 
}
