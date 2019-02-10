import { connection } from './connection';
import {
    schoolBySchoolGroupLoader,
    schoolGroupBySchoolLoader,
    partnerBySchoolLoader,
    schoolByPartnerLoader,
    sellOutBySchool,
    partnerByPartnerIdLoader,
  } from './loaders';
import axios from 'axios';

export default {
    Mutation: {
        update_entity(root, { keyValue: { key, value, type }, entity, id }) {
            return new Promise((resolve, reject) => {
                if (type === 'number') {
                    value = Number(value);
                    if (isNaN(value)) {
                        reject('incorrect value/type');
                        return;
                    }
                }
                if (type === 'boolean') {
                    value = (value === 'true');
                }
                connection.query(`UPDATE ${entity} SET ${key} = ? WHERE id = ?`, [value, id], (error, results, fields) => {
                    if (error) throw error;
                    resolve({ name: entity });
                });
            });
        },
        recalculate_location(root, { city, street, street_number, postal_code, id }) {
            return new Promise((resolve, reject) => {
                const address = `BELGIE,${city},${postal_code},${street}%20${street_number}`;
                const apiLink = `http://www.mapquestapi.com/geocoding/v1/address?key=7Ar65wx0rpVfx7VmKO01pGTf4AhVZazQ&location=${address}`;
                console.log({ apiLink });
                axios.get(apiLink)
                    .then((response) => {
                        if (response.data) {
                            if (response.data.results[0]) {
                                if (response.data.results[0].locations[0]) {
                                    const latitude = response.data.results[0].locations[0].latLng.lat;
                                    const longitude = response.data.results[0].locations[0].latLng.lng;
                                    console.log(latitude, longitude, id);
                                    connection.query(`UPDATE school SET latitude = ?, longitude = ? WHERE id = ?`, [latitude, longitude, id], (error, results, fields) => {
                                        if (error) throw error;
                                        resolve({ latitude, longitude });
                                    });
                                }
                            }
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        create_entity(root, { entity }) {
            return new Promise((resolve, reject) => {
                console.log(entity);
                connection.query(`INSERT INTO ${entity} SET ?`, { name: null }, (error, results, fields) => {
                    if (error) reject(error);
                    resolve({ id: results.insertId });
                });
            });
        },
        link_entity(root, { base_entity_id, base_entity_name, link_entity_id, link_entity_name, remove }) {
            return new Promise((resolve, reject) => {
                const baseIdName = `${base_entity_name}_id`;
                const linkIdName = `${link_entity_name}_id`;
                if (remove) {
                    connection.query(`DELETE FROM ${base_entity_name}_${link_entity_name} where ${baseIdName} = ${base_entity_id} and ${linkIdName} = ${link_entity_id}`, (error, results, fields) => {
                        if (error) reject(error);
                        console.log({ base_entity_id, base_entity_name, link_entity_id, link_entity_name, remove })
                        partnerBySchoolLoader.clear(base_entity_id);
                        resolve({ name: 'test' });
                    });
                } else {
                    connection.query(`INSERT INTO ${base_entity_name}_${link_entity_name} SET ?`, { [baseIdName]: base_entity_id, [linkIdName]: link_entity_id }, (error, results, fields) => {
                        if (error) reject(error);
                        console.log({ base_entity_id, base_entity_name, link_entity_id, link_entity_name, remove })
                        partnerBySchoolLoader.clear(base_entity_id);
                        resolve({ name: 'test' });
                    });
                }
            });
        }
    }
}
