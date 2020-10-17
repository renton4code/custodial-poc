import { Connection } from 'typeorm'
import * as yaml from 'js-yaml'
import * as fs from 'fs'

export async function loadFixtures(name: string, dbConnection: Connection): Promise<any> {

  let items: any[] = [];
  try {
    const file: any = yaml.safeLoad(fs.readFileSync(`./seed-db/${name}.yml`, 'utf8'));
    items = file[name];
  } catch (e) {
    console.log('Error while seeding database.');
    console.log(e);
  }

  // no sql injection, since it's only for developer environment
  await dbConnection.createQueryRunner().query(`TRUNCATE TABLE ${name};`);

  for (let item of items) {
    const entityName = Object.keys(item)[0];
    const data = item[entityName];
    await dbConnection.createQueryBuilder().insert().into(entityName).values(data).execute();
  }
}
