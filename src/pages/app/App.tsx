import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import ColdWater from '../../assets/coldWater.svg';
import Electricity from '../../assets/electricity.svg';
import Flame from '../../assets/flame.svg';
import HotWater from '../../assets/hotWater.svg';
import { meterStore } from '../../store/MetersStore';
import style from './style.module.css';

const App = observer(() => {
  const [currentPage, setCurrentPage] = useState(1);
  const calculateOffsetPage = (offset: number) => {
    if (currentPage > 3) {
      return currentPage + offset;
    } else {
      return currentPage + offset + 1;
    }
  };

  const calculateButtonStyle = (buttonNumber: number) => {
    return `${style.tableFooterButton} ${
      buttonNumber === currentPage && style.tableFooterButtonCurrent
    }`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  };

  const handleAreaMeter = (data: string[]) => {
    if (!data.includes('AreaMeter')) return 'Неизвестен';
    const type = data[0];

    switch (type) {
      case 'HotWaterAreaMeter':
        return (
          <span className={style.typeWrapper}>
            <img src={HotWater} alt="hotWater" className={style.typeIcon} />
            ГВС
          </span>
        );
      case 'ColdWaterAreaMeter':
        return (
          <span className={style.typeWrapper}>
            <img src={ColdWater} alt="coldWater" className={style.typeIcon} />
            ХВС
          </span>
        );
      case 'GasAreaMeter':
        return (
          <span className={style.typeWrapper}>
            <img src={Flame} alt="gas" className={style.typeIcon} />
            ТПЛ
          </span>
        );
      case 'ElectricityAreaMeter':
        return (
          <span className={style.typeWrapper}>
            <img
              src={Electricity}
              alt="electricity"
              className={style.typeIcon}
            />
            ЭЛДТ
          </span>
        );
      default:
        'Неизвестен';
    }
  };

  const handleMeterDelete = (id: string) => {
    meterStore.deleteMeter(id).then(() => {
      meterStore.fetchMeters().then(() => {
        meterStore.fetchAddresses();
      });
    });
  };

  useEffect(() => {
    meterStore.modifyOffset(currentPage - 1);
    meterStore.fetchMeters().then(() => {
      meterStore.fetchAddresses();
    });
  }, [currentPage]);

  return (
    <div className={style.wrapper}>
      <h2 className={style.title}>Список счётчиков</h2>
      {meterStore.loading && <div className={style.loading}>Загрузка...</div>}
      {!meterStore.loading && (
        <div className={style.tableWrapper}>
          <table className={style.table}>
            <thead className={style.tableHeader}>
              <tr>
                <th className={style.tableHeaderNumber}>№</th>
                <th className={style.tableHeaderType}>Тип</th>
                <th className={style.tableHeaderDate}>Дата установки</th>
                <th className={style.tableHeaderAuto}>Автоматический</th>
                <th className={style.tableHeaderCurrent}>Текущие показания</th>
                <th className={style.tableHeaderAddress}>Адрес</th>
                <th className={style.tableHeaderNote}>Примечание</th>
              </tr>
            </thead>
            <tbody className={style.tableBody}>
              {meterStore.meters.map((item, index) => (
                <tr key={item.id}>
                  <td className={style.tableBodyNumber}>{index + 1}</td>
                  <td className={style.tableBodyType}>
                    {handleAreaMeter(item._type)}
                  </td>
                  <td className={style.tableBodyDate}>
                    {formatDate(item.installation_date)}
                  </td>
                  <td className={style.tableBodyAuto}>
                    {item.is_automatic ? 'Да' : 'Нет'}
                  </td>
                  <td className={style.tableBodyCurrent}>
                    {item.initial_values}
                  </td>
                  <td className={style.tableBodyAddress}>{`${
                    meterStore.addresses.get(item.area.id)?.house.address
                  }`}</td>
                  <td className={style.tableBodyNote}>
                    {item.description}
                    <button
                      className={style.tableBodyDeleteButton}
                      onClick={() => handleMeterDelete(item.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className={style.tableFooter}>
              <tr>
                <td colSpan={10}>
                  <div className={style.tableFooterContent}>
                    <button
                      className={`${calculateButtonStyle(1)}`}
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </button>
                    <button
                      className={`${calculateButtonStyle(2)}`}
                      onClick={() => setCurrentPage(2)}
                    >
                      2
                    </button>
                    <button
                      className={`${
                        currentPage > 3
                          ? calculateButtonStyle(currentPage - 1)
                          : calculateButtonStyle(3)
                      }`}
                      onClick={() =>
                        currentPage > 3
                          ? setCurrentPage(currentPage - 1)
                          : setCurrentPage(3)
                      }
                    >
                      {currentPage > 3 ? currentPage - 1 : 3}
                    </button>
                    <button
                      className={`${style.tableFooterButton} ${
                        currentPage > 3 ? style.tableFooterButtonCurrent : ''
                      }`}
                    >
                      {currentPage > 3 ? currentPage : `...`}
                    </button>
                    <button
                      className={`${calculateButtonStyle(
                        calculateOffsetPage(1)
                      )}`}
                      onClick={() => setCurrentPage(calculateOffsetPage(1))}
                    >
                      {calculateOffsetPage(1)}
                    </button>
                    <button
                      className={`${calculateButtonStyle(
                        calculateOffsetPage(2)
                      )}`}
                      onClick={() => setCurrentPage(calculateOffsetPage(2))}
                    >
                      {calculateOffsetPage(2)}
                    </button>
                    <button
                      className={`${calculateButtonStyle(
                        calculateOffsetPage(3)
                      )}`}
                      onClick={() => setCurrentPage(calculateOffsetPage(3))}
                    >
                      {calculateOffsetPage(3)}
                    </button>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
});
export default App;
