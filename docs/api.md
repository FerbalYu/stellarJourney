# API Reference

## Base URL

```
http://localhost:{PORT}
```

Default PORT: `3000`. Set via `PORT` environment variable.

## Response Convention

All endpoints return JSON with uniform envelope:

```json
{
  "success": true | false,
  "data": { ... },
  "error": "error message (only when success=false)"
}
```

---

## Troubleshoot API

Base path: `/api/troubleshoot`

### GET /api/troubleshoot/steps

获取排查步骤列表。

**Request**: None

**Response** `200`:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "重启设备",
      "icon": "🔄",
      "description": "重启设备是最基础的故障排查方法",
      "instructions": [
        "保存当前所有工作",
        "完全关闭游戏程序",
        "关闭设备电源",
        "等待至少 10 秒钟",
        "重新启动设备",
        "再次打开游戏"
      ],
      "warning": null
    }
  ]
}
```

Steps order: 1(重启设备) → 2(清除缓存) → 3(切换网络) → 4(更新版本)

---

### POST /api/troubleshoot/log

记录排查步骤完成。

**Request Body**:
```json
{
  "step": 1,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "completed": true
}
```

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| `step` | number | Yes | 1-4 整数 |
| `timestamp` | string | No | ISO 8601，默认当前时间 |
| `completed` | boolean | Yes | 必须为 `true` |

**Response** `200`:
```json
{
  "success": true,
  "message": "步骤 1 完成已记录",
  "data": {
    "step": 1,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error** `400`:
```json
{
  "success": false,
  "error": "步骤编号无效，必须是 1-4 之间的整数"
}
```

---

### POST /api/troubleshoot/complete

标记排查流程全部完成。

**Request Body**: None (empty body accepted)

**Response** `200`:
```json
{
  "success": true,
  "message": "排查流程已完成",
  "data": {
    "completedAt": "2024-01-01T00:00:00.000Z",
    "totalStepsCompleted": 4
  }
}
```

Side effect: `stats.completedTroubleshootings` 计数器 +1

---

### GET /api/troubleshoot/stats

获取排查统计数据。

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "totalRequests": 42,
    "stepCompletions": { "1": 10, "2": 8, "3": 7, "4": 5 },
    "completedTroubleshootings": 5,
    "recentLogs": [
      { "step": 4, "timestamp": "...", "completed": true }
    ]
  }
}
```

`recentLogs` 最多返回最近 10 条。

---

## Game API

### GET /api/game/version

获取游戏版本信息。

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "currentVersion": "1.0.0",
    "latestVersion": "1.0.1",
    "updateAvailable": true,
    "downloadUrl": "/download",
    "releaseNotes": "修复了若干问题，提升了稳定性"
  }
}
```

Environment variable overrides:
- `GAME_VERSION` → `currentVersion`
- `LATEST_VERSION` → `latestVersion`
- `DOWNLOAD_URL` → `downloadUrl`
- `RELEASE_NOTES` → `releaseNotes`

Version comparison: simple semantic (major.minor.patch), left-to-right numeric compare.

---

## System API

### GET /api/health

健康检查。

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": "12分钟34秒",
    "memory": {
      "rss": "45MB",
      "heapUsed": "12MB",
      "heapTotal": "20MB"
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api

API 根路径。返回所有可用端点列表。

---

## Error Codes

| Code | Meaning | When |
|------|---------|------|
| `400` | Bad Request | 输入验证失败 |
| `404` | Not Found | 路由或资源不存在 |
| `500` | Internal Server Error | 未预期异常 |

Production mode (`NODE_ENV=production`): 500 错误不返回 `error.message` 和 `stack`，仅返回 `"服务器内部错误"`。

---

## Static Files

All `public/` files served via `express.static`. SPA fallback: unmatched GET routes serve `public/index.html`.
