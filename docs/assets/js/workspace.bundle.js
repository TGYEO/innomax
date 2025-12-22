/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./TypeScript/workspace/01_dashboard.ts":
/*!**********************************************!*\
  !*** ./TypeScript/workspace/01_dashboard.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initDashboardPanel: () => (/* binding */ initDashboardPanel)
/* harmony export */ });
/**
 * 📊 장비 대시보드 초기화 (전체 코드)
 */
async function initDashboardPanel(API_BASE) {
    console.debug("📊 [Dashboard] 초기화 시작");
}


/***/ }),

/***/ "./TypeScript/workspace/02_view.ts":
/*!*****************************************!*\
  !*** ./TypeScript/workspace/02_view.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initView: () => (/* binding */ initView)
/* harmony export */ });
// src/view.ts
function initView(API_BASE) {
    const userData = localStorage.getItem("user");
    if (!userData) {
        alert("세션 만료 또는 비정상 접근입니다.");
        window.location.href = "index.html";
        return;
    }
    const user = JSON.parse(userData);
    const userName = document.getElementById("userName");
    const avatar = document.getElementById("avatar");
    if (userName)
        userName.textContent = user.name;
    if (avatar)
        avatar.textContent = user.name.charAt(0).toUpperCase();
    // ✅ 세션 만료 체크 (30분 기준)
    const loginTime = user.loginTime;
    const now = Date.now();
    if (now - loginTime > 1000 * 60 * 30) {
        alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
        localStorage.clear();
        window.location.href = "index.html";
    }
    // ✅ 로그아웃 버튼 이벤트
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.clear();
        fetch(`${API_BASE}/api/login/logout`, {
            method: "POST",
            credentials: "include",
        }).catch(() => { });
        window.location.href = "index.html";
    });
    // ✅ 뒤로가기 방지
    history.pushState(null, "", location.href);
    window.onpopstate = function () {
        history.go(1);
    };
}


/***/ }),

/***/ "./TypeScript/workspace/03_user-register.ts":
/*!**************************************************!*\
  !*** ./TypeScript/workspace/03_user-register.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initUserRegisterPanel: () => (/* binding */ initUserRegisterPanel)
/* harmony export */ });
function initUserRegisterPanel(API_BASE) {
    const userTableBody = document.getElementById("userTableBody");
    const userCount = document.getElementById("userCount");
    const userForm = document.getElementById("userForm");
    const modalMode = document.getElementById("modalMode");
    const modalNo = document.getElementById("modalNo");
    const userModal = document.getElementById("userModal");
    const permPreview = document.getElementById("permPreview");
    const permLabels = {
        order_register: "수주건등록",
        task_assign: "업무할당",
        progress: "진행상황",
        report: "진행상황보고",
        request: "요청사항",
    };
    const permValues = {
        ReadWrite: "읽고 쓰기 가능",
        ReadOnly: "읽기 전용",
        NoAccess: "접근 불가",
    };
    function parsePerm(json) {
        try {
            const obj = json ? JSON.parse(json) : {};
            return {
                order_register: obj.order_register ?? "NoAccess",
                task_assign: obj.task_assign ?? "NoAccess",
                progress: obj.progress ?? "NoAccess",
                report: obj.report ?? "NoAccess",
                request: obj.request ?? "NoAccess",
            };
        }
        catch {
            return {
                order_register: "NoAccess",
                task_assign: "NoAccess",
                progress: "NoAccess",
                report: "NoAccess",
                request: "NoAccess",
            };
        }
    }
    function updatePermPreview(permissions) {
        if (!permPreview)
            return;
        const html = Object.entries(permissions)
            .map(([k, v]) => `${permLabels[k]} : ${permValues[v]}`)
            .join("<br>");
        permPreview.innerHTML = html;
    }
    // 🟦 사용자 목록 렌더링
    async function renderUsers() {
        try {
            const res = await fetch(`${API_BASE}/api/users`);
            const users = await res.json();
            userTableBody.innerHTML = "";
            users.forEach((u, idx) => {
                const p = parsePerm(u.permissions);
                const permText = Object.entries(p)
                    .map(([k, v]) => `${permLabels[k]} : ${permValues[v]}`)
                    .join("<br>");
                userTableBody.innerHTML += `
          <tr>
            <td class="px-4 py-2">${idx + 1}</td>
            <td class="px-4 py-2">${u.Name ?? "-"}</td>
            <td class="px-4 py-2">${u.ID}</td>
            <td class="px-4 py-2">****</td>
            <td class="px-4 py-2">${u.email ?? "-"}</td>
            <td class="px-4 py-2">${u.company_part ?? "-"}</td>
            <td class="px-4 py-2 text-xs">${permText}</td>
            <td class="px-4 py-2 text-center space-x-2">
              <button data-action="edit" data-no="${u.No}" class="px-3 py-1 bg-yellow-400 text-white rounded text-xs">수정</button>
              <button data-action="delete" data-no="${u.No}" class="px-3 py-1 bg-red-500 text-white rounded text-xs">삭제</button>
            </td>
          </tr>`;
            });
            userCount.innerText = `${users.length}명`;
        }
        catch (err) {
            console.error("❌ 사용자 목록 불러오기 실패:", err);
        }
    }
    // 🟦 모달 열기
    async function openUserModal(mode, no) {
        const title = document.getElementById("modalTitle");
        const nameInput = document.getElementById("modalName");
        const idInput = document.getElementById("modalID");
        const passwordInput = document.getElementById("modalPassword");
        const emailInput = document.getElementById("modalEmail");
        const companyInput = document.getElementById("modalCompanyPart");
        const Select = (id) => document.getElementById(id);
        passwordInput.type = "password";
        // ==============================
        // 신규 사용자 추가
        // ==============================
        if (mode === "add") {
            title.innerText = "신규 사용자 추가";
            modalMode.value = "add";
            modalNo.value = "";
            userForm.reset();
            const defaultPerm = {
                order_register: "ReadWrite",
                task_assign: "ReadWrite",
                progress: "ReadWrite",
                report: "ReadWrite",
                request: "ReadWrite",
            };
            Select("수주건등록").value = defaultPerm.order_register;
            Select("업무할당").value = defaultPerm.task_assign;
            Select("진행상황").value = defaultPerm.progress;
            Select("진행상황보고").value = defaultPerm.report;
            Select("요청사항").value = defaultPerm.request;
            updatePermPreview(defaultPerm);
        }
        // ==============================
        // 사용자 수정
        // ==============================
        else if (mode === "edit" && no) {
            try {
                const res = await fetch(`${API_BASE}/api/users/${no}`);
                const u = await res.json();
                title.innerText = "사용자 수정";
                modalMode.value = "edit";
                modalNo.value = u.No;
                nameInput.value = u.Name ?? "";
                idInput.value = u.ID;
                passwordInput.value = "";
                passwordInput.placeholder = "변경 시에만 입력";
                emailInput.value = u.email ?? "";
                companyInput.value = u.company_part ?? "";
                const p = parsePerm(u.permissions);
                Select("수주건등록").value = p.order_register;
                Select("업무할당").value = p.task_assign;
                Select("진행상황").value = p.progress;
                Select("진행상황보고").value = p.report;
                Select("요청사항").value = p.request;
                updatePermPreview(p);
            }
            catch (err) {
                console.error("❌ 사용자 정보 불러오기 실패:", err);
            }
        }
        userModal.classList.remove("hidden");
    }
    // 🟦 모달 닫기
    function closeUserModal() {
        userModal.classList.add("hidden");
    }
    window.togglePassword = function () {
        const input = document.getElementById("modalPassword");
        input.type = input.type === "password" ? "text" : "password";
    };
    // 새 권한 ID
    const permIds = ["수주건등록", "업무할당", "진행상황", "진행상황보고", "요청사항"];
    // 🟦 권한 select 변경 → 미리보기 갱신
    permIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("change", () => {
                const p = {
                    order_register: document.getElementById("수주건등록").value,
                    task_assign: document.getElementById("업무할당").value,
                    progress: document.getElementById("진행상황").value,
                    report: document.getElementById("진행상황보고").value,
                    request: document.getElementById("요청사항").value,
                };
                updatePermPreview(p);
            });
        }
    });
    // 🟦 저장
    if (userForm) {
        userForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const mode = modalMode.value;
            const no = modalNo.value || undefined;
            const Name = document.getElementById("modalName").value.trim();
            const ID = document.getElementById("modalID").value.trim();
            const password = document.getElementById("modalPassword").value.trim();
            const email = document.getElementById("modalEmail").value.trim() || null;
            const company_part = document.getElementById("modalCompanyPart").value.trim() || null;
            const permissions = {
                order_register: document.getElementById("수주건등록").value,
                task_assign: document.getElementById("업무할당").value,
                progress: document.getElementById("진행상황").value,
                report: document.getElementById("진행상황보고").value,
                request: document.getElementById("요청사항").value,
            };
            try {
                if (mode === "add") {
                    await fetch(`${API_BASE}/api/users`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ Name, ID, password, email, company_part, permissions }),
                    });
                }
                else {
                    const payload = { Name, ID, email, company_part, permissions };
                    if (password)
                        payload.password = password;
                    await fetch(`${API_BASE}/api/users/${no}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });
                }
                await renderUsers();
                closeUserModal();
            }
            catch (err) {
                console.error("❌ 사용자 저장 실패:", err);
            }
        });
    }
    // 🟦 삭제
    async function deleteUser(no) {
        await fetch(`${API_BASE}/api/users/${no}`, { method: "DELETE" });
        await renderUsers();
    }
    userTableBody.addEventListener("click", (e) => {
        const target = e.target;
        if (target.dataset.action === "edit")
            openUserModal("edit", target.dataset.no);
        if (target.dataset.action === "delete")
            deleteUser(target.dataset.no);
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape")
            closeUserModal();
    });
    window.openAddUserModal = () => openUserModal("add");
    window.closeUserModal = closeUserModal;
    renderUsers();
}


/***/ }),

/***/ "./TypeScript/workspace/04_order-register_main.ts":
/*!********************************************************!*\
  !*** ./TypeScript/workspace/04_order-register_main.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initOrderRegister_main: () => (/* binding */ initOrderRegister_main)
/* harmony export */ });
/* harmony import */ var _05_order_register_tab_1__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./05_order-register_tab_1 */ "./TypeScript/workspace/05_order-register_tab_1.ts");
/* harmony import */ var _06_order_register_tab_2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./06_order-register_tab_2 */ "./TypeScript/workspace/06_order-register_tab_2.ts");
/* harmony import */ var _07_order_register_tab_3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./07_order-register_tab_3 */ "./TypeScript/workspace/07_order-register_tab_3.ts");
let initOrderRegister_main_init = false;



function initOrderRegister_main(API_BASE) {
    // 모든 탭 숨기기 (접근 시마다 실행)
    const tabs = document.querySelectorAll(".tab-panel");
    tabs.forEach((tab) => {
        tab.classList.add("opacity-0", "translate-x-10", "pointer-events-none");
    });
    if (initOrderRegister_main_init)
        return;
    initOrderRegister_main_init = true;
    //각 탭페이지 접속
    const tabButtons = document.querySelectorAll("[data-tab-target]");
    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const targetTab = button.getAttribute("data-tab-target");
            // 선택된 탭 활성화
            const activeTab = document.querySelector(`#${targetTab}`);
            if (activeTab) {
                activeTab.classList.remove("opacity-0", "translate-x-10", "pointer-events-none");
            }
            // 탭에 따라 초기화 함수 호출
            switch (targetTab) {
                case "orderRegisterPage_tab_1":
                    (0,_05_order_register_tab_1__WEBPACK_IMPORTED_MODULE_0__.initOrderRegister_tab_1)(API_BASE);
                    break;
                case "orderRegisterPage_tab_2":
                    (0,_06_order_register_tab_2__WEBPACK_IMPORTED_MODULE_1__.initOrderRegister_tab_2)(API_BASE);
                    break;
                case "orderRegisterPage_tab_3":
                    (0,_07_order_register_tab_3__WEBPACK_IMPORTED_MODULE_2__.initOrderRegister_tab_3)(API_BASE);
                    break;
                default:
                    console.warn("Unknown tab:", targetTab);
            }
        });
    });
}


/***/ }),

/***/ "./TypeScript/workspace/05_order-register_tab_1.ts":
/*!*********************************************************!*\
  !*** ./TypeScript/workspace/05_order-register_tab_1.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initOrderRegister_tab_1: () => (/* binding */ initOrderRegister_tab_1)
/* harmony export */ });
/* harmony import */ var _workspace_utils_ModalUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../workspace/utils/ModalUtil */ "./TypeScript/workspace/utils/ModalUtil.ts");
//여기는 수주건 등록쪽임 초기

let initOrderRegister_tab_1_init = false;
function initOrderRegister_tab_1(API_BASE) {
    // 탭 패널
    const orderNo_orderRegisterPage_tab_1 = document.getElementById("orderNo_orderRegisterPage_tab_1");
    const equipName_orderRegisterPage_tab_1 = document.getElementById("equipName_orderRegisterPage_tab_1");
    const clientName_orderRegisterPage_tab_1 = document.getElementById("clientName_orderRegisterPage_tab_1");
    const packDate_orderRegisterPage_tab_1 = document.getElementById("packDate_orderRegisterPage_tab_1");
    const deliveryDate_orderRegisterPage_tab_1 = document.getElementById("deliveryDate_orderRegisterPage_tab_1");
    const hartMakeMain_orderRegisterPage_tab_1 = document.getElementById("hartMakeMain_orderRegisterPage_tab_1");
    const hartMakeSub_orderRegisterPage_tab_1 = document.getElementById("hartMakeSub_orderRegisterPage_tab_1");
    const hartMakeCompany_orderRegisterPage_tab_1 = document.getElementById("hartMakeCompany_orderRegisterPage_tab_1");
    const plcMain_orderRegisterPage_tab_1 = document.getElementById("plcMain_orderRegisterPage_tab_1");
    const plcSub_orderRegisterPage_tab_1 = document.getElementById("plcSub_orderRegisterPage_tab_1");
    const plcCompany_orderRegisterPage_tab_1 = document.getElementById("plcCompany_orderRegisterPage_tab_1");
    const wireMain_orderRegisterPage_tab_1 = document.getElementById("wireMain_orderRegisterPage_tab_1");
    const wireSub_orderRegisterPage_tab_1 = document.getElementById("wireSub_orderRegisterPage_tab_1");
    const wireCompany_orderRegisterPage_tab_1 = document.getElementById("wireCompany_orderRegisterPage_tab_1");
    const setupMain_orderRegisterPage_tab_1 = document.getElementById("setupMain_orderRegisterPage_tab_1");
    const setupSub_orderRegisterPage_tab_1 = document.getElementById("setupSub_orderRegisterPage_tab_1");
    const btnSaveOrder_orderRegisterPage_tab_1 = document.getElementById("btnSaveOrder_orderRegisterPage_tab_1");
    const btnEditOrder_orderRegisterPage_tab_1 = document.getElementById("btnEditOrder_orderRegisterPage_tab_1");
    const orderListBody_orderRegisterPage_tab_1 = document.getElementById("orderListBody_orderRegisterPage_tab_1");
    const EquipGroup_orderRegisterPage_tab_1 = document.getElementById("EquipGroup_orderRegisterPage_tab_1");
    //테이블 렌더링 쪽
    const filterYear_orderRegisterPage_tab_1 = document.getElementById("filterYear_orderRegisterPage_tab_1");
    const filterEquipGroup_orderRegisterPage_tab_1 = document.getElementById("filterEquipGroup_orderRegisterPage_tab_1");
    const filterClient_orderRegisterPage_tab_1 = document.getElementById("filterClient_orderRegisterPage_tab_1");
    const filterResetbtn_orderRegisterPage_tab_1 = document.getElementById("filterResetbtn_orderRegisterPage_tab_1");
    //필수 요소 모음집
    const requiredElements = [
        orderNo_orderRegisterPage_tab_1,
        equipName_orderRegisterPage_tab_1,
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
        EquipGroup_orderRegisterPage_tab_1.value = "";
    }
    function visible_option(option) {
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
                _workspace_utils_ModalUtil__WEBPACK_IMPORTED_MODULE_0__.ModalUtil.confirm({
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
            }
            else {
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
            }
            else {
                row.style.display = "none"; // 숨기기
            }
        });
    }
    //#endregion
    //#region 수주건 저장 함수
    async function saveOrderRegisterTab1() {
        const payload = {
            orderNo: orderNo_orderRegisterPage_tab_1.value,
            details: {
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
                    await _workspace_utils_ModalUtil__WEBPACK_IMPORTED_MODULE_0__.ModalUtil.confirm({
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
        }
        catch (error) {
            console.error("Error saving order:", error);
            alert("Error saving order. Please try again. 개발자 문의!");
            return -2; // 일반 오류 코드 반환
        }
    }
    //#endregion
    //#region 수주건 수정 함수
    async function ChangeOrderRegisterTab1() {
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
        }
        catch (error) {
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
            let orders = data.data;
            // 코드번호 기준 정렬 (- 이후의 3글자를 기준으로)
            orders = orders.sort((a, b) => {
                const aNumber = parseInt(a.code_no.split("-")[1]?.substring(0, 3) || "0", 10);
                const bNumber = parseInt(b.code_no.split("-")[1]?.substring(0, 3) || "0", 10);
                return aNumber - bNumber;
            });
            // 테이블 바디 초기화
            orderListBody_orderRegisterPage_tab_1.innerHTML = "";
            // 각 수주건을 테이블에 추가
            orders.forEach((order, index) => {
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
        }
        catch (error) {
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
                const target = e.currentTarget;
                const action = target.dataset.action;
                const number = target.dataset.number;
                if (!action || !number)
                    return;
                if (action === "code_no_button") {
                    console.log(`[order_registerPage_tab_1] 수주번호 클릭: ${number}`);
                    await _workspace_utils_ModalUtil__WEBPACK_IMPORTED_MODULE_0__.ModalUtil.confirm({
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
                        orderNo_orderRegisterPage_tab_1.value = order.code_no;
                        equipName_orderRegisterPage_tab_1.value = detail.equipName;
                        clientName_orderRegisterPage_tab_1.value = detail.clientName;
                        packDate_orderRegisterPage_tab_1.value = detail.packDate;
                        deliveryDate_orderRegisterPage_tab_1.value = detail.deliveryDate;
                        hartMakeMain_orderRegisterPage_tab_1.value = detail.hartMakeMain;
                        hartMakeSub_orderRegisterPage_tab_1.value = detail.hartMakeSub;
                        hartMakeCompany_orderRegisterPage_tab_1.value = detail.hartMakeCompany;
                        plcMain_orderRegisterPage_tab_1.value = detail.plcMain;
                        plcSub_orderRegisterPage_tab_1.value = detail.plcSub;
                        plcCompany_orderRegisterPage_tab_1.value = detail.plcCompany;
                        wireMain_orderRegisterPage_tab_1.value = detail.wireMain;
                        wireSub_orderRegisterPage_tab_1.value = detail.wireSub;
                        wireCompany_orderRegisterPage_tab_1.value = detail.wireCompany;
                        setupMain_orderRegisterPage_tab_1.value = detail.setupMain;
                        setupSub_orderRegisterPage_tab_1.value = detail.setupSub;
                        EquipGroup_orderRegisterPage_tab_1.value = detail.eqtype;
                    }
                    catch (error) {
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
                await _workspace_utils_ModalUtil__WEBPACK_IMPORTED_MODULE_0__.ModalUtil.confirm({
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
            _workspace_utils_ModalUtil__WEBPACK_IMPORTED_MODULE_0__.ModalUtil.confirm({
                title: "저장 완료",
                message: "수주건이 성공적으로 저장되었습니다.",
                type: "success"
            });
        }
        ;
        fetchAndRenderOrderList(); // 마지막 갱신
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
            _workspace_utils_ModalUtil__WEBPACK_IMPORTED_MODULE_0__.ModalUtil.confirm({
                title: "수정 완료",
                message: "수주건이 성공적으로 수정되었습니다.",
                type: "success"
            });
        }
        ;
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
    function showProgressModal(message = "잠시만 기다려주세요.") {
        const progressModal = document.getElementById("progressModal_orderRegisterPage");
        const progressBar = document.getElementById("progressBar_orderRegisterPage");
        const progressMessage = document.getElementById("progressMessage_orderRegisterPage");
        if (progressModal && progressBar && progressMessage) {
            progressMessage.textContent = message;
            progressBar.style.width = "0%"; // 초기화
            progressModal.classList.remove("hidden");
        }
    }
    function hideProgressModal() {
        const progressModal = document.getElementById("progressModal_orderRegisterPage");
        if (progressModal) {
            progressModal.classList.add("hidden");
        }
    }
    function updateProgressBar(percentage) {
        const progressBar = document.getElementById("progressBar_orderRegisterPage");
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }
    //#endregion
    fetchAndRenderOrderList();
}


/***/ }),

/***/ "./TypeScript/workspace/06_order-register_tab_2.ts":
/*!*********************************************************!*\
  !*** ./TypeScript/workspace/06_order-register_tab_2.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initOrderRegister_tab_2: () => (/* binding */ initOrderRegister_tab_2)
/* harmony export */ });
let initOrderRegister_tab_2_init = false;
function initOrderRegister_tab_2(API_BASE) {
    console.log("탭2");
    if (initOrderRegister_tab_2_init)
        return;
}


/***/ }),

/***/ "./TypeScript/workspace/07_order-register_tab_3.ts":
/*!*********************************************************!*\
  !*** ./TypeScript/workspace/07_order-register_tab_3.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initOrderRegister_tab_3: () => (/* binding */ initOrderRegister_tab_3)
/* harmony export */ });
let initOrderRegister_tab_3_init = false;
function initOrderRegister_tab_3(API_BASE) {
    console.log("탭3");
    if (initOrderRegister_tab_3_init)
        return;
}


/***/ }),

/***/ "./TypeScript/workspace/utils/ModalUtil.ts":
/*!*************************************************!*\
  !*** ./TypeScript/workspace/utils/ModalUtil.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ModalUtil: () => (/* binding */ ModalUtil)
/* harmony export */ });
const ModalUtil = {
    // ⬇️ ModalUtil.ts 맨 아래에 메서드 하나 추가 (show/confirm 아래에)
    /**
     * 숫자 입력 모달 (확인/취소)
     * - 사용 예: const n = await ModalUtil.promptNumber({ title:"추가", message:"변경 수량을 입력하세요." });
     * - 취소 시 null 반환
     */
    async promptNumber({ title = "입력", message = "값을 입력하세요.", defaultValue = 1, min = 1, max, type = "info", placeholder = "수량" }) {
        const el = this.ensureElement();
        const titleEl = el.querySelector("#modalTitle");
        const msgEl = el.querySelector("#modalMessage");
        const okBtn = el.querySelector("#modalCloseBtn");
        const cancelBtn = el.querySelector("#modalCancelBtn");
        this.setStyleByType(type);
        titleEl.textContent = title;
        // 입력박스 포함해서 메시지 구성
        msgEl.innerHTML = `
      <div class="space-y-3">
        <div class="text-sm text-gray-600">${message}</div>
        <input id="modalPromptInput" type="number"
               class="w-full border rounded-lg px-3 py-2 text-center"
               value="${defaultValue}"
               ${min !== undefined ? `min="${min}"` : ""}
               ${max !== undefined ? `max="${max}"` : ""}
               placeholder="${placeholder}" />
      </div>
    `;
        cancelBtn.classList.remove("hidden");
        okBtn.textContent = "확인";
        cancelBtn.textContent = "취소";
        el.classList.remove("hidden");
        const input = () => el.querySelector("#modalPromptInput");
        return await new Promise((resolve) => {
            const onOk = () => {
                const v = Number((input().value || "").trim());
                if (!Number.isFinite(v) || (min !== undefined && v < min) || (max !== undefined && v > max)) {
                    // 간단한 피드백
                    input().classList.add("ring-2", "ring-rose-500");
                    setTimeout(() => input().classList.remove("ring-2", "ring-rose-500"), 600);
                    input().focus();
                    return;
                }
                cleanup();
                this.hide();
                resolve(v);
            };
            const onCancel = () => {
                cleanup();
                this.hide();
                resolve(null);
            };
            const onKey = (ev) => {
                if (ev.key === "Escape")
                    onCancel();
                if (ev.key === "Enter")
                    onOk();
            };
            const cleanup = () => {
                okBtn.removeEventListener("click", onOk);
                cancelBtn.removeEventListener("click", onCancel);
                window.removeEventListener("keydown", onKey);
            };
            okBtn.addEventListener("click", onOk);
            cancelBtn.addEventListener("click", onCancel);
            window.addEventListener("keydown", onKey);
            // 자동 포커스
            setTimeout(() => input()?.focus(), 50);
        });
    },
    el: null,
    ensureElement() {
        if (this.el)
            return this.el;
        const div = document.createElement("div");
        div.id = "globalModalPopup";
        div.className =
            "hidden fixed inset-0 z-[9999] flex items-center justify-center bg-black/50";
        // 기본 구조: 아이콘, 큰 타이틀, 메시지, 버튼들
        div.innerHTML = `
      <div id="modalBox" class="bg-white rounded-2xl shadow-2xl w-[380px] p-6 text-center transition-all">
        <div id="modalIcon" class="text-6xl mb-4 select-none">ℹ️</div>
        <h2 id="modalTitle" class="text-2xl font-extrabold mb-3 text-gray-900 tracking-tight">알림</h2>
        <p id="modalMessage" class="text-sm text-gray-600 mb-6 leading-6"></p>
        <div id="modalBtns" class="flex items-center justify-center gap-2">
          <button id="modalCancelBtn"
            class="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">취소</button>
          <button id="modalCloseBtn"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">확인</button>
        </div>
      </div>
    `;
        document.body.appendChild(div);
        this.el = div;
        return div;
    },
    // 내부 공통 스타일링
    setStyleByType(type) {
        const el = this.ensureElement();
        const iconEl = el.querySelector("#modalIcon");
        const titleEl = el.querySelector("#modalTitle");
        // 기본값
        let icon = "ℹ️";
        let iconClass = "text-6xl text-blue-500 mb-4";
        let titleClass = "text-2xl font-extrabold mb-3 text-gray-900 tracking-tight";
        switch (type) {
            case "success":
                icon = "✅";
                iconClass = "text-6xl text-green-500 mb-4";
                break;
            case "error":
                icon = "❌";
                iconClass = "text-6xl text-red-500 mb-4";
                break;
            case "warning":
                icon = "⚠️";
                iconClass = "text-6xl text-yellow-500 mb-4";
                break;
            case "increase":
                icon = "➕";
                iconClass = "text-6xl text-emerald-600 mb-4";
                titleClass = "text-3xl font-black mb-3 text-emerald-700 tracking-tight";
                break;
            case "decrease":
                icon = "➖";
                iconClass = "text-6xl text-rose-600 mb-4";
                titleClass = "text-3xl font-black mb-3 text-rose-700 tracking-tight";
                break;
            default:
                break;
        }
        iconEl.textContent = icon;
        iconEl.className = iconClass;
        titleEl.className = titleClass;
    },
    /**
     * (단순) 알림 모달
     * @param message 본문 메시지
     * @param title 제목
     * @param type "info" | "success" | "error" | "increase" | "decrease" | "warning"
     */
    show(message, title = "알림", type = "info") {
        const el = this.ensureElement();
        const titleEl = el.querySelector("#modalTitle");
        const msgEl = el.querySelector("#modalMessage");
        const okBtn = el.querySelector("#modalCloseBtn");
        const cancelBtn = el.querySelector("#modalCancelBtn");
        const btnWrap = el.querySelector("#modalBtns");
        this.setStyleByType(type);
        titleEl.textContent = title;
        msgEl.textContent = message;
        // 단순 알림 → 취소 버튼 숨김, 확인만
        cancelBtn.classList.add("hidden");
        okBtn.textContent = "닫기";
        el.classList.remove("hidden");
        const close = () => {
            this.hide();
            okBtn.removeEventListener("click", close);
        };
        okBtn.addEventListener("click", close);
    },
    /**
     * 확인/취소 모달 (Promise 반환)
     * - "추가" / "감소" 등의 굵은 타이틀을 크게 표시 가능
     */
    confirm({ title = "확인", message = "", confirmText = "확인", cancelText = "취소", type = "warning", }) {
        const el = this.ensureElement();
        const titleEl = el.querySelector("#modalTitle");
        const msgEl = el.querySelector("#modalMessage");
        const okBtn = el.querySelector("#modalCloseBtn");
        const cancelBtn = el.querySelector("#modalCancelBtn");
        this.setStyleByType(type);
        titleEl.textContent = title; // ← "추가" 또는 "감소" 크게 표시
        msgEl.textContent = message;
        cancelBtn.textContent = cancelText;
        okBtn.textContent = confirmText;
        cancelBtn.classList.remove("hidden");
        el.classList.remove("hidden");
        return new Promise((resolve) => {
            const onOk = () => {
                cleanup();
                this.hide();
                resolve(true);
            };
            const onCancel = () => {
                cleanup();
                this.hide();
                resolve(false);
            };
            const onKey = (ev) => {
                if (ev.key === "Escape")
                    onCancel();
                if (ev.key === "Enter")
                    onOk();
            };
            const cleanup = () => {
                okBtn.removeEventListener("click", onOk);
                cancelBtn.removeEventListener("click", onCancel);
                window.removeEventListener("keydown", onKey);
            };
            okBtn.addEventListener("click", onOk);
            cancelBtn.addEventListener("click", onCancel);
            window.addEventListener("keydown", onKey);
        });
    },
    hide() {
        const el = this.ensureElement();
        el.classList.add("hidden");
    },
};


/***/ }),

/***/ "./TypeScript/workspace/utils/loading.ts":
/*!***********************************************!*\
  !*** ./TypeScript/workspace/utils/loading.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LoadingUtil: () => (/* binding */ LoadingUtil)
/* harmony export */ });
/**
 * ✅ 전역 로딩 / 진행률 팝업 유틸리티
 * 자동 생성 + 진행률 표시 + 최소 표시시간 포함
 */
const LoadingUtil = {
    el: null,
    ensureElement() {
        if (this.el)
            return this.el;
        const div = document.createElement("div");
        div.id = "globalLoadingPopup";
        div.className =
            "hidden fixed inset-0 z-[9999] flex items-center justify-center bg-black/40";
        div.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg px-8 py-6 text-center max-w-sm w-[90%] transition-all">
        <div id="spinnerWrap" class="flex justify-center mb-4">
          <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div id="progressWrap" class="hidden flex flex-col items-center mb-2">
          <div class="w-32 bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
            <div id="progressBar" class="bg-blue-500 h-2 rounded-full transition-all duration-200" style="width:0%"></div>
          </div>
          <span id="progressText" class="text-xs text-gray-600">0%</span>
        </div>
        <p id="loadingMessage" class="text-gray-700 font-medium text-sm leading-relaxed">
          ⚙️ 서버에서 데이터를 불러오는 중입니다.<br />잠시만 기다려주세요.
        </p>
      </div>
    `;
        document.body.appendChild(div);
        this.el = div;
        return div;
    },
    /** 🔹 일반 로딩 */
    show(message) {
        const el = this.ensureElement();
        const msg = el.querySelector("#loadingMessage");
        const spinner = el.querySelector("#spinnerWrap");
        const progressWrap = el.querySelector("#progressWrap");
        if (msg) {
            msg.innerHTML =
                message ||
                    `⚙️ 서버에서 데이터를 불러오는 중입니다.<br />잠시만 기다려주세요.`;
        }
        spinner.classList.remove("hidden");
        progressWrap.classList.add("hidden");
        el.classList.remove("hidden");
    },
    /** 🔹 진행률 기반 로딩 */
    showProgress(message = "💾 서버에 데이터를 저장 중입니다...") {
        const el = this.ensureElement();
        const msg = el.querySelector("#loadingMessage");
        const spinner = el.querySelector("#spinnerWrap");
        const progressWrap = el.querySelector("#progressWrap");
        const progressBar = el.querySelector("#progressBar");
        const progressText = el.querySelector("#progressText");
        msg.innerHTML = message;
        spinner.classList.add("hidden");
        progressWrap.classList.remove("hidden");
        el.classList.remove("hidden");
        // 초기화
        progressBar.style.width = "0%";
        progressText.textContent = "0%";
    },
    /** 🔹 진행률 갱신 */
    updateProgress(value) {
        const el = this.ensureElement();
        const bar = el.querySelector("#progressBar");
        const text = el.querySelector("#progressText");
        const percent = Math.min(100, Math.max(0, value));
        if (bar)
            bar.style.width = `${percent}%`;
        if (text)
            text.textContent = `${percent.toFixed(0)}%`;
    },
    /** 🔹 로딩 종료 */
    hide() {
        const el = this.ensureElement();
        el.classList.add("hidden");
    },
    /** 🔹 일반 wrap (0.8초 최소 유지) */
    async wrap(promise, message) {
        const MIN_DELAY = 800;
        this.show(message);
        try {
            const [result] = await Promise.all([
                promise,
                new Promise(resolve => setTimeout(resolve, MIN_DELAY))
            ]);
            return result;
        }
        finally {
            this.hide();
        }
    },
    /** 🔹 진행률 기반 Promise 래핑 */
    async trackProgress(promise, message, duration = 1500) {
        this.showProgress(message);
        const el = this.ensureElement();
        // 가짜 진행률 시뮬레이션 (UX용)
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10 + 5;
            this.updateProgress(progress);
            if (progress >= 90)
                clearInterval(interval);
        }, 150);
        try {
            const result = await promise;
            this.updateProgress(100);
            await new Promise(resolve => setTimeout(resolve, duration)); // 약간의 여유시간
            return result;
        }
        finally {
            clearInterval(interval);
            this.hide();
        }
    }
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************************************!*\
  !*** ./TypeScript/workspace/00_workspace.ts ***!
  \**********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _03_user_register__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./03_user-register */ "./TypeScript/workspace/03_user-register.ts");
/* harmony import */ var _02_view__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./02_view */ "./TypeScript/workspace/02_view.ts");
/* harmony import */ var _01_dashboard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./01_dashboard */ "./TypeScript/workspace/01_dashboard.ts");
/* harmony import */ var _utils_loading__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/loading */ "./TypeScript/workspace/utils/loading.ts");
/* harmony import */ var _04_order_register_main__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./04_order-register_main */ "./TypeScript/workspace/04_order-register_main.ts");
/* harmony import */ var _utils_ModalUtil__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/ModalUtil */ "./TypeScript/workspace/utils/ModalUtil.ts");
// TypeScript/workspace/workspace.ts






// ==============================================================
// 🔵 API 기본주소
// ==============================================================
const dummy = "1";
const API_BASE = location.hostname === "tgyeo.github.io"
    ? "https://port-0-innomax-mghorm7bef413a34.sel3.cloudtype.app"
    : "http://127.0.0.1:5050";
function initLocalTabNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const panels = document.querySelectorAll('[id^="panel-"]');
    const titleEl = document.getElementById("wsTitle");
    function showPanel(id) {
        // 1) 모든 패널 숨기기
        panels.forEach((p) => p.classList.add("hidden"));
        // 2) 해당 패널 표시
        const target = document.getElementById(id);
        if (target)
            target.classList.remove("hidden");
        // 3) 버튼 스타일 적용
        navButtons.forEach((btn) => {
            const active = btn.dataset.panel === id;
            btn.classList.toggle("bg-[#d4f7bf]", active);
            btn.classList.toggle("text-[#000000]", active);
            btn.classList.toggle("font-bold", active);
        });
        // 4) 제목 변경
        const curBtn = document.querySelector(`.nav-btn[data-panel="${id}"]`);
        if (curBtn && titleEl) {
            titleEl.textContent = curBtn.textContent?.trim() ?? "";
        }
    }
    // 초기 Dashboard
    showPanel("panel-dashboard");
    return showPanel;
}
// ==============================================================
// 🔵 메인 초기화
// ==============================================================
document.addEventListener("DOMContentLoaded", async () => {
    console.debug("[INIT] DOMContentLoaded 시작");
    // nav-btn 전환 로직 활성화
    const showPanel = initLocalTabNavigation();
    // 공통 View 초기화
    await (0,_02_view__WEBPACK_IMPORTED_MODULE_1__.initView)(API_BASE);
    const sidebarButtons = document.querySelectorAll("#sidebar [data-panel]");
    const userName = document.getElementById("userName");
    sidebarButtons.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.panel;
            if (!id)
                return;
            // ----------------------------------------------
            // 🔐 1) 권한 체크 
            // ----------------------------------------------
            //최상단 사용자 관리탭
            if (id.includes("사용자-관리")) {
                const allowed = ["장혜용", "여태검"];
                const current = (userName?.textContent ?? "").trim();
                if (!allowed.includes(current)) {
                    const ok = await _utils_ModalUtil__WEBPACK_IMPORTED_MODULE_5__.ModalUtil.confirm({
                        title: "접근 권한",
                        message: "사용자 관리 권한이 없습니다.",
                        type: "warning",
                    });
                    if (ok) {
                        return; // ❗ showPanel 실행 전 return → 패널이 안 보임
                    }
                    else {
                        return; // ❗ showPanel 실행 전 return → 패널이 안 보임
                    }
                }
            }
            if (id.includes("orderRegisterPage")) {
                try {
                    const url = `${API_BASE}/api/users`;
                    const res = await fetch(url);
                    if (!res.ok) {
                        console.error("❌ 사용자 목록 불러오기 실패");
                        return;
                    }
                    const userList = await res.json(); // 배열 전체를 받아온다고 가정
                    console.log("📌 사용자 전체 목록:", userList);
                    const allowed = [];
                    for (const user of userList) {
                        try {
                            // permissions 필드는 문자열 → JSON 파싱
                            const perms = JSON.parse(user.permissions);
                            // 수주건등록 권한 체크
                            if (perms.order_register === "ReadWrite") {
                                allowed.push(user.Name); // 또는 user.ID
                            }
                        }
                        catch (err) {
                            console.error("❌ permission 파싱 실패:", user.permissions, err);
                        }
                    }
                    console.log("✅ 수주건 등록 권한자 목록:", allowed);
                    // 여기서 allowed 배열을 실제 권한 체크에 사용
                    const currentUser = (userName?.textContent ?? "").trim();
                    if (!allowed.includes(currentUser)) {
                        const ok = await _utils_ModalUtil__WEBPACK_IMPORTED_MODULE_5__.ModalUtil.confirm({
                            title: "접근 권한",
                            message: "수주건 등록 권한이 없습니다.",
                            type: "warning",
                        });
                        if (ok) {
                            return false; // 권한 없음
                        }
                        else {
                            return false; // 권한 없음
                        }
                    }
                }
                catch (err) {
                    console.error("❌ 사용자 권한 로딩 오류:", err);
                }
            }
            // ----------------------------------------------
            // 🔵 2) 패널 전환(showPanel) 실행
            //     → 패널이 시각적으로 보이는 단계
            // ----------------------------------------------
            showPanel(id);
            // ----------------------------------------------
            // ⏳ 3) 패널 초기화
            // ----------------------------------------------
            _utils_loading__WEBPACK_IMPORTED_MODULE_3__.LoadingUtil.show();
            try {
                await new Promise((r) => requestAnimationFrame(r));
                if (id.includes("대시보드")) {
                    await (0,_01_dashboard__WEBPACK_IMPORTED_MODULE_2__.initDashboardPanel)(API_BASE);
                }
                else if (id.includes("사용자-관리")) {
                    await (0,_03_user_register__WEBPACK_IMPORTED_MODULE_0__.initUserRegisterPanel)(API_BASE);
                }
                else if (id.includes("orderRegisterPage")) {
                    await (0,_04_order_register_main__WEBPACK_IMPORTED_MODULE_4__.initOrderRegister_main)(API_BASE);
                }
                console.debug(`[TAB] ${id} 초기화 완료`);
            }
            catch (err) {
                console.error(`[TAB ERROR] ${id}:`, err);
                alert(`${id} 초기화 중 오류 발생`);
            }
            finally {
                _utils_loading__WEBPACK_IMPORTED_MODULE_3__.LoadingUtil.hide();
            }
        });
    });
    // 초기 Dashboard 데이터 로드
    await (0,_01_dashboard__WEBPACK_IMPORTED_MODULE_2__.initDashboardPanel)(API_BASE);
    console.debug("[INIT] workspace 초기화 완료");
});

})();

/******/ })()
;
//# sourceMappingURL=workspace.bundle.js.map