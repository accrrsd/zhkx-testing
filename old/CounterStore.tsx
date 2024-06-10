import { applySnapshot, flow, types } from 'mobx-state-tree';
import AddressModel from './AddressModule';
import { CounterModel, CounterResponseModel } from './CounterModule';

const CounterStoreModel = types
  .model('CounterStore', {
    counters: types.array(CounterModel),
    addresses: types.map(AddressModel),
    loading: types.boolean,
    error: types.maybeNull(types.string),
  })
  .actions((self) => ({
    fetchCounters: flow(function* fetchCounters(limit = 20, offset = 0) {
      self.loading = true;
      self.error = null;
      try {
        const response = yield fetch(
          `http://showroom.eis24.me/api/v4/test/meters/?limit=${limit}&offset=${offset}`
        );
        const data = yield response.json();
        const counterResponse = CounterResponseModel.create(data);
        applySnapshot(self.counters, counterResponse.results);

        // Fetch addresses
        const addressIds = [
          ...new Set(counterResponse.results.map((counter) => counter.area.id)),
        ];
        const addressesResponse = yield fetch(
          `http://showroom.eis24.me/api/v4/test/areas/?id__in=${addressIds.join(
            ','
          )}`
        );
        const addressesData = yield addressesResponse.json();

        addressesData.results.forEach((address: any) => {
          self.addresses.set(address.id, AddressModel.create(address));
        });
      } catch (error) {
        self.error = error.message;
      } finally {
        self.loading = false;
      }
    }),
    removeCounter: flow(function* removeCounter(id) {
      try {
        yield fetch(`http://showroom.eis24.me/api/v4/test/meters/${id}/`, {
          method: 'DELETE',
        });
        const index = self.counters.findIndex((counter) => counter.id === id);
        if (index > -1) {
          self.counters.splice(index, 1);
        }
      } catch (error) {
        console.error('Failed to remove counter:', error);
      }
    }),
  }));

export default CounterStoreModel;
