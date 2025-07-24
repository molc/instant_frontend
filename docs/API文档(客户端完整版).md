# 即时通讯系统 API 文档

> 基于实际代码生成的完整API文档 - 版本 1.0.1

## 📋 目录

### 🔧 基础信息
- [版本更新说明](#🆕-版本更新-v101)
- [基础信息](#基础信息)
- [认证说明](#认证说明)

### 🔐 认证与用户管理
- [1. 认证模块 (auth)](#1-认证模块-auth)
  - 1.1 用户登录
- [2. 用户模块 (users)](#2-用户模块-users)
  - 2.1 创建用户
  - 2.2 获取当前用户信息
  - 2.3 搜索用户
  - 2.4 获取用户在线状态

### 💬 核心通信功能
- [3. 会话模块 (conversations)](#3-会话模块-conversations)
  - 3.1 创建单聊
  - 3.2 创建群聊
  - 3.3 获取用户会话列表
  - 3.4 获取会话详情
  - 3.5 更新会话信息
  - 3.6 删除会话
  - 3.7 获取会话成员
  - 3.8 添加会话成员
  - 3.9 移除会话成员
  - 3.10 更新会话成员信息

- [4. 消息模块 (messages)](#4-消息模块-messages)
  - 4.1 发送文本消息
  - 4.2 发送文件消息
  - 4.3 发送位置消息
  - 4.4 搜索消息
  - 4.5 获取未读消息数
  - 4.6 获取会话消息
  - 4.7 获取单条消息
  - 4.8 更新消息
  - 4.9 撤回消息
  - 4.10 标记消息已读
  - 4.11 获取消息已读回执
  - 4.12 发送正在输入指示

- [5. 文件模块 (files)](#5-文件模块-files)
  - 5.1 上传文件
  - 5.2 下载文件
  - 5.3 获取文件信息
  - 5.4 获取用户文件列表
  - 5.5 删除文件
  - 5.6 获取文件下载信息

### ⚡ 实时通信与推送
- [6. 实时通信模块 (realtime)](#6-实时通信模块-realtime)
  - 6.1 获取在线用户
  - 6.2 检查用户在线状态
  - 6.3 发送广播消息
  - 6.4 获取连接统计

### 👥 高级群组功能
- [7. 群组高级功能 (groups)](#7-群组高级功能-groups)
  - 7.1 添加群组成员
  - 7.2 移除群组成员
  - 7.3 生成群组邀请码
  - 7.4 获取群组统计信息
  - 7.5 搜索公开群组

### 🌐 WebSocket 实时连接
- [8. WebSocket 实时连接](#8-websocket-实时连接)
  - WebSocket连接地址
  - 认证方式
  - 消息格式
  - 事件类型详解

### 🔔 通知系统
- [9. 通知模块 (notifications)](#9-通知模块-notifications)
  - 9.1 获取通知列表
  - 9.2 创建通知
  - 9.3 获取通知统计
  - 9.4 获取单个通知
  - 9.5 更新通知
  - 9.6 删除通知
  - 9.7 批量发送通知
  - 9.8 标记通知已读
  - 9.9 批量操作通知
  - 9.10 获取通知偏好设置
  - 9.11 更新通知偏好设置
  - 9.12 获取通知模板列表
  - 9.13 创建通知模板
  - 9.14 获取通知模板详情
  - 9.15 更新通知模板
  - 9.16 删除通知模板

### 🛡️ 安全与系统
- [10. 安全测试模块 (security)](#10-安全测试模块-security)
  - 10.1 速率限制测试
  - 10.2 安全头测试
  - 10.3 关键端点测试
  - 10.4 CORS测试
  - 10.5 获取安全状态
  - 10.6 模拟攻击测试

- [11. 系统模块 (system)](#11-系统模块-system)
  - 11.1 健康检查
  - 11.2 根路径

### 📚 附录
- [错误码说明](#错误码说明)
  - HTTP状态码
  - 错误响应格式
- [WebSocket 事件类型详解](#websocket-事件类型详解)
  - 即时消息通知
  - 会话创建通知
  - 用户状态变更通知
  - 广播通知
  - 连接管理事件
- [开发说明](#开发说明)
  - 环境要求
  - 本地开发
  - API文档

---

## 🆕 版本更新 (v1.0.1)

### 新增功能
- **未读消息计数**: 会话列表API现在包含 `unread_count` 字段，显示每个会话的未读消息数量
- **文件消息完整推送**: WebSocket文件消息现在包含完整的 `file_info` 对象，客户端可直接显示文件详情
- **文件下载权限**: 自动为会话成员创建文件分享权限，确保文件下载功能正常
- **用户体验增强**: 用户登录后可直接在会话列表中看到离线期间收到的未读消息数，无需额外API调用

### 影响的API
- `GET /api/v1/conversations/` - 响应中新增 `unread_count` 字段
- `POST /api/v1/messages/file` - 自动创建文件分享权限
- **WebSocket消息推送** - 文件消息新增 `file_info` 完整对象

### 客户端更新建议
1. **会话列表**: 更新UI显示未读消息计数徽章
2. **文件消息**: 利用WebSocket推送的 `file_info` 直接显示文件详情，无需额外API调用
3. **下载功能**: 使用 `/api/v1/files/download/{file_id}` 进行文件下载
4. **错误处理**: 如 `file_info` 为空，回退到 `/api/v1/files/info/{file_id}` 获取文件信息
5. 删除原有的单独获取未读数的冗余调用（如需要仍可保留作为补充）

---

## 基础信息

- **Base URL**: `http://172.19.103.122:8000`
- **API Version**: v1
- **API Prefix**: `/api/v1`
- **认证方式**: Bearer Token (JWT)

## 认证说明

除了用户注册和登录接口外，所有API都需要在请求头中包含认证令牌：

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. 认证模块 (auth)

### 1.1 用户登录

**接口**: `POST /api/v1/auth/login/access-token`

**描述**: 用户登录获取访问令牌

**请求参数**:
- **Content-Type**: `application/x-www-form-urlencoded`
- **Body**:
  - `username` (string, 必填): 用户标准ID
  - `password` (string, 必填): 用户密码

**响应数据**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

**响应字段**:
- `access_token` (string): JWT访问令牌
- `token_type` (string): 令牌类型，固定为"bearer"

**状态码**:
- `200`: 登录成功
- `400`: 用户名或密码错误
- `422`: 请求参数验证失败

---

## 2. 用户模块 (users)

### 2.1 创建用户

**接口**: `POST /api/v1/users/`

**描述**: 注册新用户

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "standard_id": "string",
  "name": "string", 
  "password": "string"
}
```

**请求字段**:
- `standard_id` (string, 必填): 用户标准ID，长度1-20字符，唯一
- `name` (string, 必填): 用户姓名，长度1-100字符
- `password` (string, 必填): 用户密码，最少6字符

**响应数据**:
```json
{
  "id": 1,
  "standard_id": "test123",
  "name": "测试用户",
  "is_active": true
}
```

**响应字段**:
- `id` (integer): 用户ID
- `standard_id` (string): 用户标准ID
- `name` (string): 用户姓名
- `is_active` (boolean): 是否激活

**状态码**:
- `200`: 创建成功
- `400`: 用户已存在
- `422`: 请求参数验证失败

### 2.2 获取当前用户信息

**接口**: `GET /api/v1/users/me`

**描述**: 获取当前登录用户的信息

**请求参数**: 无

**响应数据**:
```json
{
  "id": 1,
  "standard_id": "test123",
  "name": "测试用户",
  "is_active": true
}
```

**状态码**:
- `200`: 获取成功
- `401`: 未认证
- `403`: 认证失败

### 2.3 搜索用户

**接口**: `GET /api/v1/users/search`

**描述**: 根据关键词搜索用户

**请求参数**:
- **Query Parameters**:
  - `keyword` (string, 可选): 搜索关键词，默认为空
  - `limit` (integer, 可选): 返回结果数量限制，默认10，范围1-50

**响应数据**:
```json
[
  {
    "id": 1,
    "standard_id": "test123",
    "name": "测试用户",
    "is_active": true
  }
]
```

**状态码**:
- `200`: 搜索成功
- `401`: 未认证

### 2.4 获取用户在线状态

**接口**: `POST /api/v1/users/statuses`

**描述**: 批量获取用户在线状态

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "user_ids": [1, 2, 3]
}
```

**请求字段**:
- `user_ids` (array[integer], 必填): 用户ID列表

**响应数据**:
```json
{
  "statuses": {
    "1": true,
    "2": false,
    "3": true
  }
}
```

**响应字段**:
- `statuses` (object): 用户ID到在线状态的映射，true表示在线，false表示离线

**状态码**:
- `200`: 获取成功
- `401`: 未认证

---

## 3. 会话模块 (conversations)

### 3.1 创建单聊

**接口**: `POST /api/v1/conversations/single`

**描述**: 创建单人会话

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "target_user_id": 2
}
```

**请求字段**:
- `target_user_id` (integer, 必填): 目标用户ID

**响应数据**:
```json
{
  "id": 1,
  "name": null,
  "type": "single",
  "description": null,
  "avatar": null,
  "max_members": 2,
  "allow_invite": true,
  "allow_member_modify": false,
  "status": "active",
  "creator_id": 1,
  "created_at": "2025-01-08T10:00:00Z",
  "updated_at": "2025-01-08T10:00:00Z"
}
```

**状态码**:
- `200`: 创建成功
- `400`: 参数错误或用户不存在
- `401`: 未认证

### 3.2 创建群聊

**接口**: `POST /api/v1/conversations/group`

**描述**: 创建群组会话

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "name": "测试群组",
  "description": "这是一个测试群组",
  "member_ids": [2, 3, 4],
  "max_members": 500,
  "allow_invite": true,
  "allow_member_modify": false
}
```

**请求字段**:
- `name` (string, 必填): 群组名称，长度1-100字符
- `description` (string, 可选): 群组描述
- `member_ids` (array[integer], 必填): 初始成员ID列表，至少1个
- `max_members` (integer, 可选): 最大成员数，默认500，范围2-1000
- `allow_invite` (boolean, 可选): 是否允许邀请新成员，默认true
- `allow_member_modify` (boolean, 可选): 是否允许成员修改群信息，默认false

**响应数据**: 同创建单聊响应格式

**状态码**:
- `200`: 创建成功
- `400`: 参数错误
- `401`: 未认证

### 3.3 获取用户会话列表

**接口**: `GET /api/v1/conversations/`

**描述**: 获取当前用户的会话列表

**请求参数**:
- **Query Parameters**:
  - `skip` (integer, 可选): 跳过的记录数，默认0
  - `limit` (integer, 可选): 返回的记录数，默认20

**响应数据**:
```json
{
  "conversations": [
    {
      "id": 1,
      "name": "测试群组",
      "type": "group",
      "status": "active",
      "creator_id": 1,
      "created_at": "2025-01-08T10:00:00Z",
      "updated_at": "2025-01-08T10:00:00Z",
      "member_count": 3,
      "unread_count": 5,
      "last_message_at": "2025-01-08T11:00:00Z",
      "participants": [
        {
          "id": 2,
          "standard_id": "user002",
          "name": "其他用户"
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

**响应字段说明**:
- `conversations` (array): 会话列表
  - `id` (integer): 会话ID
  - `name` (string): 会话名称（群聊时显示）
  - `type` (string): 会话类型，"single"（单聊）或"group"（群聊）
  - `status` (string): 会话状态
  - `creator_id` (integer): 创建者用户ID
  - `created_at` (string): 创建时间
  - `updated_at` (string): 更新时间
  - `member_count` (integer): 成员数量
  - `unread_count` (integer): **未读消息数量**（新增字段）
  - `last_message_at` (string): 最新消息时间
  - `participants` (array): 参与者列表（排除当前用户）
- `total` (integer): 总记录数
- `page` (integer): 当前页码
- `page_size` (integer): 每页大小

**状态码**:
- `200`: 获取成功
- `401`: 未认证

### 3.4 获取会话详情

**接口**: `GET /api/v1/conversations/{conversation_id}`

**描述**: 获取指定会话的详细信息

**请求参数**:
- **Path Parameters**:
  - `conversation_id` (integer, 必填): 会话ID

**响应数据**: 同创建会话响应格式

**状态码**:
- `200`: 获取成功
- `404`: 会话不存在
- `401`: 未认证
- `403`: 无权限访问

### 3.5 更新会话信息

**接口**: `PUT /api/v1/conversations/{conversation_id}`

**描述**: 更新会话信息

**请求参数**:
- **Path Parameters**:
  - `conversation_id` (integer, 必填): 会话ID
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "name": "新的群组名称",
  "description": "新的群组描述",
  "avatar": "avatar_url",
  "max_members": 600,
  "allow_invite": false,
  "allow_member_modify": true
}
```

**请求字段** (所有字段都是可选的):
- `name` (string): 会话名称
- `description` (string): 会话描述
- `avatar` (string): 会话头像URL
- `max_members` (integer): 最大成员数
- `allow_invite` (boolean): 是否允许邀请
- `allow_member_modify` (boolean): 是否允许成员修改

**响应数据**: 同创建会话响应格式

**状态码**:
- `200`: 更新成功
- `404`: 会话不存在
- `401`: 未认证
- `403`: 无权限

### 3.6 删除会话

**接口**: `DELETE /api/v1/conversations/{conversation_id}`

**描述**: 删除指定会话

**请求参数**:
- **Path Parameters**:
  - `conversation_id` (integer, 必填): 会话ID

**响应数据**: 无内容

**状态码**:
- `204`: 删除成功
- `404`: 会话不存在
- `401`: 未认证
- `403`: 无权限

### 3.7 获取会话成员

**接口**: `GET /api/v1/conversations/{conversation_id}/members`

**描述**: 获取指定会话的成员列表

**请求参数**:
- **Path Parameters**:
  - `conversation_id` (integer, 必填): 会话ID

**响应数据**:
```json
{
  "members": [
    {
      "id": 1,
      "conversation_id": 1,
      "user_id": 1,
      "role": "admin",
      "status": "active",
      "joined_at": "2025-01-08T10:00:00Z",
      "user_name": "管理员",
      "user_standard_id": "admin123"
    }
  ],
  "total": 1
}
```

**状态码**:
- `200`: 获取成功
- `404`: 会话不存在
- `401`: 未认证
- `403`: 无权限

### 3.8 添加会话成员

**接口**: `POST /api/v1/conversations/{conversation_id}/members`

**描述**: 向会话添加新成员

**请求参数**:
- **Path Parameters**:
  - `conversation_id` (integer, 必填): 会话ID
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "user_ids": [5, 6, 7],
  "role": "member"
}
```

**请求字段**:
- `user_ids` (array[integer], 必填): 要添加的用户ID列表
- `role` (string, 可选): 成员角色，默认"member"

**响应数据**: 无内容

**状态码**:
- `200`: 添加成功
- `404`: 会话不存在
- `401`: 未认证
- `403`: 无权限

### 3.9 移除会话成员

**接口**: `DELETE /api/v1/conversations/{conversation_id}/members/{user_id}`

**描述**: 从会话中移除指定成员

**请求参数**:
- **Path Parameters**:
  - `conversation_id` (integer, 必填): 会话ID
  - `user_id` (integer, 必填): 用户ID

**响应数据**: 无内容

**状态码**:
- `204`: 移除成功
- `404`: 会话或用户不存在
- `401`: 未认证
- `403`: 无权限

### 3.10 更新会话成员信息

**接口**: `PUT /api/v1/conversations/{conversation_id}/members/{user_id}`

**描述**: 更新会话成员的信息

**请求参数**:
- **Path Parameters**:
  - `conversation_id` (integer, 必填): 会话ID
  - `user_id` (integer, 必填): 用户ID
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "role": "admin",
  "nickname": "新昵称",
  "status": "active",
  "muted_until": "2025-01-10T10:00:00Z"
}
```

**请求字段** (所有字段都是可选的):
- `role` (string): 成员角色
- `nickname` (string): 群内昵称
- `status` (string): 成员状态
- `muted_until` (string): 禁言到期时间

**响应数据**: 无内容

**状态码**:
- `200`: 更新成功
- `404`: 会话或用户不存在
- `401`: 未认证
- `403`: 无权限

---

## 4. 消息模块 (messages)

### 4.1 发送文本消息

**接口**: `POST /api/v1/messages/text`

**描述**: 发送文本消息

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "conversation_id": 1,
  "content": "Hello, world!",
  "reply_to_id": 10
}
```

**请求字段**:
- `conversation_id` (integer, 必填): 会话ID
- `content` (string, 必填): 消息内容，长度1-5000字符
- `reply_to_id` (integer, 可选): 回复的消息ID

**响应数据**:
```json
{
  "id": 1,
  "conversation_id": 1,
  "sender_id": 1,
  "message_type": "text",
  "content": "Hello, world!",
  "status": "sent",
  "reply_to_id": 10,
  "created_at": "2025-01-08T12:00:00Z",
  "updated_at": "2025-01-08T12:00:00Z",
  "sender_name": "用户名",
  "sender_standard_id": "user123"
}
```

**状态码**:
- `200`: 发送成功
- `404`: 会话不存在
- `401`: 未认证
- `403`: 无权限

### 4.2 发送文件消息

**接口**: `POST /api/v1/messages/file`

**描述**: 发送文件消息

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "conversation_id": 1,
  "file_id": "file_uuid_123",
  "file_name": "document.pdf",
  "file_size": 1024000,
  "content": "这是一个PDF文件",
  "reply_to_id": 10
}
```

**请求字段**:
- `conversation_id` (integer, 必填): 会话ID
- `file_id` (string, 必填): 文件ID
- `file_name` (string, 必填): 文件名
- `file_size` (integer, 必填): 文件大小（字节）
- `content` (string, 可选): 文件描述
- `reply_to_id` (integer, 可选): 回复的消息ID

**响应数据**:
```json
{
  "id": 123,
  "conversation_id": 1,
  "sender_id": 1,
  "message_type": "file",
  "content": "这是一个PDF文件",
  "status": "sent",
  "reply_to_id": 10,
  "created_at": "2025-01-15T12:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z",
  "sender_name": "用户名",
  "sender_standard_id": "user123",
  "file_info": {
    "id": 456,
    "file_id": "d4b64371-0d7b-4f6b-b97b-34bd6aa6ab10",
    "name": "document.pdf",
    "path": "2025/01/15/user_1/d4b64371-0d7b-4f6b-b97b-34bd6aa6ab10.pdf",
    "size": 1024000,
    "type": "application/pdf"
  }
}
```

**状态码**:
- `200`: 发送成功
- `404`: 会话或文件不存在
- `401`: 未认证
- `403`: 无权限

### 4.3 发送位置消息

**接口**: `POST /api/v1/messages/location`

**描述**: 发送位置消息

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "conversation_id": 1,
  "latitude": "39.9042",
  "longitude": "116.4074",
  "address": "北京市朝阳区",
  "reply_to_id": 10
}
```

**请求字段**:
- `conversation_id` (integer, 必填): 会话ID
- `latitude` (string, 必填): 纬度
- `longitude` (string, 必填): 经度
- `address` (string, 可选): 地址描述
- `reply_to_id` (integer, 可选): 回复的消息ID

**响应数据**: 同发送文本消息响应格式，但包含位置信息

**状态码**:
- `200`: 发送成功
- `404`: 会话不存在
- `401`: 未认证
- `403`: 无权限

### 4.4 搜索消息

**接口**: `GET /api/v1/messages/search`

**描述**: 搜索消息

**请求参数**:
- **Query Parameters**:
  - `keyword` (string, 必填): 搜索关键词
  - `conversation_id` (integer, 可选): 会话ID
  - `message_type` (string, 可选): 消息类型
  - `limit` (integer, 可选): 结果数量限制，默认20

**响应数据**:
```json
{
  "messages": [
    {
      "id": 1,
      "conversation_id": 1,
      "sender_id": 1,
      "message_type": "text",
      "content": "Hello, world!",
      "status": "sent",
      "created_at": "2025-01-08T12:00:00Z",
      "sender_name": "用户名"
    }
  ],
  "total": 1,
  "limit": 20
}
```

**状态码**:
- `200`: 搜索成功
- `401`: 未认证

### 4.5 获取未读消息数

**接口**: `GET /api/v1/messages/unread/count`

**描述**: 获取未读消息数量

**请求参数**:
- **Query Parameters**:
  - `conversation_id` (integer, 可选): 会话ID，不提供则获取所有未读数

**响应数据**:
```json
{
  "unread_count": 5,
  "conversation_id": 1
}
```

**状态码**:
- `200`: 获取成功
- `401`: 未认证

### 4.6 获取会话消息

**接口**: `GET /api/v1/messages/conversation/{conversation_id}`

**描述**: 获取指定会话的消息列表

**请求参数**:
- **Path Parameters**:
  - `conversation_id` (integer, 必填): 会话ID
- **Query Parameters**:
  - `limit` (integer, 可选): 消息数量限制，默认20
  - `before_cursor` (string, 可选): 向前分页游标
  - `after_cursor` (string, 可选): 向后分页游标

**响应数据**:
```json
{
  "messages": [
    {
      "id": 1,
      "conversation_id": 1,
      "sender_id": 1,
      "message_type": "text",
      "content": "Hello, world!",
      "status": "sent",
      "created_at": "2025-01-08T12:00:00Z",
      "sender_name": "用户名"
    }
  ],
  "has_more": true,
  "limit": 20
}
```

**状态码**:
- `200`: 获取成功
- `404`: 会话不存在
- `401`: 未认证
- `403`: 无权限

### 4.7 获取单条消息

**接口**: `GET /api/v1/messages/single/{message_id}`

**描述**: 获取指定消息的详细信息

**请求参数**:
- **Path Parameters**:
  - `message_id` (integer, 必填): 消息ID

**响应数据**: 同消息响应格式

**状态码**:
- `200`: 获取成功
- `404`: 消息不存在
- `401`: 未认证
- `403`: 无权限

### 4.8 更新消息

**接口**: `PUT /api/v1/messages/{message_id}`

**描述**: 更新消息内容

**请求参数**:
- **Path Parameters**:
  - `message_id` (integer, 必填): 消息ID
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "content": "更新后的消息内容",
  "status": "edited"
}
```

**请求字段**:
- `content` (string, 可选): 消息内容
- `status` (string, 可选): 消息状态

**响应数据**: 同消息响应格式

**状态码**:
- `200`: 更新成功
- `404`: 消息不存在
- `401`: 未认证
- `403`: 无权限

### 4.9 撤回消息

**接口**: `POST /api/v1/messages/{message_id}/recall`

**描述**: 撤回指定消息

**请求参数**:
- **Path Parameters**:
  - `message_id` (integer, 必填): 消息ID

**响应数据**: 无内容

**状态码**:
- `200`: 撤回成功
- `404`: 消息不存在
- `401`: 未认证
- `403`: 无权限或超时

### 4.10 标记消息已读

**接口**: `POST /api/v1/messages/mark-read`

**描述**: 标记消息为已读

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "conversation_id": 1,
  "message_ids": [1, 2, 3]
}
```

**请求字段**:
- `conversation_id` (integer, 必填): 会话ID
- `message_ids` (array[integer], 必填): 消息ID列表

**响应数据**: 无内容

**状态码**:
- `200`: 标记成功
- `404`: 会话不存在
- `401`: 未认证
- `403`: 无权限

### 4.11 获取消息已读回执

**接口**: `GET /api/v1/messages/{message_id}/read-receipts`

**描述**: 获取消息的已读回执信息

**请求参数**:
- **Path Parameters**:
  - `message_id` (integer, 必填): 消息ID

**响应数据**:
```json
{
  "receipts": [
    {
      "id": 1,
      "message_id": 1,
      "user_id": 2,
      "read_at": "2025-01-08T12:30:00Z"
    }
  ],
  "total": 1
}
```

**状态码**:
- `200`: 获取成功
- `404`: 消息不存在
- `401`: 未认证
- `403`: 无权限

### 4.12 发送正在输入指示

**接口**: `POST /api/v1/messages/typing`

**描述**: 发送正在输入状态指示

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "conversation_id": 1,
  "is_typing": true
}
```

**请求字段**:
- `conversation_id` (integer, 必填): 会话ID
- `is_typing` (boolean, 可选): 是否正在输入，默认true

**响应数据**: 无内容

**状态码**:
- `200`: 发送成功
- `404`: 会话不存在
- `401`: 未认证
- `403`: 无权限

---

## 5. 文件模块 (files)

### 5.1 上传文件

**接口**: `POST /api/v1/files/upload`

**描述**: 上传文件

**请求参数**:
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file` (file, 必填): 要上传的文件
  - `description` (string, 可选): 文件描述
  - `is_public` (boolean, 可选): 是否为公共文件，默认false

**响应数据**:
```json
{
  "id": 1,
  "file_id": "uuid-123-456",
  "file_name": "document.pdf",
  "file_path": "/uploads/2025/01/08/document.pdf",
  "file_size": 1024000,
  "file_type": "application/pdf",
  "uploaded_at": "2025-01-08T13:00:00Z",
  "uploader_id": 1
}
```

**状态码**:
- `200`: 上传成功
- `400`: 文件格式不支持或大小超限
- `401`: 未认证

### 5.2 下载文件

**接口**: `GET /api/v1/files/download/{file_id}`

**描述**: 下载文件

**请求参数**:
- **Path Parameters**:
  - `file_id` (string, 必填): 文件ID

**响应数据**: 文件二进制内容

**状态码**:
- `200`: 下载成功
- `404`: 文件不存在
- `401`: 未认证
- `403`: 无权限

### 5.3 获取文件信息

**接口**: `GET /api/v1/files/info/{file_id}`

**描述**: 获取文件详细信息

**请求参数**:
- **Path Parameters**:
  - `file_id` (string, 必填): 文件ID

**响应数据**:
```json
{
  "file_id": "uuid-123-456",
  "file_name": "document.pdf",
  "file_path": "/uploads/2025/01/08/document.pdf",
  "file_size": 1024000,
  "file_type": "application/pdf",
  "is_public": false,
  "uploader_id": 1,
  "uploaded_at": "2025-01-08T13:00:00Z",
  "download_count": 5
}
```

**状态码**:
- `200`: 获取成功
- `404`: 文件不存在
- `401`: 未认证
- `403`: 无权限

### 5.4 获取用户文件列表

**接口**: `GET /api/v1/files/list`

**描述**: 获取当前用户的文件列表

**请求参数**:
- **Query Parameters**:
  - `page` (integer, 可选): 页码，默认1
  - `page_size` (integer, 可选): 每页大小，默认20

**响应数据**:
```json
{
  "files": [
    {
      "file_id": "uuid-123-456",
      "file_name": "document.pdf",
      "file_size": 1024000,
      "file_type": "application/pdf",
      "uploaded_at": "2025-01-08T13:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

**状态码**:
- `200`: 获取成功
- `401`: 未认证

### 5.5 删除文件

**接口**: `DELETE /api/v1/files/{file_id}`

**描述**: 删除文件

**请求参数**:
- **Path Parameters**:
  - `file_id` (string, 必填): 文件ID

**响应数据**: 无内容

**状态码**:
- `204`: 删除成功
- `404`: 文件不存在
- `401`: 未认证
- `403`: 无权限

### 5.6 获取文件下载信息

**接口**: `GET /api/v1/files/download-info/{file_id}`

**描述**: 获取文件下载信息（不直接下载文件）

**请求参数**:
- **Path Parameters**:
  - `file_id` (string, 必填): 文件ID

**响应数据**:
```json
{
  "file_id": "uuid-123-456",
  "file_name": "document.pdf",
  "file_size": 1024000,
  "file_type": "application/pdf",
  "download_url": "/api/v1/files/download/uuid-123-456"
}
```

**状态码**:
- `200`: 获取成功
- `404`: 文件不存在
- `401`: 未认证
- `403`: 无权限

---

## 6. 实时通信模块 (realtime)

### 6.1 获取在线用户

**接口**: `GET /api/v1/realtime/online-users`

**描述**: 获取当前在线用户列表

**请求参数**: 无

**响应数据**:
```json
{
  "online_users": [1, 2, 3, 5],
  "count": 4
}
```

**状态码**:
- `200`: 获取成功
- `401`: 未认证

### 6.2 检查用户在线状态

**接口**: `GET /api/v1/realtime/user-status/{user_id}`

**描述**: 检查指定用户的在线状态

**请求参数**:
- **Path Parameters**:
  - `user_id` (integer, 必填): 用户ID

**响应数据**:
```json
{
  "user_id": 1,
  "is_online": true,
  "last_seen": "2025-01-08T14:00:00Z"
}
```

**状态码**:
- `200`: 获取成功
- `404`: 用户不存在
- `401`: 未认证

### 6.3 发送广播消息

**接口**: `POST /api/v1/realtime/broadcast`

**描述**: 发送系统广播消息

**请求参数**:
- **Query Parameters**:
  - `message` (string, 必填): 广播消息内容
  - `broadcast_type` (string, 可选): 广播类型，默认"system"

**响应数据**:
```json
{
  "message": "广播消息发送成功",
  "recipients": 10
}
```

**状态码**:
- `200`: 发送成功
- `401`: 未认证
- `403`: 无权限

### 6.4 获取连接统计

**接口**: `GET /api/v1/realtime/connection-stats`

**描述**: 获取WebSocket连接统计信息

**请求参数**: 无

**响应数据**:
```json
{
  "total_connections": 25,
  "authenticated_connections": 20,
  "anonymous_connections": 5
}
```

**状态码**:
- `200`: 获取成功
- `401`: 未认证
- `403`: 无权限

---

## 7. 群组高级功能 (groups)

### 7.1 添加群组成员

**接口**: `POST /api/v1/groups/{conversation_id}/members`

**描述**: 批量添加群组成员

**请求参数**:
- **Path Parameters**:
  - `conversation_id` (integer, 必填): 群组会话ID
- **Query Parameters**:
  - `user_ids` (array[integer], 必填): 用户ID列表

**响应数据**: 群组会话信息

**状态码**:
- `200`: 添加成功
- `404`: 群组不存在
- `401`: 未认证
- `403`: 无权限

### 7.2 移除群组成员

**接口**: `DELETE /api/v1/groups/{conversation_id}/members/{user_id}`

**描述**: 移除群组成员

**请求参数**:
- **Path Parameters**:
  - `conversation_id` (integer, 必填): 群组会话ID
  - `user_id` (integer, 必填): 用户ID

**响应数据**: 群组会话信息

**状态码**:
- `200`: 移除成功
- `404`: 群组或用户不存在
- `401`: 未认证
- `403`: 无权限

### 7.3 生成群组邀请码

**接口**: `POST /api/v1/groups/{conversation_id}/invite-code`

**描述**: 生成群组邀请码

**请求参数**:
- **Path Parameters**:
  - `conversation_id` (integer, 必填): 群组会话ID

**响应数据**:
```json
{
  "invite_code": "ABC123DEF",
  "expires_at": "2025-01-15T10:00:00Z"
}
```

**状态码**:
- `200`: 生成成功
- `404`: 群组不存在
- `401`: 未认证
- `403`: 无权限

### 7.4 获取群组统计信息

**接口**: `GET /api/v1/groups/{conversation_id}/stats`

**描述**: 获取群组统计信息

**请求参数**:
- **Path Parameters**:
  - `conversation_id` (integer, 必填): 群组会话ID

**响应数据**:
```json
{
  "member_count": 25,
  "message_count": 1500,
  "active_members": 20,
  "created_at": "2025-01-01T00:00:00Z"
}
```

**状态码**:
- `200`: 获取成功
- `404`: 群组不存在
- `401`: 未认证
- `403`: 无权限

### 7.5 搜索公开群组

**接口**: `GET /api/v1/groups/search`

**描述**: 搜索公开群组

**请求参数**:
- **Query Parameters**:
  - `keyword` (string, 必填): 搜索关键词
  - `limit` (integer, 可选): 返回数量限制，默认10

**响应数据**:
```json
{
  "groups": [
    {
      "id": 1,
      "name": "技术交流群",
      "description": "技术交流讨论",
      "member_count": 150,
      "avatar": "group_avatar_url"
    }
  ],
  "total": 1
}
```

**状态码**:
- `200`: 搜索成功
- `401`: 未认证

---

## 8. WebSocket 实时连接

### WebSocket连接地址

`ws://172.19.103.122:8000/ws/{user_id}`

### 认证

WebSocket连接需要在连接时提供JWT token作为查询参数：

`ws://172.19.103.122:8000/ws/{user_id}?token={jwt_token}`

### 消息格式

**接收消息**:
```json
{
  "type": "message",
  "data": {
    "id": 1,
    "conversation_id": 1,
    "sender_id": 2,
    "content": "Hello!",
    "message_type": "text",
    "created_at": "2025-01-08T16:00:00Z"
  }
}
```

**发送消息**:
```json
{
  "type": "message",
  "conversation_id": 1,
  "content": "Hello!",
  "message_type": "text"
}
```

### 事件类型详解

详细的WebSocket事件类型请参见本文档后续的[WebSocket事件类型详解](#websocket-事件类型详解)部分。

### 文件消息处理指南

**🔗 文件消息完整性保障**

自v1.0.1版本起，WebSocket推送的文件消息包含完整的`file_info`对象，客户端无需额外API调用即可获取：

- **文件名** (`name`): 用于显示和保存
- **文件大小** (`size`): 用于显示和进度条  
- **文件类型** (`type`): 用于图标和预览判断
- **文件路径** (`path`): 用于下载地址构建

**🎯 客户端集成建议**

1. **实时显示**: 收到文件消息后直接使用`file_info`显示文件信息
2. **下载处理**: 使用`file_id`构建下载URL：`/api/v1/files/download/{file_id}`
3. **缓存策略**: 建议缓存`file_info`避免重复API调用
4. **错误处理**: 如`file_info`为空，回退到`/api/v1/files/info/{file_id}`获取

**📱 UI展示参考**

```javascript
// 文件消息UI渲染示例
function renderFileMessage(messageData) {
  const { file_info } = messageData;
  return `
    <div class="file-message">
      <div class="file-icon">${getFileIcon(file_info.type)}</div>
      <div class="file-details">
        <div class="file-name">${file_info.name}</div>
        <div class="file-size">${formatFileSize(file_info.size)}</div>
      </div>
      <a href="/api/v1/files/download/${file_info.file_id}" 
         class="download-btn">下载</a>
    </div>
  `;
}
```

---

## 9. 通知模块 (notifications)

### 9.1 获取通知列表

**接口**: `GET /api/v1/notifications/`

**描述**: 获取用户通知列表

**请求参数**:
- **Query Parameters**:
  - `page` (integer, 可选): 页码，默认1
  - `size` (integer, 可选): 每页数量，默认20
  - `unread_only` (boolean, 可选): 仅显示未读通知，默认false
  - `notification_type` (string, 可选): 通知类型筛选

**响应数据**:
```json
{
  "notifications": [
    {
      "id": 1,
      "title": "新消息",
      "content": "您有一条新消息",
      "type": "message",
      "status": "unread",
      "priority": "normal",
      "created_at": "2025-01-08T15:00:00Z"
    }
  ],
  "total": 1,
  "unread_count": 1,
  "page": 1,
  "size": 20
}
```

**状态码**:
- `200`: 获取成功
- `401`: 未认证

### 9.2 创建通知

**接口**: `POST /api/v1/notifications/`

**描述**: 创建新通知

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "user_id": 1,
  "title": "系统通知",
  "content": "这是一条系统通知",
  "type": "system",
  "priority": "high",
  "channels": ["websocket", "push"],
  "scheduled_at": "2025-01-08T16:00:00Z"
}
```

**响应数据**: 通知详情

**状态码**:
- `201`: 创建成功
- `400`: 参数错误
- `401`: 未认证
- `403`: 无权限

### 9.3 获取通知统计

**接口**: `GET /api/v1/notifications/stats`

**描述**: 获取通知统计信息

**请求参数**: 无

**响应数据**:
```json
{
  "total_notifications": 50,
  "unread_count": 5,
  "read_count": 45,
  "by_type": {
    "message": 30,
    "system": 15,
    "group_invite": 5
  },
  "by_priority": {
    "high": 5,
    "normal": 40,
    "low": 5
  }
}
```

**状态码**:
- `200`: 获取成功
- `401`: 未认证

### 9.4 获取单个通知

**接口**: `GET /api/v1/notifications/{notification_id}`

**描述**: 获取指定通知详情

**请求参数**:
- **Path Parameters**:
  - `notification_id` (integer, 必填): 通知ID

**响应数据**: 通知详情

**状态码**:
- `200`: 获取成功
- `404`: 通知不存在
- `401`: 未认证
- `403`: 无权限

### 9.5 更新通知

**接口**: `PATCH /api/v1/notifications/{notification_id}`

**描述**: 更新通知信息

**请求参数**:
- **Path Parameters**:
  - `notification_id` (integer, 必填): 通知ID
- **Content-Type**: `application/json`
- **Body**: 要更新的字段

**响应数据**: 更新后的通知详情

**状态码**:
- `200`: 更新成功
- `404`: 通知不存在
- `401`: 未认证
- `403`: 无权限

### 9.6 删除通知

**接口**: `DELETE /api/v1/notifications/{notification_id}`

**描述**: 删除指定通知

**请求参数**:
- **Path Parameters**:
  - `notification_id` (integer, 必填): 通知ID

**响应数据**: 无内容

**状态码**:
- `204`: 删除成功
- `404`: 通知不存在
- `401`: 未认证
- `403`: 无权限

### 9.7 批量发送通知

**接口**: `POST /api/v1/notifications/send`

**描述**: 批量发送通知

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "user_ids": [1, 2, 3],
  "title": "系统维护通知",
  "content": "系统将于今晚进行维护",
  "type": "system",
  "priority": "high"
}
```

**响应数据**:
```json
{
  "total_sent": 3,
  "successful": 3,
  "failed": 0,
  "notification_ids": [1, 2, 3],
  "errors": []
}
```

**状态码**:
- `200`: 发送成功
- `400`: 参数错误
- `401`: 未认证
- `403`: 无权限

### 9.8 标记通知已读

**接口**: `POST /api/v1/notifications/mark-read`

**描述**: 批量标记通知为已读

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "notification_ids": [1, 2, 3]
}
```

**响应数据**: 无内容

**状态码**:
- `200`: 标记成功
- `400`: 参数错误
- `401`: 未认证

### 9.9 批量操作通知

**接口**: `POST /api/v1/notifications/batch-action`

**描述**: 批量操作通知

**请求参数**:
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "notification_ids": [1, 2, 3],
  "action": "mark_read"
}
```

**响应数据**: 无内容

**状态码**:
- `200`: 操作成功
- `400`: 参数错误
- `401`: 未认证

### 9.10 获取通知偏好设置

**接口**: `GET /api/v1/notifications/preferences/`

**描述**: 获取用户通知偏好设置

**请求参数**: 无

**响应数据**:
```json
{
  "id": 1,
  "user_id": 1,
  "message_enabled": true,
  "group_message_enabled": true,
  "websocket_enabled": true,
  "email_enabled": true,
  "push_enabled": true,
  "do_not_disturb": false,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00",
  "email_frequency": "immediate"
}
```

**状态码**:
- `200`: 获取成功
- `401`: 未认证

### 9.11 更新通知偏好设置

**接口**: `PUT /api/v1/notifications/preferences/`

**描述**: 更新用户通知偏好设置

**请求参数**:
- **Content-Type**: `application/json`
- **Body**: 要更新的偏好设置字段

**响应数据**: 更新后的偏好设置

**状态码**:
- `200`: 更新成功
- `400`: 参数错误
- `401`: 未认证

### 9.12 获取通知模板列表

**接口**: `GET /api/v1/notifications/templates/`

**描述**: 获取通知模板列表

**请求参数**:
- **Query Parameters**:
  - `page` (integer, 可选): 页码
  - `size` (integer, 可选): 每页数量
  - `notification_type` (string, 可选): 通知类型筛选
  - `active_only` (boolean, 可选): 仅显示启用的模板

**响应数据**: 模板列表

**状态码**:
- `200`: 获取成功
- `401`: 未认证
- `403`: 无权限

### 9.13 创建通知模板

**接口**: `POST /api/v1/notifications/templates/`

**描述**: 创建新的通知模板

**请求参数**:
- **Content-Type**: `application/json`
- **Body**: 模板信息

**响应数据**: 创建的模板详情

**状态码**:
- `201`: 创建成功
- `400`: 参数错误
- `401`: 未认证
- `403`: 无权限

### 9.14 获取通知模板详情

**接口**: `GET /api/v1/notifications/templates/{template_id}`

**描述**: 获取指定通知模板详情

**请求参数**:
- **Path Parameters**:
  - `template_id` (integer, 必填): 模板ID

**响应数据**: 模板详情

**状态码**:
- `200`: 获取成功
- `404`: 模板不存在
- `401`: 未认证
- `403`: 无权限

### 9.15 更新通知模板

**接口**: `PATCH /api/v1/notifications/templates/{template_id}`

**描述**: 更新通知模板

**请求参数**:
- **Path Parameters**:
  - `template_id` (integer, 必填): 模板ID
- **Content-Type**: `application/json`
- **Body**: 要更新的模板字段

**响应数据**: 更新后的模板详情

**状态码**:
- `200`: 更新成功
- `404`: 模板不存在
- `401`: 未认证
- `403`: 无权限

### 9.16 删除通知模板

**接口**: `DELETE /api/v1/notifications/templates/{template_id}`

**描述**: 删除通知模板

**请求参数**:
- **Path Parameters**:
  - `template_id` (integer, 必填): 模板ID

**响应数据**: 无内容

**状态码**:
- `204`: 删除成功
- `404`: 模板不存在
- `401`: 未认证
- `403`: 无权限

---

## 10. 安全测试模块 (security)

### 10.1 速率限制测试

**接口**: `GET /api/v1/security/rate-limit-test`

**描述**: 测试API速率限制功能

**请求参数**: 无

**响应数据**:
```json
{
  "message": "Rate limit test passed",
  "timestamp": "2025-01-08T16:00:00Z"
}
```

**状态码**:
- `200`: 测试通过
- `429`: 速率限制触发

### 10.2 安全头测试

**接口**: `GET /api/v1/security/security-headers-test`

**描述**: 测试安全响应头设置

**请求参数**: 无

**响应数据**:
```json
{
  "message": "Security headers test passed"
}
```

**状态码**:
- `200`: 测试通过

### 10.3 关键端点测试

**接口**: `POST /api/v1/security/critical-endpoint-test`

**描述**: 测试关键端点的安全性

**请求参数**: 无

**响应数据**:
```json
{
  "message": "Critical endpoint security test passed"
}
```

**状态码**:
- `200`: 测试通过
- `401`: 未认证
- `403`: 无权限

### 10.4 CORS测试

**接口**: `GET /api/v1/security/cors-test`

**描述**: 测试跨域资源共享配置

**请求参数**: 无

**响应数据**:
```json
{
  "message": "CORS test passed"
}
```

**状态码**:
- `200`: 测试通过

### 10.5 获取安全状态

**接口**: `GET /api/v1/security/security-status`

**描述**: 获取系统安全状态

**请求参数**: 无

**响应数据**:
```json
{
  "security_level": "high",
  "active_protections": ["rate_limiting", "csrf_protection", "xss_protection"],
  "last_security_check": "2025-01-08T16:00:00Z"
}
```

**状态码**:
- `200`: 获取成功
- `401`: 未认证
- `403`: 无权限

### 10.6 模拟攻击测试

**接口**: `POST /api/v1/security/simulate-attack`

**描述**: 模拟安全攻击以测试防护机制

**请求参数**:
- **Query Parameters**:
  - `attack_type` (string, 必填): 攻击类型

**响应数据**:
```json
{
  "attack_type": "sql_injection",
  "blocked": true,
  "message": "Attack successfully blocked"
}
```

**状态码**:
- `200`: 攻击被成功阻止
- `401`: 未认证
- `403`: 无权限

---

## 11. 系统模块 (system)

### 11.1 健康检查

**接口**: `GET /health`

**描述**: 系统健康检查

**请求参数**: 无

**响应数据**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T16:00:00Z",
  "version": "1.0.0"
}
```

**状态码**:
- `200`: 系统正常

### 11.2 根路径

**接口**: `GET /`

**描述**: 根路径访问

**请求参数**: 无

**响应数据**:
```json
{
  "message": "Instant Messaging System API",
  "version": "1.0.0",
  "docs_url": "/docs"
}
```

**状态码**:
- `200`: 访问成功

---

## 错误码说明

### HTTP状态码

- `200`: 请求成功
- `201`: 创建成功
- `204`: 删除成功，无内容返回
- `400`: 请求参数错误
- `401`: 未认证，需要登录
- `403`: 无权限访问
- `404`: 资源不存在
- `422`: 请求参数验证失败
- `429`: 请求过于频繁，触发速率限制
- `500`: 服务器内部错误

### 错误响应格式

```json
{
  "detail": "错误描述信息"
}
```

或者对于验证错误：

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "字段验证错误信息",
      "type": "value_error"
    }
  ]
}
```

---

## WebSocket 事件类型详解

#### 1. 即时消息通知
- **事件类型**: `new_message`
- **描述**: 接收到新的即时消息

**文本消息格式**:
```json
{
  "type": "new_message",
  "data": {
    "message_id": 18,
    "conversation_id": 20,
    "sender_id": 1,
    "content": "Hello!",
    "message_type": "text",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**文件消息格式** (🆕 包含完整文件信息):
```json
{
  "type": "new_message",
  "data": {
    "message_id": 123,
    "conversation_id": 1,
    "sender_id": 2,
    "content": "这是一个PDF文档",
    "message_type": "file",
    "timestamp": "2025-01-15T10:30:00Z",
    "file_id": "d4b64371-0d7b-4f6b-b97b-34bd6aa6ab10",
    "file_info": {
      "id": 456,
      "file_id": "d4b64371-0d7b-4f6b-b97b-34bd6aa6ab10",
      "name": "重要文档.pdf",
      "path": "2025/01/15/user_2/d4b64371-0d7b-4f6b-b97b-34bd6aa6ab10.pdf",
      "size": 2048000,
      "type": "application/pdf"
    }
  }
}
```

**位置消息格式**:
```json
{
  "type": "new_message", 
  "data": {
    "message_id": 124,
    "conversation_id": 1,
    "sender_id": 2,
    "content": "我在这里",
    "message_type": "location",
    "timestamp": "2025-01-15T10:30:00Z",
    "latitude": "39.9042",
    "longitude": "116.4074",
    "address": "北京市朝阳区"
  }
}
```

#### 2. 会话创建通知
- **事件类型**: `conversation_created`
- **描述**: 被邀请加入新会话或会话创建成功
- **数据格式**:
```json
{
  "type": "conversation_created",
  "data": {
    "conversation_id": 5,
    "conversation_type": "group",
    "conversation_name": "新群组",
    "creator_id": 1,
    "creator_name": "管理员",
    "participant_ids": [1, 2, 3],
    "created_at": "2025-01-08T16:00:00Z"
  }
}
```

#### 3. 用户状态变更通知
- **事件类型**: `user_status_changed`
- **描述**: 用户在线状态发生变化（上线或下线）
- **数据格式**:
```json
{
  "type": "user_status_changed",
  "data": {
    "user_id": 2,
    "is_online": true,
    "timestamp": "2025-01-08T16:00:00Z"
  }
}
```

#### 4. 广播通知
- **事件类型**: `broadcast_received`
- **描述**: 接收到系统广播消息
- **数据格式**:
```json
{
  "type": "broadcast_received",
  "data": {
    "broadcast_id": 456,
    "title": "系统公告",
    "content": "系统将于今晚进行维护",
    "priority": "high",
    "sent_at": "2025-01-08T16:00:00Z"
  }
}
```

#### 5. 会话更新通知
- **事件类型**: `conversation_updated`
- **描述**: 会话信息被更新（包括名称、描述等）
- **数据格式**:
```json
{
  "type": "conversation_updated",
  "data": {
    "conversation_id": 1,
    "updater_id": 2,
    "update_type": "name_updated",
    "participant_ids": [1, 2, 3],
    "timestamp": "2025-01-08T16:00:00Z"
  }
}
```

#### 6. 添加成员通知
- **事件类型**: `member_added`
- **描述**: 有新成员加入会话
- **数据格式**:
```json
{
  "type": "member_added",
  "data": {
    "conversation_id": 1,
    "operator_id": 1,
    "added_user_ids": [4, 5],
    "participant_ids": [1, 2, 3, 4, 5],
    "timestamp": "2025-01-08T16:00:00Z"
  }
}
```

#### 7. 移除成员通知
- **事件类型**: `member_removed`
- **描述**: 有成员被移除出会话或主动退出
- **数据格式**:
```json
{
  "type": "member_removed",
  "data": {
    "conversation_id": 1,
    "operator_id": 1,
    "removed_user_id": 3,
    "participant_ids": [1, 2],
    "is_self_exit": false,
    "timestamp": "2025-01-08T16:00:00Z"
  }
}
```

#### 8. 会话删除通知
- **事件类型**: `conversation_deleted`
- **描述**: 会话被删除或群组被解散
- **数据格式**:
```json
{
  "type": "conversation_deleted",
  "data": {
    "conversation_id": 1,
    "operator_id": 1,
    "conversation_type": "group",
    "participant_ids": [1, 2, 3],
    "timestamp": "2025-01-08T16:00:00Z"
  }
}
```

#### 9. 角色变更通知
- **事件类型**: `role_changed`
- **描述**: 群组成员角色发生变化（包括群主转让）
- **数据格式**:
```json
{
  "type": "role_changed",
  "data": {
    "conversation_id": 1,
    "operator_id": 1,
    "target_user_id": 2,
    "old_role": "member",
    "new_role": "admin",
    "participant_ids": [1, 2, 3],
    "timestamp": "2025-01-08T16:00:00Z"
  }
}
```

#### 10. 水印修改通知
- **事件类型**: `watermark_updated`
- **描述**: 会话水印被修改
- **数据格式**:
```json
{
  "type": "watermark_updated",
  "data": {
    "conversation_id": 1,
    "operator_id": 1,
    "watermark_text": "保密信息，请勿外传",
    "participant_ids": [1, 2, 3],
    "timestamp": "2025-01-08T16:00:00Z"
  }
}
```

#### 11. 用户位置更新通知
- **事件类型**: `location_updated`
- **描述**: 用户位置信息更新
- **数据格式**:
```json
{
  "type": "location_updated",
  "data": {
    "user_id": 1,
    "latitude": 39.908815,
    "longitude": 116.397527,
    "accuracy": 10.5,
    "timestamp": "2025-01-08T16:00:00Z"
  }
}
```

#### 12. 正在输入指示
- **事件类型**: `typing_indicator`
- **描述**: 用户正在输入状态指示
- **数据格式**:
```json
{
  "type": "typing_indicator",
  "data": {
    "conversation_id": 1,
    "sender_id": 2,
    "is_typing": true,
    "timestamp": "2025-01-08T16:00:00Z"
  }
}
```

#### 传统事件类型（连接管理）

#### 13. 连接建立确认
- **事件类型**: `connection_established`
- **描述**: WebSocket连接建立成功确认
- **数据格式**:
```json
{
  "type": "connection_established",
  "connection_id": "uuid-123",
  "user_id": 1,
  "timestamp": "2025-01-08T16:00:00Z"
}
```

#### 14. 心跳包
- **事件类型**: `heartbeat`
- **描述**: 服务器发送的心跳包
- **数据格式**:
```json
{
  "type": "heartbeat",
  "timestamp": "2025-01-08T16:00:00Z"
}
```

#### 15. Ping响应
- **事件类型**: `pong`
- **描述**: 对客户端ping的响应
- **数据格式**:
```json
{
  "type": "pong",
  "timestamp": "2025-01-08T16:00:00Z"
}
```

#### 16. 消息状态更新
- **事件类型**: `message_status`
- **描述**: 消息发送状态更新
- **数据格式**:
```json
{
  "type": "message_status",
  "data": {
    "messageId": "msg-123",
    "status": "sent",
    "timestamp": "2025-01-08T16:00:00Z"
  }
}
```

---

## 开发说明

### 环境要求

- Python 3.12+
- MySQL 8.0+
- Redis 6.0+
- RabbitMQ 3.8+

### 本地开发

1. 安装依赖：`pip install -r requirements.txt`
2. 配置环境变量
3. 运行数据库迁移：`alembic upgrade head`
4. 启动服务：`uvicorn app.main:app --reload`

### API文档

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## 🧪 系统测试状态

### 最新测试结果 (v1.0.1)
- **测试时间**: 2025-01-15
- **测试覆盖率**: 100% ✅
- **测试项目**: 
  - ✅ API结构完整性
  - ✅ 数据库模型
  - ✅ CRUD操作
  - ✅ 文件服务
  - ✅ WebSocket消息发布
  - ✅ 文件消息响应结构
  - ✅ WebSocket消息结构

### 核心功能验证
- **文件发送**: ✅ 完整的file_info推送
- **文件下载**: ✅ 权限自动创建
- **WebSocket推送**: ✅ 包含完整文件信息
- **API响应**: ✅ 文件信息完整返回
- **权限管理**: ✅ FileShare自动处理

### 客户端集成就绪
系统已准备好进行客户端集成，所有API和WebSocket功能已验证可用。

---

*本文档最后更新时间：2025-01-15*

