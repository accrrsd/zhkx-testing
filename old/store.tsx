import CounterStoreModel from './models/CounterStore';

export const counterStore = CounterStoreModel.create({
  counters: [],
  addresses: {},
  loading: false,
  error: null,
});
