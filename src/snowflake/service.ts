import * as snowflake from 'snowflake-sdk'

export const snowflakeService = (account: string, username: string, password: string) => {
  snowflake.configure({ ocspFailOpen: false });
  var connection = snowflake.createConnection({ account, username, password });

  const connect = () => {
    return new Promise<void>((resolve, reject) => {
      connection.connect((err: any) => {
        if (err) { reject(err); } else { resolve(); }
      });
    })
  }

  const query = (statement: string) => {
    return new Promise((resolve, reject) => {
      connection.execute({
        sqlText: statement, complete: (err: any, stmt: any, rows: any) => {
          if (err) { reject(err); } else { resolve(rows); }
        }
      });
    })
  }

  const connected = connect();

  return {
    query: async (statements: string[]) => {
      await connected;
      let rows: any = undefined;
      for (const statement of statements) {
        rows = await query(statement);
      }
      return rows;
    }
  }
}