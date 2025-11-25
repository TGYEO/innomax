"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = partsHistoryRouter;
const express_1 = require("express");
function partsHistoryRouter(pool) {
    const router = (0, express_1.Router)();
    // ✅ Parts 사용 이력 조회
    router.get("/", async (req, res, next) => {
        try {
            const result = await pool.query("SELECT * FROM parts_history ORDER BY used_at DESC");
            res.json(result.rows);
        }
        catch (err) {
            next(err);
        }
    });
    // ✅ Parts 사용 기록 등록
    router.post("/", async (req, res, next) => {
        const { part_id, used_by, quantity } = req.body;
        if (!part_id || !used_by) {
            res.status(400).json({ success: false, error: "필수값 누락" });
            return;
        }
        try {
            await pool.query(`INSERT INTO parts_history (part_id, used_by, quantity, used_at) VALUES ($1, $2, $3, NOW())`, [part_id, used_by, quantity]);
            res.status(201).json({ success: true });
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
