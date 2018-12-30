import { connection } from './connection';
import {
  schoolBySchoolGroupLoader,
  schoolGroupBySchoolLoader,
  partnerBySchoolLoader,
  schoolByPartnerLoader,
  sellOutBySchool,
  partnerByPartnerIdLoader,
} from './loaders';

function getAddress() {
  return `CONCAT(city, ' ', postal_code, ' ', street, ' ', street_number) AS address`;
}

function getRange({ limit, offset }) {
  return `LIMIT ${limit} OFFSET ${offset}`;
}

function getSearch(search, partner = false) {
  if (search) {
    search = connection.escape(`%${search}%`);
    if (!partner) {
      return `where name like ${search} or  city like ${search} or  street like ${search}`;
    }
    return `where name like ${search}`;
  }
  return '';
}

const resolvers = {
  school_group: {
    school({ id }){
      return schoolBySchoolGroupLoader.load(id);
    },
  },
  school: {
    school_group({ id }){
      return schoolGroupBySchoolLoader.load(id);
    },
    partner({ id }){
      return partnerBySchoolLoader.load(id);
    },
    sell_out({ id }){
      return sellOutBySchool.load(id);
    }
  },
  partner: {
    school({ id }){
      return schoolByPartnerLoader.load(id);
    }
  },
  sell_out: {
    partner({ partner_id }){
      return partnerByPartnerIdLoader.load(partner_id).then(result => result[0]);
    }
  },
  Query: {
    school_groups: (root, { range, search }) => {
      return new Promise((resolve, reject) => {
        connection.query(`SELECT *, ${getAddress()} from school_group ${getSearch(search)} ${getRange(range)}`, (error, results) => {
          if (error) reject(error);
          resolve(results);
        });
      });
    },
    schools: (root, { range, search }) => {
      return new Promise((resolve, reject) => {
        const query = `SELECT *, ${getAddress()} from school ${getSearch(search)} ${getRange(range)}`;
        console.log(query);
        connection.query(query, (error, results) => {
          if (error) reject(error);
          resolve(results);
        });
      });
    },
    school: (root, { id }) => {
      return new Promise((resolve, reject) => {
        const query = `SELECT * from school where id = ?`;
        connection.query(query, [id], (error, results) => {
          if (error) reject(error);
          resolve(results[0]);
        });
      });
    },
    partners: (root, { range, search }) => {
      return new Promise((resolve, reject) => {
        connection.query(`SELECT * from partner ${getSearch(search, true)} ${getRange(range)}`, (error, results) => {
          if (error) reject(error);
          resolve(results);
        });
      });
    },
  },
}

module.exports = {
  resolvers
}