export const environment = {
  production: false,

  BASE_URL: 'http://localhost:3000/',
  AUTH: {
    REGISTER: 'auth/register',
    LOGIN: 'auth/login',
    GET_USER: 'auth',
    OTP: 'auth/verify-otp',
  },
  WORKSPACES: {
    CREATE: 'workspaces',
    GET_ALL: 'workspaces',
    GET_WHOLE_WORKSPACE: 'workspaces/',
    DELETE: 'workspaces/',
  },
  WORKSPACES_MEMBER: {
    UPDATE: 'ws-members/update',
    ASSIGN_MEMBER: 'ws-members/assign',
    DELETE: 'ws-members/remove',
  },
  BOARDS: {
    CREATE: 'boards',
    GET_ALL: 'boards',
    GET_FROM_WS: 'boards/workspace/',
    DELETE: 'boards/',
  },
  LISTS: {
    CREATE: 'lists',
    GET_ALL: 'lists',
    GET_FROM_BOARD: 'lists/board/',
    DELETE: 'lists/',
  },
  TASKS: {
    CREATE: 'tasks',
    GET_ALL: 'tasks',
    GET_FROM_LIST: 'tasks/list/',
    ASSIGN_TASK: 'tasks/assign',
    UPDATE: 'tasks/',
    DELETE: 'tasks/',
  },
  COMMENTS: {
    CREATE: 'comments',
    GET_ALL: 'comments',
  },

  LOGS: {
    GET_ALL: 'activity-logs',
  },

  USERS: {
    GET_ALL_USERS: 'users',
    GET_ALL_USERS_WORKSPACE: 'users/workspaces/',
  },
};
