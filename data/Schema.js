import { gql } from 'apollo-server-express';


const typeDefs = gql`
  type school {
    name: String
    city: String
    street: String
    street_number: String
    postal_code: Int
    address: String
    count_of_students: Int
    school_level: String
    school_type: String
    installed_base: String
    bring_your_own_device: Boolean
    website: String
    school_group: [school_group]
    partner: [partner]
    sell_out: [sell_out]
  }

  type school_group {
    name: String
    city: String
    street: String
    street_number: String
    postal_code: Int
    address: String
    count_of_students: Int
    school: [school]
  }

  type partner {
    name: String
    education_focused: Boolean
    school: [school]
  }

  type sell_out {
    units: Int
    fiscal_year: Int
    hp_quarter: Int
    partner: partner
  }

  input range {
    limit: Int!
    offset: Int!
  }

  type Query {
    school_groups(range: range!, search: String): [school_group]
    schools(range: range!, search: String): [school]
    partners(range: range!, search: String): [partner]
    school(id: Int): school
  }
`;

module.exports = {
  typeDefs
}
