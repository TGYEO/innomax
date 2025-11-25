"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = loginRouter;
const express_1 = require("express");
function loginRouter(pool) {
    const router = (0, express_1.Router)();
    // ✅ 로그인 API
    router.post("/", async (req, res, next) => {
        var _a;
        const { name, password } = req.body;
        if (!name || !password) {
            res.status(400).json({ success: false, error: "입력값 부족" });
            return;
        }
        try {
            const result = await pool.query(`SELECT * FROM users WHERE name = $1`, [name]);
            if (result.rows.length === 0) {
                res.status(404).json({ success: false, error: "사용자 없음" });
                return;
            }
            const user = result.rows[0];
            const phoneLast4 = (_a = user.phone) === null || _a === void 0 ? void 0 : _a.slice(-4);
            if (phoneLast4 === password) {
                res.json({ success: true, user });
            }
            else {
                res.status(401).json({ success: false, error: "비밀번호 불일치" });
            }
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
