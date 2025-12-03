export function initUserRegisterPanel(API_BASE: string) {
  const userTableBody = document.getElementById("userTableBody") as HTMLTableSectionElement;
  const userCount = document.getElementById("userCount") as HTMLSpanElement;
  const userForm = document.getElementById("userForm") as HTMLFormElement;
  const modalMode = document.getElementById("modalMode") as HTMLInputElement;
  const modalNo = document.getElementById("modalNo") as HTMLInputElement;
  const userModal = document.getElementById("userModal") as HTMLDivElement;
  const permPreview = document.getElementById("permPreview") as HTMLDivElement;

  type PermValue = "ReadWrite" | "ReadOnly" | "NoAccess";

  type Permissions = {
    order_register: PermValue;
    task_assign: PermValue;
    progress: PermValue;
    report: PermValue;
    request: PermValue;
  };

  type UserRow = {
    No: string;
    ID: string;
    Name: string | null;
    email: string | null;
    company_part: string | null;
    created_at: string | null;
    updated_at: string | null;
    permissions: string | null;
  };

  const permLabels: Record<keyof Permissions, string> = {
    order_register: "수주건등록",
    task_assign: "업무할당",
    progress: "진행상황",
    report: "진행상황보고",
    request: "요청사항",
  };

  const permValues: Record<PermValue, string> = {
    ReadWrite: "읽고 쓰기 가능",
    ReadOnly: "읽기 전용",
    NoAccess: "접근 불가",
  };

  function parsePerm(json: string | null): Permissions {
    try {
      const obj = json ? JSON.parse(json) : {};
      return {
        order_register: obj.order_register ?? "NoAccess",
        task_assign: obj.task_assign ?? "NoAccess",
        progress: obj.progress ?? "NoAccess",
        report: obj.report ?? "NoAccess",
        request: obj.request ?? "NoAccess",
      };
    } catch {
      return {
        order_register: "NoAccess",
        task_assign: "NoAccess",
        progress: "NoAccess",
        report: "NoAccess",
        request: "NoAccess",
      };
    }
  }

  function updatePermPreview(permissions: Permissions) {
    if (!permPreview) return;

    const html = Object.entries(permissions)
      .map(([k, v]) => `${permLabels[k as keyof Permissions]} : ${permValues[v]}`)
      .join("<br>");

    permPreview.innerHTML = html;
  }

  // 🟦 사용자 목록 렌더링
  async function renderUsers() {
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      const users: UserRow[] = await res.json();
      userTableBody.innerHTML = "";

      users.forEach((u, idx) => {
        const p = parsePerm(u.permissions);
        const permText = Object.entries(p)
          .map(([k, v]) => `${permLabels[k as keyof Permissions]} : ${permValues[v]}`)
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
    } catch (err) {
      console.error("❌ 사용자 목록 불러오기 실패:", err);
    }
  }

  // 🟦 모달 열기
  async function openUserModal(mode: "add" | "edit", no?: string) {
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;
    const nameInput = document.getElementById("modalName") as HTMLInputElement;
    const idInput = document.getElementById("modalID") as HTMLInputElement;
    const passwordInput = document.getElementById("modalPassword") as HTMLInputElement;
    const emailInput = document.getElementById("modalEmail") as HTMLInputElement;
    const companyInput = document.getElementById("modalCompanyPart") as HTMLInputElement;

    const Select = (id: string) => document.getElementById(id) as HTMLSelectElement;

    passwordInput.type = "password";

    // ==============================
    // 신규 사용자 추가
    // ==============================
    if (mode === "add") {
      title.innerText = "신규 사용자 추가";
      modalMode.value = "add";
      modalNo.value = "";
      userForm.reset();

      const defaultPerm: Permissions = {
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
        const u: UserRow = await res.json();

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
      } catch (err) {
        console.error("❌ 사용자 정보 불러오기 실패:", err);
      }
    }

    userModal.classList.remove("hidden");
  }

  // 🟦 모달 닫기
  function closeUserModal() {
    userModal.classList.add("hidden");
  }

  (window as any).togglePassword = function () {
    const input = document.getElementById("modalPassword") as HTMLInputElement;
    input.type = input.type === "password" ? "text" : "password";
  };

  // 새 권한 ID
  const permIds = ["수주건등록", "업무할당", "진행상황", "진행상황보고", "요청사항"];

  // 🟦 권한 select 변경 → 미리보기 갱신
  permIds.forEach((id) => {
    const el = document.getElementById(id) as HTMLSelectElement;
    if (el) {
      el.addEventListener("change", () => {
        const p: Permissions = {
          order_register: (document.getElementById("수주건등록") as HTMLSelectElement).value as PermValue,
          task_assign: (document.getElementById("업무할당") as HTMLSelectElement).value as PermValue,
          progress: (document.getElementById("진행상황") as HTMLSelectElement).value as PermValue,
          report: (document.getElementById("진행상황보고") as HTMLSelectElement).value as PermValue,
          request: (document.getElementById("요청사항") as HTMLSelectElement).value as PermValue,
        };
        updatePermPreview(p);
      });
    }
  });

  // 🟦 저장
  if (userForm) {
    userForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const mode = modalMode.value as "add" | "edit";
      const no = modalNo.value || undefined;

      const Name = (document.getElementById("modalName") as HTMLInputElement).value.trim();
      const ID = (document.getElementById("modalID") as HTMLInputElement).value.trim();
      const password = (document.getElementById("modalPassword") as HTMLInputElement).value.trim();
      const email = (document.getElementById("modalEmail") as HTMLInputElement).value.trim() || null;
      const company_part = (document.getElementById("modalCompanyPart") as HTMLInputElement).value.trim() || null;

      const permissions: Permissions = {
        order_register: (document.getElementById("수주건등록") as HTMLSelectElement).value as PermValue,
        task_assign: (document.getElementById("업무할당") as HTMLSelectElement).value as PermValue,
        progress: (document.getElementById("진행상황") as HTMLSelectElement).value as PermValue,
        report: (document.getElementById("진행상황보고") as HTMLSelectElement).value as PermValue,
        request: (document.getElementById("요청사항") as HTMLSelectElement).value as PermValue,
      };

      try {
        if (mode === "add") {
          await fetch(`${API_BASE}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Name, ID, password, email, company_part, permissions }),
          });
        } else {
          const payload: any = { Name, ID, email, company_part, permissions };
          if (password) payload.password = password;

          await fetch(`${API_BASE}/api/users/${no}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        await renderUsers();
        closeUserModal();
      } catch (err) {
        console.error("❌ 사용자 저장 실패:", err);
      }
    });
  }

  // 🟦 삭제
  async function deleteUser(no: string) {
    await fetch(`${API_BASE}/api/users/${no}`, { method: "DELETE" });
    await renderUsers();
  }

  userTableBody.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.dataset.action === "edit") openUserModal("edit", target.dataset.no!);
    if (target.dataset.action === "delete") deleteUser(target.dataset.no!);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeUserModal();
  });

  (window as any).openAddUserModal = () => openUserModal("add");
  (window as any).closeUserModal = closeUserModal;

  renderUsers();
}
