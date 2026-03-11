# Jide 阿尔兹海默症大脑训练系统 - 补充设计

## 1. 医疗补充设计

### 1.1 训练强度分级（更细致）

考虑到阿尔兹海默症患者的个体差异，我们将训练强度分为5个**大级别**，每个大级别下分2个小级别：

| 大级别 | 适用人群 | 特征 |
|-------|---------|------|
| 入门级 | 初期患者/新手 | 超大按钮、无时间限制、随时提示 |
| 基础级 | 轻症患者 | 大按钮、宽松时间、有限提示 |
| 进阶级 | 轻中度患者 | 正常大小、有时间限制 |
| 挑战级 | 中度患者 | 较难、有竞争元素 |
| 专家级 | 能力较好的患者 | 高难度、速度挑战 |

### 1.2 训练效果评估

每完成一个周期（四周）的训练，系统生成**认知评估报告**：

```typescript
interface CognitiveReport {
  userId: string;
  period: { start: Date; end: Date };
  dimensions: {
    memory: { before: number; after: number; change: number };
    attention: { before: number; after: number; change: number };
    // ...
  };
  training: {
    totalDays: number;
    totalDuration: number;
    completionRate: number;
  };
  aiAnalysis: string; // AI生成的综合分析
  suggestions: string[]; // 训练建议
}
```

### 1.3 医学禁忌与注意事项

```markdown
## ⚠️ 禁忌症与注意事项

### 适宜人群
- 轻度认知障碍(MCI)患者
- 早期阿尔兹海默症患者
- 中期阿尔兹海默症患者（在陪护下）

### 注意事项
1. 每次训练不超过30分钟
2. 出现疲劳症状立即停止
3. 需要在安静环境下进行
4. 建议有人陪伴操作

### 不建议使用的情况
- 重度阿尔兹海默症晚期
- 严重视力/听力障碍
- 精神行为症状明显
```

### 1.4 音乐素材说明

```markdown
## 🎵 音乐素材使用说明

为避免版权问题，我们采用以下方案：

1. **自制音效**：自行录制简单节拍
2. **免版权音乐**：使用 YouTube Audio Library 等
3. **自然声音**：雨声、鸟鸣、流水等
4. **患者熟悉旋律**：使用经典老歌简谱重新编曲
```

---

## 2. 技术补充设计

### 2.1 数据同步方案

```typescript
// 本地优先策略
interface SyncStrategy {
  // 优先使用本地数据
  readLocalFirst: boolean;
  
  // 离线队列
  offlineQueue: {
    pending: TrainingRecord[];
    lastSyncAt: Date;
  };
  
  // 冲突解决：本地时间戳优先
  conflictResolution: 'local_wins' | 'server_wins' | 'manual';
}

// 同步触发条件
- 训练完成时
- 应用启动时
- 网络恢复时
- 每5分钟定期同步
```

### 2.2 PWA离线支持

```typescript
// Service Worker 缓存策略
const CACHE_STRATEGY = {
  // 静态资源：Cache First
  static: ['/static/js/*.js', '/static/css/*.css'],
  
  // 训练数据：Network First
  training: ['/api/training/*'],
  
  // 用户数据：Stale-While-Revalidate
  user: ['/api/user/*', '/api/progress/*']
};

// 离线可用功能
const OFFLINE_FEATURES = [
  '浏览训练介绍',
  '进行已缓存的训练',
  '查看历史记录',
  '设置个人偏好'
];
```

### 2.3 安全设计

```typescript
// 安全措施
interface SecurityConfig {
  // 认证
  tokenExpiry: 7 * 24 * 60 * 60 * 1000; // 7天
  refreshTokenExpiry: 30 * 24 * 60 * 60 * 1000; // 30天
  
  // 防护
  rateLimit: { max: 100, window: 60 * 1000 }; // 100次/分钟
  corsOrigins: ['https://jide.com', 'http://localhost:5173'];
  
  // 数据加密
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotation: 90 * 24 * 60 * 60 * 1000; // 90天
  };
}
```

### 2.4 技术栈补充

```yaml
前端技术栈（确定版）:
  框架: Vue 3.4+ (Composition API)
  语言: TypeScript 5.0+
  状态: Pinia 2.1+
  路由: Vue Router 4.2+
  HTTP: Axios + TanStack Query
  UI: Element Plus 2.4+ (定制主题)
  图表: ECharts 5.9+
  构建: Vite 5.0+
  PWA: Vite PWA Plugin
  
后端（可选）:
  API: Node.js + Express / Python + FastAPI
  数据库: SQLite(本地) + PostgreSQL(云端)
  缓存: Redis
  文件: 阿里云OSS / 腾讯云COS
```

---

## 3. 待补充文档

| 文档 | 状态 | 说明 |
|-----|------|------|
| 测试用例 | 待编写 | 单元测试、集成测试、E2E测试 |
| 数据字典 | 待编写 | 详细字段说明 |
| 运营文档 | 待编写 | 推广、盈利模式 |
| API变更日志 | 待维护 | 版本历史 |

---

## 4. Review总结

### ✅ 已完成
- 24种训练方式详细设计
- 难度自适应算法
- 成就系统
- 家属查看系统
- 完整技术文档

### 🔧 需要补充
1. ~~训练强度分级~~ ✅ 已补充
2. ~~效果评估机制~~ ✅ 已补充
3. ~~音乐版权说明~~ ✅ 已补充
4. ~~数据同步方案~~ ✅ 已补充
5. ~~PWA离线支持~~ ✅ 已补充
6. ~~安全设计~~ ✅ 已补充
7. 测试用例（可选）

---

*补充文档版本：v1.1*  
*Review日期：2026-03-11*
