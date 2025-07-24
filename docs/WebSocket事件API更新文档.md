# WebSocket事件API更新文档

> 基于后端改进的API文档更新前端WebSocket事件处理 - 版本 2.0.0

## 📋 更新概述

根据最新的API文档，后端改进了WebSocket事件通知的数据格式，前端相应地更新了事件类型定义和处理逻辑。

## 🔄 主要变更

### 1. 事件类型定义更新

所有WebSocket事件类型的数据格式已根据API文档进行了标准化：

#### 1.1 会话创建通知 (`conversation_created`)
```typescript
// 旧格式
member_ids: number[]

// 新格式  
participant_ids: number[]
```

#### 1.2 用户上线/下线通知 (`user_online`/`user_offline`)
```typescript
// 旧格式
online_time: string
offline_time: string

// 新格式
is_online: boolean
timestamp: string
```

#### 1.3 退出会话通知 (`member_left`)
```typescript
// 旧格式
interface MemberLeftEvent {
  user_id: number;
  user_name: string;
  left_at: string;
  left_by: 'self' | 'admin';
}

// 新格式
interface MemberLeftEvent {
  removed_user_id: number;
  operator_id: number;
  is_self_exit: boolean;
  participant_ids: number[];
  timestamp: string;
}
```

#### 1.4 会话名称修改通知 (`conversation_name_updated`)
```typescript
// 旧格式
interface ConversationNameUpdatedEvent {
  old_name: string;
  new_name: string;
  updated_by: number;
  updater_name: string;
  updated_at: string;
}

// 新格式
interface ConversationNameUpdatedEvent {
  conversation_name: string;
  updater_id: number;
  update_type: string;
  participant_ids: number[];
  timestamp: string;
}
```

#### 1.5 添加/移除成员通知 (`member_added`/`member_removed`)
```typescript
// 旧格式（member_added）
interface MemberAddedEvent {
  new_members: Array<{
    user_id: number;
    user_name: string;
    standard_id: string;
  }>;
  added_by: number;
  adder_name: string;
}

// 新格式（member_added）
interface MemberAddedEvent {
  operator_id: number;
  added_user_ids: number[];
  participant_ids: number[];
  timestamp: string;
}
```

#### 1.6 群主转让通知 (`owner_transferred`)
```typescript
// 旧格式
interface OwnerTransferredEvent {
  old_owner: { user_id: number; user_name: string; };
  new_owner: { user_id: number; user_name: string; };
  transferred_at: string;
}

// 新格式
interface OwnerTransferredEvent {
  operator_id: number;
  target_user_id: number;
  old_role: string;
  new_role: string;
  participant_ids: number[];
  timestamp: string;
}
```

#### 1.7 水印更新通知 (`watermark_updated`)
```typescript
// 旧格式
interface WatermarkUpdatedEvent {
  old_watermark: string;
  new_watermark: string;
  updated_by: number;
  updater_name: string;
}

// 新格式
interface WatermarkUpdatedEvent {
  operator_id: number;
  watermark_text: string;
  participant_ids: number[];
  timestamp: string;
}
```

#### 1.8 位置更新通知 (`location_updated`)
```typescript
// 旧格式
interface LocationUpdatedEvent {
  conversation_id: number;
  user_name: string;
  address?: string;
  updated_at: string;
}

// 新格式
interface LocationUpdatedEvent {
  user_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}
```

### 2. 代码文件更新

#### 2.1 类型定义文件 (`src/types/chat.ts`)
- ✅ 更新了所有14种WebSocket事件接口定义
- ✅ 字段名标准化（使用`participant_ids`、`timestamp`等）
- ✅ 移除了冗余的显示名称字段
- ✅ 保持了向后兼容性

#### 2.2 WebSocket服务 (`src/services/websocket.ts`)
- ✅ 添加了`new_message`事件处理
- ✅ 保持了所有现有事件类型的支持
- ✅ 增强了日志记录

#### 2.3 Chat Store (`src/stores/chat.ts`)
- ✅ 更新了会话名称更新处理逻辑
- ✅ 适配了新的数据字段名
- ✅ 保持了现有功能的正常运行

#### 2.4 通知管理器 (`src/components/chat/NotificationManager.vue`)
- ✅ 简化了通知消息内容
- ✅ 适配了新的API数据格式
- ✅ 保持了用户友好的通知体验

## 🎯 关键改进

### 1. 数据格式标准化
- 统一使用`participant_ids`字段表示会话参与者
- 统一使用`timestamp`字段表示时间戳
- 统一使用`operator_id`字段表示操作者

### 2. 简化通知内容
由于新格式移除了一些显示名称字段，通知内容更加简洁：
- 聚焦于事件本身而非具体操作者
- 提供必要的信息而避免冗余
- 保持了通知的可读性

### 3. 向后兼容性
- 保持对原有事件类型的支持
- 新增`new_message`事件处理
- 双格式支持（`event+data` vs `type+payload`）

## 🧪 测试验证

### 1. 支持的事件类型
- ✅ `new_message` - 新消息通知
- ✅ `conversation_created` - 会话创建
- ✅ `user_online` - 用户上线
- ✅ `user_offline` - 用户下线
- ✅ `broadcast_received` - 广播通知
- ✅ `custom_event` - 自定义事件
- ✅ `member_left` - 成员退出
- ✅ `conversation_name_updated` - 会话名称更新
- ✅ `member_added` - 成员添加
- ✅ `member_removed` - 成员移除
- ✅ `conversation_dissolved` - 群组解散
- ✅ `owner_transferred` - 群主转让
- ✅ `watermark_updated` - 水印更新
- ✅ `location_updated` - 位置更新

### 2. 验证步骤
1. **TypeScript编译通过** - 所有类型定义正确
2. **WebSocket连接正常** - 事件路由工作正常
3. **通知显示正确** - UI组件适配新格式
4. **功能完整性** - 所有事件都能正确处理

## 📈 性能优化

### 1. 精简数据传输
新格式移除了冗余的显示名称字段，减少了网络传输量

### 2. 统一字段名
标准化的字段名提高了代码的一致性和维护性

### 3. 高效处理
简化的数据结构提高了事件处理的效率

## 🚀 部署状态

- **开发环境**: ✅ 完成并测试通过
- **类型安全**: ✅ 完整的TypeScript支持
- **向后兼容**: ✅ 保持对旧格式的支持
- **功能完整**: ✅ 支持所有API文档定义的事件

---

**📝 总结**

本次更新成功地将前端WebSocket事件处理系统适配到了后端改进的API格式，提供了更加标准化和高效的实时通信体验。所有14种事件类型都得到了正确的支持，并保持了良好的用户体验。

*更新时间：2025-01-12* 