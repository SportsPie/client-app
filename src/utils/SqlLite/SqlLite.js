import SQLite from 'react-native-sqlite-storage';
import moment from 'moment/moment';
import { SQL } from './SqlListConsts';

let db = null;
const SqlLite = {
  open: () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (db) resolve(true);
      db = SQLite.openDatabase(
        {
          name: 'sportspie',
          location: 'default',
        },
        () => {
          // 데이터베이스 생성 또는 열기 성공
          console.log('Database opened successfully.');
          resolve(true);
        },
        error => {
          reject(error);
        },
      );
    });
  },
  close: () => {
    if (db) {
      return new Promise((resolve, reject) => {
        db.close(
          () => {
            console.log('Database closed successfully.');
            resolve(true);
            db = null;
          },
          error => {
            reject(error);
          },
        );
      });
    }
    return null;
  },
  createChatRoom: async () => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            SQL.chatRoom.create,
            [],
            () => {
              console.log('chatRoom Table created successfully.');
              resolve(true);
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  createChatParticipant: async () => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            SQL.chatParticipant.create,
            [],
            () => {
              console.log('chatParticipant Table created successfully.');
              resolve(true);
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  createChatMessage: async () => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            SQL.chatMessage.create,
            [],
            () => {
              console.log('chatMessage Table created successfully.');
              resolve(true);
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  // [academy] [[
  createAcademies: async () => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            SQL.academies.create,
            [],
            () => {
              console.log('academies Table created successfully.');
              resolve(true);
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  createMatches: async () => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            SQL.matches.create,
            [],
            () => {
              console.log('matches Table created successfully.');
              resolve(true);
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  createMembers: async () => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            SQL.members.create,
            [],
            () => {
              console.log('members Table created successfully.');
              resolve(true);
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  // [academy] ]]
  createNotification: async () => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            SQL.notification.create,
            [],
            () => {
              console.log('notification Table created successfully.');
              resolve(true);
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  participant: async () => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            SQL.chatParticipant.create,
            [],
            () => {
              console.log('participant Table created successfully.');
              resolve(true);
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  selectAll: async (table, conditions, conditionValues) => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (!table) {
        reject(new Error('Invalid parameter'));
        return;
      }
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT * FROM ${table} ${conditions ? `${conditions}` : ''}`,
            conditionValues ? [...conditionValues] : [],
            (transaction, result) => {
              const { rows } = result;
              const rowCount = rows.length;
              const list = [];
              for (let i = 0; i < rowCount; i += 1) {
                list.push(rows.item(i));
              }
              resolve(list);
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  selectByIdx: async (table, keyColumn, keyValue) => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (!(table, keyColumn, keyValue)) {
        reject(new Error('Invalid parameter'));
        return;
      }
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT * FROM ${table} WHERE ${keyColumn} = ?`,
            [keyValue],
            (transaction, result) => {
              resolve(result.rows.item(0));
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  selectOne: async (table, conditions, conditionValues) => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (!table) {
        reject(new Error('Invalid parameter'));
        return;
      }
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT * FROM ${table} ${conditions} LIMIT 1`,
            conditionValues ? [...conditionValues] : [],
            (transaction, result) => {
              resolve(result.rows.item(0));
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  count: async (table, conditions, conditionValues) => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (!table) {
        reject(new Error('Invalid parameter'));
        return;
      }
      db.transaction(tx => {
        tx.executeSql(
          `SELECT COUNT(*) FROM ${table} ${
            conditions ? `WHERE ${conditions}` : ''
          }`,
          conditionValues ? [...conditionValues] : [],
          (transaction, result) => {
            resolve(result.rows.item(0)['COUNT(*)']);
          },
          error => {
            reject(error);
          },
        );
      });
    });
  },
  insertOne: async (table, columns, values, returnId) => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (!(table && columns && values && values.length > 0)) {
        reject(new Error('Invalid parameter'));
        return;
      }

      // console.log('values', values);
      // console.log('test', columns.replace(/\w+/g, '?'));

      db.transaction(
        tx => {
          tx.executeSql(
            `INSERT INTO ${table} (${columns}) VALUES (${columns.replace(
              /\w+/g,
              '?',
            )})`,
            values,
            (transaction, result) => {
              if (returnId) {
                resolve(result.insertId);
              } else {
                resolve(result.rowsAffected);
              }
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  insertAll: async (table, columns, values) => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (!(table && columns && values && values.length > 0)) {
        reject(new Error('Invalid parameter'));
        return;
      }
      if (typeof values[0] !== 'object') {
        reject(new Error('Invalid parameter'));
        return;
      }
      let insertedCnt = 0;
      const columnList = columns.split(',').map(v => v.trim());

      db.transaction(
        tx => {
          // eslint-disable-next-line no-restricted-syntax
          for (const value of values) {
            const valueList = [];
            let valueToPush;
            columnList.forEach((column, idx) => {
              if (column === 'regDate') {
                const regDate = new Date();
                valueToPush = moment(
                  value[column] ? new Date(value[column]) : regDate,
                ).format('YYYY-MM-DD HH:mm:ss');
              } else {
                valueToPush =
                  value[column] === undefined ? null : value[column];
              }
              valueList.push(valueToPush);
            });
            tx.executeSql(
              `INSERT INTO ${table} (${columns}) VALUES (${columns.replace(
                /\w+/g,
                '?',
              )})`,
              valueList,
              // eslint-disable-next-line no-loop-func
              (transaction, result) => {
                insertedCnt += result.rowsAffected;
              },
              error => {
                throw error; // throw the error, it will be caught in 'transaction' error callback
              },
            );
          }
        },
        error => {
          reject(error);
        },
        () => {
          // Transaction successful, resolve the Promise
          console.log('Data inserted successfully.');
          resolve(insertedCnt);
        },
      );
    });
  },
  updateByIdx: async (table, columns, values, keyColumn, keyValue) => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (
        !(
          table &&
          columns &&
          values &&
          values.length > 0 &&
          keyColumn &&
          keyValue
        )
      ) {
        reject(new Error('Invalid parameter'));
        return;
      }

      db.transaction(
        tx => {
          const columnSplit = columns.split(',');
          for (let i = 0; i < columnSplit.length; i += 1) {
            columnSplit[i] = `${columnSplit[i]} = ?`;
          }
          const updateColumns = columnSplit.join(',');
          tx.executeSql(
            `UPDATE ${table} SET ${updateColumns} WHERE ${keyColumn} = ?`,
            [...values, keyValue],
            (transaction, results) => {
              resolve(results.rowsAffected);
            },
            (transaction, error) => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  update: async (table, columns, values, conditions, conditionValues) => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (
        !(
          table &&
          columns &&
          values &&
          values.length > 0 &&
          conditions &&
          conditionValues
        )
      ) {
        reject(new Error('Invalid parameter'));
        return;
      }
      if (conditions && (!conditionValues || conditionValues.length === 0)) {
        reject(new Error('Invalid parameter'));
        return;
      }

      db.transaction(
        tx => {
          const columnSplit = columns.split(',');
          for (let i = 0; i < columnSplit.length; i += 1) {
            columnSplit[i] = `${columnSplit[i]} = ?`;
          }
          tx.executeSql(
            `UPDATE ${table} SET ${columnSplit.join(',')} WHERE ${conditions}`,
            [...values, ...conditionValues],
            (transaction, results) => {
              resolve(results.rowsAffected);
            },
            (transaction, error) => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  updateALl: async (table, columns, values, conditions, conditionValues) => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (
        !(
          table &&
          columns &&
          values &&
          values.length > 0 &&
          conditions &&
          conditionValues
        )
      ) {
        reject(new Error('Invalid parameter'));
        return;
      }
      if (conditions && (!conditionValues || conditionValues.length === 0)) {
        reject(new Error('Invalid parameter'));
        return;
      }

      let updateCnt = 0;
      const columnList = columns.split(',').map(v => v.trim());

      db.transaction(
        tx => {
          let index = 0;
          // eslint-disable-next-line no-restricted-syntax
          for (const value of values) {
            const columnSplit = columns.split(',');
            for (let i = 0; i < columnSplit.length; i += 1) {
              columnSplit[i] = `${columnSplit[i]} = ?`;
            }
            const valueList = [];
            let valueToPush;
            columnList.forEach((column, idx) => {
              if (column === 'regDate') {
                const regDate = new Date();
                valueToPush = moment(
                  value[column] ? new Date(value[column]) : regDate,
                ).format('YYYY-MM-DD HH:mm:ss');
              } else {
                valueToPush =
                  value[column] === undefined ? null : value[column];
              }
              valueList.push(valueToPush);
            });

            tx.executeSql(
              `UPDATE ${table} SET ${columnSplit.join(',')} WHERE ${
                conditions[index]
              }`,
              [...valueList, ...conditionValues[index]],
              // eslint-disable-next-line no-loop-func
              (transaction, result) => {
                updateCnt += result.rowsAffected;
              },
              (transaction, error) => {
                throw error;
              },
            );
            index += 1;
          }
        },
        error => {
          reject(error);
        },
        () => {
          // Transaction successful, resolve the Promise
          console.log('Data updated successfully.');
          resolve(updateCnt);
        },
      );
    });
  },
  deleteByIdx: async (table, keyColumn, keyValue) => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (!(table && keyColumn && keyValue)) {
        reject(new Error('Invalid parameter'));
        return;
      }

      db.transaction(
        tx => {
          tx.executeSql(
            `DELETE FROM ${table} WHERE ${keyColumn} = ?`,
            [keyValue],
            (transaction, results) => {
              resolve(results.rowsAffected);
            },
            (transaction, error) => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  delete: async (table, conditions, conditionValues) => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (!(table && conditions && conditionValues)) {
        reject(new Error('Invalid parameter'));
        return;
      }
      if (conditions && (!conditionValues || conditionValues.length === 0)) {
        reject(new Error('Invalid parameter'));
        return;
      }

      db.transaction(
        tx => {
          tx.executeSql(
            `DELETE FROM ${table} WHERE  ${conditions}`,
            [...conditionValues],
            (transaction, results) => {
              resolve(results.rowsAffected);
            },
            (transaction, error) => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  deleteAll: async table => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (!table) {
        reject(new Error('Invalid parameter'));
        return;
      }

      db.transaction(
        tx => {
          tx.executeSql(
            `DELETE FROM ${table}`,
            [],
            (transaction, results) => {
              resolve(results.rowsAffected);
            },
            (transaction, error) => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  dropTable: async table => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (!table) {
        reject(new Error('Invalid parameter'));
        return;
      }

      db.transaction(
        tx => {
          tx.executeSql(
            `DROP TABLE IF EXISTS ${table}`,
            [],
            (transaction, results) => {
              console.log(`${table} table droped successfully.`);
              resolve(results.rowsAffected);
            },
            (transaction, error) => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
  customSql: async sql => {
    if (!db) await SqlLite.open();
    return new Promise((resolve, reject) => {
      if (!sql) {
        reject(new Error('Invalid parameter'));
        return;
      }
      db.transaction(
        tx => {
          tx.executeSql(
            sql,
            [],
            (transaction, result) => {
              const { rows } = result;
              const rowCount = rows.length;
              const list = [];
              for (let i = 0; i < rowCount; i += 1) {
                list.push(rows.item(i));
              }
              resolve(list);
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          reject(error);
        },
      );
    });
  },
};

export default SqlLite;
