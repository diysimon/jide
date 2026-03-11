# Jide API接口设计文档

## 1. 接口概述

Base URL: `https://api.jide.com/v1`（可配置）  
认证方式: Bearer Token / JWT

---

## 2. 用户接口

### 2.1 注册
```
POST /auth/register
Body: {
  username: string,
  password: string,
  nickname: string,
  role: "patient" | "caregiver"
}
Response: { userId, token }
```

### 2.2 登录
```
POST /auth/login
Body: { username, password }
Response: { userId, token, role, nickname }
```

### 2.3 获取用户信息
```
GET /users/me
Header: Authorization: Bearer <token>
Response: { userId, nickname, role, age, gender, diseaseStage, createdAt }
```

### 2.4 更新用户资料
```
PATCH /users/me
Body: { nickname?, age?, gender?, diseaseStage? }
Response: { success }
```

---

## 3. 训练接口

### 3.1 开始训练
```
POST /training/start
Body: {
  trainingType: "M1" | "M2" | ... | "P2",
  difficulty: number
}
Response: {
  sessionId: string,
  trainingData: object // 训练初始数据
}
```

### 3.2 提交训练结果
```
POST /training/complete
Body: {
  sessionId: string,
  score: number,
  correctRate: number,
  timeUsed: number,
  hintUsed: number,
  errorCount: number,
  trainingData: object // 详细数据JSON
}
Response: { recordId, newAchievements[], levelChange? }
```

### 3.3 获取训练历史
```
GET /training/history?type=M1&limit=10&offset=0
Response: {
  records: TrainingRecord[],
  total: number
}
```

### 3.4 获取训练配置
```
GET /training/config?type=M1
Response: {
  type: "M1",
  name: "卡片配对",
  difficultyLevels: 10,
  description: string
}
```

---

## 4. 进度接口

### 4.1 获取用户进度
```
GET /progress
Response: {
  dimensions: {
    memory: { level, totalTimes, trend },
    attention: { level, totalTimes, trend },
    // ...
  },
  totalTrainingDays: number,
  consecutiveDays: number
}
```

### 4.2 获取趋势数据
```
GET /progress/trend?dimension=memory&period=week
Response: {
  dates: ["2026-03-05", "2026-03-06", ...],
  scores: [75, 80, 78, ...],
  avgScore: number
}
```

---

## 5. 成就接口

### 5.1 获取成就列表
```
GET /achievements
Response: {
  achievements: Achievement[],
  userAchievements: UserAchievement[]
}
```

### 5.2 获取最新成就
```
GET /achievements/latest
Response: { achievements: UserAchievement[] }
```

---

## 6. 家属接口

### 6.1 生成邀请码
```
POST /relation/invite
Body: { relationType: "spouse" | "child" | "other" }
Response: { inviteCode, expiresAt }
```

### 6.2 绑定账户
```
POST /relation/bind
Body: { inviteCode: string }
Response: { success, patientName }
```

### 6.3 获取患者数据
```
GET /relation/patients/:patientId/dashboard
Response: {
  patient: { nickname, lastTrainingAt },
  today: { times, duration, score },
  weekTrend: number,
  dimensions: { ... }
}
```

### 6.4 发送鼓励消息
```
POST /message/encourage
Body: { patientId, message }
Response: { success }
```

### 6.5 设置提醒
```
POST /reminder/set
Body: {
  patientId: string,
  type: "training" | "absence",
  enabled: boolean,
  config: object
}
Response: { success }
```

---

## 7. 错误码

| 码 | 说明 |
|----|------|
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

*文档版本：v1.0*  
*技术文档：API接口设计*  
*最后更新：2026-03-11*
