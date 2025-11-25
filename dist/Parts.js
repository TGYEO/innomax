"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = partsRouter;
const express_1 = require("express");
function partsRouter(pool) {
    const router = (0, express_1.Router)();
    // ✅ Parts 목록 조회
    router.get("/", async (req, res, next) => {
        try {
            const result = await pool.query("SELECT * FROM parts ORDER BY created_at DESC");
            res.json(result.rows);
        }
        catch (err) {
            next(err);
        }
    });
    // ✅ Parts 등록
    router.post("/", async (req, res, next) => {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ success: false, error: "이름은 필수입니다" });
            return;
        }
        try {
            await pool.query(`INSERT INTO parts (name, description, created_at) VALUES ($1, $2, NOW())`, [name, description]);
            res.status(201).json({ success: true });
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
