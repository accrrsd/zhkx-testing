import axios from 'axios';
import { flow, types } from 'mobx-state-tree';

// Модель для счётчика
const Meter = types.model('Meter', {
  id: types.identifier,
  _type: types.array(types.string),
  area: types.model({
    id: types.string,
  }),
  is_automatic: types.maybeNull(types.boolean),
  description: types.string,
  installation_date: types.string,
  initial_values: types.array(types.number),
});

// Модель для данных адреса
const AddressData = types.model('AddressData', {
  id: types.identifier,
  number: types.number,
  str_number: types.string,
  str_number_full: types.string,
  house: types.model({
    id: types.identifier,
    address: types.string,
  }),
});

type TAddressSuccessResponse = {
  success: boolean;
  message: string;
  data: {
    results: any[];
  };
};

// Модель для хранилища счётчиков
const MeterStore = types
  .model('MeterStore', {
    meters: types.array(Meter),
    addresses: types.map(AddressData),
    count: types.number,
    limit: 20,
    offset: 0,
    loading: false,
  })
  .actions((self) => ({
    modifyOffset(value: number) {
      self.offset = value;
    },

    fetchMeters: flow(function* fetchMeters() {
      self.loading = true;
      try {
        const response = yield axios.get(
          `http://showroom.eis24.me/api/v4/test/meters/`,
          {
            params: {
              limit: self.limit,
              offset: self.offset,
            },
          }
        );
        self.meters = response.data.results;
        self.count = response.data.count;
        self.loading = false;
      } catch (error) {
        console.error('Failed to fetch meters', error);
        self.loading = false;
      }
    }),

    fetchAddresses: flow(function* fetchAddresses() {
      const uniqueAreaIds = Array.from(
        new Set(self.meters.map((meter) => meter.area.id))
      );
      const areaIdsToFetch = uniqueAreaIds.filter(
        (areaId) => !self.addresses.has(areaId)
      );
      try {
        const responses = yield Promise.all(
          areaIdsToFetch.map((areaId) =>
            axios.get(
              `http://showroom.eis24.me/api/v4/test/areas/?id__in=${areaId}`
            )
          )
        );
        responses.forEach((response: TAddressSuccessResponse) => {
          self.addresses.put(AddressData.create(response.data.results[0]));
        });
      } catch (error) {
        console.error('Failed to fetch addresses', error);
      }
    }),

    // Метод для удаления счётчика по его id
    deleteMeter: flow(function* deleteMeter(meterId: string) {
      try {
        yield axios.delete(
          `http://showroom.eis24.me/api/v4/test/meters/${meterId}/`
        );
        const index = self.meters.findIndex((meter) => meter.id === meterId);
        if (index > -1) {
          self.meters.splice(index, 1);
        }
      } catch (error) {
        console.error('Failed to delete meter', error);
      }
    }),
  }));

// Экспортируем экземпляр хранилища
export const meterStore = MeterStore.create({
  meters: [],
  addresses: {},
  count: 0,
});
