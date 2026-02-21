# Data Access & Privacy

This document describes how user data is isolated and where sharing is intentional.

## Principle: Every user has their own data

- **Clients (CRM):** Stored per user within a workspace. Each row has `user_id`; users only see and manage their own clients. RLS and API both enforce `user_id = auth.uid()` and `workspace_id` membership.
- **Scripts:** Same model as clients: `user_id` + `workspace_id`. Users only see and edit their own scripts.
- **Lesson progress:** Stored in `user_lesson_progress` with `user_id`. Users only read/write their own progress. API uses authenticated `user.id` for upserts.
- **Billing / subscription / usage:** Scoped by **workspace**. Only data for the workspace the user belongs to (via `getWorkspaceForUser`) is returned. No cross-workspace access.
- **Team chat messages:** Scoped by workspace. Users only see messages for their workspace.
- **Workspace members, join requests, invites:** Scoped by workspace; admins see only their workspace’s data.

## Intentional sharing (no leak)

- **Client sharing:** A user can **share a client** with a teammate. Only clients that **belong to the current user** (validated in `POST /api/clients/share`) can be shared. The recipient sees the shared client in “Shared with me” and can add it to their own list. Stored in `client_shares` with `from_user_id` and `to_user_id`.
- **Calendar (when implemented):** Calendar/events will be **workspace-scoped** so the team can see shared events. Personal vs team visibility will be controlled by a visibility flag. Today the calendar is local/mock only.

## API security summary

| API / area           | Scoping                         | Notes                                      |
|----------------------|----------------------------------|--------------------------------------------|
| GET/POST /api/clients | `workspace_id` + `user_id`      | Only own clients.                          |
| PATCH/DELETE /api/clients/[id] | `user_id` on row              | Only own client.                           |
| POST /api/clients/share | Client must be owned by caller | Validates ownership before creating share. |
| GET /api/clients/shared-with-me | `to_user_id = current user` + `workspace_id` | Only shares sent to you.           |
| GET/POST /api/scripts | `workspace_id` + `user_id`      | Only own scripts.                          |
| PATCH/DELETE /api/scripts/[id] | `user_id` on row             | Only own script.                           |
| GET /api/workspaces/members | `workspace_id` from membership | Only your workspace members.               |
| GET/POST /api/team/chat | `workspace_id` from membership | Only your workspace chat.                  |
| GET /api/billing/info | `workspace_id` from membership  | Only your workspace billing.               |
| GET /api/workspaces/join-requests | Admin only, own workspace  | Only pending requests for your workspace.  |
| POST /api/workspaces/join-requests/[id] | Admin only, same workspace | Accept/reject only your workspace’s requests. |
| POST /api/workspaces/invite-by-sms | Admin only, own workspace   | Invites only for your workspace.           |
| POST /api/courses/progress | `user_id` from auth            | Only your progress.                         |

## RLS (Supabase)

Tables use Row Level Security so that even direct DB access respects:

- **clients / scripts:** `is_workspace_member(workspace_id, auth.uid()) and user_id = auth.uid()`
- **client_shares:** Members can read shares in their workspace; insert for shares from/to members.
- **workspace_members, team_messages, etc.:** Scoped by `workspace_id` and membership.

This ensures no data leaks when using the Supabase client with the authenticated user (e.g. server `createClient()` with cookies).
