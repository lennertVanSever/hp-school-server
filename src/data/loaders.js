import DataLoader from 'dataloader';
import { connection } from './connection';
import _ from 'lodash';


export const schoolBySchoolGroupLoader = new DataLoader(schoolGroupKeys => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT school.*, school_group_school.school_group_id FROM school_group_school
      JOIN school ON school.id=school_group_school.school_id
      WHERE school_group_school.school_group_id IN (?);
    `;
    
    connection.query(query, [schoolGroupKeys], (error, results) => {
      if (error) return reject(error);
      resolve(mappingData(schoolGroupKeys, "school_group_id", results));
    });
    
  });
});

export const partnerBySchoolLoader = new DataLoader(schoolKeys => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT partner.*, school_partner.school_id FROM school_partner
      JOIN partner ON partner.id=school_partner.partner_id
      WHERE school_partner.school_id IN (?);
    `;
    
    connection.query(query, [schoolKeys], (error, results) => {
      if (error) return reject(error);
      resolve(mappingData(schoolKeys, "school_id", results));
    });
    
  });
});

export const schoolByPartnerLoader = new DataLoader(partnerKeys => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT school.*, school_partner.partner_id FROM school_partner
      JOIN school ON school.id=school_partner.school_id
      WHERE school_partner.partner_id IN (?);
    `;
    
    connection.query(query, [partnerKeys], (error, results) => {
      if (error) return reject(error);
      resolve(mappingData(partnerKeys, "partner_id", results));
    });
    
  });
});

export const schoolGroupBySchoolLoader = new DataLoader(schoolKeys => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT school_group.*, school_group_school.school_id FROM school_group_school
      JOIN school_group ON school_group.id=school_group_school.school_group_id
      WHERE school_group_school.school_id IN (?);
    `;
    
    connection.query(query, [schoolKeys], (error, results) => {
      if (error) return reject(error);
      resolve(mappingData(schoolKeys, "school_id", results));
    });
    
  });
});

export const sellOutBySchool = new DataLoader(schoolKeys => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM sell_out
      WHERE sell_out.school_id IN (?);
    `;
    
    connection.query(query, [schoolKeys], (error, results) => {
      if (error) return reject(error);
      resolve(mappingData(schoolKeys, "school_id", results));
    });
    
  });
});

export const partnerByPartnerIdLoader = new DataLoader(partnerKeys => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM partner
      WHERE id IN (?);
    `;
    
    connection.query(query, [partnerKeys], (error, results) => {
      if (error) return reject(error);
      resolve(mappingData(partnerKeys, "id", results));
    });
    
  });
});

function mappingData(keys, idName, data) {
  const groupedByID = _.groupBy(data, idName);
  const mappedKeyWithData = keys.map(key => {
    if (groupedByID[key]) return groupedByID[key];
    return [];
  });
  return mappedKeyWithData;
}