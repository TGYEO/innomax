let initOrderRegister_detail_Panel_Initialized = false;

type SizeKey = "main_1" | "main_2" | "local1" | "local2" | "local3" | "local4" | "local5";

export function initOrderRegister_detail_Panel(API_BASE: string) {

    if (initOrderRegister_detail_Panel_Initialized) return;
    initOrderRegister_detail_Panel_Initialized = true;

    console.log("🟦 [메인장비 사양등록] 패널 초기화 시작");

    // 🔧 실제 1~8 생성
    const container = document.getElementById("chamber-container")!;
    for (let i = 1; i <= 8; i++) {
        container.insertAdjacentHTML("beforeend", createChamberLayout(i));

        const domChamber = collectChamberDOM(i);
        bindChamberEvents(domChamber);
        bindChamberEvents_1(domChamber, i);


    }





    // -------------------------------------------------------------------
    // 📌 1) DOM 요소 수집
    // -------------------------------------------------------------------

    const suffix = "_panel-수주건등록-2";

    const dom = {
        type: document.getElementById("equipment_type" + suffix) as HTMLSelectElement,
        inch: document.getElementById("equipment_inch" + suffix) as HTMLSelectElement,
        traumWrap: document.getElementById("traum_only_wrap" + suffix) as HTMLDivElement,
        traumSub: document.getElementById("traum_sub" + suffix) as HTMLSelectElement,
        driveType: document.getElementById("drive_type" + suffix) as HTMLSelectElement,

        layout: document.getElementById("layout-view" + suffix) as HTMLDivElement,
        btnApply: document.getElementById("장비기본구조-btnApplyLayout" + suffix) as HTMLButtonElement,

        sizeInputs: {
            main_1: {
                width: document.getElementById("main_1_width" + suffix) as HTMLInputElement,
                height: document.getElementById("main_1_height" + suffix) as HTMLInputElement,
            },
            main_2: {
                width: document.getElementById("main_2_width" + suffix) as HTMLInputElement,
                height: document.getElementById("main_2_height" + suffix) as HTMLInputElement,
            },
            local1: {
                width: document.getElementById("local1_width" + suffix) as HTMLInputElement,
                height: document.getElementById("local1_height" + suffix) as HTMLInputElement,
            },
            local2: {
                width: document.getElementById("local2_width" + suffix) as HTMLInputElement,
                height: document.getElementById("local2_height" + suffix) as HTMLInputElement,
            },
            local3: {
                width: document.getElementById("local3_width" + suffix) as HTMLInputElement,
                height: document.getElementById("local3_height" + suffix) as HTMLInputElement,
            },
            local4: {
                width: document.getElementById("local4_width" + suffix) as HTMLInputElement,
                height: document.getElementById("local4_height" + suffix) as HTMLInputElement,
            },
            local5: {
                width: document.getElementById("local5_width" + suffix) as HTMLInputElement,
                height: document.getElementById("local5_height" + suffix) as HTMLInputElement,
            },
        } as Record<SizeKey, { width: HTMLInputElement; height: HTMLInputElement }>



    };

    function collectChamberDOM(chNo: number) {
        const suffix = "_panel-수주건등록-2";

        const dom: any = {

            // 🔹 챔버 전체 DIV (루트 DOM 추가)
            root: document.getElementById(`챔버-${chNo}-구조`),


            chuckType: document.getElementById(`챔버-${chNo}-구조-chuck_type${suffix}`),

            cups: {},
            innerCup: document.getElementById(`챔버-${chNo}-구조-inner-cup_type${suffix}`),

            backChemical: {
                type1: document.getElementById(`챔버-${chNo}-구조-Back-Chemical-type-1${suffix}`),
                type2: document.getElementById(`챔버-${chNo}-구조-Back-Chemical-type-2${suffix}`)
            },

            dispensers: {},

            btnApply: document.getElementById(`챔버-${chNo}-구조-btnApplyLayout${suffix}`)
        };

        // -------------------------------------------------
        // Cup 1~4 DOM 수집
        // -------------------------------------------------
        for (let i = 1; i <= 4; i++) {
            dom.cups[`cup${i}`] = document.getElementById(
                `챔버-${chNo}-구조-cup-${i}_type${suffix}`
            );
        }

        // -------------------------------------------------
        // Dispenser 1~4 DOM 수집
        // -------------------------------------------------
        for (let d = 1; d <= 4; d++) {
            const dispKey = `dispenser${d}`;
            dom.dispensers[dispKey] = {
                type: document.getElementById(
                    `챔버-${chNo}-구조-dispenser-${d}_type${suffix}`
                ),
                chemicals: {}
            };

            // Chemical 1~4
            for (let c = 1; c <= 4; c++) {
                dom.dispensers[dispKey].chemicals[`chem${c}`] =
                    document.getElementById(
                        `챔버-${chNo}-구조-dispenser-${d}-chemical-${c}_type${suffix}`
                    );
            }
        }

        //이벤트 등록 함수

        return dom;
    }


    dom.layout.style.position = "relative";
    dom.layout.style.minHeight = "400px";

    // -------------------------------------------------------------------
    // 📌 2) TRAUM ONLY 표시
    // -------------------------------------------------------------------
    function applyTraumCondition() {
        console.log(`🔎 [TRAUM 체크] type=${dom.type.value}`);
        dom.traumWrap.style.display = dom.type.value === "TRAUM" ? "" : "none";
    }
    applyTraumCondition();
    dom.type.addEventListener("change", applyTraumCondition);

    // -------------------------------------------------------------------
    // 📌 3) 확인 버튼 클릭 → 박스 생성
    // -------------------------------------------------------------------
    dom.btnApply.addEventListener("click", () => {

        console.log("📐 [레이아웃 생성 START] ---------------------------");

        // 초기화
        dom.layout.innerHTML = "";
        console.log("🧹 기존 layout 박스 삭제 완료");

        const items: { key: SizeKey; label: string }[] = [
            { key: "main_1", label: "메인장비-1" },
            { key: "main_2", label: "메인장비-2" },
            { key: "local1", label: "로컬유닛-1" },
            { key: "local2", label: "로컬유닛-2" },
            { key: "local3", label: "로컬유닛-3" },
            { key: "local4", label: "로컬유닛-4" },
            { key: "local5", label: "로컬유닛-5" },
        ];

        // ● 입력된 값 확인 로그
        console.log("📥 입력값 확인");
        items.forEach(i => {
            console.log(
                `   - ${i.label}: ${dom.sizeInputs[i.key].width.value} × ${dom.sizeInputs[i.key].height.value}`
            );
        });

        // 유효값 필터링
        const valid = items.map(item => {
            const w = Number(dom.sizeInputs[item.key].width.value);
            const h = Number(dom.sizeInputs[item.key].height.value);

            return { ...item, width: w, height: h };
        }).filter(v => v.width > 0 && v.height > 0);

        console.log("📋 유효 데이터:", valid);

        if (!valid.length) {
            console.warn("⚠️ [STOP] width/height 모두 0 또는 비어 있음 → 박스 생성 중단");
            return;
        }

        const maxWidth = Math.max(...valid.map(x => x.width));
        const maxHeight = Math.max(...valid.map(x => x.height));

        console.log("📏 최대 width =", maxWidth, " / 최대 height =", maxHeight);

        const baseMinW = 80;   // 최소 가로 px
        const baseMinH = 40;   // 최소 세로 px
        const baseAddW = 220;  // 비례 가로 px
        const baseAddH = 140;  // 비례 세로 px

        valid.forEach((item, idx) => {

            // 📌 가로 비례(px)
            const ratioW = item.width / maxWidth;
            const pxWidth = baseMinW + baseAddW * ratioW;

            // 📌 세로 비례(px)
            const ratioH = item.height / maxHeight;
            const pxHeight = baseMinH + baseAddH * ratioH;

            console.log(`➡ 박스 생성: ${item.label}, size = ${pxWidth} × ${pxHeight}`);

            const box = document.createElement("div");
            box.className = "drag-box";

            // 가로/세로 반영
            box.style.width = `${pxWidth}px`;
            box.style.height = `${pxHeight}px`; // 실제로 height 가 아니라고 봐야한다

            // 초기 위치
            box.style.left = "10px";
            box.style.top = `${10 + idx * (pxHeight + 20)}px`;

            // Text
            box.textContent = `${item.label} (${item.width} × ${item.height})`;

            dom.layout.appendChild(box);
        });


        console.log("🎉 박스 생성 완료. 드래그 기능 활성화");

        enableDrag(dom.layout);
    });

    // -------------------------------------------------------------------
    // 📌 4) 드래그 기능
    // -------------------------------------------------------------------
    function enableDrag(container: HTMLElement) {
        console.log("🟦 드래그 기능 활성화");

        let target: HTMLElement | null = null;
        let offsetX = 0, offsetY = 0;

        container.onmousedown = (e) => {
            const el = (e.target as HTMLElement).closest(".drag-box") as HTMLElement;
            if (!el) return;

            target = el;

            const rect = el.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            console.log(`🟡 드래그 시작: ${el.textContent}`);

            document.onmousemove = onMove;
            document.onmouseup = onUp;
        };

        function onMove(e: MouseEvent) {
            if (!target) return;

            const rect = container.getBoundingClientRect();
            let x = e.clientX - rect.left - offsetX;
            let y = e.clientY - rect.top - offsetY;

            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x > rect.width - target.offsetWidth)
                x = rect.width - target.offsetWidth;
            if (y > rect.height - target.offsetHeight)
                y = rect.height - target.offsetHeight;

            target.style.left = `${x}px`;
            target.style.top = `${y}px`;
        }

        function onUp() {
            if (target) {
                console.log(`🟢 드래그 종료: 최종 위치 = ${target.style.left}, ${target.style.top}`);
            }
            target = null;
            document.onmousemove = null;
            document.onmouseup = null;
        }
    }


    function createChamberLayout(chNo: any) {
        return `
        <div class="border border-[#000000] mt-3 rounded">

            <!-- 🔹 챔버 헤더 (이벤트 없음) -->
            <div id="챔버-${chNo}-구조-header"
                class="flex justify-between items-center bg-gray-200 px-2 py-1.5 cursor-pointer">

                <div class="font-semibold">챔버-${chNo}</div>

                <button id="챔버-${chNo}-구조-toggleBtn"
                    class="text-sm text-blue-600 hover:underline">
                    접기
                </button>
            </div>

            <!-- 🔹 챔버 전체 내부 (접기/펼침 대상) -->
            <div id="챔버-${chNo}-구조-body" class="p-1.5 space-y-2">

                <!-- CHUCK -->
                <div class="opt-row p-1.5">
                    <label class="opt-label">CHUCK Type</label>
                    <select id="챔버-${chNo}-구조-chuck_type_panel-수주건등록-2" class="opt-input p-1.5">
                        <option>NONE</option>
                        <option>GRIP</option>
                        <option>VACCUM</option>
                        <option>Bernoulli</option>
                        <option>Venturi</option>
                    </select>
                </div>

                <!-- Cup 1~4 -->
                ${[1, 2, 3, 4].map(i => `
                <div class="opt-row p-1.5">
                    <label class="opt-label">Cup-${i} Type</label>
                    <select id="챔버-${chNo}-구조-cup-${i}_type_panel-수주건등록-2" class="opt-input p-1.5">
                        <option>None</option>
                        <option>Cyclinder</option>
                        <option>Motor</option>
                    </select>
                </div>
                `).join("")}

                <!-- Inner Cup -->
                <div class="opt-row p-1.5">
                    <label class="opt-label">Inner Cup Type</label>
                    <select id="챔버-${chNo}-구조-inner-cup_type_panel-수주건등록-2" class="opt-input p-1.5">
                        <option>None</option>
                        <option>Motor</option>
                    </select>
                </div>

                <!-- Back Chemical -->
                <div class="opt-row p-1.5">
                    <label class="opt-label">Back Chemical</label>
                    <div class="flex flex-col gap-1">
                        <select id="챔버-${chNo}-구조-Back-Chemical-type-1_panel-수주건등록-2" class="opt-input p-1.5">
                            <option>None</option>
                            <option>DIW</option>
                            <option>N2</option>
                        </select>
                        <select id="챔버-${chNo}-구조-Back-Chemical-type-2_panel-수주건등록-2" class="opt-input p-1.5">
                            <option>None</option>
                            <option>DIW</option>
                            <option>N2</option>
                        </select>
                    </div>
                </div>

                <!-- DIS1 --------------------------------------------------------------- -->
                <div class="border border-[#53f51d] p-1.5 space-y-1.5">

                    <div class="opt-row p-1.5">
                        <label class="opt-label">Dispenser-1 Type</label>
                        <select id="챔버-${chNo}-구조-dispenser-1_type_panel-수주건등록-2" class="opt-input p-1.5">
                            <option>None</option>
                            <option>U/D Cyclinder</option>
                            <option>U/D Motor</option>
                        </select>
                    </div>

                    <div class="opt-row p-1.5">
                        <label class="opt-label">Dispenser-1 Chemical</label>
                        <div class="flex flex-col gap-1">
                            ${[1, 2, 3, 4].map(i => `
                                <input type="text"
                                    id="챔버-${chNo}-구조-dispenser-1-chemical-${i}_type_panel-수주건등록-2"
                                    class="opt-input p-1.5"
                                    placeholder="Chemical ${i}">
                            `).join("")}
                        </div>
                    </div>
                </div>

                <!-- DIS2 --------------------------------------------------------------- -->
                <div class="border border-[#f5361d] p-1.5 space-y-1.5">
                    <div class="opt-row p-1.5">
                        <label class="opt-label">Dispenser-2 Type</label>
                        <select id="챔버-${chNo}-구조-dispenser-2_type_panel-수주건등록-2" class="opt-input p-1.5">
                            <option>None</option>
                            <option>U/D Cyclinder</option>
                            <option>U/D Motor</option>
                        </select>
                    </div>

                    <div class="opt-row p-1.5">
                        <label class="opt-label">Dispenser-2 Chemical</label>
                        <div class="flex flex-col gap-1">
                            ${[1, 2, 3, 4].map(i => `
                                <input type="text"
                                    id="챔버-${chNo}-구조-dispenser-2-chemical-${i}_type_panel-수주건등록-2"
                                    class="opt-input p-1.5"
                                    placeholder="Chemical ${i}">
                            `).join("")}
                        </div>
                    </div>
                </div>

                <!-- DIS3 --------------------------------------------------------------- -->
                <div class="border border-[#0988cc] p-1.5 space-y-1.5">
                    <div class="opt-row p-1.5">
                        <label class="opt-label">Dispenser-3 Type</label>
                        <select id="챔버-${chNo}-구조-dispenser-3_type_panel-수주건등록-2" class="opt-input p-1.5">
                            <option>None</option>
                            <option>U/D Cyclinder</option>
                            <option>U/D Motor</option>
                        </select>
                    </div>

                    <div class="opt-row p-1.5">
                        <label class="opt-label">Dispenser-3 Chemical</label>
                        <div class="flex flex-col gap-1">
                            ${[1, 2, 3, 4].map(i => `
                                <input type="text"
                                    id="챔버-${chNo}-구조-dispenser-3-chemical-${i}_type_panel-수주건등록-2"
                                    class="opt-input p-1.5"
                                    placeholder="Chemical ${i}">
                            `).join("")}
                        </div>
                    </div>
                </div>

                <!-- DIS4 --------------------------------------------------------------- -->
                <div class="border border-[#ba7cf8] p-1.5 space-y-1.5">
                    <div class="opt-row p-1.5">
                        <label class="opt-label">Dispenser-4 Type</label>
                        <select id="챔버-${chNo}-구조-dispenser-4_type_panel-수주건등록-2" class="opt-input p-1.5">
                            <option>None</option>
                            <option>U/D Cyclinder</option>
                            <option>U/D Motor</option>
                        </select>
                    </div>

                    <div class="opt-row p-1.5">
                        <label class="opt-label">Dispenser-4 Chemical</label>
                        <div class="flex flex-col gap-1">
                            ${[1, 2, 3, 4].map(i => `
                                <input type="text"
                                    id="챔버-${chNo}-구조-dispenser-4-chemical-${i}_type_panel-수주건등록-2"
                                    class="opt-input p-1.5"
                                    placeholder="Chemical ${i}">
                            `).join("")}
                        </div>
                    </div>
                </div>

                <div class="flex justify-end mt-4">
                    <button id="챔버-${chNo}-구조-btnApplyLayout_panel-수주건등록-2"
                        class="px-4 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
                        확인
                    </button>
                </div>

            </div>
        </div>
        `;
    }




    //#region 챔버 형상화 관련
    function collectChamberValues(dom: any) {
        const result: any = {};

        result.chuckType = dom.chuckType.value;
        result.innerCup = dom.innerCup.value;

        result.cups = {};
        for (let i = 1; i <= 4; i++) {
            result.cups[`cup${i}`] = dom.cups[`cup${i}`].value;
        }

        result.backChemical = {
            type1: dom.backChemical.type1.value,
            type2: dom.backChemical.type2.value,
        };

        result.dispensers = {};
        for (let d = 1; d <= 4; d++) {
            result.dispensers[`disp${d}`] = {
                type: dom.dispensers[`dispenser${d}`].type.value,
                chemicals: {}
            };

            for (let c = 1; c <= 4; c++) {
                result.dispensers[`disp${d}`].chemicals[`chem${c}`] =
                    dom.dispensers[`dispenser${d}`].chemicals[`chem${c}`].value;
            }
        }

        return result;
    }


    function appendChamberBox(chNo: number, values: any) {

        const boxId = `box_${chNo}_${Date.now()}`;

        const box = document.createElement("div");
        box.id = boxId;

        box.className = `
        absolute bg-white border border-black rounded shadow-md p-2
        w-[220px] h-auto cursor-move select-none
    `;

        box.innerHTML = `
        <div class="font-bold text-sm mb-2">Chamber ${chNo}</div>

        <div class="text-xs leading-4 space-y-1">

            <div><b>CHUCK :</b> ${values.chuckType}</div>
            <div><b>INNER :</b> ${values.innerCup}</div>

            <div><b>CUP-1 :</b> 
                ${values.cups.cup1}
            </div>

            <div><b>CUP-2 :</b> 
                ${values.cups.cup2}
            </div>

            <div><b>CUP-3 :</b> 
                ${values.cups.cup3}
            </div>
            
            <div><b>CUP-4 :</b> 
                ${values.cups.cup4}
            </div>

            <div><b>BACK :</b> 
                ${values.backChemical.type1},
                ${values.backChemical.type2}
            </div>

            ${[1, 2, 3, 4].map(d => `
                <div class="mt-1">
                    <b>DIS-${d} :</b> ${values.dispensers[`disp${d}`].type}
                </div>
                <div class="ml-2">
                    ${values.dispensers[`disp${d}`].chemicals.chem1},
                    ${values.dispensers[`disp${d}`].chemicals.chem2},
                    ${values.dispensers[`disp${d}`].chemicals.chem3},
                    ${values.dispensers[`disp${d}`].chemicals.chem4}
                </div>
            `).join("")}

        </div>

        <button class="absolute top-1 right-1 text-[10px] px-1 bg-red-600 text-white rounded"
            data-remove="${boxId}">
            X
        </button>
    `;

        // 랜덤 초기 위치
        box.style.left = `${30 + Math.random() * 100}px`;
        box.style.top = `${30 + Math.random() * 100}px`;

        dom.layout.appendChild(box);

        makeDraggable(box);
        bindRemoveEvent(box);
    }



    function makeDraggable(box: HTMLElement) {
        let offsetX = 0;
        let offsetY = 0;
        let isDown = false;

        box.addEventListener("mousedown", (e) => {
            if ((e.target as HTMLElement).dataset.remove) return; // X 버튼 제외

            isDown = true;
            offsetX = e.clientX - box.offsetLeft;
            offsetY = e.clientY - box.offsetTop;
            box.style.zIndex = "999";
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            box.style.left = e.clientX - offsetX + "px";
            box.style.top = e.clientY - offsetY + "px";
        });

        document.addEventListener("mouseup", () => {
            isDown = false;
            box.style.zIndex = "1";
        });
    }


    function bindRemoveEvent(box: HTMLElement) {
        const btn = box.querySelector("[data-remove]") as HTMLElement;
        if (!btn) return;

        btn.addEventListener("click", () => {
            box.remove();
        });
    }


    const container_1 = document.getElementById("chamber-container")!;
    for (let i = 1; i <= 8; i++) {

        const dom = collectChamberDOM(i);
        bindChamberEvents(dom); // 변경 색 하이라이트


        // 🔵 확인 버튼 이벤트 연결
        dom.btnApply.addEventListener("click", () => {
            const values = collectChamberValues(dom);
            appendChamberBox(i, values);

        });
    }


    //#endregion



    //#region 공통 함수
    function applySelectHighlight(selectEl: HTMLSelectElement | null) {
        if (!selectEl) return;

        selectEl.addEventListener("change", () => {
            selectEl.style.backgroundColor = "#d0f0ff";   // 변경 시 하늘색
        });




    }




    async function bindChamberEvents(dom: any): Promise<number> {

        // 1) Chuck   
        applySelectHighlight(dom.chuckType);

        applySelectHighlight(dom.root);

        // 2) Inner Cup
        applySelectHighlight(dom.innerCup);

        // 3) Back Chemical 1, 2
        applySelectHighlight(dom.backChemical.type1);
        applySelectHighlight(dom.backChemical.type2);

        // 4) Cup 1~4
        for (let i = 1; i <= 4; i++) {
            applySelectHighlight(dom.cups[`cup${i}`]);
        }

        // 5) Dispenser 1~4 + Chemical 1~4
        for (let d = 1; d <= 4; d++) {
            const disp = dom.dispensers[`dispenser${d}`];
            if (!disp) continue;

            applySelectHighlight(disp.type);

            for (let c = 1; c <= 4; c++) {
                applySelectHighlight(disp.chemicals[`chem${c}`]);
            }
        }
        return 1;
    }


    function bindChamberEvents_1(dom: any, chNo: number) {
        const header = document.getElementById(`챔버-${chNo}-구조-header`);
        const body = document.getElementById(`챔버-${chNo}-구조-body`);
        const btn = document.getElementById(`챔버-${chNo}-구조-toggleBtn`);

        if (!header || !body || !btn) return;

        header.addEventListener("click", () => {
            const hidden = body.style.display === "none";

            body.style.display = hidden ? "block" : "none";
            btn.innerText = hidden ? "접기" : "펼치기";
        });
    }




    //#endregion



    console.log("✅ [메인장비 사양등록] 패널 초기화 완료");
}
