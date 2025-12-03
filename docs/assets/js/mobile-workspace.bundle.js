/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./TypeScript/mobile/01_Mobile_DashBoard.ts":
/*!**************************************************!*\
  !*** ./TypeScript/mobile/01_Mobile_DashBoard.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initMobile_DashBoard: () => (/* binding */ initMobile_DashBoard)
/* harmony export */ });
// ======================================================
// 📋 정호개발 - 모바일 대시보드 (홈)
// ======================================================
function initMobile_DashBoard(API_BASE) {
    const section = document.getElementById("dashboard");
    if (!section)
        return;
    const timeEl = section.querySelector("#currentTime");
    function updateTime() {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString("ko-KR", { hour12: false });
    }
    updateTime();
    setInterval(updateTime, 1000);
    console.log("🏠 [Mobile_DashBoard] 홈 초기화 완료");
}


/***/ }),

/***/ "./TypeScript/mobile/02_mobile_set_up.ts":
/*!***********************************************!*\
  !*** ./TypeScript/mobile/02_mobile_set_up.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initMobile_SetUp: () => (/* binding */ initMobile_SetUp)
/* harmony export */ });
// ======================================================
// 📱 정호개발 - 모바일 SET-UP 화면 초기화
// 작성자: 여태검
// ======================================================
function initMobile_SetUp(API_BASE) {
    console.log("🚀 [SET-UP] 초기화 시작");
    // 화면 요소 찾기
    const section = document.getElementById("mobile_set_up_section");
    const tabBtn = document.querySelector("[data-tab='mobile_set_up']");
    const orderSelect = document.getElementById("setupOrderSelect");
    const btnLoadYesterday = document.getElementById("btnLoadYesterdayWork");
    const percentRange = document.getElementById("setupProgressPercent");
    const percentLabel = document.getElementById("setupProgressPercentLabel");
    const loadedWorkBox = document.getElementById("setupLoadedWork");
    const workInput = document.getElementById("setupWorkInput");
    if (!section || !tabBtn) {
        console.warn("⚠️ [SET-UP] section 또는 버튼을 찾지 못했습니다.");
        return;
    }
    // ======================================================
    // 📌 1) 탭 클릭 시 화면 전환
    // ======================================================
    tabBtn.addEventListener("click", () => {
        document.querySelectorAll("section.tab-section, section[id^='mobile_']")
            .forEach(sec => sec.classList.add("hidden"));
        section.classList.remove("hidden");
        window.scrollTo(0, 0);
    });
    // ======================================================
    // 📌 2) 수주건 목록 로드 (서버 연동)
    // ======================================================
    async function loadOrders() {
        try {
            orderSelect.innerHTML = `<option value="">불러오는 중...</option>`;
            const res = await fetch(`${API_BASE}/api/mobile/orders`, { method: "GET" });
            const data = await res.json();
            orderSelect.innerHTML = `<option value="">수주건을 선택하세요</option>`;
            data.forEach((o) => {
                const opt = document.createElement("option");
                opt.value = o.id;
                opt.textContent = `${o.project_name} (${o.customer})`;
                orderSelect.appendChild(opt);
            });
        }
        catch (err) {
            console.error("❌ 수주건 불러오기 실패:", err);
            orderSelect.innerHTML = `<option value="">불러오기 실패</option>`;
        }
    }
    // ======================================================
    // 📌 3) 전날 업무 불러오기
    // ======================================================
    btnLoadYesterday.addEventListener("click", async () => {
        const orderId = orderSelect.value;
        if (!orderId) {
            alert("⚠️ 먼저 수주건을 선택해주세요.");
            return;
        }
        btnLoadYesterday.textContent = "불러오는 중...";
        btnLoadYesterday.disabled = true;
        try {
            const res = await fetch(`${API_BASE}/api/mobile/set-up/yesterday?order_id=${orderId}`);
            const data = await res.json();
            loadedWorkBox.textContent = data.text || "전날 업무 내용이 없습니다.";
            percentRange.value = data.percent || "0";
            percentLabel.textContent = `(${percentRange.value}%)`;
        }
        catch (err) {
            console.error("❌ 전날 업무 불러오기 오류:", err);
            loadedWorkBox.textContent = "전날 업무를 불러오지 못했습니다.";
        }
        finally {
            btnLoadYesterday.textContent = "전날 업무 불러오기";
            btnLoadYesterday.disabled = false;
        }
    });
    // ======================================================
    // 📌 4) 진행률 Range → Label 반영
    // ======================================================
    percentRange.addEventListener("input", () => {
        percentLabel.textContent = `(${percentRange.value}%)`;
    });
    // ======================================================
    // 📌 5) 화면 초기 설정
    // ======================================================
    loadOrders(); // 수주건 자동 불러오기
    console.log("✅ [SET-UP] 초기화 완료");
}


/***/ }),

/***/ "./TypeScript/mobile/03_mobile_as.ts":
/*!*******************************************!*\
  !*** ./TypeScript/mobile/03_mobile_as.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initMobile_AS: () => (/* binding */ initMobile_AS)
/* harmony export */ });
function initMobile_AS(API_BASE) {
    console.log("🚀 [A/S] 초기화 완료");
}


/***/ }),

/***/ "./TypeScript/mobile/04_mobile_test.ts":
/*!*********************************************!*\
  !*** ./TypeScript/mobile/04_mobile_test.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initMobile_Test: () => (/* binding */ initMobile_Test)
/* harmony export */ });
function initMobile_Test(API_BASE) {
    console.log("🚀 [TEST] 초기화 완료");
}


/***/ }),

/***/ "./TypeScript/mobile/05_mobile_doc.ts":
/*!********************************************!*\
  !*** ./TypeScript/mobile/05_mobile_doc.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initMobile_Doc: () => (/* binding */ initMobile_Doc)
/* harmony export */ });
function initMobile_Doc(API_BASE) {
    console.log("🚀 [DOC] 초기화 완료");
}


/***/ }),

/***/ "./TypeScript/mobile/mobileUtils/Mobile_Loading.ts":
/*!*********************************************************!*\
  !*** ./TypeScript/mobile/mobileUtils/Mobile_Loading.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Mobile_Loading: () => (/* binding */ Mobile_Loading)
/* harmony export */ });
// ======================================================
// ⏳ 정호개발 - 모바일 로딩 유틸
// ======================================================
const Mobile_Loading = {
    show(message = "로딩 중...") {
        let overlay = document.getElementById("mobileLoadingOverlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "mobileLoadingOverlay";
            overlay.className =
                "fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]";
            overlay.innerHTML = `
        <div class="bg-white rounded-xl px-6 py-4 text-center shadow-lg">
          <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-gray-700 text-sm">${message}</p>
        </div>
      `;
            document.body.appendChild(overlay);
        }
        else {
            overlay.classList.remove("hidden");
        }
    },
    hide() {
        const overlay = document.getElementById("mobileLoadingOverlay");
        if (overlay)
            overlay.classList.add("hidden");
    },
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
/*!**************************************************!*\
  !*** ./TypeScript/mobile/00_Mobile_Workspace.ts ***!
  \**************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initMobile_Workspace: () => (/* binding */ initMobile_Workspace)
/* harmony export */ });
/* harmony import */ var _01_Mobile_DashBoard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./01_Mobile_DashBoard */ "./TypeScript/mobile/01_Mobile_DashBoard.ts");
/* harmony import */ var _mobileUtils_Mobile_Loading__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mobileUtils/Mobile_Loading */ "./TypeScript/mobile/mobileUtils/Mobile_Loading.ts");
/* harmony import */ var _02_mobile_set_up__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./02_mobile_set_up */ "./TypeScript/mobile/02_mobile_set_up.ts");
/* harmony import */ var _03_mobile_as__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./03_mobile_as */ "./TypeScript/mobile/03_mobile_as.ts");
/* harmony import */ var _04_mobile_test__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./04_mobile_test */ "./TypeScript/mobile/04_mobile_test.ts");
/* harmony import */ var _05_mobile_doc__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./05_mobile_doc */ "./TypeScript/mobile/05_mobile_doc.ts");
// ======================================================
// 📱 정호개발 - 모바일 워크스페이스 (메인 엔트리)
// 작성자: 여태검
// 설명: 로그인 인증 + 세션만료 + 대시보드/출고/입고/점검 초기화 + 서버상태 모니터링
// ======================================================


// ======================================================
// 📦 출장/사내 업무 모듈 Pool Import
// ======================================================




// ======================================================
// 🌐 API BASE 설정
// ======================================================
const isLocal = location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname.includes("app.github.dev");
const API_BASE = isLocal
    ? "http://127.0.0.1:5050"
    : "https://port-0-innomax-mghorm7bef413a34.sel3.cloudtype.app";
console.log("📱 [Mobile_Workspace] 초기화 시작");
// ======================================================
// 👤 로그인 인증 및 세션 관리
// ======================================================
function initAuthAndUserInfo() {
    const userData = localStorage.getItem("user");
    if (!userData) {
        alert("세션 만료 또는 비정상 접근입니다.");
        window.location.href = "index.html"; // ✅ 로그인 페이지로 이동
        return false;
    }
    const user = JSON.parse(userData);
    const userName = document.getElementById("userName");
    const userRole = document.getElementById("userRole");
    if (userName)
        userName.textContent = user.name;
    if (userRole)
        userRole.textContent = "SW팀";
    // ✅ 세션 만료 검사 (30분)
    const loginTime = user.loginTime;
    const now = Date.now();
    if (now - loginTime > 1000 * 60 * 30) {
        alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
        localStorage.clear();
        window.location.href = "index.html";
        return false;
    }
    // ✅ 로그아웃 버튼 이벤트
    const logoutBtn = document.getElementById("btnLogout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            const ok = confirm("정말 로그아웃 하시겠습니까?");
            if (!ok)
                return;
            localStorage.clear();
            try {
                await fetch(`${API_BASE}/api/logout`, {
                    method: "POST",
                    credentials: "include",
                });
            }
            catch {
                /* 무시 */
            }
            window.location.href = "index.html";
        });
    }
    // ✅ 뒤로가기 방지
    history.pushState(null, "", location.href);
    window.onpopstate = function () {
        history.go(1);
    };
    return true;
}
// ======================================================
// 📱 메인 초기화
// ======================================================
async function initMobile_Workspace() {
    try {
        _mobileUtils_Mobile_Loading__WEBPACK_IMPORTED_MODULE_1__.Mobile_Loading.show("로딩 중...");
        // ✅ 로그인/세션 검증
        const ok = initAuthAndUserInfo();
        if (!ok)
            return;
        // ✅ 각 탭 초기화
        console.log("🧭 [Mobile_Workspace] 모듈 초기화 시작");
        (0,_01_Mobile_DashBoard__WEBPACK_IMPORTED_MODULE_0__.initMobile_DashBoard)(API_BASE);
        console.log("✅ [Mobile_Workspace] 모든 모듈 초기화 완료");
        // ✅ 서버 상태 모니터링 시작
        startServerConnectionCheck();
        // 🔹 출장/사내 업무 Pool 모듈 초기화
        initBusinessModules();
    }
    catch (err) {
        console.error("❌ [Mobile_Workspace] 초기화 오류:", err);
        alert("모바일 워크스페이스 초기화 중 오류가 발생했습니다.");
    }
    finally {
        _mobileUtils_Mobile_Loading__WEBPACK_IMPORTED_MODULE_1__.Mobile_Loading.hide();
    }
}
// ======================================================
// 📦 DOM 로드 후 자동 실행
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    initMobile_Workspace();
});
// ======================================================
// 🌐 서버 연결 상태 체크 (Footer 표시)
// ======================================================
async function checkServerStatus() {
    try {
        const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
        if (!res.ok)
            throw new Error("HTTP " + res.status);
        return true;
    }
    catch {
        return false;
    }
}
function updateFooterStatus(connected) {
    const el = document.getElementById("serverStatus");
    if (!el)
        return;
    if (connected) {
        el.textContent = "서버 연결됨";
        el.classList.remove("before:text-red-500", "text-gray-400");
        el.classList.add("before:text-green-400", "text-green-300");
    }
    else {
        el.textContent = "서버 연결 끊김";
        el.classList.remove("before:text-green-400", "text-green-300");
        el.classList.add("before:text-red-500", "text-gray-400");
    }
}
// ======================================================
// 📦 출장업무 + 사내업무 Pool 초기화
// ======================================================
function initBusinessModules() {
    console.log("📦 [Mobile_Workspace] 업무 Pool 초기화 시작");
    (0,_02_mobile_set_up__WEBPACK_IMPORTED_MODULE_2__.initMobile_SetUp)(API_BASE);
    (0,_03_mobile_as__WEBPACK_IMPORTED_MODULE_3__.initMobile_AS)(API_BASE);
    (0,_04_mobile_test__WEBPACK_IMPORTED_MODULE_4__.initMobile_Test)(API_BASE);
    (0,_05_mobile_doc__WEBPACK_IMPORTED_MODULE_5__.initMobile_Doc)(API_BASE);
}
/**
 * 5초 간격으로 서버 연결 상태를 점검하고 footer에 표시
 */
function startServerConnectionCheck() {
    checkServerStatus().then(updateFooterStatus);
    setInterval(async () => {
        const ok = await checkServerStatus();
        updateFooterStatus(ok);
    }, 5000);
}
// ======================================================
// 📱 탭 전환 처리 (PC workspace.ts 참고하여 동일 구조로 추가)
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    initMobile_Workspace();
    // 🔹 탭 버튼들: data-tab 속성 필수
    const tabButtons = document.querySelectorAll("[data-tab]");
    console.log("📱 [Mobile_Workspace] 데이터-탭 버튼 수:", tabButtons.length);
    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.tab;
            if (!targetId)
                return;
            console.log(`[MOBILE TAB] 클릭됨 → ${targetId}`);
            // 🔹 모든 모바일 패널 숨기기
            document
                .querySelectorAll("[id^='mobile_panel-']")
                .forEach((el) => el.classList.add("hidden"));
            // 🔹 해당 패널 표시
            const panel = document.getElementById(`mobile_panel-${targetId}`);
            if (!panel) {
                console.error(`[MOBILE TAB] 패널 없음: mobile_panel-${targetId}`);
                return;
            }
            panel.classList.remove("hidden");
            // 🔹 모바일에서는 sidebar 자동 닫기 (UI 경험 개선)
            const sidebar = document.getElementById("mobileSidebar");
            if (sidebar)
                sidebar.classList.add("hidden");
        });
    });
});

})();

/******/ })()
;
//# sourceMappingURL=mobile-workspace.bundle.js.map