# 即时通讯API接口清单

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | 即时通讯API接口清单 |
| 版本 | V3.0.0 |
| 更新时间 | 2024年 |
| 基于设计文档 | 《即时通讯系统概要设计 V3.0.0》 |

## 目录

1. [API概述](#api概述)
2. [认证系统 (Auth)](#认证系统-auth)
3. [用户管理 (Users)](#用户管理-users)
4. [会话管理 (Conversations)](#会话管理-conversations)
5. [消息系统 (Messages)](#消息系统-messages)
6. [文件管理 (Files)](#文件管理-files)
7. [群组管理 (Groups)](#群组管理-groups)
8. [通知系统 (Notifications)](#通知系统-notifications)
9. [实时通信 (Realtime)](#实时通信-realtime)
10. [系统级接口 (待设计)](#系统级接口-待设计)
11. [附录：枚举定义](#附录枚举定义)

## API概述

### 基础信息
- **基础路径**: `/api/v1`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8

### 认证头格式
```
Authorization: Bearer <token>
```

### 标准响应格式
- **成功响应**: `200 OK`, `201 Created`, `204 No Content`。直接返回数据对象、数组或无内容。
- **错误响应**: `4xx` 或 `5xx` 状态码。
```json
{
  "detail": "具体的错误描述信息"
}
```

## 认证系统 (Auth)
- **前缀**: `/auth`

### 1. 用户登录
- **接口**: `POST /login/access-token`
- **功能**: 用户使用标准ID和密码登录，获取访问令牌。
- **请求体**: `application/x-www-form-urlencoded`
- **返回**: `{ "access_token": "...", "token_type": "bearer" }`

## 用户管理 (Users)
- **前缀**: `/users`
- **认证**: 需要

### 1. 创建用户
- **接口**: `POST /`
- **功能**: 创建一个新用户。
- **请求体**: `schemas.UserCreate`

### 2. 获取当前用户信息
- **接口**: `GET /me`
- **功能**: 获取当前已认证用户的信息。
- **返回**: `schemas.User`

### 3. 搜索用户
- **接口**: `GET /search`
- **功能**: 根据关键词（姓名或ID）搜索用户。
- **查询参数**: `keyword: str`
- **返回**: `List[schemas.User]`

## 会话管理 (Conversations)
- **前缀**: `/conversations`
- **认证**: 需要

### 1. 获取当前用户的所有会话
- **接口**: `GET /`
- **功能**: 获取用户参与的所有会话列表。
- **返回**: `List[schemas.Conversation]`

### 2. 创建单聊会话
- **接口**: `POST /single`
- **功能**: 与指定用户创建一个新的单聊会话。
- **请求体**: `{ "target_user_id": int }`
- **返回**: `schemas.Conversation`

### 3. 创建群聊会话
- **接口**: `POST /group`
- **功能**: 创建一个新的群聊会话。
- **请求体**: `schemas.GroupConversationCreate`
- **返回**: `schemas.Conversation`

## 消息系统 (Messages)
- **前缀**: `/messages`
- **认证**: 需要

### 1. 发送文本消息
- **接口**: `POST /text`
- **功能**: 发送一条纯文本消息到指定会话。
- **请求体**: `schemas.MessageCreateText`
- **返回**: `schemas.Message`

### 2. 发送文件消息
- **接口**: `POST /file`
- **功能**: 发送一条文件消息到指定会话。
- **请求体**: `schemas.MessageCreateFile`
- **返回**: `schemas.Message`

### 3. 获取会话的历史消息
- **接口**: `GET /conversation/{conversation_id}`
- **功能**: 分页获取指定会话的历史消息。
- **查询参数**: `skip: int = 0`, `limit: int = 100`
- **返回**: `List[schemas.Message]`

### 4. 标记消息已读
- **接口**: `POST /mark-read`
- **功能**: 更新用户在某个会话中的最后已读消息。
- **请求体**: `schemas.MessageRead`
- **返回**: `204 No Content`

## 文件管理 (Files)
- **前缀**: `/files`
- **认证**: 需要

### 1. 上传文件
- **接口**: `POST /upload`
- **功能**: 上传一个文件。
- **请求**: `multipart/form-data`
- **返回**: `schemas.File`

### 2. 下载文件
- **接口**: `GET /download/{file_id}`
- **功能**: 下载一个指定的文件。
- **返回**: `FileResponse`

## 群组管理 (Groups)
- **前缀**: `/groups`
- **认证**: 需要

### 1. 添加群成员
- **接口**: `POST /{conversation_id}/members`
- **功能**: 向指定群聊中添加一个或多个成员。
- **请求体**: `{ "user_ids": List[int] }`
- **返回**: `schemas.Conversation`

### 2. 移除群成员
- **接口**: `DELETE /{conversation_id}/members/{user_id}`
- **功能**: 从指定群聊中移除一个成员（需要权限）。
- **返回**: `schemas.Conversation`

## 通知系统 (Notifications)
- **前缀**: `/notifications`
- **认证**: 需要

### 1. 获取当前用户的通知
- **接口**: `GET /`
- **功能**: 获取当前用户的所有通知。
- **返回**: `List[schemas.Notification]`

### 2. 标记通知已读
- **接口**: `POST /{notification_id}/mark-read`
- **功能**: 将指定通知标记为已读。
- **返回**: `204 No Content`

## 实时通信 (Realtime)
- **前缀**: `/realtime`

### 1. WebSocket 连接
- **接口**: `WS /ws`
- **功能**: 建立WebSocket连接以进行实时双向通信。
- **认证**: 通过URL查询参数传递JWT Token (`?token=...`)

## 系统级接口 (待设计)

以下模块已在概要设计中规划，但API接口需要根据未来的详细需求进行设计。

### 广播系统 (Broadcasts)
- **前缀**: `/broadcasts`
- **功能**: 用于管理员发送全系统或目标性广播。
- **规划接口**:
    - `POST /`: 发送新广播
    - `GET /`: 获取历史广播列表

### 事件系统 (Events)
- **前缀**: `/events`
- **功能**: 用于客户端上报特定事件（如打卡、告警等）。
- **规划接口**:
    - `POST /`: 上报一个新事件
    - `GET /`: 查询历史事件

### 级联对接 (Cascade)
- **前缀**: `/cascade`
- **功能**: 用于与第三方系统或中心平台进行数据同步与交互。
- **规划接口**:
    - `GET /mq-info`: 获取MQ连接信息
    - `POST /sync/users`: 同步用户信息

## 附录：枚举定义

### 消息类型 (MessageType)
| 值 | 说明 |
|------|------|
| `text` | 文本消息 |
| `file` | 文件消息 |
| `image` | 图片消息 |
| `audio` | 音频消息 |
| `video` | 视频消息 |
| `system`| 系统消息 |

### 会话类型 (ConversationType)
| 值 | 说明 |
|------|------|
| `single` | 单聊 |
| `group` | 群聊 |

### 群成员角色 (MemberRole)
| 值 | 说明 |
|------|------|
| `owner` | 群主 |
| `admin` | 管理员 |
| `member` | 普通成员 |

## 错误处理

所有API在出错时会返回HTTP错误状态码和错误详情：

```json
{
  "detail": "具体的错误描述信息"
}
```

常见错误码：
- `400`: 请求参数错误
- `401`: 未认证或Token无效
- `403`: 无权限执行此操作
- `404`: 请求的资源不存在
- `429`: 请求频率过高
- `500`: 服务器内部错误 

## 接口补充（与代码一致）

### 用户管理 (Users)
- **接口**: `POST /statuses` - 批量获取用户在线状态，返回 `schemas.UserStatusResponse`。

### 会话管理 (Conversations)
- **接口**: `GET /{conversation_id}` - 获取会话详情。
- **接口**: `PUT /{conversation_id}` - 更新会话信息。
- **接口**: `DELETE /{conversation_id}` - 删除会话。
- **接口**: `GET /{conversation_id}/members` - 获取会话成员列表。
- **接口**: `POST /{conversation_id}/members` - 添加会话成员。
- **接口**: `DELETE /{conversation_id}/members/{user_id}` - 移除会话成员。
- **接口**: `PUT /{conversation_id}/members/{user_id}` - 更新会话成员信息。

### 消息系统 (Messages)
- **接口**: `POST /location` - 发送位置消息。
- **接口**: `GET /search` - 搜索消息。
- **接口**: `GET /unread/count` - 获取未读消息数量。
- **接口**: `GET /single/{message_id}` - 获取单条消息详情。
- **接口**: `PUT /{message_id}` - 更新消息内容。
- **接口**: `POST /{message_id}/recall` - 撤回消息。
- **接口**: `GET /{message_id}/read-receipts` - 获取消息阅读回执。
- **接口**: `POST /typing` - 发送正在输入事件。

### 文件管理 (Files)
- **接口**: `GET /info/{file_id}` - 获取文件信息。
- **接口**: `GET /list` - 获取文件列表。
- **接口**: `DELETE /{file_id}` - 删除文件。
- **接口**: `GET /download-info/{file_id}` - 获取文件下载信息。

### 群组管理 (Groups)
- **接口**: `POST /{conversation_id}/invite-code` - 生成群组邀请码。
- **接口**: `GET /{conversation_id}/stats` - 获取群组统计信息。
- **接口**: `GET /search` - 搜索公开群组。

### 通知系统 (Notifications)
- **接口**: `GET /stats` - 获取通知统计信息。
- **接口**: `POST /` - 创建通知。
- **接口**: `POST /send` - 发送通知。
- **接口**: `PATCH /{notification_id}` - 更新通知。
- **接口**: `DELETE /{notification_id}` - 删除通知。
- **接口**: `POST /mark-read` - 标记通知为已读。
- **接口**: `POST /batch-action` - 通知批量操作。
- **接口**: `GET /preferences/` - 获取通知偏好设置。
- **接口**: `PUT /preferences/` - 更新通知偏好设置。
- **接口**: `GET /templates/` - 获取通知模板列表。
- **接口**: `POST /templates/` - 创建通知模板。
- **接口**: `GET /templates/{template_id}` - 获取模板详情。
- **接口**: `PATCH /templates/{template_id}` - 更新模板。
- **接口**: `DELETE /templates/{template_id}` - 删除模板。

### 实时通信 (Realtime)
- **接口**: `GET /online-users` - 获取在线用户列表。
- **接口**: `GET /user-status/{user_id}` - 查询用户在线状态。
- **接口**: `POST /broadcast` - 发送广播消息。
- **接口**: `GET /connection-stats` - 获取连接统计信息。 