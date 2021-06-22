import { createSchema } from './schema';
import { createServices } from './service';

describe('createSchema', () => {
  it('works with two different schemas', () => {
    const services = createServices(
      [
        {
          name: 'first',
          source: `
          type PqcDefaultMsg {
            msg: String
          }

          type Query {
            precachePqc : PqcDefaultMsg {
              get('/api/precache')
            }
          }
        `,
          data: {},
        },
        {
          name: 'second',
          source: `
          type PqcOption {
            id: Int
            value: String
          }

          type Query {
            pqcOptions : [PqcOption] {
              get('/api/options')
            }
          }
        `,
          data: {},
        },
      ],
      {
        get: true,
        post: true,
        put: true,
      },
    );
    const result = createSchema(services);
    expect(result.get()).not.toBeUndefined();
  });

  it('works with two overlapping schemas', () => {
    const services = createServices(
      [
        {
          name: 'first',
          source: `
            type LensesCollection {
              items: [Lens]
              count: Int
              filters: FilterValues
            }

            type DefaultMsg {
              msg: String
            }

            type LensInternal {
              productFamily: Option!
              productLines: [Option!]!
              category: Option!
              diameters: [String!]
            }

            type Lens {
              brandName: String!
              category: String!
              productFamily: String!
              productLine: String!
              code: String!
              diameters: String!
              id: Int
              index: String
              materialType: String
              tint: [String!]
              coatings: [String!]
              internal: LensInternal!
            }

            type Option {
              id: Int
              value: String
            }

            type FilterValues {
              brand: [Option!]!
              diameter: [Int!]!
              productFamily: [Option!]!
              productLine: [Option!]!
              focalType: [Int!]!
              materialType: [Option!]!
              materialVariant: [Option!]!
              materialProperty: [String!]!
              lensCategory: [Option!]!
              sphere: [Float!]!
              cylinder: [Float!]!
              opticParam: [String!]!
              refractiveIndex: [Float!]!
              addition: [Float!]!
              additionIncrement: [String!]!
              sphereIncrement: [Float!]!
              optimizedDiameter: [Float!]!
            }

            type TileItem {
              refractiveIndex: String!
              materialType: Option!
              diameter: String!
              variantCount: Int
            }

            type Tile {
              count: Int!
              productLine: Option!
              items: [TileItem!]!
            }

            type Tiles {
              totalCount: Int!
              category: [Option!]!
              tiles: [Tile!]!
              filters: FilterValues
            }

            input LensFilter {
              brand: [Int!]
              diameter: [Int!]
              productFamily: [Int!]
              productLine: [Int!]
              focalType: [Int!]
              materialType: [Int!]
              materialVariant: [Int!]
              stock: Boolean
              sidedRequired: Boolean
              materialProperty: [String!]
              sphere: [Float!]
              cylinder: [Float!]
              opticParam: [String!]
              sport: Boolean
              refractiveIndex: [Float!]
              addition: [Float!]
              additionIncrement: [String!]
              sphereIncrement: [Float!]
              optimizedDiameter: [Float!]
            }

            input Filters {
              lensCategory: [String!]!
              left: LensFilter
              right: LensFilter
            }

            type Query {
              getPqcFilters: FilterValues {
                get(\`/api/filters\`)
              }

              precachePqc : DefaultMsg {
                get(\`/api/precache\`)
              }
            }

            type Mutation {
              getPqcTiles (data: Filters): Tiles {
                put(\`/api/tiles\`, {... data})
              }

              getPqcList (data: Filters): LensesCollection {
                put(\`/api/list\`, {... data})
              }
            }
        `,
          data: {},
        },
        {
          name: 'second',
          source: `
            type LensesCollection {
              items: [LensWithOptions]
              count: Int
              offset: Int
            }

            type LensWithOptions {
              id: Int
              code: String
              name: String
              brandName: String
              productFamily: String
              productLine: String
              coating: [LensOption]
              color: [LensOption]
              diameter: [LensOption]
            }

            type LensOption {
              name: String
              code: String
            }

            type FilterValue {
              key: String
              value: String
              displayName: String
            }

            type Filters {
              lensCategory: [FilterValue]
              materialProperty: [FilterValue]
              refractiveIndex: [FilterValue]
              productFamily: [FilterValue]
              productLine: [FilterValue]
            }

            type Query {
              getLensesByCustomerNo(
                customerNo: String, offset: Int, length: Int,
                sphereR: String, sphereL: String,
                cylinderR: String, cylinderL: String,
                additionR: String, additionL: String,
                diameterR: String, diameterL: String,
                productFamilyL: String, productFamilyR: String,
                productLineL: String, productLineR: String,
                lensCategoryL: String, lensCategoryR: String,
                focalTypeL: String, focalTypeR: String,
                refractiveIndexL: String, refractiveIndexR: String,
                materialPropertyL: String, materialPropertyR: String
              ): LensesCollection {
                get(cq(\`api/customer/\${customerNo}/lens\`, {offset, length, sphereR, sphereL, cylinderR, cylinderL, additionR, additionL, diameterR, diameterL, materialPropertyL, materialPropertyR, refractiveIndexL, refractiveIndexR, focalTypeL, focalTypeR, productFamilyL, productFamilyR, productLineL, productLineR, lensCategoryL, lensCategoryR }))
              }

              getFiltersByCustomerNo(customerNo: String): Filters {
                get(\`api/customer/\${customerNo}/filters\`)
              }
            }
        `,
          data: {},
        },
      ],
      {
        get: true,
        post: true,
        put: true,
      },
    );
    const result = createSchema(services);
    expect(result.get()).not.toBeUndefined();
  });
});
