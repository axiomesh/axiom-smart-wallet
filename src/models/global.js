export default {
  namespace: 'global',
  state: {
    userInfo: {},
    transferForm: {},
    freeForm: {},
  },
  effects: {
    *setUser({ payload }, { put }) {
      yield put({ type: 'putUser', payload});
    },
    *setForm({ payload }, { put }) {
      yield put({ type: 'putForm', payload});
    },
    *setFreeForm({ payload }, { put }) {
      yield put({ type: 'putFreeForm', payload});
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
    putFreeForm(state, { payload }) {
      return {
        ...state,
        freeForm: payload,
      };
    },
  },

};
