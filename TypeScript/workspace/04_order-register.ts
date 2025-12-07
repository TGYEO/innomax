// TypeScript/workspace/order-register.ts

import { initOrderRegister_detail_Panel } from "./04_order-register_detail";



export function initOrderRegisterPanel(API_BASE: string) {


    const API_BASE_inner =
        location.hostname === "tgyeo.github.io"
            ? "https://port-0-innomax-mghorm7bef413a34.sel3.cloudtype.app"
            : "http://127.0.0.1:5050";
    

    // 내부 탭 버튼
    const tabButtons = document.querySelectorAll<HTMLButtonElement>(
        `#panel-수주건등록 .tab-btn`
    );

    const tabs = document.querySelectorAll<HTMLElement>(
        `#panel-수주건등록 .tab-panel`
    );


    

    // 내부 탭 버튼 클릭 이벤트
    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const tabId = btn.dataset.tab;
            if (tabId === "_panel-수주건등록-2") {
                initOrderRegister_detail_Panel(API_BASE_inner);
            }


            //아직 작업 시작 안함
            // if (tabId === "_panel-수주건등록-1") {
            //     initOrderRegister_detail_Panel(API_BASE_inner);
            // }

            // if (tabId === "_panel-수주건등록-3") {
            //     initOrderRegister_detail_Panel(API_BASE_inner);
            // }


        });
    });

 
}
