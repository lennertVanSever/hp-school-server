import { gql } from 'apollo-server-express';


const typeDefs = gql`
  type school {
    id: Int
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
    partners: [partner]
    sell_out: [sell_out]
    longitude: Float
    latitude: Float
  }

  type school_group {
    id: Int
    name: String
    city: String
    street: String
    street_number: String
    postal_code: Int
    address: String
    count_of_students: Int
    school: [school]
    longitude: Float
    latitude: Float
  }

  type partner {
    id: Int
    name: String
    education_focused: Boolean
    schools: [school]
  }

  type sell_out {
    units: Int
    fiscal_year: Int
    hp_quarter: Int
    partner: partner
  }

  type address_prediction {
    display_string: String,
    longitude: Float
    latitude: Float
    city: String
    street: String
    street_number: String
    postal_code: Int
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
    partner(id: Int): partner
  }

  input keyValue {
    key: String
    value: String
    type: String
  }

  type entity {
    name: String
    id: Int
  }

  type Mutation {
    update_entity(keyValue: keyValue, id: Int, entity: String): entity
    create_entity(entity: String): entity
    link_entity(base_entity_id: Int, base_entity_name: String, link_entity_id: Int, link_entity_name: String, remove: Boolean): entity
    recalculate_location(city: String, street: String, street_number: String, postal_code: Int, id: Int): school
  }
`;

module.exports = {
  typeDefs
}
