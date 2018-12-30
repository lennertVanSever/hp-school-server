import schools from './schools.json';
import { connection } from './data/connection';

function adressToStreetAndStreetNumber(adress) {
  if (adress) {
    const regex = /(?:(\d+.+)|\d)/g;
    let streetNumber = adress.match(regex);
    if (streetNumber) {
      streetNumber = streetNumber[0];
      streetNumber = streetNumber.trim();
    } else {
      streetNumber = '';
    }
    let street = adress.replace(regex, '');
    street = street.trim();
    return ({
      street,
      streetNumber,
    });
  }
  return {
    street: null,
    streetNumber: null,
  }
}

function toBoolean(value) {
  if (value) {
    const regex = /ja/gi;
    let boolean = regex.test(value);
    if (boolean) {
      return 1;
    }
  }
  return 0;
}

function resetDatabase() {
  const query = `
    DELETE FROM school_group_school;

    DELETE FROM school;
    ALTER TABLE school AUTO_INCREMENT = 1;

    DELETE FROM school_group;
    ALTER TABLE school_group AUTO_INCREMENT = 1;
  `;
  connection.query(query, (error, result) => {
    if (error) return console.log(error);
    console.log('database out');
  });
}

function doSchoolGroups() {
  function getSchoolGroups() {
    const scholenGroup = [];
    schools.forEach((school, index) => {
      if (school['Scholengroep/Raamcontract']) {
        let alreadyInArray = false;
        scholenGroup.forEach((schoolGroup, index) => {
          if (schoolGroup['Scholengroep/Raamcontract'] === school['Scholengroep/Raamcontract']) {
            alreadyInArray = true;
          }
        });
        if (!alreadyInArray) scholenGroup.push(school);
      }
    });

    return scholenGroup;
  }

  function insertScholenGroupData(dataToInsert) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO school_group SET ?;`;
      connection.query(query, dataToInsert, (error, result) => {
        if (error) {
          console.log(dataToInsert)
          return reject(error);
        }
        console.log(result);
        resolve(dataToInsert);
      })
    });
  }

  const scholenGroups = getSchoolGroups();

  scholenGroups.forEach(scholenGroup => {
    const { street, streetNumber } = adressToStreetAndStreetNumber(scholenGroup['Adres']);
    const dataToInsert = {
      name: scholenGroup['Scholengroep/Raamcontract'],
      city: scholenGroup['Gemeente'] || null,
      street,
      street_number: streetNumber,
      postal_code: scholenGroup['Postcode'] || null,
      count_of_students: scholenGroup['#Leerlingen'] || null,
    }
    insertScholenGroupData(dataToInsert);
  });
}



function doSchool() {
  function getSchool() {
    const uniqueSchools = [];
    schools.forEach((school, index) => {
      if (school['Scholen']) {
        let alreadyInArray = false;
        uniqueSchools.forEach((uniqueSchool) => {
          if (uniqueSchool['Scholen'] === school['Scholen']) {
            alreadyInArray = true;
          }
        });
        if (!alreadyInArray) uniqueSchools.push(school);
      }
    });
    return uniqueSchools;
  }

  function insertSchoolData(dataToInsert) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO school SET ?;`;
      connection.query(query, dataToInsert, (error, result) => {
        if (error) {
          console.log(dataToInsert)
          return reject(error);
        }
        // console.log(result);
        resolve(dataToInsert);
      })
    });
  }

  const uniqueSchools = getSchool();
  uniqueSchools.forEach(school => {
    const { street, streetNumber } = adressToStreetAndStreetNumber(school['Adres']);
    const dataToInsert = {
      name: school['Scholen'],
      city: school['Gemeente'] || null,
      street,
      street_number: streetNumber,
      postal_code: school['Postcode'] || null,
      count_of_students: school['#Leerlingen'] || null,
      school_level: school['ASO - BSO - TSO'] || null,
      school_type: school["Kleuter - Lager - Secundair - Volwassenonderwijs"] || null,
      installed_base: school["Installed base"] || null,
      bring_your_own_device: toBoolean(school['BYOD']),
      website: school['Website'] || null,
    }
    insertSchoolData(dataToInsert);
  });

}

function doConnectionSchoolToSchoolGroup() {
  function getConnectionData() {
    const connectionData = [];
    schools.forEach((school, index) => {
      if (school['Scholen'] && school['Scholengroep/Raamcontract']) {
        let alreadyInArray = false;
        connectionData.forEach((uniqueSchool) => {
          if (connectionData['Scholen'] === school['Scholen'] && connectionData['Scholengroep/Raamcontract'] === school['Scholengroep/Raamcontract']) {
            alreadyInArray = true;
          }
        });
        if (!alreadyInArray) {
          connectionData.push({
            schoolGroup: school['Scholengroep/Raamcontract'],
            school: school['Scholen'],
          });
        }
      }
    });

    return connectionData;
  }

  function insertConnectionData(dataToInsert) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO school_group_school SET ?;`;
      connection.query(query, dataToInsert, (error, result) => {
        if (error) {
          console.log(dataToInsert)
          return reject(error);
        }
        // console.log(result);
        resolve(dataToInsert);
      })
    });
  }

  const connectionData = getConnectionData();
  connectionData.forEach(({ school, schoolGroup }) => {
    //console.log(school, schoolGroup);
    let dataToInsert = {};
    connection.query(`SELECT id FROM school_group where name = ?;`, [schoolGroup], (error, result) => {
      if (error) console.log(error, schoolGroup);
      const { id } = result[0];
      dataToInsert['school_group_id'] = id;

      connection.query(`SELECT id FROM school where name = ?;`, [school], (error, result) => {
        if (error) console.log(error, schoolGroup);
        const { id } = result[0];
        dataToInsert['school_id'] = id;
        insertConnectionData(dataToInsert);
      })

    })
  });
}





function doPartners() {
  function getPartners() {
    const partners = [];
    schools.forEach((school) => {
      if (school['Partner']) {
        let alreadyInArray = false;
        partners.forEach((uniquePartner) => {
          if (uniquePartner['name'] === school['Partner']) {
            alreadyInArray = true;
          }
        });
        if (!alreadyInArray) {
          partners.push({
            name: school['Partner'],
            education_focused: toBoolean(school['Edu Focus Partner']),
          });
        }
      }
    });
    return partners;
  }

  const partners = getPartners();

  partners.forEach(partner => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO partner SET ?;`;
      connection.query(query, partner, (error, result) => {
        if (error) {
          console.log(partner)
          return reject(error);
        }
        // console.log(result);
        resolve(partner);
      })
    });
  });
}

function doConnectionPartnerToSchool() {
  function getPartnerConnection() {
    const partnerConnections = [];
    schools.forEach((school) => {
      if (school['Partner']) {
        let alreadyInArray = false;
        partnerConnections.forEach((partnerConnection) => {
          if (partnerConnection['partner'] === school['Partner'] && partnerConnection['school'] === school['Scholen']) {
            alreadyInArray = true;
          }
        });
        if (!alreadyInArray) {
          partnerConnections.push({
            partner: school['Partner'],
            school: school['Scholen'],
          });
        }
      }
    });
    return partnerConnections;
  }

  function insertConnectionData(dataToInsert) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO school_partner SET ?;`;
      connection.query(query, dataToInsert, (error, result) => {
        if (error) {
          console.log(dataToInsert)
          return reject(error);
        }
        resolve(dataToInsert);
      })
    });
  }

  const partnerConnections = getPartnerConnection();

  partnerConnections.forEach(({ partner, school }) => {
    //console.log(school, schoolGroup);
    let dataToInsert = {};
    connection.query(`SELECT id FROM partner where name = ?;`, [partner], (error, result) => {
      if (error) console.log(error, partner);
      const { id } = result[0];
      dataToInsert['partner_id'] = id;

      connection.query(`SELECT id FROM school where name = ?;`, [school], (error, result) => {
        if (error) console.log(error, schoolGroup);
        const { id } = result[0];
        dataToInsert['school_id'] = id;
        console.log(dataToInsert);
        insertConnectionData(dataToInsert);
      })

    })
  });
}

function doSellOuts() {
  const data = schools.filter(school => {
    if (school['FY15-Q4'] || school['FY16-Q1'] || school['FY16-Q2'] || school['FY16-Q3'] || school['FY16-Q4'] || school['FY17-Q1'] || school['FY17-Q2'] || school['FY17-Q3'] || school['FY17-Q4'] || school['FY18-Q1'] || school['FY18-Q2'] || school['FY18-Q3'] || school['FY18-Q4']) {
      return school;
    }
  });

  function specialInsert(sellOut, id, fiscal_year, hp_quarter) {
    if(sellOut[id]){
      const dataToInsert = {
        partner_id: sellOut.partner_id,
        school_id: sellOut.school_id,
        fiscal_year,
        units: sellOut[id],
        hp_quarter,
      }
      const query = `INSERT INTO sell_out SET ?;`;
      connection.query(query, dataToInsert, (error, result) => {
        if (error) {
          console.log(error)
        }
      })
    }
  }

  function insertConnectionData(sellOut) {
    specialInsert(sellOut, 'FY15-Q4', 2015, 4);

    specialInsert(sellOut, 'FY16-Q1', 2016, 1);
    specialInsert(sellOut, 'FY16-Q2', 2016, 2);
    specialInsert(sellOut, 'FY16-Q3', 2016, 3);
    specialInsert(sellOut, 'FY16-Q4', 2016, 4)

    specialInsert(sellOut, 'FY17-Q1', 2017, 1);
    specialInsert(sellOut, 'FY17-Q2', 2017, 2);
    specialInsert(sellOut, 'FY17-Q3', 2017, 3);
    specialInsert(sellOut, 'FY17-Q4', 2017, 4);

    specialInsert(sellOut, 'FY18-Q1', 2017, 1);
    specialInsert(sellOut, 'FY18-Q2', 2017, 2);
    specialInsert(sellOut, 'FY18-Q3', 2017, 3);
    specialInsert(sellOut, 'FY18-Q4', 2017, 4);
  }
  data.forEach(sellOut => {

    connection.query(`SELECT id FROM partner where name = ?;`, [sellOut['Partner']], (error, result) => {
      if (error) console.log(error, partner);
      const { id } = result[0];
      sellOut['partner_id'] = id;

      connection.query(`SELECT id FROM school where name = ?;`, [sellOut['Scholen']], (error, result) => {
        if (error) console.log(error, schoolGroup);
        const { id } = result[0];
        sellOut['school_id'] = id;
        insertConnectionData(sellOut);
      })

    })
  });
}


// resetDatabase();

//doSchoolGroups();
//doSchool();
//doConnectionSchoolToSchoolGroup();

//doPartners();
//doConnectionPartnerToSchool();

//doSellOuts();

