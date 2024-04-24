export default {
  namespace: 'global',
  state: {
    userInfo: {},
  },
  effects: {
    *setUser({ payload }, { put }) {
      yield put({ type: 'putUser', payload});
    },
  },

  reducers: {
    putUser(state, { payload }) {
      return {
        ...state,
        userInfo: payload,
      };
    },
  },
};
