// TypeScript/workspace/order-register.ts

import { initOrderRegister_detail_Panel } from "./04_order-register_detail";

interface InnoMaxProjectDetail {
    orderNo: string;
    equipName: string;
    clientName: string;
    packDate: string | null;
    deliveryDate: string | null;

    mfgMain: string;
    mfgSub: string;
    mfgCompany: string;

    plcMain: string;
    plcSub: string;
    plcCompany: string;

    wireMain: string;
    wireSub: string;
    wireCompany: string;

    setupMain: string;
    setupSub: string;
}

interface InnoMaxProjectRow {
    code_no: string;
    detail_json: InnoMaxProjectDetail;
}

let orderRegisterInitialized = false;

export function initOrderRegisterPanel(API_BASE: string) {


    const API_BASE_inner =
        location.hostname === "tgyeo.github.io"
            ? "https://port-0-innomax-mghorm7bef413a34.sel3.cloudtype.app"
            : "http://127.0.0.1:5050";
    function clearForm() {
        orderNoEl.value = "";
        equipNameEl.value = "";
        clientNameEl.value = "";

        packDateEl.value = "";
        deliveryDateEl.value = "";

        mfgMainEl.value = "";
        mfgSubEl.value = "";
        mfgCompanyEl.value = "";

        plcMainEl.value = "";
        plcSubEl.value = "";
        plcCompanyEl.value = "";

        wireMainEl.value = "";
        wireSubEl.value = "";
        wireCompanyEl.value = "";

        setupMainEl.value = "";
        setupSubEl.value = "";

        // 포커스 기본 위치
        orderNoEl.focus();
    }

    const panel = document.getElementById("panel-수주건등록") as HTMLElement | null;
    if (!panel) {
        console.warn("⚠️ [OrderRegister] #panel-수주건등록 를 찾지 못했습니다.");
        return;
    }

    const orderNoEl = panel.querySelector("#orderNo") as HTMLInputElement;
    const equipNameEl = panel.querySelector("#equipName") as HTMLInputElement;
    const clientNameEl = panel.querySelector("#clientName") as HTMLSelectElement;

    const packDateEl = panel.querySelector("#packDate") as HTMLInputElement;
    const deliveryDateEl = panel.querySelector("#deliveryDate") as HTMLInputElement;

    const mfgMainEl = panel.querySelector("#mfgMain") as HTMLInputElement;
    const mfgSubEl = panel.querySelector("#mfgSub") as HTMLInputElement;
    const mfgCompanyEl = panel.querySelector("#mfgCompany") as HTMLInputElement;

    const plcMainEl = panel.querySelector("#plcMain") as HTMLInputElement;
    const plcSubEl = panel.querySelector("#plcSub") as HTMLInputElement;
    const plcCompanyEl = panel.querySelector("#plcCompany") as HTMLInputElement;

    const wireMainEl = panel.querySelector("#wireMain") as HTMLInputElement;
    const wireSubEl = panel.querySelector("#wireSub") as HTMLInputElement;
    const wireCompanyEl = panel.querySelector("#wireCompany") as HTMLInputElement;

    const setupMainEl = panel.querySelector("#setupMain") as HTMLInputElement;
    const setupSubEl = panel.querySelector("#setupSub") as HTMLInputElement;

    const btnSaveOrder = panel.querySelector("#btnSaveOrder") as HTMLButtonElement;
    const orderListBody = panel.querySelector(
        "#orderListBody"
    ) as HTMLTableSectionElement;

    if (!btnSaveOrder || !orderListBody) {
        console.error("❌ [OrderRegister] 버튼 또는 테이블 body를 찾지 못했습니다.");
        return;
    }

    // 내부 탭 버튼
    const tabButtons = document.querySelectorAll<HTMLButtonElement>(
        `#panel-수주건등록 .tab-btn`
    );

    const tabs = document.querySelectorAll<HTMLElement>(
        `#panel-수주건등록 .tab-panel`
    );


    // ============================================
    // ✅ 리스트 로드 함수
    // ============================================
    async function loadOrderList() {
        orderListBody.innerHTML =
            '<tr><td colspan="7" class="text-center text-gray-400 py-4">로딩 중...</td></tr>';

        try {
            const res = await fetch(`${API_BASE}/api/innomax-projects`);
            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message || "조회 실패");
            }

            const rows: InnoMaxProjectRow[] = json.rows || [];

            if (rows.length === 0) {
                orderListBody.innerHTML =
                    '<tr><td colspan="7" class="text-center text-gray-400 py-4">등록된 수주건이 없습니다.</td></tr>';
                return;
            }

            orderListBody.innerHTML = "";

            rows.forEach((row, idx) => {
                const d = row.detail_json || ({} as InnoMaxProjectDetail);

                const tr = document.createElement("tr");
                tr.classList.add(
                    "hover:bg-sky-50",
                    "cursor-pointer",
                    "transition-colors"
                );

                tr.innerHTML = `
          <td class="border px-3 py-1 text-center">${idx + 1}</td>
          <td class="border px-3 py-1">${row.code_no}</td>
          <td class="border px-3 py-1">${d.equipName ?? ""}</td>
          <td class="border px-3 py-1">${d.clientName ?? ""}</td>
          <td class="border px-3 py-1">${d.packDate ?? ""}</td>
          <td class="border px-3 py-1">${d.deliveryDate ?? ""}</td>
          <td class="border px-3 py-1 text-center text-xs">
            <button class="px-2 py-1 rounded bg-indigo-500 text-white btn-order-select" data-code="${row.code_no}">
              선택
            </button>
          </td>
        `;

                orderListBody.appendChild(tr);
            });
        } catch (err) {
            console.error("❌ [OrderRegister] 리스트 로드 오류:", err);
            orderListBody.innerHTML =
                '<tr><td colspan="7" class="text-center text-red-500 py-4">조회 중 오류가 발생했습니다.</td></tr>';
        }
    }

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

    // ============================================
    // ✅ 이벤트 바인딩 (중복 방지)
    // ============================================
    if (!orderRegisterInitialized) {
        orderRegisterInitialized = true;




        // 🔹 저장 버튼 클릭
        btnSaveOrder.addEventListener("click", async () => {
            const orderNo = orderNoEl.value.trim();
            const equipName = equipNameEl.value.trim();
            const clientName = clientNameEl.value.trim();

            if (!orderNo) {
                alert("수주건번호를 입력하세요.");
                orderNoEl.focus();
                return;
            }
            if (!equipName) {
                alert("장비명을 입력하세요.");
                equipNameEl.focus();
                return;
            }
            if (!clientName) {
                alert("고객사를 선택하세요.");
                clientNameEl.focus();
                return;
            }

            const payload: InnoMaxProjectDetail = {
                orderNo,
                equipName,
                clientName,
                packDate: packDateEl.value || null,
                deliveryDate: deliveryDateEl.value || null,

                mfgMain: mfgMainEl.value || "",
                mfgSub: mfgSubEl.value || "",
                mfgCompany: mfgCompanyEl.value || "",

                plcMain: plcMainEl.value || "",
                plcSub: plcSubEl.value || "",
                plcCompany: plcCompanyEl.value || "",

                wireMain: wireMainEl.value || "",
                wireSub: wireSubEl.value || "",
                wireCompany: wireCompanyEl.value || "",

                setupMain: setupMainEl.value || "",
                setupSub: setupSubEl.value || "",
            };

            try {
                const res = await fetch(`${API_BASE}/api/innomax-projects`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const json = await res.json();

                if (!res.ok || !json.ok) {
                    throw new Error(json.message || "저장 실패");
                }

                alert("수주건이 저장되었습니다.");
                clearForm();         // ← 폼 전체 초기화
                // 🔹 리스트 새로고침
                await loadOrderList();
            } catch (err) {
                console.error("❌ [OrderRegister] 저장 오류:", err);
                alert("수주건 저장 중 오류가 발생했습니다.");
            }
        });

        // 🔹 리스트에서 "선택" 버튼 클릭 시, 폼에 다시 채워넣기
        orderListBody.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (!target.classList.contains("btn-order-select")) return;

            const code = target.dataset.code;
            if (!code) return;

            // 현재 rows를 다시 가져오는 것보다는,
            // 화면에서 detail_json까지 숨겨두지 않았으니
            // 간단하게 다시 GET 후 해당 code_no를 찾아 채워넣는 방식 사용
            (async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/innomax-projects`);
                    const json = await res.json();

                    if (!res.ok || !json.ok) return;

                    const rows: InnoMaxProjectRow[] = json.rows || [];
                    const found = rows.find((r) => r.code_no === code);
                    if (!found) return;

                    const d = found.detail_json;

                    orderNoEl.value = d.orderNo ?? found.code_no;
                    equipNameEl.value = d.equipName ?? "";
                    clientNameEl.value = d.clientName ?? "";
                    packDateEl.value = d.packDate ?? "";
                    deliveryDateEl.value = d.deliveryDate ?? "";

                    mfgMainEl.value = d.mfgMain ?? "";
                    mfgSubEl.value = d.mfgSub ?? "";
                    mfgCompanyEl.value = d.mfgCompany ?? "";

                    plcMainEl.value = d.plcMain ?? "";
                    plcSubEl.value = d.plcSub ?? "";
                    plcCompanyEl.value = d.plcCompany ?? "";

                    wireMainEl.value = d.wireMain ?? "";
                    wireSubEl.value = d.wireSub ?? "";
                    wireCompanyEl.value = d.wireCompany ?? "";

                    setupMainEl.value = d.setupMain ?? "";
                    setupSubEl.value = d.setupSub ?? "";
                } catch (err) {
                    console.error("❌ [OrderRegister] 선택 후 로드 오류:", err);
                }
            })();
        });
    }

    // ✅ 탭 들어올 때마다 리스트는 매번 새로 조회
    loadOrderList().catch((err) =>
        console.error("❌ [OrderRegister] 초기 로드 오류:", err)
    );
}
