export default {
  namespace: 'global',
  state: {
    userInfo: {},
    transferForm: {}
  },
  effects: {
    *setUser({ payload }, { put }) {
      yield put({ type: 'putUser', payload});
    },
    *setForm({ payload }, { put }) {
      yield put({ type: 'putForm', payload});
    },
  },

  reducers: {
    putUser(state, { payload }) {
      return {
        ...state,
        userInfo: payload,
      };
    },
    putForm(state, { payload }) {
      return {
        ...state,
        transferForm: payload,
      };
    },
  },
  
};
